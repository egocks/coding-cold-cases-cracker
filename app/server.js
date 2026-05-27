import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { buildCaseIndex, getCase, loadCaseIndex } from "./lib/case-indexer.js";
import { createRun } from "./lib/pipeline.js";
import { findRunById, listCaseRuns, listRuns, updateRun } from "./lib/workspace.js";
import { projectRoot, zipsDir, ensureDir } from "./lib/paths.js";
import { runCommand } from "./lib/runner.js";
import { availableActions, bulletinInbox, evidencePayload, latestNonClosedRun, larkVerdict, publicStatus, publicStatusReason, updateBulletinState } from "./lib/presenter.js";

const port = Number.parseInt(process.env.APP_PORT || "3000", 10);
const terminalUrl = process.env.TERMINAL_URL || "http://localhost:7681";
const terminalControlUrl = process.env.TERMINAL_CONTROL_URL || "http://terminal:7682";
const terminalActions = new Set(["enter", "up", "down", "back"]);
const retroInvestigatorPath = path.join(projectRoot, "public", "retro_investigator.png");

await buildCaseIndex();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return sendJson(response, await statusPayload());
    }

    if (request.method === "GET" && url.pathname === "/assets/retro_investigator.png") {
      return sendFile(response, retroInvestigatorPath, "image/png");
    }

    if (request.method === "POST" && url.pathname === "/api/terminal/input") {
      const payload = await readJson(request);
      const action = String(payload.action || "");
      if (!terminalActions.has(action)) {
        return sendJson(response, { ok: false, error: "Unsupported terminal action." }, 400);
      }
      return sendJson(response, await proxyTerminalInput(action));
    }

    if (request.method === "GET" && url.pathname === "/api/cases") {
      const index = await loadCaseIndex();
      return sendJson(response, index);
    }

    const caseMatch = url.pathname.match(/^\/api\/cases\/([^/]+)$/);
    if (request.method === "GET" && caseMatch) {
      const coldCase = await getCase(decodeURIComponent(caseMatch[1]));
      const runs = await listCaseRuns(coldCase.id);
      const latestRun = latestNonClosedRun(runs);
      return sendJson(response, { ...coldCase, latestRun: latestRun ? publicRun(latestRun) : null, publicStatus: publicStatus(latestRun), publicStatusReason: publicStatusReason(latestRun), availableActions: availableActions(latestRun), runs: runs.map(publicRun) });
    }

    const createRunMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/runs$/);
    if (request.method === "POST" && createRunMatch) {
      const run = await createRun(decodeURIComponent(createRunMatch[1]));
      return sendJson(response, publicRun(run), 201);
    }

    const startMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/start$/);
    if (request.method === "POST" && startMatch) {
      const run = await findRunById(decodeURIComponent(startMatch[1]));
      const child = spawn("node", ["app/cli.js", "run-pipeline", run.workspaceDir], {
        cwd: projectRoot,
        detached: true,
        stdio: "ignore",
        env: process.env
      });
      child.unref();
      return sendJson(response, { ok: true, run: publicRun(run), message: "Pipeline started in the background." }, 202);
    }

    const approveMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/approve$/);
    if (request.method === "POST" && approveMatch) {
      const run = await findRunById(decodeURIComponent(approveMatch[1]));
      if (run.status !== "resolution_validated") {
        return sendJson(response, { ok: false, error: "Approve is available only after Resolution Validated." }, 409);
      }
      const closed = await updateRun(run, "closed", "User approved the validated resolution. Case Closed.");
      return sendJson(response, { ok: true, run: publicRun(closed) });
    }

    const eventsMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/events$/);
    if (request.method === "GET" && eventsMatch) {
      const run = await findRunById(decodeURIComponent(eventsMatch[1]));
      return sendJson(response, { run: publicRun(run), timeline: run.timeline || [] });
    }

    const evidenceMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/evidence$/);
    if (request.method === "GET" && evidenceMatch) {
      const run = await findRunById(decodeURIComponent(evidenceMatch[1]));
      return sendJson(response, await evidencePayload(run));
    }

    const zipMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/zip$/);
    if (request.method === "POST" && zipMatch) {
      const run = await findRunById(decodeURIComponent(zipMatch[1]));
      const zipPath = await zipRun(run);
      return sendJson(response, { ok: true, zipPath });
    }

    if (request.method === "GET" && url.pathname === "/api/gallery") {
      const runs = (await listRuns()).filter((run) => run.status === "closed");
      return sendJson(response, { count: runs.length, runs: await Promise.all(runs.map(publicGalleryRun)) });
    }

    if (request.method === "GET" && url.pathname === "/api/bulletins") {
      return sendJson(response, await bulletinInbox(await listRuns(), {
        filter: url.searchParams.get("filter") || "Inbox",
        merged: url.searchParams.get("merged") !== "false"
      }));
    }

    const bulletinActionMatch = url.pathname.match(/^\/api\/bulletins\/([^/]+)\/(read|unread|dismiss|restore|mute)$/);
    if (request.method === "POST" && bulletinActionMatch) {
      const [, id, action] = bulletinActionMatch;
      await updateBulletinState(await listRuns(), action, { id: decodeURIComponent(id) });
      return sendJson(response, { ok: true, id: decodeURIComponent(id), action });
    }

    if (request.method === "POST" && url.pathname === "/api/bulletins/unmute") {
      const payload = await readJson(request);
      await updateBulletinState(await listRuns(), "unmute", { caseId: payload.caseId, type: payload.type });
      return sendJson(response, { ok: true, action: "unmute", caseId: payload.caseId, type: payload.type });
    }

    const caseBulletinsMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/bulletins$/);
    if (request.method === "GET" && caseBulletinsMatch) {
      const caseId = decodeURIComponent(caseBulletinsMatch[1]);
      return sendJson(response, await bulletinInbox(await listRuns(), {
        caseId,
        filter: url.searchParams.get("filter") || "Inbox",
        merged: url.searchParams.get("merged") !== "false"
      }));
    }

    if (request.method === "GET" && ["/", "/desk", "/options", "/about"].includes(url.pathname)) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(renderHome(url.pathname));
      return;
    }

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found.\n");
  } catch (error) {
    sendJson(response, { ok: false, error: error.message }, error.statusCode || 500);
  }
});

server.listen(port, () => {
  console.log(`Coding Cold Cases Cracker shell: http://localhost:${port}`);
});

async function statusPayload() {
  const status = await getKiroStatus();
  const index = await loadCaseIndex();
  const runs = await listRuns();
  return {
    ok: true,
    kiro: status,
    env: {
      hasKiroApiKey: Boolean(process.env.KIRO_API_KEY),
      hasLarkApiKey: Boolean(process.env.GETLARK_API_KEY || process.env.LARKCI_API_KEY),
      hasWriter: status.ok || Boolean(process.env.KIRO_API_KEY),
      hasGithubToken: Boolean(process.env.GITHUB_TOKEN),
      githubRepoUrl: process.env.GITHUB_REPO_URL || null
    },
    cases: {
      count: index.count,
      shortlistCount: index.shortlist_count
    },
    runs: {
      total: runs.length,
      closed: runs.filter((run) => run.status === "closed").length,
      unproven: runs.filter((run) => publicStatus(run) === "Unproven").length,
      resolutionValidated: runs.filter((run) => run.status === "resolution_validated").length,
      latestLarkVerdict: runs[0] ? larkVerdict(runs[0]) : "No Evidence Yet"
    }
  };
}

function getKiroStatus() {
  return new Promise((resolve) => {
    execFile("bash", ["scripts/kiro-status.sh", "--json"], { cwd: projectRoot, env: process.env }, (error, stdout, stderr) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({
          mode: process.env.KIRO_API_KEY ? "autopilot-ready" : "unknown",
          ok: !error,
          stdout,
          stderr
        });
      }
    });
  });
}

async function zipRun(run) {
  await ensureDir(zipsDir);
  const zipPath = path.join(zipsDir, `${run.case_id}-${run.run_id}.zip`);
  const result = await runCommand(`zip -qr '${zipPath.replace(/'/g, "'\\''")}' .`, { cwd: run.workspaceDir, timeoutMs: 2 * 60 * 1000 });
  if (result.code !== 0) throw new Error(result.output);
  return zipPath;
}

function publicRun(run) {
  return {
    case_id: run.case_id,
    run_id: run.run_id,
    status: run.status,
    publicStatus: publicStatus(run),
    publicStatusReason: publicStatusReason(run),
    availableActions: availableActions(run),
    created_at: run.created_at,
    updated_at: run.updated_at,
    title: run.original?.title,
    workspace: run.workspace,
    workspaceDir: run.workspaceDir,
    github: run.github,
    lark: run.lark,
    kiro: run.kiro,
    writer: run.writer,
    commands: run.commands,
    timeline: run.timeline,
    larkVerdict: larkVerdict(run),
    reports: run.artifacts
  };
}

async function publicGalleryRun(run) {
  const storyPath = path.join(run.workspaceDir, "reports", "case-file.md");
  let story = "";
  try {
    story = await fs.readFile(storyPath, "utf8");
  } catch {
    // Partial cases may not have a story yet.
  }
  return {
    ...publicRun(run),
    story: {
      path: "reports/case-file.md",
      excerpt: story.replace(/^#.*$/m, "").trim().slice(0, 600)
    },
    zipAvailable: false
  };
}

function sendJson(response, value, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(value, null, 2)}\n`);
}

async function sendFile(response, filePath, contentType) {
  try {
    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      "content-type": contentType,
      "cache-control": "public, max-age=3600"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.code === "ENOENT" ? "Asset not found.\n" : `Unable to read asset: ${error.message}\n`);
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) {
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        const error = new Error("Request body must be valid JSON.");
        error.statusCode = 400;
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function proxyTerminalInput(action) {
  try {
    const response = await fetch(`${terminalControlUrl}/input`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || "Terminal control sidecar rejected the action.");
      error.statusCode = response.status === 400 ? 400 : 502;
      throw error;
    }
    return { ok: true, action };
  } catch (error) {
    if (error.statusCode === 400) throw error;
    const proxyError = new Error(`Terminal control is unavailable: ${error.message}`);
    proxyError.statusCode = 502;
    throw proxyError;
  }
}

function renderHome(initialPath = "/") {
  const icon = {
    enter: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 10l-4 4 4 4"/><path d="M5 14h11a3 3 0 0 0 3-3V6"/></svg>`,
    up: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>`,
    down: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`,
    info: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
    minus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>`,
    marginOut: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4-4"/><path d="M4 4v5"/><path d="M4 4h5"/><path d="m16 8 4-4"/><path d="M20 4v5"/><path d="M20 4h-5"/><path d="m8 16-4 4"/><path d="M4 20v-5"/><path d="M4 20h5"/><path d="m16 16 4 4"/><path d="M20 20v-5"/><path d="M20 20h-5"/></svg>`,
    marginIn: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 5 5"/><path d="M9 4v5"/><path d="M4 9h5"/><path d="m20 4-5 5"/><path d="M15 4v5"/><path d="M20 9h-5"/><path d="m4 20 5-5"/><path d="M9 20v-5"/><path d="M4 15h5"/><path d="m20 20-5-5"/><path d="M15 20v-5"/><path d="M20 15h-5"/></svg>`,
    full: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`,
    normal: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M16 3v3a2 2 0 0 0 2 2h3"/><path d="M8 21v-3a2 2 0 0 0-2-2H3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`
  };
  const iconJson = JSON.stringify({ full: icon.full, normal: icon.normal });
  const terminalUrlJson = JSON.stringify(terminalUrl);
  const initialPathJson = JSON.stringify(initialPath);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Coding Cold Cases Cracker</title>
    <style>
      :root { color-scheme: dark; --bg: #080b0a; --panel: #101210; --ink: #e7f5e8; --muted: #8a9a8f; --amber: #c2a96a; --blue: #4a90e2; --green: #6ee787; --closed: #a6f3b6; --red: #d64b4b; --line: #29352d; }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 100%; min-height: 100%; background: var(--bg); color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0; overflow: hidden; }
      body { min-height: 100vh; }
      button, label { font: inherit; }
      .screen { min-height: 100vh; display: none; }
      .screen.active { display: grid; }
      .title, .web-page { position: relative; isolation: isolate; background: #050706 url("/assets/retro_investigator.png") center / cover no-repeat; }
      .title::before, .web-page::before { content: ""; position: absolute; inset: 0; z-index: -2; background: inherit; filter: saturate(.72) contrast(1.02) brightness(.56); }
      .title::after, .web-page::after { content: ""; position: absolute; inset: 0; z-index: -1; background:
        radial-gradient(circle at 52% 48%, rgba(110,231,135,.10), transparent 0 12%, rgba(0,0,0,.18) 38%, rgba(0,0,0,.74) 100%),
        linear-gradient(90deg, rgba(0,0,0,.83), rgba(0,0,0,.42) 50%, rgba(0,0,0,.78)); }
      .title { place-items: center; padding: 24px; text-align: center; overflow: hidden; }
      .title-inner { width: min(760px, 100%); }
      .web-page { align-items: start; justify-items: stretch; padding: clamp(18px, 5vw, 64px); overflow: auto; }
      .web-page-inner { width: min(1180px, 100%); margin: 0 auto; min-height: calc(100vh - clamp(18px, 5vw, 64px) * 2); display: grid; grid-template-rows: auto 1fr; gap: 28px; }
      .web-nav { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(194,169,106,.28); }
      .web-nav a { color: var(--muted); text-decoration: none; text-transform: uppercase; font-size: 13px; }
      .web-nav a:hover, .web-nav a:focus-visible { color: var(--green); outline: none; }
      .web-page h2 { margin: 0 0 16px; font-size: clamp(36px, 6.5vw, 78px); line-height: .98; max-width: 980px; }
      .web-page p { color: var(--muted); line-height: 1.6; }
      .page-hero { max-width: 980px; }
      .page-grid { display: grid; grid-template-columns: minmax(260px, .92fr) minmax(360px, 1.08fr); gap: clamp(24px, 5vw, 70px); align-items: start; }
      .options-grid { display: grid; grid-template-columns: minmax(280px, 520px); gap: 18px; align-content: start; }
      .page-section { border-top: 1px solid rgba(194,169,106,.28); padding-top: 14px; }
      .page-section h3 { color: var(--amber); margin: 0 0 10px; font-size: 15px; text-transform: uppercase; }
      .page-section ul, .page-section ol { color: var(--muted); line-height: 1.55; padding-left: 20px; margin: 0; }
      .page-section li + li { margin-top: 6px; }
      .option-list { display: grid; gap: 10px; }
      .option-row { min-height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border: 1px solid rgba(41,53,45,.9); background: rgba(16,18,16,.72); padding: 8px 10px 8px 14px; }
      .option-label { color: var(--ink); }
      .option-row.disabled { opacity: .48; }
      .option-row.disabled .terminal-button { pointer-events: none; }
      .option-action { min-width: 158px; min-height: 36px; border-color: rgba(194,169,106,.34); }
      .option-note { min-height: 20px; color: var(--muted); }
      .eyebrow { color: var(--green); font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
      h1 { margin: 0; font-size: clamp(34px, 8vw, 76px); line-height: 1; text-shadow: 0 4px 28px rgba(0,0,0,.9); }
      .subtitle { color: var(--ink); margin: 18px auto 30px; max-width: 620px; line-height: 1.55; text-shadow: 0 2px 18px rgba(0,0,0,.86); }
      .menu { display: grid; gap: 10px; width: min(360px, 100%); margin: 0 auto; }
      .terminal-button, .icon-button { color: var(--ink); background: #0b100d; border: 1px solid var(--line); border-radius: 2px; cursor: pointer; }
      .terminal-button { min-height: 46px; padding: 0 16px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: .2ch; text-decoration: none; }
      .terminal-button:hover, .terminal-button:focus-visible, .terminal-button.selected { outline: none; border-color: var(--green); box-shadow: inset 0 0 0 1px var(--green); }
      .terminal-button:hover .button-label::before, .terminal-button:focus-visible .button-label::before, .terminal-button.selected .button-label::before { content: "[ "; color: var(--amber); }
      .terminal-button:hover .button-label::after, .terminal-button:focus-visible .button-label::after, .terminal-button.selected .button-label::after { content: " ]"; color: var(--amber); }
      .skip { color: var(--muted); display: inline-flex; gap: 8px; align-items: center; justify-content: center; margin-top: 16px; }
      .desk { grid-template-rows: 1fr; padding: 10px; }
      .bezel {
        --bezel-top: 44px;
        --bezel-side: 44px;
        --bezel-bottom: 54px;
        --bezel-extra: 0px;
        position: relative;
        height: calc(100vh - 20px);
        min-height: 360px;
        border: 1px solid #1c2a22;
        background: #060807;
        padding:
          calc(var(--bezel-top) + var(--bezel-extra))
          calc(var(--bezel-side) + var(--bezel-extra))
          calc(var(--bezel-bottom) + var(--bezel-extra))
          calc(var(--bezel-side) + var(--bezel-extra));
        display: grid;
        grid-template-rows: minmax(0, 1fr);
        overflow: hidden;
      }
      .bezel::before { content: ""; pointer-events: none; position: absolute; inset: auto 0 0; height: calc(var(--bezel-bottom) + var(--bezel-extra)); border-top: 1px solid rgba(255, 255, 255, .04); background: repeating-linear-gradient(0deg, rgba(255,255,255,.025), rgba(255,255,255,.025) 1px, transparent 1px, transparent 3px); opacity: .55; }
      .bezel::after {
        content: "";
        pointer-events: none;
        position: absolute;
        inset:
          calc(var(--bezel-top) + var(--bezel-extra))
          calc(var(--bezel-side) + var(--bezel-extra))
          calc(var(--bezel-bottom) + var(--bezel-extra))
          calc(var(--bezel-side) + var(--bezel-extra));
        border: 1px solid rgba(110, 231, 135, .18);
        box-shadow: inset 0 0 38px rgba(110, 231, 135, .08);
      }
      iframe { width: 100%; height: 100%; min-height: 0; border: 0; background: #000; position: relative; z-index: 1; }
      .bezel-controls { position: absolute; z-index: 2; display: flex; gap: 8px; align-items: center; }
      .top-left { top: 8px; left: 14px; }
      .top-right { top: 8px; right: 14px; }
      .bottom-left { left: 14px; bottom: 12px; }
      .bottom-right { right: 14px; bottom: 12px; }
      .icon-button { width: 28px; height: 28px; display: inline-grid; place-items: center; padding: 0; color: #9aaba0; background: linear-gradient(#101713, #090d0b); border: 1px solid #203328; border-radius: 3px; box-shadow: inset 0 1px 0 rgba(255,255,255,.09), inset 0 -2px 0 rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.55); }
      .icon-button:hover, .icon-button:focus-visible { border-color: #3c5747; color: var(--ink); outline: none; }
      .icon-button.pressed { color: var(--green); border-color: var(--green); transform: translateY(1px); box-shadow: inset 0 2px 4px rgba(0,0,0,.75), 0 0 8px rgba(110,231,135,.16); }
      svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
      .hidden { display: none; }
      @media (max-width: 720px) {
        html, body { overflow: auto; }
        .title::after, .web-page::after { background:
          radial-gradient(circle at 50% 44%, rgba(110,231,135,.08), transparent 0 12%, rgba(0,0,0,.28) 36%, rgba(0,0,0,.82) 100%),
          linear-gradient(90deg, rgba(0,0,0,.86), rgba(0,0,0,.70)); }
        .page-grid, .options-grid { grid-template-columns: 1fr; }
        .web-page { align-items: start; padding: 22px; }
        .web-page-inner { min-height: auto; }
        .web-nav { align-items: start; flex-direction: column; }
        .option-row { align-items: stretch; flex-direction: column; }
        .option-action { width: 100%; }
        .bezel { --bezel-top: 42px; --bezel-side: 12px; --bezel-bottom: 52px; }
        .bottom-left, .bottom-right { gap: 3px; }
        .icon-button { width: 26px; height: 26px; }
      }
    </style>
  </head>
  <body>
    <main id="title" class="screen title active">
      <section class="title-inner">
        <div class="eyebrow">Vet &gt; Vibe &gt; Validate</div>
        <h1>Coding Cold Cases Cracker</h1>
        <p class="subtitle">Reconstruct the failure, work the fix, prove the close.</p>
        <nav class="menu" aria-label="Title menu">
          <a class="terminal-button selected" data-title-menu="0" href="/desk"><span class="button-label">Go to Desk</span></a>
          <a class="terminal-button" data-title-menu="1" href="/options"><span class="button-label">Options</span></a>
          <a class="terminal-button" data-title-menu="2" href="/about"><span class="button-label">About</span></a>
        </nav>
        <label class="skip"><input id="skipTitle" type="checkbox"> Skip title next time</label>
      </section>
    </main>

    <main id="optionsPage" class="screen web-page">
      <section class="web-page-inner">
        <nav class="web-nav" aria-label="Options navigation">
          <a href="/">Title</a>
          <a href="/desk">Terminal Desk</a>
          <a href="/about">About</a>
        </nav>
        <div class="options-grid">
          <section class="page-section">
            <h2>Options</h2>
            <div id="optionList" class="option-list" aria-live="polite">
              <div class="option-row"><span class="option-label">Kiro</span><button class="terminal-button option-action" type="button"><span class="button-label">Loading</span></button></div>
              <div class="option-row"><span class="option-label">Lark</span><button class="terminal-button option-action" type="button"><span class="button-label">Loading</span></button></div>
              <div class="option-row"><span class="option-label">GitHub</span><button class="terminal-button option-action" type="button"><span class="button-label">Loading</span></button></div>
              <div class="option-row disabled"><span class="option-label">Placeholder #1</span><button class="terminal-button option-action" type="button" disabled><span class="button-label">Locked</span></button></div>
              <div class="option-row disabled"><span class="option-label">Placeholder #2</span><button class="terminal-button option-action" type="button" disabled><span class="button-label">Locked</span></button></div>
            </div>
            <p id="optionNote" class="option-note" role="status"></p>
          </section>
        </div>
      </section>
    </main>

    <main id="aboutPage" class="screen web-page">
      <section class="web-page-inner">
        <nav class="web-nav" aria-label="About navigation">
          <a href="/">Title</a>
          <a href="/desk">Terminal Desk</a>
          <a href="/options">Options</a>
        </nav>
        <div class="page-grid">
          <section class="page-section">
            <div class="eyebrow">Case Desk Briefing</div>
            <h2>Coding Cold Cases Cracker</h2>
            <p><strong>Vet. Vibe. Validate.</strong> Reconstruct the failure, work the fix, prove the close.</p>
          </section>
          <section class="page-section">
            <h3>What This Is</h3>
            <p>Coding Cold Cases Cracker reopens old unresolved developer questions and turns them into evidence-backed case files. The desk favors reproduced evidence over confident guesses: reconstruct, test, repair, validate, and preserve the trail.</p>
          </section>
          <section class="page-section">
            <h3>How To Work The Desk</h3>
            <ol>
              <li>Use Go to Desk to enter the terminal.</li>
              <li>Use Up, Down, Enter, and Esc from the keyboard or bezel buttons.</li>
              <li>Open a case file, then Start Casework to run Vet -> Vibe -> Validate.</li>
              <li>Monitor watches the run; Examine opens Lark evidence; Confer calls in Larkule Quirot; Approve closes validated work.</li>
            </ol>
          </section>
          <section class="page-section">
            <h3>Why Lark</h3>
            <p>Lark is the forensic backbone: it runs independent workflows, records reproducible evidence, and gives the closure verdict. Its CLI-first model fits automated investigation work, and its artifacts make the final case file inspectable instead of merely persuasive.</p>
          </section>
          <section class="page-section">
            <h3>Status Language</h3>
            <ul>
              <li>Cold Case: no active run yet.</li>
              <li>Evidence Collected: the first Lark pass has evidence.</li>
              <li>Resolution Validated: Lark accepted the repaired case.</li>
              <li>Case Closed: the user approved the validated resolution.</li>
              <li>Unproven: useful clues may exist, but closure was not earned.</li>
            </ul>
          </section>
        </div>
      </section>
    </main>

    <main id="desk" class="screen desk">
      <section class="bezel" aria-label="Full screen terminal desk">
        <div class="bezel-controls top-left">
          <a class="icon-button" title="Back to title" href="/">${icon.back}</a>
        </div>
        <div class="bezel-controls top-right">
          <a class="icon-button" title="About" href="/about">${icon.info}</a>
        </div>
        <iframe id="terminal" src="${terminalUrl}" title="Coding Cold Cases terminal"></iframe>
        <div class="bezel-controls bottom-left">
          <button id="keyEnter" class="icon-button" type="button" title="Enter" onclick="triggerBezelKey('enter')">${icon.enter}</button>
          <button id="keyUp" class="icon-button" type="button" title="Up" onclick="triggerBezelKey('up')">${icon.up}</button>
          <button id="keyDown" class="icon-button" type="button" title="Down" onclick="triggerBezelKey('down')">${icon.down}</button>
          <button id="keyBack" class="icon-button" type="button" title="Back" onclick="triggerBezelKey('back')">${icon.back}</button>
        </div>
        <div class="bezel-controls bottom-right">
          <button class="icon-button" type="button" title="Zoom in" onclick="terminalZoom(1)">${icon.plus}</button>
          <button class="icon-button" type="button" title="Zoom out" onclick="terminalZoom(-1)">${icon.minus}</button>
          <button class="icon-button" type="button" title="Increase margin" onclick="terminalMargin(1)">${icon.marginIn}</button>
          <button class="icon-button" type="button" title="Decrease margin" onclick="terminalMargin(-1)">${icon.marginOut}</button>
          <button id="fullscreenButton" class="icon-button" type="button" title="Fullscreen" onclick="toggleFullscreen()">${icon.full}</button>
        </div>
      </section>
    </main>
    <script>
      const fullscreenIcons = ${iconJson};
      const terminalUrl = ${terminalUrlJson};
      const initialPath = ${initialPathJson};
      const skipTitle = document.getElementById('skipTitle');
      const titleButtons = [...document.querySelectorAll('[data-title-menu]')];
      let titleCursor = 0;
      skipTitle.checked = localStorage.getItem('ccc.skipTitle') === 'yes';
      skipTitle.addEventListener('change', () => localStorage.setItem('ccc.skipTitle', skipTitle.checked ? 'yes' : 'no'));
      titleButtons.forEach((button, index) => {
        button.addEventListener('mouseenter', () => {
          titleCursor = index;
          updateTitleSelection();
        });
        button.addEventListener('focus', () => {
          titleCursor = index;
          updateTitleSelection();
        });
      });
      bootRoute(initialPath);

      function hideScreens() {
        document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
      }
      function bootRoute(pathname) {
        if (pathname === '/desk' || (pathname === '/' && skipTitle.checked)) {
          if (pathname === '/' && skipTitle.checked) history.replaceState({}, '', '/desk');
          showDesk();
          return;
        }
        if (pathname === '/options') {
          showOptions();
          return;
        }
        if (pathname === '/about') {
          showAbout();
          return;
        }
        showTitle();
      }
      function showDesk() {
        hideScreens();
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.getElementById('desk').classList.add('active');
        requestAnimationFrame(() => {
          resizeTerminal();
          document.getElementById('terminal').focus();
        });
      }
      function showTitle() {
        hideScreens();
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.getElementById('title').classList.add('active');
        updateTitleSelection();
      }
      function updateTitleSelection() {
        titleButtons.forEach((button, index) => button.classList.toggle('selected', index === titleCursor));
      }
      async function showOptions() {
        hideScreens();
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.getElementById('optionsPage').classList.add('active');
        const data = await fetch('/api/status').then((response) => response.json());
        const options = [
          {
            label: data.kiro.ok ? 'Kiro Authenticated' : 'Kiro',
            action: data.kiro.ok ? 'Re-Authenticate' : 'Authenticate Kiro'
          },
          {
            label: data.env.hasLarkApiKey ? 'Lark Connected' : 'Lark',
            action: data.env.hasLarkApiKey ? 'Re-Connect' : 'Connect Lark'
          },
          {
            label: data.env.hasGithubToken ? 'GitHub Connected' : 'GitHub',
            action: data.env.hasGithubToken ? 'Re-Connect' : 'Connect GitHub'
          }
        ];
        document.getElementById('optionList').innerHTML = [
          ...options.map((item) => '<div class="option-row"><span class="option-label">' + item.label + '</span><button class="terminal-button option-action" type="button" onclick="showOptionNotice()"><span class="button-label">' + item.action + '</span></button></div>'),
          '<div class="option-row disabled"><span class="option-label">Placeholder #1</span><button class="terminal-button option-action" type="button" disabled><span class="button-label">Locked</span></button></div>',
          '<div class="option-row disabled"><span class="option-label">Placeholder #2</span><button class="terminal-button option-action" type="button" disabled><span class="button-label">Locked</span></button></div>'
        ].join('');
      }
      function showOptionNotice() {
        document.getElementById('optionNote').textContent = 'Connections are managed by this deployment.';
      }
      function showAbout() {
        hideScreens();
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.getElementById('aboutPage').classList.add('active');
      }
      let zoom = 1;
      let margin = 0;
      function terminalZoom(delta) {
        zoom = Math.max(.8, Math.min(1.3, zoom + delta * .1));
        resizeTerminal();
      }
      function terminalMargin(delta) {
        margin = Math.max(0, Math.min(48, margin + delta * 8));
        document.querySelector('.bezel').style.setProperty('--bezel-extra', margin + 'px');
        requestAnimationFrame(resizeTerminal);
      }
      async function toggleFullscreen() {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.querySelector('.bezel').requestFullscreen();
        }
      }
      function updateFullscreenButton() {
        const button = document.getElementById('fullscreenButton');
        const active = Boolean(document.fullscreenElement);
        button.innerHTML = active ? fullscreenIcons.normal : fullscreenIcons.full;
        button.title = active ? 'Exit fullscreen' : 'Fullscreen';
        button.setAttribute('aria-label', button.title);
      }
      async function triggerBezelKey(name) {
        const ids = { enter: 'keyEnter', up: 'keyUp', down: 'keyDown', back: 'keyBack' };
        const button = document.getElementById(ids[name]);
        if (!button) return;
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 140);
        try {
          const response = await fetch('/api/terminal/input', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: name })
          });
          if (!response.ok) console.warn('Terminal control failed', await response.text());
        } catch (error) {
          console.warn('Terminal control unavailable', error);
        }
      }
      function handleDeskKeyboard(event) {
        if (!document.getElementById('desk').classList.contains('active')) return;
        if (document.activeElement === document.getElementById('terminal')) return;

        const map = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          Enter: 'enter',
          Escape: 'back'
        };
        const keyName = map[event.key];
        if (!keyName) return;
        event.preventDefault();
        triggerBezelKey(keyName);
      }
      function handleTitleKeyboard(event) {
        if (!document.getElementById('title').classList.contains('active')) return;
        if (document.activeElement === skipTitle) return;
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          titleCursor = (titleCursor - 1 + titleButtons.length) % titleButtons.length;
          updateTitleSelection();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          titleCursor = (titleCursor + 1) % titleButtons.length;
          updateTitleSelection();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          titleButtons[titleCursor].click();
        } else if (event.key === 'Escape') {
          event.preventDefault();
        }
      }
      function resizeTerminal() {
        const iframe = document.querySelector('iframe');
        const bezel = document.querySelector('.bezel');
        if (!document.getElementById('desk').classList.contains('active')) return;
        const rect = bezel.getBoundingClientRect();
        if (rect.height < 100) return;
        const style = getComputedStyle(bezel);
        const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const height = Math.max(320, rect.height - paddingY);
        iframe.style.transform = 'scale(' + zoom + ')';
        iframe.style.transformOrigin = 'top left';
        iframe.style.width = (100 / zoom) + '%';
        iframe.style.height = (height / zoom) + 'px';
      }
      document.addEventListener('fullscreenchange', updateFullscreenButton);
      document.addEventListener('keydown', handleDeskKeyboard);
      document.addEventListener('keydown', handleTitleKeyboard);
      window.addEventListener('resize', resizeTerminal);
      window.addEventListener('load', () => requestAnimationFrame(resizeTerminal));
      updateFullscreenButton();
      updateTitleSelection();
    </script>
  </body>
</html>`;
}
