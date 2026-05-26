#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildCaseIndex, loadCaseIndex } from "./lib/case-indexer.js";
import { advanceExistingEvidence, createRun, runPipeline } from "./lib/pipeline.js";
import { findRunById, listCaseRuns, listRuns } from "./lib/workspace.js";
import { kiroCommand } from "./lib/kiro.js";
import { zipsDir, ensureDir } from "./lib/paths.js";
import { runCommand } from "./lib/runner.js";

const command = process.argv[2] || "tui";

if (command === "index") await index();
else if (command === "create-run") await createRunCommand();
else if (command === "run-pipeline") await runPipelineCommand();
else if (command === "advance-run") await advanceRunCommand();
else if (command === "gallery") await gallery();
else if (command === "zip") await zipRunCommand();
else if (command === "tui") await tui();
else {
  console.error(`Unknown command: ${command}`);
  process.exit(64);
}

async function index() {
  const result = await buildCaseIndex();
  console.log(`Indexed ${result.count} cases (${result.shortlist_count} shortlist).`);
}

async function createRunCommand() {
  const caseId = process.argv[3];
  if (!caseId) throw new Error("Usage: node app/cli.js create-run <case-id>");
  const run = await createRun(caseId);
  console.log(run.workspaceDir);
}

async function runPipelineCommand() {
  const workspaceDir = process.argv[3];
  if (!workspaceDir) throw new Error("Usage: node app/cli.js run-pipeline <workspace-dir>");
  const run = await runPipeline(path.resolve(workspaceDir), {
    onData(chunk) {
      process.stdout.write(chunk);
    }
  });
  console.log(`\nFinal status: ${run.status}`);
}

async function advanceRunCommand() {
  const workspaceDir = process.argv[3];
  if (!workspaceDir) throw new Error("Usage: node app/cli.js advance-run <workspace-dir>");
  const run = await advanceExistingEvidence(path.resolve(workspaceDir), {
    onData(chunk) {
      process.stdout.write(chunk);
    }
  });
  console.log(`\nFinal status: ${run.status}`);
}

async function gallery() {
  const runs = (await listRuns()).filter((run) => ["closed", "partial", "reports_ready"].includes(run.status));
  if (!runs.length) {
    console.log("No real solved or partial case reports yet.");
    return;
  }
  for (const run of runs) {
    console.log(`${run.status.toUpperCase()} ${run.original.title}`);
    console.log(`  Run: ${run.run_id}`);
    console.log(`  Report: ${path.join(run.workspaceDir, "reports", "case-file.md")}`);
    console.log("");
  }
}

async function zipRunCommand() {
  const runId = process.argv[3];
  if (!runId) throw new Error("Usage: node app/cli.js zip <run-id>");
  const run = await findRunById(runId);
  const zipPath = await zipRun(run);
  console.log(zipPath);
}

async function tui() {
  await buildCaseIndex();
  const rl = createInterface({ input, output });
  let search = "";
  let selected = null;

  try {
    while (true) {
      const indexData = await loadCaseIndex();
      const cases = filterCases(indexData.cases, search);
      printHeader();
      printReadiness();
      console.log(`Search: ${search || "(none)"} | Showing ${Math.min(cases.length, 18)} of ${cases.length} cases\n`);
      cases.slice(0, 18).forEach((item, idx) => {
        const marker = selected?.id === item.id ? ">" : " ";
        const tags = item.tags.slice(0, 4).join(",");
        console.log(`${marker} ${String(idx + 1).padStart(2, "0")}. ${item.title}`);
        console.log(`     ${item.cold_signal} | score ${item.score} | ${tags}`);
      });

      console.log("\nActions: number=case details, /=search, g=gallery, r=runs, q=quit");
      const answer = (await rl.question("\nCold Case Desk> ")).trim();
      if (answer === "q") break;
      if (answer === "/") {
        search = (await rl.question("Search title/tag/signal> ")).trim();
        continue;
      }
      if (answer === "g") {
        await pause(rl, async () => gallery());
        continue;
      }
      if (answer === "r") {
        await pause(rl, printRuns);
        continue;
      }
      const index = Number(answer) - 1;
      if (Number.isInteger(index) && cases[index]) {
        selected = cases[index];
        await caseDetail(rl, selected);
      }
    }
  } finally {
    rl.close();
  }
}

async function caseDetail(rl, coldCase) {
  while (true) {
    console.clear();
    const runs = await listCaseRuns(coldCase.id);
    console.log(`\n=== ${coldCase.title} ===\n`);
    console.log(`${coldCase.url}\n`);
    console.log(`Posted ${coldCase.posted} | Score ${coldCase.score} | Views ${coldCase.views} | Answers ${coldCase.answers}`);
    console.log(`Signal: ${coldCase.cold_signal}`);
    console.log(`Tags: ${coldCase.tags.join(", ")}`);
    console.log(`Expected Lark evidence: ${coldCase.expected_lark_evidence}`);
    if (coldCase.risk_hints.length) console.log(`Risk hints: ${coldCase.risk_hints.join(" ")}`);
    console.log(`\nExcerpt: ${coldCase.why_interesting || "(no excerpt)"}\n`);
    console.log(`Runs: ${runs.length}`);
    runs.slice(0, 5).forEach((run) => console.log(`- ${run.run_id}: ${run.status}`));
    console.log("\nActions: n=new run, s=start latest run, k=print Kiro command, z=zip latest run, b=back");
    const answer = (await rl.question("\nCase File> ")).trim();
    if (answer === "b") return;
    if (answer === "n") {
      const run = await createRun(coldCase.id);
      console.log(`\nCreated: ${run.workspaceDir}`);
      console.log(`Next: start pipeline or run Kiro supervised with ${kiroCommand(run, { interactive: true })}`);
      await rl.question("\nPress Enter to continue.");
    }
    if (answer === "s") {
      const latest = (await listCaseRuns(coldCase.id))[0] || await createRun(coldCase.id);
      console.log(`\nStarting pipeline for ${latest.run_id}...\n`);
      const result = await runPipeline(latest.workspaceDir, { onData: (chunk) => process.stdout.write(chunk) });
      console.log(`\nPipeline status: ${result.status}`);
      await rl.question("\nPress Enter to continue.");
    }
    if (answer === "k") {
      const latest = (await listCaseRuns(coldCase.id))[0] || await createRun(coldCase.id);
      console.log(`\ncd "${latest.workspaceDir}"`);
      console.log(kiroCommand(latest, { interactive: true }));
      await rl.question("\nPress Enter to continue.");
    }
    if (answer === "z") {
      const latest = (await listCaseRuns(coldCase.id))[0];
      if (!latest) console.log("No run exists yet.");
      else console.log(`Zip: ${await zipRun(latest)}`);
      await rl.question("\nPress Enter to continue.");
    }
  }
}

async function printRuns() {
  const runs = await listRuns();
  if (!runs.length) {
    console.log("No runs yet.");
    return;
  }
  for (const run of runs.slice(0, 20)) {
    console.log(`${run.run_id} | ${run.status} | ${run.original.title}`);
    console.log(`  ${run.workspaceDir}`);
  }
}

async function zipRun(run) {
  await ensureDir(zipsDir);
  const zipPath = path.join(zipsDir, `${run.case_id}-${run.run_id}.zip`);
  const result = await runCommand(`zip -qr ${shellQuote(zipPath)} .`, { cwd: run.workspaceDir, timeoutMs: 2 * 60 * 1000 });
  if (result.code !== 0) throw new Error(result.output);
  return zipPath;
}

function filterCases(cases, search) {
  const needle = search.toLowerCase();
  if (!needle) return cases;
  return cases.filter((item) => [item.title, item.cold_signal, item.tags.join(" "), item.why_interesting].join(" ").toLowerCase().includes(needle));
}

function printHeader() {
  console.clear();
  console.log("############################################################");
  console.log("# CODING COLD CASES CRACKER                                #");
  console.log("# Support incident reproduction lab: Kiro -> Lark -> Groq  #");
  console.log("############################################################\n");
}

function printReadiness() {
  const kiro = process.env.KIRO_API_KEY ? "autopilot" : "supervised";
  const lark = process.env.GETLARK_API_KEY || process.env.LARKCI_API_KEY ? "ready" : "missing key";
  const groq = process.env.GROQ_API_KEY ? "ready" : "missing key";
  const github = process.env.GITHUB_TOKEN ? "ready" : "local only";
  console.log(`Kiro: ${kiro} | Lark: ${lark} | Groq: ${groq} | GitHub: ${github}\n`);
}

async function pause(rl, fn) {
  console.clear();
  await fn();
  await rl.question("\nPress Enter to continue.");
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}
