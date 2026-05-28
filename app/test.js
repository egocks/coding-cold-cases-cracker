#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buildCaseIndex, getCase } from "./lib/case-indexer.js";
import { createRun, runPipeline } from "./lib/pipeline.js";
import { findRunById, updateRun } from "./lib/workspace.js";
import { availableActions, publicStatus, publicStatusReason } from "./lib/presenter.js";

const execFileAsync = promisify(execFile);

const index = await buildCaseIndex();
assert.equal(index.count, 150, "expected full cold-case index");
assert.equal(index.shortlist_count, 20, "expected 20 shortlisted cases");

const maven = index.cases.find((item) => item.title.includes("Maven generate-sources"));
assert.ok(maven, "expected Maven shortlist case");
assert.equal(maven.shortlist, true);
assert.ok(maven.tags.includes("maven"));
assert.ok(maven.narrative_teaser, "expected narrative teaser in parsed case data");

const loaded = await getCase(maven.id);
assert.equal(loaded.id, maven.id);

const run = await createRun(maven.id);
assert.equal(run.status, "prepared");
assert.equal(publicStatus(null), "Cold Case");
assert.equal(publicStatus(run), "Casework Started");
assert.deepEqual(availableActions(run), ["Monitor", "Confer", "Bulletins", "Back"]);

for (const required of [
  "case.json",
  "case-state.json",
  "original/original-question.md",
  ".kiro/agents/case-reconstructor.json",
  ".kiro/agents/case-repairer.json",
  ".kiro/agents/case-debriefer.json",
  ".kiro/agents/case-writer.json",
  ".kiro/agents/case-investigator.json",
  ".kiro/steering/product.md",
  ".kiro/steering/tech.md",
  ".kiro/steering/structure.md",
  ".kiro/steering/evidence-discipline.md",
  ".kiro/steering/lark-first.md",
  ".kiro/steering/narrative-boundaries.md",
  ".kiro/steering/read-only-debrief.md",
  ".kiro/steering/creative-case-writing.md",
  "prompts/kiro-reconstruction.md",
  "prompts/kiro-repair-from-lark.md",
  "prompts/kiro-debrief.md",
  "lark/reproduction-workflow.json",
  "lark/verification-workflow.json",
  "lark/test-coverage-summary.md",
  "tests/lark/red/replay-reproduction.sh",
  "tests/lark/green/replay-verification.sh"
]) {
  await fs.access(path.join(run.workspaceDir, required));
}

const state = JSON.parse(await fs.readFile(path.join(run.workspaceDir, "case-state.json"), "utf8"));
assert.equal(state.status, "prepared");
assert.ok(state.kiro.reconstruction.prompt.endsWith("kiro-reconstruction.md"));
assert.ok(state.kiro.repair.prompt.endsWith("kiro-repair-from-lark.md"));
assert.equal(state.lark.reproduction.passed, false);

const reconstructionPrompt = await fs.readFile(path.join(run.workspaceDir, "prompts", "kiro-reconstruction.md"), "utf8");
assert.match(reconstructionPrompt, /Do not repair the case/);

const repairPrompt = await fs.readFile(path.join(run.workspaceDir, "prompts", "kiro-repair-from-lark.md"), "utf8");
assert.match(repairPrompt, /Lark Reproduction Evidence/);

await validateKiroAgentsIfAvailable(run.workspaceDir);

const found = await findRunById(run.run_id);
assert.equal(found.run_id, run.run_id);

const unprovenStatuses = ["partial", "blocked", "awaiting_kiro_supervision", "leads_exhausted"];
for (const status of unprovenStatuses) {
  assert.equal(publicStatus({ status, timeline: [{ message: "not proven" }] }), "Unproven");
}

const validated = await updateRun(run, "resolution_validated", "Lark verification passed. Resolution awaits user approval.", {
  lark: { ...run.lark, verification_passed: true }
});
assert.equal(publicStatus(validated), "Resolution Validated");
assert.match(publicStatusReason(validated), /awaiting user approval/i);
assert.deepEqual(availableActions(validated), ["Approve", "Examine", "Download", "Confer", "Back"]);

const closed = await updateRun(validated, "closed", "User approved the validated resolution. Case Closed.");
assert.equal(publicStatus(closed), "Case Closed");

await fs.rm(run.workspaceDir, { recursive: true, force: true });
await fs.rmdir(path.dirname(run.workspaceDir)).catch(() => {});

await runFailureScenarioChecks(maven.id);

console.log("Smoke checks passed.");

async function validateKiroAgentsIfAvailable(workspaceDir) {
  try {
    await execFileAsync("kiro-cli", ["--version"], { cwd: workspaceDir, timeout: 20_000 });
  } catch {
    console.log("Kiro CLI not found locally; skipped agent validation.");
    return;
  }

  for (const agent of [
    "case-reconstructor.json",
    "case-repairer.json",
    "case-debriefer.json",
    "case-writer.json",
    "case-investigator.json"
  ]) {
    await execFileAsync("kiro-cli", ["agent", "validate", "--path", path.join(workspaceDir, ".kiro", "agents", agent)], {
      cwd: workspaceDir,
      timeout: 30_000
    });
  }
}

async function runFailureScenarioChecks(caseId) {
  const step1 = await runSimulatedPipeline(caseId, {
    runKiroPhase: async (_run, phase) => {
      assert.equal(phase, "reconstruction");
      return { code: 1, output: "simulated reconstruction failure" };
    }
  });
  assert.equal(step1.result.status, "leads_exhausted");
  assert.equal(publicStatus(step1.result), "Unproven");
  assert.equal(step1.calls.kiro.reconstruction, 3);
  assert.equal(step1.calls.larkReproduction, 0);
  await cleanupScenario(step1.result);

  let step2LarkReproductionCalls = 0;
  const step2 = await runSimulatedPipeline(caseId, {
    runKiroPhase: async () => ({ code: 0, output: "simulated Kiro success" }),
    runLarkReproduction: async () => (
      step2LarkReproductionCalls++ === 0
        ? phaseResult({ passed: false, output: "simulated Lark rejection" })
        : phaseResult({ passed: true, output: "simulated Lark reproduction pass" })
    )
  });
  assert.equal(step2.result.status, "resolution_validated");
  assert.equal(step2.calls.kiro.reconstruction, 2);
  assert.equal(step2.calls.larkReproduction, 2);
  await cleanupScenario(step2.result);

  let step3RepairCalls = 0;
  const step3 = await runSimulatedPipeline(caseId, {
    runKiroPhase: async (_run, phase) => {
      if (phase === "repair" && step3RepairCalls++ === 0) {
        return { code: 1, output: "simulated repair refusal" };
      }
      return { code: 0, output: `simulated ${phase} success` };
    }
  });
  assert.equal(step3.result.status, "resolution_validated");
  assert.equal(step3.calls.kiro.repair, 2);
  await cleanupScenario(step3.result);

  const incorrectSolution = await runSimulatedPipeline(caseId, {
    runKiroPhase: async () => ({ code: 0, output: "simulated Kiro success with incorrect repair" }),
    runLarkVerification: async () => phaseResult({ passed: false, output: "simulated Lark repair rejection" })
  });
  assert.equal(incorrectSolution.result.status, "leads_exhausted");
  assert.equal(publicStatus(incorrectSolution.result), "Unproven");
  assert.equal(incorrectSolution.calls.kiro.repair, 3);
  assert.equal(incorrectSolution.calls.larkVerification, 3);
  await cleanupScenario(incorrectSolution.result);

  const step4 = await runSimulatedPipeline(caseId, {
    runKiroPhase: async () => ({ code: 0, output: "simulated Kiro success" }),
    runLarkVerification: async () => phaseResult({ provisioned: false, passed: false, output: "simulated Lark setup failure" })
  });
  assert.equal(step4.result.status, "blocked");
  assert.equal(publicStatus(step4.result), "Unproven");
  assert.equal(step4.calls.kiro.repair, 1);
  assert.equal(step4.calls.larkVerification, 1);
  await cleanupScenario(step4.result);

  const lark409 = await runSimulatedPipeline(caseId, {
    runKiroPhase: async () => ({ code: 0, output: "simulated Kiro success" }),
    runLarkVerification: async () => phaseResult({
      provisioned: false,
      transient: true,
      passed: false,
      output: "Error: HTTP 409 Conflict, body: workflow already has an in-flight generation"
    })
  });
  assert.equal(lark409.result.status, "blocked");
  assert.equal(publicStatus(lark409.result), "Unproven");
  assert.equal(lark409.calls.kiro.repair, 1, "Lark 409 provisioning conflicts must not burn Kiro repair attempts");
  assert.equal(lark409.calls.larkVerification, 1);
  await cleanupScenario(lark409.result);

  const larkInvocationLimit = await runSimulatedPipeline(caseId, {
    runKiroPhase: async () => ({ code: 0, output: "simulated Kiro success" }),
    runLarkReproduction: async () => phaseResult({
      provisioned: false,
      blockedReason: "lark_invocation_limit",
      passed: false,
      output: "Invocation limit reached. Please contact support@getlark.ai to increase your limit."
    })
  });
  assert.equal(larkInvocationLimit.result.status, "blocked");
  assert.equal(publicStatus(larkInvocationLimit.result), "Unproven");
  assert.equal(larkInvocationLimit.calls.kiro.reconstruction, 1, "Lark invocation limits must not burn Kiro reconstruction attempts");
  assert.equal(larkInvocationLimit.calls.larkReproduction, 1);
  assert.equal(larkInvocationLimit.result.lark.reproduction.blocked_reason, "lark_invocation_limit");
  await cleanupScenario(larkInvocationLimit.result);

  const kiroFalseSuccess = await runSimulatedPipeline(caseId, {
    writeArtifactsOnKiroSuccess: false,
    runKiroPhase: async () => ({
      code: 0,
      output: [
        "Monthly request limit reached",
        "Upgrade your plan for increased limits.",
        "The limits reset on 06/01."
      ].join("\n")
    })
  });
  assert.equal(kiroFalseSuccess.result.status, "blocked");
  assert.equal(publicStatus(kiroFalseSuccess.result), "Unproven");
  assert.equal(kiroFalseSuccess.calls.kiro.reconstruction, 1);
  assert.equal(kiroFalseSuccess.calls.larkReproduction, 0, "Incomplete Kiro reconstruction must not be sent to Lark");
  assert.equal(kiroFalseSuccess.result.kiro.reconstruction.validation.reason, "kiro_capacity_limit");
  await cleanupScenario(kiroFalseSuccess.result);

  const incompleteKiroPackage = await runSimulatedPipeline(caseId, {
    maxAttempts: 1,
    writeArtifactsOnKiroSuccess: false,
    runKiroPhase: async () => ({ code: 0, output: "simulated success without artifacts or command" })
  });
  assert.equal(incompleteKiroPackage.result.status, "leads_exhausted");
  assert.equal(publicStatus(incompleteKiroPackage.result), "Unproven");
  assert.equal(incompleteKiroPackage.calls.kiro.reconstruction, 1);
  assert.equal(incompleteKiroPackage.calls.larkReproduction, 0, "Placeholder commands and empty repro/ must halt before Lark");
  assert.equal(incompleteKiroPackage.result.kiro.reconstruction.validation.reason, "incomplete_reconstruction_package");
  await cleanupScenario(incompleteKiroPackage.result);

  const larkQuotesUpstreamQuota = await runSimulatedPipeline(caseId, {
    runKiroPhase: async (currentRun, phase) => {
      await writeMinimalPackage(currentRun, phase);
      return { code: 0, output: `simulated ${phase} success` };
    },
    runLarkReproduction: async () => phaseResult({
      passed: true,
      output: [
        "Lark confirmed the reproduction.",
        "The upstream Kiro log said: Monthly request limit reached.",
        "Status: success"
      ].join("\n")
    })
  });
  assert.equal(larkQuotesUpstreamQuota.result.status, "resolution_validated");
  assert.equal(larkQuotesUpstreamQuota.result.lark.reproduction.blocked_reason, null);
  assert.equal(larkQuotesUpstreamQuota.result.lark.reproduction.passed, true);
  await cleanupScenario(larkQuotesUpstreamQuota.result);

  const writer = await runSimulatedPipeline(caseId, {
    writeCaseReports: async () => ({
      usedKiroWriter: false,
      output: "simulated writer failure after retry",
      quality: { accepted: false, attempts: 2, issues: ["simulated refusal"] }
    })
  });
  assert.equal(writer.result.status, "resolution_validated");
  assert.equal(writer.result.writer.quality.accepted, false);
  await cleanupScenario(writer.result);
}

async function runSimulatedPipeline(caseId, overrides = {}) {
  const scenarioRun = await createRun(caseId);
  const calls = {
    kiro: { reconstruction: 0, repair: 0, writer: 0 },
    larkReproduction: 0,
    larkVerification: 0
  };

  const result = await runPipeline(scenarioRun.workspaceDir, {
    maxAttempts: overrides.maxAttempts || 3,
    publishRunToGitHub: async () => ({ published: false, output: "simulated local-only publish" }),
    runKiroPhase: async (currentRun, phase, options) => {
      calls.kiro[phase] = Number(calls.kiro[phase] || 0) + 1;
      const result = overrides.runKiroPhase
        ? await overrides.runKiroPhase(currentRun, phase, options)
        : { code: 0, output: `simulated ${phase} success` };
      if (result.code === 0 && overrides.writeArtifactsOnKiroSuccess !== false) {
        await writeMinimalPackage(currentRun, phase);
      }
      return result;
    },
    runLarkReproduction: async (currentRun, options) => {
      calls.larkReproduction += 1;
      if (overrides.runLarkReproduction) return overrides.runLarkReproduction(currentRun, options);
      return phaseResult({ passed: true, output: "simulated Lark reproduction pass" });
    },
    runLarkVerification: async (currentRun, options) => {
      calls.larkVerification += 1;
      if (overrides.runLarkVerification) return overrides.runLarkVerification(currentRun, options);
      return phaseResult({ passed: true, output: "simulated Lark verification pass" });
    },
    writeCaseReports: overrides.writeCaseReports || (async () => ({
      usedKiroWriter: true,
      output: "simulated writer success",
      quality: { accepted: true, attempts: 1, issues: [] }
    }))
  });

  return { result, calls };
}

function phaseResult({ provisioned = true, transient = false, blockedReason = null, passed = true, output = "simulated phase output" } = {}) {
  return {
    code: passed ? 0 : 1,
    output,
    provisioned,
    transient,
    transientReason: transient ? "workflow_generation_in_flight" : null,
    blockedReason,
    passed,
    groupId: "wfl_grp_simulated",
    workflowId: "wflw_simulated",
    executionIds: ["wflw_exec_simulated"]
  };
}

async function cleanupScenario(run) {
  await fs.rm(run.workspaceDir, { recursive: true, force: true });
  await fs.rmdir(path.dirname(run.workspaceDir)).catch(() => {});
}

async function writeMinimalPackage(run, phase) {
  const workspaceDir = run.workspaceDir;
  const targetDir = phase === "repair" ? "repaired" : "repro";
  await fs.mkdir(path.join(workspaceDir, targetDir), { recursive: true });
  await fs.writeFile(path.join(workspaceDir, targetDir, "README.md"), `${phase} artifact\n`);
  await fs.mkdir(path.join(workspaceDir, "reports"), { recursive: true });
  if (phase === "reconstruction") {
    await fs.writeFile(path.join(workspaceDir, "reports", "reconstruction-report.md"), "Reconstruction report\n");
  }
  if (phase === "repair") {
    await fs.writeFile(path.join(workspaceDir, "reports", "technical-report.md"), "Technical report\n");
  }
  const caseJsonPath = path.join(workspaceDir, "case.json");
  const caseJson = JSON.parse(await fs.readFile(caseJsonPath, "utf8"));
  caseJson.commands = {
    ...caseJson.commands,
    reproduce: "printf 'red reproduction\\n'",
    verify: "printf 'green verification\\n'"
  };
  await fs.writeFile(caseJsonPath, `${JSON.stringify(caseJson, null, 2)}\n`);
}
