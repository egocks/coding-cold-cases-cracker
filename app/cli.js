#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildCaseIndex, loadCaseIndex } from "./lib/case-indexer.js";
import { advanceExistingEvidence, createRun, runPipeline } from "./lib/pipeline.js";
import { findRunById, listCaseRuns, listRuns, updateRun } from "./lib/workspace.js";
import { kiroCommand } from "./lib/kiro.js";
import { zipsDir, ensureDir } from "./lib/paths.js";
import { runCommand } from "./lib/runner.js";
import { availableActions, bulletinsFromRuns, evidencePayload, isActiveRun, latestNonClosedRun, larkVerdict, publicStatus, publicStatusReason, STATUS_FILTERS } from "./lib/presenter.js";

const command = process.argv[2] || "tui";

if (input.isTTY) emitKeypressEvents(input);

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
  const runs = (await listRuns()).filter((run) => run.status === "closed");
  if (!runs.length) {
    console.log("No closed case reports yet.");
    return;
  }
  for (const run of runs) {
    console.log(`${statusBadge(run)} ${run.original.title}`);
    console.log(`  Run: ${run.run_id}`);
    console.log(`  Lark: ${larkVerdict(run)}`);
    if (run.github?.remote_url) console.log(`  Remote: ${run.github.remote_url}`);
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
  let statusFilter = "All active cases";
  let selected = null;
  let deskCursor = 0;
  let cabinetCursor = 0;
  const deskItems = [
    { label: "Cold Cases", key: "c" },
    { label: "Solved Cases", key: "g" },
    { label: "Bulletins", key: "b" },
    { label: "Options", key: "o" },
    { label: "About", key: "a" }
  ];

  try {
    while (true) {
      printHeader("Case Desk");
      console.log("Case Desk\n---------\n");
      deskItems.forEach((item, index) => console.log(`${index === deskCursor ? ">" : " "} ${item.label}`));
      console.log("\nActions: Up/Down=select, Enter=open, c=Cold Cases, g=Solved Cases, b=Bulletins, o=Options, a=About, q=Quit");
      const deskInput = await menuInput(rl, "\nCase Desk> ");
      if (deskInput === "up") {
        deskCursor = wrapIndex(deskCursor - 1, deskItems.length);
        continue;
      }
      if (deskInput === "down") {
        deskCursor = wrapIndex(deskCursor + 1, deskItems.length);
        continue;
      }
      const deskAnswer = (deskInput === "enter" ? deskItems[deskCursor].key : deskInput).trim().toLowerCase();
      if (deskAnswer === "q") break;
      if (deskAnswer === "g") await galleryConsole(rl);
      if (deskAnswer === "b") await bulletinsConsole(rl);
      if (deskAnswer === "o") await optionsConsole(rl);
      if (deskAnswer === "a") await aboutConsole(rl);
      if (deskAnswer !== "c" && deskAnswer !== "") continue;

      while (true) {
        const cabinetRuns = await listRuns();
        const cabinetCases = filterCases((await loadCaseIndex()).cases, cabinetRuns, search, statusFilter);
        const visibleCases = cabinetCases.slice(0, 18);
        cabinetCursor = clamp(cabinetCursor, 0, Math.max(visibleCases.length - 1, 0));
        printHeader("Cold Cases Cabinet");
        console.log(`Search: ${search || "(none)"} | Filter: ${statusFilter} | Showing ${Math.min(cabinetCases.length, 18)} of ${cabinetCases.length} cases\n`);
        visibleCases.forEach((item, idx) => {
          const runsForCase = cabinetRuns.filter((run) => run.case_id === item.id);
          const latest = latestNonClosedRun(runsForCase);
          const marker = idx === cabinetCursor ? ">" : " ";
          const tags = item.tags.slice(0, 4).join(",");
          console.log(`${marker} ${String(idx + 1).padStart(2, "0")}. ${item.title}`);
          console.log(`     ${publicStatus(latest)} | answers ${item.answers} | score ${item.score} | views ${item.views} | ${item.cold_signal}`);
          console.log(`     ${tags}`);
        });

        console.log("\nActions: Up/Down=select, Enter=pull case file, number=pull case file, /=Search, F=Filter, Esc=back");
        const answer = (await menuInput(rl, "\nCold Cases Cabinet> ")).trim();
        if (answer === "up") {
          cabinetCursor = wrapIndex(cabinetCursor - 1, visibleCases.length);
          continue;
        }
        if (answer === "down") {
          cabinetCursor = wrapIndex(cabinetCursor + 1, visibleCases.length);
          continue;
        }
        if (answer === "escape" || answer.toLowerCase() === "esc" || answer.toLowerCase() === "b") break;
        if (answer === "/") {
          search = (await ask(rl, "Search title/tag/signal> ")).trim();
          cabinetCursor = 0;
          continue;
        }
        if (answer.toLowerCase() === "f") {
          statusFilter = await chooseStatusFilter(rl, statusFilter);
          cabinetCursor = 0;
          continue;
        }
        const index = answer === "enter" ? cabinetCursor : Number(answer) - 1;
        if (Number.isInteger(index) && visibleCases[index]) {
          selected = visibleCases[index];
          await caseDetail(rl, selected);
        }
      }
    }
  } finally {
    rl.close();
  }
}

async function ask(rl, prompt) {
  try {
    return await rl.question(prompt);
  } catch (error) {
    if (error.code === "ERR_USE_AFTER_CLOSE") return "q";
    throw error;
  }
}

async function menuInput(rl, prompt) {
  if (!input.isTTY) return ask(rl, prompt);

  output.write(prompt);
  rl.pause();
  const wasRaw = input.isRaw;
  input.setRawMode(true);
  input.resume();

  return new Promise((resolve) => {
    const onKeypress = (str, key = {}) => {
      input.off("keypress", onKeypress);
      input.setRawMode(Boolean(wasRaw));
      rl.resume();

      if (key.ctrl && key.name === "c") {
        output.write("\n");
        resolve("q");
        return;
      }
      if (key.name === "up") {
        output.write("\r\x1b[2K");
        resolve("up");
      } else if (key.name === "down") {
        output.write("\r\x1b[2K");
        resolve("down");
      }
      else if (key.name === "return" || key.name === "enter") {
        output.write("\n");
        resolve("enter");
      } else if (key.name === "escape") {
        output.write("\n");
        resolve("escape");
      } else {
        output.write(`${str || ""}\n`);
        resolve(str || "");
      }
    };
    input.once("keypress", onKeypress);
  });
}

async function galleryConsole(rl) {
  let search = "";
  let cursor = 0;
  while (true) {
    const runs = await galleryRuns(search);
    const visibleRuns = runs.slice(0, 12);
    cursor = clamp(cursor, 0, Math.max(visibleRuns.length - 1, 0));
    printHeader("Case Closed Gallery");
    console.log(`Search: ${search || "(none)"} | Showing ${Math.min(runs.length, 12)} of ${runs.length} gallery runs\n`);
    visibleRuns.forEach((run, index) => {
      console.log(`${index === cursor ? ">" : " "} ${String(index + 1).padStart(2, "0")}. ${statusBadge(run)} ${run.original.title}`);
      console.log(`    ${larkVerdict(run)} | ${run.run_id}`);
      if (run.github?.remote_url) console.log(`    ${run.github.remote_url}`);
    });
    console.log("\nActions: Up/Down=select, Enter=view story, number=view story, /=search title/story, b=back");
    const answer = (await menuInput(rl, "\nGallery> ")).trim();
    if (answer === "up") {
      cursor = wrapIndex(cursor - 1, visibleRuns.length);
      continue;
    }
    if (answer === "down") {
      cursor = wrapIndex(cursor + 1, visibleRuns.length);
      continue;
    }
    if (answer === "b" || answer === "escape") return;
    if (answer === "/") {
      search = (await ask(rl, "Search gallery> ")).trim();
      cursor = 0;
      continue;
    }
    const index = answer === "enter" ? cursor : Number(answer) - 1;
    if (Number.isInteger(index) && visibleRuns[index]) {
      await investigationConsole(rl, visibleRuns[index]);
    }
  }
}

async function galleryRuns(search = "") {
  const runs = (await listRuns()).filter((run) => run.status === "closed");
  const needle = search.toLowerCase();
  if (!needle) return runs;
  const scored = [];
  for (const run of runs) {
    let story = "";
    try {
      story = await fs.readFile(path.join(run.workspaceDir, "reports", "case-file.md"), "utf8");
    } catch {
      // Missing case files are still valid partial gallery entries.
    }
    const haystack = [run.original?.title, run.status, larkVerdict(run), story].join(" ").toLowerCase();
    if (haystack.includes(needle)) scored.push(run);
  }
  return scored;
}

async function caseDetail(rl, coldCase) {
  while (true) {
    const runs = await listCaseRuns(coldCase.id);
    const latest = latestNonClosedRun(runs);
    const status = publicStatus(latest);
    printHeader("Case Dossier");
    console.log(`\nCase File #${coldCase.rank}: ${coldCase.title}\n`);
    if (coldCase.narrative_teaser) console.log(`${coldCase.narrative_teaser}\n`);
    console.log(`Status: ${status}`);
    if (latest) console.log(`Reason: ${publicStatusReason(latest)}`);
    console.log("\n=== Origin ===\n");
    console.log(`${coldCase.title}\n`);
    console.log(`${coldCase.url}\n`);
    console.log(`Posted ${coldCase.posted} | Score ${coldCase.score} | Views ${coldCase.views} | Answers ${coldCase.answers}`);
    console.log(`Signal: ${coldCase.cold_signal}`);
    console.log(`Tags: ${coldCase.tags.join(", ")}`);
    console.log(`Expected Lark evidence: ${coldCase.expected_lark_evidence}`);
    if (coldCase.risk_hints.length) console.log(`Risk hints: ${coldCase.risk_hints.join(" ")}`);
    console.log(`\nExcerpt: ${coldCase.why_interesting || "(no excerpt)"}\n`);
    if (latest) {
      console.log("=== Latest Run ===\n");
      console.log(`Run: ${latest.run_id}`);
      console.log(`Status: ${publicStatus(latest)} | ${larkVerdict(latest)}`);
      if (latest.github?.remote_url) console.log(`GitHub: ${latest.github.remote_url}`);
      console.log("");
    }
    console.log(`Runs: ${runs.length}`);
    runs.slice(0, 5).forEach((run) => console.log(`- ${run.run_id}: ${statusBadge(run)} | ${larkVerdict(run)}`));
    console.log(`Solution available: ${runs.some((run) => run.status === "closed") ? "yes" : "not yet"}`);
    console.log(`\nActions: ${actionFooter(latest)}`);
    const answer = (await ask(rl, "\nCase File> ")).trim();
    if (answer.toLowerCase() === "esc") return;
    if (answer.toLowerCase() === "s") {
      const run = latest || await createRun(coldCase.id);
      console.log(`\nStarting casework for ${run.run_id}...\n`);
      const result = await runPipeline(run.workspaceDir, { onData: (chunk) => process.stdout.write(chunk) });
      console.log(`\nPipeline status: ${result.status}`);
      await ask(rl, "\nPress Enter to continue.");
    }
    if (answer.toLowerCase() === "m") {
      if (!latest) {
        console.log("No run exists yet.");
        await ask(rl, "\nPress Enter to continue.");
      } else {
        await investigationConsole(rl, latest);
      }
    }
    if (answer.toLowerCase() === "e") {
      if (!latest) console.log("No evidence exists yet.");
      else await pause(rl, () => printEvidenceBoard(latest));
      if (!latest) await ask(rl, "\nPress Enter to continue.");
    }
    if (answer.toLowerCase() === "c") {
      await pause(rl, () => printConferCommand(coldCase, latest));
    }
    if (answer.toLowerCase() === "d") {
      if (!latest) console.log("No run exists yet.");
      else console.log(`Zip: ${await zipRun(latest)}`);
      await ask(rl, "\nPress Enter to continue.");
    }
    if (answer.toLowerCase() === "a") {
      if (!latest || latest.status !== "resolution_validated") {
        console.log("Approve is available only after Resolution Validated.");
      } else {
        await updateRun(latest, "closed", "User approved the validated resolution. Case Closed.");
        console.log("Case Closed. It now appears in the Solved Cases Gallery.");
      }
      await ask(rl, "\nPress Enter to continue.");
    }
    if (answer.toLowerCase() === "b") await pause(rl, () => printBulletins(coldCase.id));
  }
}

async function investigationConsole(rl, run) {
  while (true) {
    const fresh = await findRunById(run.run_id);
    printHeader("Investigation Console");
    console.log(`${fresh.original.title}\n`);
    console.log(`Run: ${fresh.run_id}`);
    console.log(`Status: ${statusBadge(fresh)}`);
    console.log(`Reason: ${publicStatusReason(fresh)}`);
    console.log(`Lark Verdict: ${larkVerdict(fresh)}`);
    if (fresh.github?.remote_url) console.log(`GitHub: ${fresh.github.remote_url}`);
    console.log(`Reproduce: ${fresh.commands?.reproduce || "pending"}`);
    console.log(`Verify: ${fresh.commands?.verify || "pending"}`);
    console.log("\nTimeline:");
    for (const event of (fresh.timeline || []).slice(-14)) {
      console.log(`- ${event.at} | ${event.type} | ${event.message}`);
    }
    console.log("\nArtifacts:");
    for (const [name, artifact] of Object.entries(fresh.artifacts || {})) {
      console.log(`- ${name}: ${artifact}`);
    }
    console.log(`\nNext: ${nextRunHint(fresh)}`);
    console.log("\nActions: E=Evidence Board, F=Case File, O=Raw Logs, Z=Zip Run, C=Confer, B=Back");
    const answer = (await ask(rl, "\nInvestigation> ")).trim();
    if (answer.toLowerCase() === "b") return;
    if (answer.toLowerCase() === "f") await pause(rl, () => printFile(path.join(fresh.workspaceDir, "reports", "case-file.md")));
    if (answer.toLowerCase() === "e") await pause(rl, () => printEvidenceBoard(fresh));
    if (answer.toLowerCase() === "o") await pause(rl, () => printLogs(fresh));
    if (answer.toLowerCase() === "z") {
      console.log(`Zip: ${await zipRun(fresh)}`);
      await ask(rl, "\nPress Enter to continue.");
    }
    if (answer.toLowerCase() === "c") await pause(rl, () => printConferCommand(fresh.original, fresh));
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

async function printFile(filePath) {
  try {
    console.log(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`Not created yet: ${filePath}`);
      return;
    }
    console.log(`Unable to read ${filePath}: ${error.message}`);
  }
}

async function printEvidenceBoard(run) {
  const evidence = await evidencePayload(run);
  printHeader("Evidence Board");
  console.log("=== Lark Verdict ===\n");
  console.log(`${evidence.larkVerdict}`);
  console.log(`${evidence.reason}\n`);
  console.log("=== Replay ===\n");
  console.log(`Red command: ${evidence.commands.reproduce || "pending"}`);
  console.log(`Green command: ${evidence.commands.verify || "pending"}\n`);
  console.log("=== Artifacts ===\n");
  for (const [name, artifact] of Object.entries(evidence.artifacts || {})) console.log(`- ${name}: ${artifact}`);
  if (evidence.github?.remote_url) console.log(`- github: ${evidence.github.remote_url}`);
  console.log("\n=== Raw Evidence ===\n");
  if (!evidence.rawEvidence.length) console.log("No raw evidence files exist yet.");
  evidence.rawEvidence.forEach((item, index) => console.log(`${index + 1}. ${item.path} (${item.bytes} bytes)`));
}

async function printLogs(run) {
  let found = false;
  for (const name of ["kiro-reconstruction.log", "lark-reproduction.log", "kiro-repair.log", "lark-verification.log", "writer.log"]) {
    const logPath = path.join(run.workspaceDir, "logs", name);
    try {
      const content = await fs.readFile(logPath, "utf8");
      found = true;
      console.log(`\n## ${name}\n`);
      console.log(content);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.log(`\n## ${name}\n`);
        console.log(`Unable to read ${logPath}: ${error.message}`);
      }
    }
  }
  if (!found) {
    console.log("# Raw Logs\n");
    console.log("No phase logs exist yet. This run has not started the investigation pipeline.");
    console.log(`\nStatus: ${statusBadge(run)}`);
    console.log(`Next: ${nextRunHint(run)}`);
  }
}

function nextRunHint(run) {
  if (run.status === "prepared" || run.status === "workspace_created") return "Press `s` to start the investigation pipeline.";
  if (run.status === "awaiting_kiro_supervision") return "Confer with the agent for supervised continuation.";
  if (run.status === "partial" || run.status === "blocked") return "Open the Evidence Board and confer before ordering further action.";
  if (run.status === "resolution_validated") return "Approve closure, examine evidence, download archive, or confer.";
  if (run.status === "closed") return "Case is Closed; inspect the case file, evidence, or debrief command.";
  return "Read-only monitor. Watch the timeline and logs for the active phase.";
}

async function zipRun(run) {
  await ensureDir(zipsDir);
  const zipPath = path.join(zipsDir, `${run.case_id}-${run.run_id}.zip`);
  const result = await runCommand(`zip -qr ${shellQuote(zipPath)} .`, { cwd: run.workspaceDir, timeoutMs: 2 * 60 * 1000 });
  if (result.code !== 0) throw new Error(result.output);
  return zipPath;
}

function filterCases(cases, runs, search, statusFilter = "All active cases") {
  const needle = search.toLowerCase();
  return cases.filter((item) => {
    const latest = latestNonClosedRun(runs.filter((run) => run.case_id === item.id));
    const status = publicStatus(latest);
    if (status === "Case Closed") return false;
    if (statusFilter !== "All active cases" && status !== statusFilter) return false;
    if (!needle) return true;
    return [item.title, item.cold_signal, item.tags.join(" "), item.why_interesting, item.narrative_teaser, status]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

function printHeader(mode = "Cold Case Desk") {
  clearScreen();
  console.log("############################################################");
  console.log("# CODING COLD CASES CRACKER                                #");
  console.log(`# ${mode.padEnd(56, " ")} #`);
  console.log("# Vet. Vibe. Validate. Reconstruct, work, prove.         #");
  console.log("############################################################\n");
}

function clearScreen() {
  output.write("\x1b[3J\x1b[2J\x1b[H");
}

function printReadiness() {
  const kiro = process.env.KIRO_API_KEY ? "autopilot" : "supervised";
  const lark = process.env.GETLARK_API_KEY || process.env.LARKCI_API_KEY ? "ready" : "missing key";
  const writer = "kiro-cli";
  const github = process.env.GITHUB_TOKEN ? "ready" : "local only";
  console.log(`Kiro: ${kiro} | Lark: ${lark} | Writer: ${writer} | GitHub: ${github}\n`);
}

async function pause(rl, fn) {
  clearScreen();
  await fn();
  await ask(rl, "\nPress Enter to continue.");
}

function statusBadge(run) {
  return publicStatus(typeof run === "string" ? { status: run } : run);
}

function actionFooter(run) {
  const actions = availableActions(run);
  const keyMap = {
    "Start Casework": "S=Start Casework",
    Monitor: "M=Monitor Casework",
    Examine: "E=Examine",
    Download: "D=Download",
    Confer: "C=Confer",
    Bulletins: "B=Bulletins",
    Approve: "A=Approve",
    Back: "Esc=Back"
  };
  return actions.map((action) => keyMap[action] || action).join(", ");
}

async function chooseStatusFilter(rl, current) {
  let cursor = Math.max(0, STATUS_FILTERS.indexOf(current));
  while (true) {
    printHeader("Filter Case Status");
    STATUS_FILTERS.forEach((status, index) => {
      const marker = index === cursor ? ">" : " ";
      console.log(`${marker} ${index + 1}. ${status}`);
    });
    console.log("\nActions: Up/Down=select, Enter=apply filter, number=apply filter, Esc=cancel");
    const answer = (await menuInput(rl, "\nFilter> ")).trim();
    if (answer === "up") {
      cursor = wrapIndex(cursor - 1, STATUS_FILTERS.length);
      continue;
    }
    if (answer === "down") {
      cursor = wrapIndex(cursor + 1, STATUS_FILTERS.length);
      continue;
    }
    if (answer.toLowerCase() === "esc" || answer === "escape" || answer.toLowerCase() === "b") return current;
    const index = answer === "enter" ? cursor : Number(answer) - 1;
    if (Number.isInteger(index) && STATUS_FILTERS[index]) return STATUS_FILTERS[index];
  }
}

async function bulletinsConsole(rl) {
  while (true) {
    clearScreen();
    await printBulletins();
    const answer = (await menuInput(rl, "\nBulletins> ")).trim();
    if (answer.toLowerCase() === "b" || answer.toLowerCase() === "esc" || answer === "escape" || answer === "enter" || answer === "") return;
  }
}

async function printBulletins(caseId = null) {
  printHeader(caseId ? "Case Bulletins" : "Bulletins");
  const bulletins = bulletinsFromRuns(await listRuns(), { caseId });
  if (!bulletins.length) {
    console.log("No bulletins yet.");
    return;
  }
  for (const item of bulletins.slice(0, 30)) {
    console.log(`- ${item.at} | ${item.title}`);
    console.log(`  ${item.message}`);
  }
  console.log("\nActions: Enter/Esc=back");
}

async function optionsConsole(rl) {
  await pause(rl, async () => {
    printHeader("Options");
    printReadiness();
    console.log("Terminal visual controls live in the web shell: zoom, margin, and fullscreen.");
    console.log("Runtime keys and Docker settings are configured through .env and docker compose.");
  });
}

async function aboutConsole(rl) {
  await pause(rl, async () => {
    printHeader("About");
    console.log("Coding Cold Cases Cracker");
    console.log("Vet. Vibe. Validate.");
    console.log("Reconstruct the failure, work the fix, prove the close.");
  });
}

function printConferCommand(coldCase, run) {
  printHeader("Confer With Agent");
  if (!run) {
    const prompt = [
      "You are Larkule Quirot, conducting a pre-brief for an unresolved coding cold case.",
      "Do not start casework or claim evidence has been collected.",
      `Title: ${coldCase.title}`,
      `URL: ${coldCase.url}`,
      `Tags: ${(coldCase.tags || []).join(", ")}`,
      `Teaser: ${coldCase.narrative_teaser || coldCase.why_interesting || ""}`
    ].join("\n");
    console.log("Pre-brief command:");
    console.log(`kiro-cli chat --tui ${shellQuote(prompt)}`);
    return;
  }
  const modeNote = isActiveRun(run) ? "Read-only while casework is actively proceeding." : "Run is paused or finished; planning questions are allowed.";
  console.log(modeNote);
  console.log(`\ncd "${run.workspaceDir}"`);
  console.log(kiroCommand(run, { phase: "debrief", interactive: true }));
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function wrapIndex(index, length) {
  if (length <= 0) return 0;
  return (index + length) % length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
