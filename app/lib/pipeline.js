import fs from "node:fs/promises";
import path from "node:path";
import { getCase } from "./case-indexer.js";
import { publishRunToGitHub } from "./github.js";
import { generateKiroArtifacts, generateKiroRepairPrompt, kiroCommand, runKiroPhase as defaultRunKiroPhase } from "./kiro.js";
import { generateLarkWorkflows, runLarkReproduction as defaultRunLarkReproduction, runLarkVerification as defaultRunLarkVerification } from "./lark.js";
import { appendLog, createRunWorkspace, loadRun, saveRun, updateRun } from "./workspace.js";
import { writeCaseReports as defaultWriteCaseReports } from "./writer.js";

const DEFAULT_MAX_ATTEMPTS = 3;

export async function createRun(caseId) {
  const coldCase = await getCase(caseId);
  const run = await createRunWorkspace(coldCase);
  await generateKiroArtifacts(run);
  await generateKiroRepairPrompt(run, { verdict: "Pending. Lark reproduction evidence has not run yet." });
  await generateLarkWorkflows(run);
  return updateRun(run, "prepared", "Generated phase-specific Kiro agent pack and Lark workflow payloads.");
}

export async function runPipeline(workspaceDir, options = {}) {
  let run = await loadRun(workspaceDir);
  const adapters = phaseAdapters(options);
  const maxAttempts = phaseMaxAttempts(options);
  const onData = async (chunk, stream) => {
    await appendLog(run, "pipeline-live.log", `[${stream}] ${chunk}`);
    options.onData?.(chunk, stream);
  };

  let reproductionReady = false;
  for (let reconstructionAttempt = 1; reconstructionAttempt <= maxAttempts; reconstructionAttempt += 1) {
    run = await runKiroReconstruction(run, onData, { attempt: reconstructionAttempt, maxAttempts, adapters });
    if (run.status === "blocked") return saveRun(run);
    if (run.status === "awaiting_kiro_supervision") return saveRun(run);
    if (run.status !== "reproduction_ready") {
      if (reconstructionAttempt < maxAttempts) {
        run = await retryRun(run, "kiro_reconstruction_retry", `Kiro reconstruction attempt ${reconstructionAttempt} did not produce a responsible package. Retrying reconstruction.`);
        continue;
      }
      run = await leadsExhausted(run, "Kiro reconstruction could not produce a responsible package after the retry limit.");
      return finishReports(run, adapters);
    }

    run = await publishPhase(run, "publishing_reproduction", "Publishing reproduction workspace for Lark access.", onData, adapters);
    await generateLarkWorkflows(run);

    for (let larkAttempt = 1; larkAttempt <= maxAttempts; larkAttempt += 1) {
      run = await runLarkReproductionPhase(run, onData, { attempt: larkAttempt, maxAttempts, adapters });
      if (run.status === "lark_reproduction_ready") {
        reproductionReady = true;
        break;
      }
      if (run.status === "blocked") {
        run = await updateRun(run, "blocked", "Lark reproduction could not run. Casework is paused without spending more Kiro attempts.");
        return saveRun(run);
      }
      if (run.status === "partial") break;
    }

    if (reproductionReady) break;
    if (reconstructionAttempt < maxAttempts) {
      await appendRetryGuidance(run, "prompts/kiro-reconstruction.md", "Lark did not validate the reconstruction package. Reconstruct the failure again using the Lark reproduction evidence and logs as feedback.");
      run = await retryRun(run, "kiro_reconstruction_retry", `Lark rejected reconstruction attempt ${reconstructionAttempt}. Returning the evidence to Kiro for another reconstruction pass.`);
      continue;
    }
    run = await leadsExhausted(run, "Lark did not validate the reconstructed scene after the retry limit.");
    return finishReports(run, adapters);
  }

  await generateKiroRepairPrompt(run);
  let verified = false;
  for (let repairAttempt = 1; repairAttempt <= maxAttempts; repairAttempt += 1) {
    run = await runKiroRepair(run, onData, { attempt: repairAttempt, maxAttempts, adapters });
    if (run.status === "awaiting_kiro_supervision") return finishReports(run, adapters);
    if (run.status !== "repair_ready") {
      if (repairAttempt < maxAttempts) {
        run = await retryRun(run, "kiro_repair_retry", `Kiro repair attempt ${repairAttempt} did not complete. Retrying repair from preserved evidence.`);
        await generateKiroRepairPrompt(run);
        continue;
      }
      run = await leadsExhausted(run, "Kiro repair could not complete after the retry limit.");
      return finishReports(run, adapters);
    }

    run = await publishPhase(run, "publishing_repair", "Publishing repaired workspace for Lark verification.", onData, adapters);
    await generateLarkWorkflows(run);

    for (let larkAttempt = 1; larkAttempt <= maxAttempts; larkAttempt += 1) {
      run = await runLarkVerificationPhase(run, onData, { attempt: larkAttempt, maxAttempts, adapters });
      if (run.status === "resolution_validated") {
        verified = true;
        break;
      }
      if (run.status === "blocked") {
        run = await updateRun(run, "blocked", "Lark verification could not run. Casework is paused without spending more Kiro attempts.");
        return saveRun(run);
      }
      if (run.status === "partial") break;
    }

    if (verified) break;
    if (repairAttempt < maxAttempts) {
      await generateKiroRepairPrompt(run);
      run = await retryRun(run, "kiro_repair_retry", `Lark rejected repair attempt ${repairAttempt}. Returning the verdict to Kiro for another repair pass.`);
      continue;
    }
    run = await leadsExhausted(run, "Lark did not validate the repair after the retry limit.");
    return finishReports(run, adapters);
  }

  return finishReports(run, adapters);
}

export async function advanceExistingEvidence(workspaceDir, options = {}) {
  let run = await loadRun(workspaceDir);
  const adapters = phaseAdapters(options);
  const onData = async (chunk, stream) => {
    await appendLog(run, "pipeline-live.log", `[${stream}] ${chunk}`);
    options.onData?.(chunk, stream);
  };

  run = await maybeRefreshRunCommands(run);
  await generateKiroRepairPrompt(run);
  if (!run.lark?.reproduction?.passed) {
    run = await publishPhase(run, "publishing_reproduction", "Publishing existing reproduction workspace for Lark access.", onData, adapters);
    await generateLarkWorkflows(run);
    run = await runLarkReproductionPhase(run, onData, { adapters });
  }
  if (!isTerminalStatus(run.status)) {
    run = await runKiroRepair(run, onData, { adapters });
  }
  if (!isTerminalStatus(run.status)) {
    run = await publishPhase(run, "publishing_repair", "Publishing repaired workspace for Lark verification.", onData, adapters);
    await generateLarkWorkflows(run);
    run = await runLarkVerificationPhase(run, onData, { adapters });
  }
  return finishReports(run, adapters);
}

async function runKiroReconstruction(run, onData, { attempt = 1, maxAttempts = DEFAULT_MAX_ATTEMPTS, adapters = phaseAdapters() } = {}) {
  run = await updateRun(run, "kiro_reconstruction_started", `Kiro reconstruction started. Attempt ${attempt} of ${maxAttempts}.`);
  const kiro = await adapters.runKiroPhase(run, "reconstruction", { onData, attempt, maxAttempts });
  await appendLog(run, "kiro-reconstruction.log", kiro.output + "\n");

  if (kiro.code === 0) {
    run = await maybeRefreshRunCommands(run);
    const validation = await validateReconstructionPackage(run, kiro.output);
    if (!validation.ok) {
      return updateRun(run, validation.blocked ? "blocked" : "partial", validation.message, {
        kiro: {
          ...(run.kiro || {}),
          reconstruction: {
            ...(run.kiro?.reconstruction || {}),
            passed: false,
            log: "logs/kiro-reconstruction.log",
            validation
          }
        }
      });
    }
    await generateLarkWorkflows(run);
    return updateRun(run, "reproduction_ready", "Kiro produced a failing reproduction for Lark forensic review.", {
      kiro: {
        ...(run.kiro || {}),
        reconstruction: {
          ...(run.kiro?.reconstruction || {}),
          passed: true,
          log: "logs/kiro-reconstruction.log",
          command: kiroCommand(run, { phase: "reconstruction" })
        }
      }
    });
  }

  if (kiro.mode === "interactive-required") {
    return updateRun(run, "awaiting_kiro_supervision", "Kiro reconstruction requires supervised terminal login/session.", {
      kiro: {
        ...(run.kiro || {}),
        reconstruction: {
          ...(run.kiro?.reconstruction || {}),
          passed: false,
          log: "logs/kiro-reconstruction.log",
          command: kiroCommand(run, { phase: "reconstruction", interactive: true })
        }
      }
    });
  }

  return updateRun(run, "partial", "Kiro could not produce a responsible failing reproduction. Evidence was preserved.", {
    kiro: {
      ...(run.kiro || {}),
      reconstruction: {
        ...(run.kiro?.reconstruction || {}),
        passed: false,
        log: "logs/kiro-reconstruction.log"
      }
    }
  });
}

async function validateReconstructionPackage(run, output) {
  const issues = [];
  const reproduce = normalizeDiscoveredCommand(run.commands?.reproduce);

  if (kiroCapacityBlocked(output)) {
    issues.push("Kiro reported a request, credit, or monthly limit before producing reconstruction artifacts.");
    return {
      ok: false,
      blocked: true,
      reason: "kiro_capacity_limit",
      issues,
      message: "Kiro reconstruction could not run because Kiro capacity was exhausted. Casework is paused without sending an empty package to Lark."
    };
  }

  if (!reproduce) {
    issues.push("case.json.commands.reproduce is missing or still set to TO_BE_DISCOVERED_BY_KIRO.");
  }

  if (!await hasNonEmptyFile(path.join(run.workspaceDir, "reports", "reconstruction-report.md"))) {
    issues.push("reports/reconstruction-report.md was not created.");
  }

  if (!await directoryHasFiles(path.join(run.workspaceDir, "repro"))) {
    issues.push("repro/ has no generated reproduction files.");
  }

  return {
    ok: issues.length === 0,
    blocked: false,
    reason: issues.length ? "incomplete_reconstruction_package" : null,
    issues,
    message: issues.length
      ? `Kiro did not produce a complete reconstruction package: ${issues.join(" ")}`
      : "Kiro reconstruction package contains required evidence."
  };
}

async function runLarkReproductionPhase(run, onData, { attempt = 1, maxAttempts = DEFAULT_MAX_ATTEMPTS, adapters = phaseAdapters() } = {}) {
  run = await updateRun(run, "lark_reproduction_running", `Lark forensic reproduction workflow started. Attempt ${attempt} of ${maxAttempts}.`);
  const lark = await adapters.runLarkReproduction(run, { onData, attempt, maxAttempts });
  await appendLog(run, "lark-reproduction.log", lark.output + "\n");

  const nextLark = {
    ...(run.lark || {}),
    group_id: lark.groupId || run.lark?.group_id || null,
    workflow_ids: [...new Set([...(run.lark?.workflow_ids || []), lark.workflowId].filter(Boolean))],
    execution_ids: [...new Set([...(run.lark?.execution_ids || []), ...(lark.executionIds || [])])],
    reproduction: {
      ...(run.lark?.reproduction || {}),
      workflow_id: lark.workflowId || run.lark?.reproduction?.workflow_id || null,
      execution_ids: lark.executionIds || [],
      passed: Boolean(lark.passed),
      provisioned: Boolean(lark.provisioned),
      blocked_reason: lark.blockedReason || null,
      transient: Boolean(lark.transient),
      transient_reason: lark.transientReason || null,
      output: "lark/reproduction-output.md",
      evidence: "lark/reproduction-evidence.json"
    }
  };

  if (!lark.provisioned) {
    return updateRun(run, "blocked", larkBlockedMessage("reproduction", lark), { lark: nextLark });
  }
  if (!lark.passed) {
    return updateRun(run, "partial", "Lark did not confirm the failing reproduction. Repair is paused to avoid unsupported closure.", { lark: nextLark });
  }
  return updateRun(run, "lark_reproduction_ready", "Lark confirmed reproduction evidence for Kiro repair.", { lark: nextLark });
}

async function runKiroRepair(run, onData, { attempt = 1, maxAttempts = DEFAULT_MAX_ATTEMPTS, adapters = phaseAdapters() } = {}) {
  run = await updateRun(run, "kiro_repair_started", `Kiro repair started from Lark reproduction evidence. Attempt ${attempt} of ${maxAttempts}.`);
  const kiro = await adapters.runKiroPhase(run, "repair", { onData, attempt, maxAttempts });
  await appendLog(run, "kiro-repair.log", kiro.output + "\n");

  if (kiro.code === 0) {
    run = await maybeRefreshRunCommands(run);
    await generateLarkWorkflows(run);
    return updateRun(run, "repair_ready", "Kiro produced a candidate repair for Lark verification.", {
      kiro: {
        ...(run.kiro || {}),
        repair: {
          ...(run.kiro?.repair || {}),
          passed: true,
          log: "logs/kiro-repair.log",
          command: kiroCommand(run, { phase: "repair" })
        }
      }
    });
  }

  if (kiro.mode === "interactive-required") {
    return updateRun(run, "awaiting_kiro_supervision", "Kiro repair requires supervised terminal login/session.", {
      kiro: {
        ...(run.kiro || {}),
        repair: {
          ...(run.kiro?.repair || {}),
          passed: false,
          log: "logs/kiro-repair.log",
          command: kiroCommand(run, { phase: "repair", interactive: true })
        }
      }
    });
  }

  return updateRun(run, "partial", "Kiro repair did not complete. Lark reproduction evidence and logs were preserved.", {
    kiro: {
      ...(run.kiro || {}),
      repair: {
        ...(run.kiro?.repair || {}),
        passed: false,
        log: "logs/kiro-repair.log"
      }
    }
  });
}

async function runLarkVerificationPhase(run, onData, { attempt = 1, maxAttempts = DEFAULT_MAX_ATTEMPTS, adapters = phaseAdapters() } = {}) {
  run = await updateRun(run, "lark_verification_running", `Lark closure verification started. Attempt ${attempt} of ${maxAttempts}.`);
  const lark = await adapters.runLarkVerification(run, { onData, attempt, maxAttempts });
  await appendLog(run, "lark-verification.log", lark.output + "\n");

  const nextLark = {
    ...(run.lark || {}),
    group_id: lark.groupId || run.lark?.group_id || null,
    workflow_ids: [...new Set([...(run.lark?.workflow_ids || []), lark.workflowId].filter(Boolean))],
    execution_ids: [...new Set([...(run.lark?.execution_ids || []), ...(lark.executionIds || [])])],
    verification: {
      ...(run.lark?.verification || {}),
      workflow_id: lark.workflowId || run.lark?.verification?.workflow_id || null,
      execution_ids: lark.executionIds || [],
      passed: Boolean(lark.passed),
      provisioned: Boolean(lark.provisioned),
      blocked_reason: lark.blockedReason || null,
      transient: Boolean(lark.transient),
      transient_reason: lark.transientReason || null,
      output: "lark/verification-output.md",
      evidence: "lark/verification-evidence.json"
    },
    verification_passed: Boolean(lark.passed)
  };

  if (!lark.provisioned) {
    return updateRun(run, "blocked", larkBlockedMessage("verification", lark), { lark: nextLark });
  }
  return updateRun(run, lark.passed ? "resolution_validated" : "partial", lark.passed ? "Lark verification passed. Resolution awaits user approval." : "Lark rejected or could not verify the repair; case remains Unproven.", { lark: nextLark });
}

async function publishPhase(run, status, message, onData, adapters = phaseAdapters()) {
  run = await updateRun(run, status, message);
  const publish = await adapters.publishRunToGitHub(run, { onData });
  await appendLog(run, status === "publishing_reproduction" ? "github-reproduction.log" : "github-repair.log", publish.output + "\n");
  await appendLog(run, "github.log", `[${status}]\n${publish.output}\n`);
  return updateRun(run, publish.published ? `${status}_done` : "local_only", publish.published ? "Published workspace to GitHub." : "GitHub publish unavailable; continuing with local evidence only.", {
    github: {
      branch: publish.branch || run.github?.branch || null,
      remote_url: publish.remoteUrl || run.github?.remote_url || null
    }
  });
}

async function finishReports(run, adapters = phaseAdapters()) {
  const writer = await adapters.writeCaseReports(run);
  await appendLog(run, "writer.log", writer.output + "\n");
  const reportStatus = run.status;
  run = await updateRun(run, "reports_ready", "Kiro writer reports are ready.", {
    writer: {
      ...(run.writer || {}),
      provider: "kiro-cli",
      used_kiro_writer: writer.usedKiroWriter,
      quality: writer.quality || run.writer?.quality
    }
  });

  if (reportStatus === "resolution_validated" || run.lark?.verification_passed) {
    run = await updateRun(run, "resolution_validated", "Final status restored to Resolution Validated after report generation.");
  } else if (["partial", "blocked", "awaiting_kiro_supervision", "leads_exhausted"].includes(reportStatus)) {
    run = await updateRun(run, reportStatus, `Final status restored to ${reportStatus} after report generation.`);
  }

  return saveRun(run);
}

function isTerminalStatus(status) {
  return ["partial", "blocked", "awaiting_kiro_supervision", "leads_exhausted"].includes(status);
}

function phaseAdapters(options = {}) {
  return {
    runKiroPhase: options.runKiroPhase || defaultRunKiroPhase,
    runLarkReproduction: options.runLarkReproduction || defaultRunLarkReproduction,
    runLarkVerification: options.runLarkVerification || defaultRunLarkVerification,
    writeCaseReports: options.writeCaseReports || defaultWriteCaseReports,
    publishRunToGitHub: options.publishRunToGitHub || publishRunToGitHub
  };
}

function phaseMaxAttempts(options = {}) {
  const configured = Number(options.maxAttempts || process.env.COLD_CASE_MAX_ATTEMPTS || DEFAULT_MAX_ATTEMPTS);
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : DEFAULT_MAX_ATTEMPTS;
}

async function retryRun(run, status, message) {
  return updateRun(run, status, message, {
    retries: {
      ...(run.retries || {}),
      total: Number(run.retries?.total || 0) + 1
    }
  });
}

function larkBlockedMessage(phase, lark) {
  if (lark.blockedReason === "lark_invocation_limit") {
    return `Lark ${phase} could not run because the invocation limit was reached. Casework is paused until Lark capacity is available.`;
  }
  if (lark.blockedReason === "lark_rate_limit") {
    return `Lark ${phase} could not run because a rate or quota limit was reached. Casework is paused until Lark capacity is available.`;
  }
  if (lark.transientReason === "workflow_generation_in_flight") {
    return `Lark ${phase} could not run because workflow generation remained in flight after retries. Casework is paused without spending more Kiro attempts.`;
  }
  return `Lark ${phase} could not run. Casework is paused until Lark is available.`;
}

async function leadsExhausted(run, message) {
  return updateRun(run, "leads_exhausted", message, {
    retries: {
      ...(run.retries || {}),
      exhausted: true,
      exhausted_at: new Date().toISOString()
    }
  });
}

async function appendRetryGuidance(run, relativePromptPath, guidance) {
  await fs.appendFile(path.join(run.workspaceDir, relativePromptPath), `\n\n## Retry Guidance\n\n${guidance}\n`);
}

async function maybeRefreshRunCommands(run) {
  try {
    const caseJson = JSON.parse(await fs.readFile(path.join(run.workspaceDir, "case.json"), "utf8"));
    return {
      ...run,
      commands: {
        reproduce: caseJson.commands?.reproduce || run.commands?.reproduce,
        verify: caseJson.commands?.verify || run.commands?.verify
      },
      assumptions: caseJson.assumptions || run.assumptions || []
    };
  } catch {
    return run;
  }
}

function normalizeDiscoveredCommand(command) {
  const value = String(command || "").trim();
  return value && value !== "TO_BE_DISCOVERED_BY_KIRO" ? value : "";
}

function kiroCapacityBlocked(output) {
  return /Monthly request limit reached|request limit reached|credit limit|usage limit|Upgrade your plan for increased limits|limits reset on/i.test(output || "");
}

async function hasNonEmptyFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

async function directoryHasFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isFile()) return true;
      if (entry.isDirectory() && await directoryHasFiles(entryPath)) return true;
    }
    return false;
  } catch {
    return false;
  }
}
