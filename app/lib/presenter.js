import fs from "node:fs/promises";
import path from "node:path";

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

export function bulletinsFromRuns(runs, { caseId = null } = {}) {
  return runs
    .filter((run) => !caseId || run.case_id === caseId)
    .flatMap((run) => (run.timeline || []).map((item) => ({
      at: item.at,
      caseId: run.case_id,
      runId: run.run_id,
      title: run.original?.title,
      type: item.type,
      status: publicStatus({ ...run, status: item.type }),
      message: bulletinMessage(item)
    })))
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
