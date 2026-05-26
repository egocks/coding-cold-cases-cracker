#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { buildCaseIndex, getCase } from "./lib/case-indexer.js";
import { createRun } from "./lib/pipeline.js";
import { findRunById } from "./lib/workspace.js";

const index = await buildCaseIndex();
assert.equal(index.count >= 100, true, "expected full cold-case index");
assert.equal(index.shortlist_count, 20, "expected 20 shortlisted cases");

const maven = index.cases.find((item) => item.title.includes("Maven generate-sources"));
assert.ok(maven, "expected Maven shortlist case");
assert.equal(maven.shortlist, true);
assert.ok(maven.tags.includes("maven"));

const loaded = await getCase(maven.id);
assert.equal(loaded.id, maven.id);

const run = await createRun(maven.id);
assert.equal(run.status, "prepared");

for (const required of [
  "case.json",
  "case-state.json",
  "original/original-question.md",
  ".kiro/agents/case-investigator.json",
  ".kiro/steering/product.md",
  ".kiro/steering/tech.md",
  ".kiro/steering/structure.md",
  "prompts/kiro-handoff.md",
  "lark/reproduction-workflow.json",
  "lark/verification-workflow.json"
]) {
  await fs.access(path.join(run.workspaceDir, required));
}

const found = await findRunById(run.run_id);
assert.equal(found.run_id, run.run_id);

await fs.rm(run.workspaceDir, { recursive: true, force: true });
await fs.rmdir(path.dirname(run.workspaceDir)).catch(() => {});

console.log("Smoke checks passed.");
