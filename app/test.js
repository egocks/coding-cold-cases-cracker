#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buildCaseIndex, getCase } from "./lib/case-indexer.js";
import { createRun } from "./lib/pipeline.js";
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

const unprovenStatuses = ["partial", "blocked", "awaiting_kiro_supervision"];
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
