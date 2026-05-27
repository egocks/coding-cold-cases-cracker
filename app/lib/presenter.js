import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { artifactsDir, ensureDir, readJson, writeJson } from "./paths.js";

export const STATUS_FILTERS = [
  "All active cases",
  "Cold Case",
  "Casework Started",
  "Scene Reconstructed",
  "Evidence Collected",
  "Case Resolved",
  "Resolution Validated",
  "Unproven"
];

const CASEWORK_STARTED = new Set([
  "workspace_created",
  "prepared",
  "kiro_reconstruction_started",
  "publishing_reproduction",
  "publishing_reproduction_done",
  "publishing_repair",
  "publishing_repair_done",
  "local_only"
]);

const UNPROVEN = new Set(["partial", "blocked", "awaiting_kiro_supervision"]);

export function publicStatus(run) {
  if (!run) return "Cold Case";
  if (run.status === "closed") return "Case Closed";
  if (run.status === "resolution_validated") return "Resolution Validated";
  if (UNPROVEN.has(run.status)) return "Unproven";
  if (run.status === "repair_ready" || run.status === "lark_verification_running") return "Case Resolved";
  if (run.status === "lark_reproduction_ready") return "Evidence Collected";
  if (run.status === "reproduction_ready") return "Scene Reconstructed";
  if (CASEWORK_STARTED.has(run.status)) return "Casework Started";
  if (run.status === "reports_ready" && run.lark?.verification_passed) return "Resolution Validated";
  return "Casework Started";
}

export function publicStatusReason(run) {
  if (!run) return "No casework has started yet.";
  const last = run.timeline?.at(-1)?.message;
  if (UNPROVEN.has(run.status)) return last || "The case has not passed final validation.";
  if (run.status === "resolution_validated") return "Lark verification passed; awaiting user approval.";
  if (run.status === "closed") return "The user approved the validated resolution.";
  return last || "Casework is in progress.";
}

export function availableActions(run) {
  const status = publicStatus(run);
  if (status === "Cold Case") return ["Start Casework", "Confer", "Bulletins", "Back"];
  if (status === "Resolution Validated") return ["Approve", "Examine", "Download", "Confer", "Back"];
  if (status === "Case Closed") return ["Examine", "Download", "Confer", "Back"];
  if (["Evidence Collected", "Case Resolved", "Unproven"].includes(status)) {
    return ["Monitor", "Examine", "Download", "Confer", "Bulletins", "Back"];
  }
  return ["Monitor", "Confer", "Bulletins", "Back"];
}

export function larkVerdict(run) {
  if (run?.lark?.verification_passed) return "Resolution Validated";
  if (run?.lark?.verification?.passed === false && run?.lark?.verification?.workflow_id) return "Repair Rejected";
  if (run?.lark?.reproduction?.passed) return "Failure Confirmed";
  if (run?.lark?.reproduction?.workflow_id) return "Lark Evidence Pending";
  return "No Evidence Yet";
}

export function isActiveRun(run) {
  if (!run) return false;
  return !["resolution_validated", "closed", "partial", "blocked", "awaiting_kiro_supervision"].includes(run.status);
}

export async function evidencePayload(run) {
  const larkDir = path.join(run.workspaceDir, "lark");
  const logsDir = path.join(run.workspaceDir, "logs");
  const reportsDir = path.join(run.workspaceDir, "reports");
  return {
    runId: run.run_id,
    caseId: run.case_id,
    title: run.original?.title,
    status: publicStatus(run),
    reason: publicStatusReason(run),
    larkVerdict: larkVerdict(run),
    commands: run.commands || {},
    github: run.github || {},
    artifacts: run.artifacts || {},
    rawEvidence: await rawEvidenceAvailability([
      path.join(larkDir, "reproduction-output.md"),
      path.join(larkDir, "reproduction-evidence.json"),
      path.join(larkDir, "verification-output.md"),
      path.join(larkDir, "verification-evidence.json"),
      path.join(larkDir, "test-coverage-summary.md"),
      path.join(logsDir, "kiro-reconstruction.log"),
      path.join(logsDir, "lark-reproduction.log"),
      path.join(logsDir, "kiro-repair.log"),
      path.join(logsDir, "lark-verification.log"),
      path.join(logsDir, "writer.log"),
      path.join(reportsDir, "evidence-map.json")
    ], run.workspaceDir)
  };
}

export const BULLETIN_FILTERS = ["Inbox", "Unread", "Read", "Archive", "Muted"];

export function bulletinsFromRuns(runs, { caseId = null } = {}) {
  return rawBulletinsFromRuns(runs, { caseId });
}

export async function bulletinInbox(runs, { caseId = null, filter = "Inbox", merged = true } = {}) {
  const state = await loadBulletinState();
  const normalizedFilter = BULLETIN_FILTERS.includes(filter) ? filter : "Inbox";
  const raw = rawBulletinsFromRuns(runs, { caseId }).map((bulletin) => applyBulletinState(bulletin, state));
  const visible = filterBulletins(raw, normalizedFilter);
  const rows = merged && normalizedFilter !== "Muted" ? mergeBulletins(visible) : sortBulletins(visible);
  return {
    filter: normalizedFilter,
    merged,
    bulletins: rows,
    mutedRules: Object.values(state.mutedRules || {}).sort((left, right) => String(right.muted_at).localeCompare(String(left.muted_at)))
  };
}

export async function updateBulletinState(runs, action, { id = null, ids = [], caseId = null, type = null } = {}) {
  const state = await loadBulletinState();
  const now = new Date().toISOString();
  const raw = rawBulletinsFromRuns(runs);
  const byId = new Map(raw.map((bulletin) => [bulletin.id, bulletin]));

  if (action === "read" || action === "unread" || action === "dismiss" || action === "restore") {
    const targetIds = ids.length ? ids : [id];
    for (const targetId of targetIds.filter(Boolean)) {
      if (action === "read") state.read[targetId] = true;
      if (action === "unread") delete state.read[targetId];
      if (action === "dismiss") state.dismissed[targetId] = true;
      if (action === "restore") delete state.dismissed[targetId];
    }
  } else if (action === "mute") {
    const bulletin = byId.get(id);
    if (!bulletin) {
      const error = new Error("Unknown bulletin.");
      error.statusCode = 404;
      throw error;
    }
    state.mutedRules[bulletin.muteKey] = {
      caseId: bulletin.caseId,
      type: bulletin.type,
      title: bulletin.title,
      muted_at: now
    };
  } else if (action === "unmute") {
    if (!caseId || !type) {
      const error = new Error("Unmute requires caseId and type.");
      error.statusCode = 400;
      throw error;
    }
    delete state.mutedRules[bulletinMuteKey(caseId, type)];
  } else {
    const error = new Error("Unsupported bulletin action.");
    error.statusCode = 400;
    throw error;
  }

  await saveBulletinState(state);
  return state;
}

function rawBulletinsFromRuns(runs, { caseId = null } = {}) {
  return runs
    .filter((run) => !caseId || run.case_id === caseId)
    .flatMap((run) => (run.timeline || []).map((item) => {
      const base = {
        at: item.at,
        caseId: run.case_id,
        runId: run.run_id,
        title: run.original?.title,
        type: item.type,
        status: publicStatus({ ...run, status: item.type }),
        message: bulletinMessage(item)
      };
      return {
        ...base,
        id: bulletinId(base),
        muteKey: bulletinMuteKey(base.caseId, base.type),
        read: false,
        dismissed: false,
        muted: false,
        mergedCount: 1,
        mergedIds: []
      };
    }))
    .sort((left, right) => String(right.at).localeCompare(String(left.at)));
}

export function latestNonClosedRun(runs) {
  return runs.find((run) => publicStatus(run) !== "Case Closed") || runs[0] || null;
}

async function rawEvidenceAvailability(filePaths, workspaceDir) {
  const available = [];
  for (const filePath of filePaths) {
    try {
      const stat = await fs.stat(filePath);
      available.push({
        path: path.relative(workspaceDir, filePath),
        bytes: stat.size
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return available;
}

function bulletinMessage(item) {
  const status = publicStatus({ status: item.type });
  if (status === "Unproven") return `${status}: ${item.message}`;
  if (status === "Resolution Validated") return `Resolution Validated: ${item.message}`;
  if (status === "Case Closed") return `Case Closed: ${item.message}`;
  return item.message;
}

const bulletinStatePath = path.join(artifactsDir, "bulletins", "state.json");

async function loadBulletinState() {
  const state = await readJson(bulletinStatePath, { read: {}, dismissed: {}, mutedRules: {} });
  return {
    read: state.read || {},
    dismissed: state.dismissed || {},
    mutedRules: state.mutedRules || {}
  };
}

async function saveBulletinState(state) {
  await ensureDir(path.dirname(bulletinStatePath));
  await writeJson(bulletinStatePath, state);
}

function applyBulletinState(bulletin, state) {
  return {
    ...bulletin,
    read: Boolean(state.read?.[bulletin.id]),
    dismissed: Boolean(state.dismissed?.[bulletin.id]),
    muted: Boolean(state.mutedRules?.[bulletin.muteKey])
  };
}

function filterBulletins(bulletins, filter) {
  if (filter === "Unread") return bulletins.filter((bulletin) => !bulletin.dismissed && !bulletin.muted && !bulletin.read);
  if (filter === "Read") return bulletins.filter((bulletin) => !bulletin.dismissed && !bulletin.muted && bulletin.read);
  if (filter === "Archive") return bulletins.filter((bulletin) => bulletin.dismissed);
  if (filter === "Muted") return bulletins.filter((bulletin) => bulletin.muted && !bulletin.dismissed);
  return bulletins.filter((bulletin) => !bulletin.dismissed && !bulletin.muted);
}

function mergeBulletins(bulletins) {
  const groups = new Map();
  for (const bulletin of bulletins) {
    const key = bulletinMuteKey(bulletin.caseId, bulletin.type);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { ...bulletin, mergedCount: 1, mergedIds: [bulletin.id] });
      continue;
    }
    existing.mergedCount += 1;
    existing.mergedIds.push(bulletin.id);
    existing.read = existing.read && bulletin.read;
    if (String(bulletin.at).localeCompare(String(existing.at)) > 0) {
      existing.id = bulletin.id;
      existing.at = bulletin.at;
      existing.runId = bulletin.runId;
      existing.title = bulletin.title;
      existing.status = bulletin.status;
      existing.message = bulletin.message;
    }
  }
  return sortBulletins([...groups.values()]);
}

function sortBulletins(bulletins) {
  return [...bulletins].sort((left, right) => {
    if (left.read !== right.read) return left.read ? 1 : -1;
    return String(right.at).localeCompare(String(left.at));
  });
}

function bulletinId(bulletin) {
  return `b-${crypto
    .createHash("sha1")
    .update([bulletin.caseId, bulletin.runId, bulletin.at, bulletin.type, bulletin.message].join("\u001f"))
    .digest("hex")
    .slice(0, 16)}`;
}

function bulletinMuteKey(caseId, type) {
  return `${caseId}::${type}`;
}
