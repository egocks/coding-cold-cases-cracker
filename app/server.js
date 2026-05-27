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
import { availableActions, bulletinsFromRuns, evidencePayload, latestNonClosedRun, larkVerdict, publicStatus, publicStatusReason } from "./lib/presenter.js";

const port = Number.parseInt(process.env.APP_PORT || "3000", 10);
const terminalUrl = process.env.TERMINAL_URL || "http://localhost:7681";

await buildCaseIndex();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return sendJson(response, await statusPayload());
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
      return sendJson(response, { bulletins: bulletinsFromRuns(await listRuns()) });
    }

    const caseBulletinsMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/bulletins$/);
    if (request.method === "GET" && caseBulletinsMatch) {
      const caseId = decodeURIComponent(caseBulletinsMatch[1]);
      return sendJson(response, { caseId, bulletins: bulletinsFromRuns(await listRuns(), { caseId }) });
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(renderHome());
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

function renderHome() {
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
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Coding Cold Cases Cracker</title>
    <style>
      :root { color-scheme: dark; --bg: #080b0a; --panel: #101210; --ink: #e7f5e8; --muted: #8a9a8f; --amber: #c2a96a; --blue: #4a90e2; --green: #6ee787; --closed: #a6f3b6; --red: #d64b4b; --line: #29352d; }
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; background: var(--bg); color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0; overflow: hidden; }
      button, label { font: inherit; }
      .screen { min-height: 100vh; display: none; }
      .screen.active { display: grid; }
      .title { place-items: center; padding: 24px; text-align: center; }
      .title-inner { width: min(760px, 100%); }
      .eyebrow { color: var(--green); font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
      h1 { margin: 0; font-size: clamp(34px, 8vw, 76px); line-height: 1; }
      .subtitle { color: var(--muted); margin: 18px auto 30px; max-width: 620px; line-height: 1.55; }
      .menu { display: grid; gap: 10px; width: min(360px, 100%); margin: 0 auto; }
      .terminal-button, .icon-button { color: var(--ink); background: #0b100d; border: 1px solid var(--line); border-radius: 2px; cursor: pointer; }
      .terminal-button { min-height: 46px; padding: 0 16px; text-transform: uppercase; }
      .terminal-button:hover, .terminal-button:focus-visible { outline: none; border-color: var(--green); box-shadow: inset 0 0 0 1px var(--green); }
      .terminal-button:hover::before, .terminal-button:focus-visible::before { content: "[ "; color: var(--amber); }
      .terminal-button:hover::after, .terminal-button:focus-visible::after { content: " ]"; color: var(--amber); }
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
      .panel { max-width: 760px; border: 1px solid var(--line); padding: 20px; background: var(--panel); }
      .hidden { display: none; }
      @media (max-width: 720px) {
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
          <button class="terminal-button" type="button" onclick="showDesk()">Go to Desk</button>
          <button class="terminal-button" type="button" onclick="showPanel('options')">Options</button>
          <button class="terminal-button" type="button" onclick="showPanel('about')">About</button>
        </nav>
        <label class="skip"><input id="skipTitle" type="checkbox"> Skip title next time</label>
      </section>
    </main>

    <main id="desk" class="screen desk">
      <section class="bezel" aria-label="Full screen terminal desk">
        <div class="bezel-controls top-left">
          <button class="icon-button" type="button" title="Back to title" onclick="showTitle()">${icon.back}</button>
        </div>
        <div class="bezel-controls top-right">
          <button class="icon-button" type="button" title="About" onclick="showPanel('about')">${icon.info}</button>
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

    <dialog id="modal" class="panel">
      <div id="modalContent"></div>
      <p><button class="terminal-button" type="button" onclick="document.getElementById('modal').close()">Back</button></p>
    </dialog>
    <script>
      const fullscreenIcons = ${iconJson};
      const skipTitle = document.getElementById('skipTitle');
      skipTitle.checked = localStorage.getItem('ccc.skipTitle') === 'yes';
      skipTitle.addEventListener('change', () => localStorage.setItem('ccc.skipTitle', skipTitle.checked ? 'yes' : 'no'));
      if (skipTitle.checked) showDesk();

      function showDesk() {
        document.getElementById('title').classList.remove('active');
        document.getElementById('desk').classList.add('active');
        requestAnimationFrame(() => {
          resizeTerminal();
          document.getElementById('terminal').focus();
        });
      }
      function showTitle() {
        document.getElementById('desk').classList.remove('active');
        document.getElementById('title').classList.add('active');
      }
      async function showPanel(kind) {
        const modal = document.getElementById('modal');
        const content = document.getElementById('modalContent');
        if (kind === 'about') {
          content.innerHTML = '<h2>Coding Cold Cases Cracker</h2><p>Vet. Vibe. Validate.</p><p>Reconstruct the failure, work the fix, prove the close.</p>';
        } else {
          const data = await fetch('/api/status').then((response) => response.json());
          content.innerHTML = '<h2>Options</h2><p>Terminal controls: zoom, margin, fullscreen.</p><p>Cases: ' + data.cases.count + ' | Closed: ' + data.runs.closed + ' | Resolution Validated: ' + data.runs.resolutionValidated + ' | Unproven: ' + data.runs.unproven + '</p>';
        }
        modal.showModal();
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
      function triggerBezelKey(name) {
        const ids = { enter: 'keyEnter', up: 'keyUp', down: 'keyDown', back: 'keyBack' };
        const button = document.getElementById(ids[name]);
        if (!button) return;
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 140);
      }
      function handleDeskKeyboard(event) {
        if (!document.getElementById('desk').classList.contains('active')) return;
        if (document.getElementById('modal').open) return;
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
      window.addEventListener('resize', resizeTerminal);
      window.addEventListener('load', () => requestAnimationFrame(resizeTerminal));
      updateFullscreenButton();
    </script>
  </body>
</html>`;
}
