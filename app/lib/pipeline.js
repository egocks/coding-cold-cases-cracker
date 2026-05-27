import fs from "node:fs/promises";
import path from "node:path";
import { getCase } from "./case-indexer.js";
import { publishRunToGitHub } from "./github.js";
import { generateKiroArtifacts, generateKiroRepairPrompt, kiroCommand, runKiroPhase } from "./kiro.js";
import { generateLarkWorkflows, runLarkReproduction, runLarkVerification } from "./lark.js";
import { appendLog, createRunWorkspace, loadRun, saveRun, updateRun } from "./workspace.js";
import { writeCaseReports } from "./writer.js";

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
  const onData = async (chunk, stream) => {
    await appendLog(run, "pipeline-live.log", `[${stream}] ${chunk}`);
    options.onData?.(chunk, stream);
  };

  run = await runKiroReconstruction(run, onData);
  if (isTerminalStatus(run.status)) return saveRun(run);

  run = await publishPhase(run, "publishing_reproduction", "Publishing reproduction workspace for Lark access.", onData);
  await generateLarkWorkflows(run);

  run = await runLarkReproductionPhase(run, onData);
  if (isTerminalStatus(run.status)) return finishReports(run);

  await generateKiroRepairPrompt(run);
  run = await runKiroRepair(run, onData);
  if (isTerminalStatus(run.status)) return finishReports(run);

  run = await publishPhase(run, "publishing_repair", "Publishing repaired workspace for Lark verification.", onData);
  await generateLarkWorkflows(run);

  run = await runLarkVerificationPhase(run, onData);
  return finishReports(run);
}

export async function advanceExistingEvidence(workspaceDir, options = {}) {
  let run = await loadRun(workspaceDir);
  const onData = async (chunk, stream) => {
    await appendLog(run, "pipeline-live.log", `[${stream}] ${chunk}`);
    options.onData?.(chunk, stream);
  };

  run = await maybeRefreshRunCommands(run);
  await generateKiroRepairPrompt(run);
  if (!run.lark?.reproduction?.passed) {
    run = await publishPhase(run, "publishing_reproduction", "Publishing existing reproduction workspace for Lark access.", onData);
    await generateLarkWorkflows(run);
    run = await runLarkReproductionPhase(run, onData);
  }
  if (!isTerminalStatus(run.status)) {
    run = await runKiroRepair(run, onData);
  }
  if (!isTerminalStatus(run.status)) {
    run = await publishPhase(run, "publishing_repair", "Publishing repaired workspace for Lark verification.", onData);
    await generateLarkWorkflows(run);
    run = await runLarkVerificationPhase(run, onData);
  }
  return finishReports(run);
}

async function runKiroReconstruction(run, onData) {
  run = await updateRun(run, "kiro_reconstruction_started", "Kiro reconstruction started.");
  const kiro = await runKiroPhase(run, "reconstruction", { onData });
  await appendLog(run, "kiro-reconstruction.log", kiro.output + "\n");

  if (kiro.code === 0) {
    run = await maybeRefreshRunCommands(run);
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

async function runLarkReproductionPhase(run, onData) {
  run = await updateRun(run, "lark_reproduction_running", "Lark forensic reproduction workflow started.");
  const lark = await runLarkReproduction(run, { onData });
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
      output: "lark/reproduction-output.md",
      evidence: "lark/reproduction-evidence.json"
    }
  };

  if (!lark.provisioned) {
    return updateRun(run, "blocked", "Lark reproduction evidence could not run. Closure is blocked until Lark is available.", { lark: nextLark });
  }
  if (!lark.passed) {
    return updateRun(run, "partial", "Lark did not confirm the failing reproduction. Repair is paused to avoid unsupported closure.", { lark: nextLark });
  }
  return updateRun(run, "lark_reproduction_ready", "Lark confirmed reproduction evidence for Kiro repair.", { lark: nextLark });
}

async function runKiroRepair(run, onData) {
  run = await updateRun(run, "kiro_repair_started", "Kiro repair started from Lark reproduction evidence.");
  const kiro = await runKiroPhase(run, "repair", { onData });
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

async function runLarkVerificationPhase(run, onData) {
  run = await updateRun(run, "lark_verification_running", "Lark closure verification started.");
  const lark = await runLarkVerification(run, { onData });
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
      output: "lark/verification-output.md",
      evidence: "lark/verification-evidence.json"
    },
    verification_passed: Boolean(lark.passed)
  };

  if (!lark.provisioned) {
    return updateRun(run, "blocked", "Lark verification could not run. Case cannot be Closed.", { lark: nextLark });
  }
  return updateRun(run, lark.passed ? "resolution_validated" : "partial", lark.passed ? "Lark verification passed. Resolution awaits user approval." : "Lark rejected or could not verify the repair; case remains Unproven.", { lark: nextLark });
}

async function publishPhase(run, status, message, onData) {
  run = await updateRun(run, status, message);
  const publish = await publishRunToGitHub(run, { onData });
  await appendLog(run, status === "publishing_reproduction" ? "github-reproduction.log" : "github-repair.log", publish.output + "\n");
  await appendLog(run, "github.log", `[${status}]\n${publish.output}\n`);
  return updateRun(run, publish.published ? `${status}_done` : "local_only", publish.published ? "Published workspace to GitHub." : "GitHub publish unavailable; continuing with local evidence only.", {
    github: {
      branch: publish.branch || run.github?.branch || null,
      remote_url: publish.remoteUrl || run.github?.remote_url || null
    }
  });
}

async function finishReports(run) {
  const writer = await writeCaseReports(run);
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
  } else if (["partial", "blocked", "awaiting_kiro_supervision"].includes(reportStatus)) {
    run = await updateRun(run, reportStatus, `Final status restored to ${reportStatus} after report generation.`);
  }

  return saveRun(run);
}

function isTerminalStatus(status) {
  return ["partial", "blocked", "awaiting_kiro_supervision"].includes(status);
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
