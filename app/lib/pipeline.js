import fs from "node:fs/promises";
import path from "node:path";
import { getCase } from "./case-indexer.js";
import { publishRunToGitHub } from "./github.js";
import { generateKiroArtifacts, runKiro } from "./kiro.js";
import { generateLarkWorkflows, runLarkVerification } from "./lark.js";
import { appendLog, createRunWorkspace, loadRun, saveRun, updateRun } from "./workspace.js";
import { writeGroqReports } from "./groq.js";

export async function createRun(caseId) {
  const coldCase = await getCase(caseId);
  const run = await createRunWorkspace(coldCase);
  await generateKiroArtifacts(run);
  await generateLarkWorkflows(run);
  return updateRun(run, "prepared", "Generated Kiro agent pack and Lark workflow payloads.");
}

export async function runPipeline(workspaceDir, options = {}) {
  let run = await loadRun(workspaceDir);
  const onData = async (chunk, stream) => {
    await appendLog(run, "pipeline-live.log", `[${stream}] ${chunk}`);
    options.onData?.(chunk, stream);
  };

  run = await updateRun(run, "kiro_reproduction_started", "Kiro investigation started.");
  const kiro = await runKiro(run, { onData });
  await appendLog(run, "kiro.log", kiro.output + "\n");

  if (kiro.code === 0) {
    run = await maybeRefreshRunCommands(run);
    run = await updateRun(run, "repair_ready", "Kiro completed its investigation and produced artifacts.");
  } else if (kiro.mode === "interactive-required") {
    run = await updateRun(run, "awaiting_kiro_supervision", "Kiro requires supervised terminal login/session before Lark verification.", {
      kiro: { mode: kiro.mode, command: "scripts/kiro-solve.sh . prompts/kiro-handoff.md" }
    });
    await writeGroqReports(run);
    return saveRun(run);
  } else {
    run = await updateRun(run, "partial", "Kiro exited without a verified repair. Evidence was preserved for review.");
    await writeGroqReports(run);
    return saveRun(run);
  }

  return finishVerificationPipeline(run, onData);
}

export async function advanceExistingEvidence(workspaceDir, options = {}) {
  let run = await loadRun(workspaceDir);
  const onData = async (chunk, stream) => {
    await appendLog(run, "pipeline-live.log", `[${stream}] ${chunk}`);
    options.onData?.(chunk, stream);
  };

  run = await maybeRefreshRunCommands(run);
  run = await updateRun(run, "repair_ready", "Existing Kiro investigation artifacts are ready for Lark verification.");
  return finishVerificationPipeline(run, onData);
}

async function finishVerificationPipeline(run, onData) {
  run = await updateRun(run, "publishing", "Publishing run workspace for Lark access.");
  const publish = await publishRunToGitHub(run, { onData });
  await appendLog(run, "github.log", publish.output + "\n");
  run = await updateRun(run, publish.published ? "published" : "local_only", publish.published ? "Published workspace to GitHub." : "GitHub publish unavailable; continuing with local evidence only.", {
    github: {
      branch: publish.branch,
      remote_url: publish.remoteUrl
    }
  });

  await generateLarkWorkflows(run);
  run = await updateRun(run, "lark_verification_running", "Lark forensic verification started.");
  const lark = await runLarkVerification(run, { onData });
  await appendLog(run, "lark.log", lark.output + "\n");
  run = await updateRun(run, lark.passed ? "closed" : "partial", lark.passed ? "Lark verification passed. Case is Closed." : "Lark verification did not pass or could not run; case remains Partial.", {
    lark: {
      group_id: lark.groupId || run.lark?.group_id || null,
      workflow_ids: lark.workflowIds || run.lark?.workflow_ids || [],
      execution_ids: lark.executionIds || run.lark?.execution_ids || [],
      verification_passed: Boolean(lark.passed)
    }
  });

  const groq = await writeGroqReports(run);
  await appendLog(run, "writer.log", groq.output + "\n");
  run = await updateRun(run, "reports_ready", "Groq/deterministic reports are ready.", {
    writer: { used_groq: groq.usedGroq }
  });

  if (run.lark?.verification_passed) {
    run = await updateRun(run, "closed", "Final status restored to Closed after report generation.");
  }

  return saveRun(run);
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
