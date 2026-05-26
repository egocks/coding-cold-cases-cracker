import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { buildCaseIndex, getCase, loadCaseIndex } from "./lib/case-indexer.js";
import { createRun } from "./lib/pipeline.js";
import { findRunById, listCaseRuns, listRuns } from "./lib/workspace.js";
import { projectRoot, zipsDir, ensureDir } from "./lib/paths.js";
import { runCommand } from "./lib/runner.js";

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
      return sendJson(response, { ...coldCase, runs: runs.map(publicRun) });
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

    const eventsMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/events$/);
    if (request.method === "GET" && eventsMatch) {
      const run = await findRunById(decodeURIComponent(eventsMatch[1]));
      return sendJson(response, { run: publicRun(run), timeline: run.timeline || [] });
    }

    const zipMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/zip$/);
    if (request.method === "POST" && zipMatch) {
      const run = await findRunById(decodeURIComponent(zipMatch[1]));
      const zipPath = await zipRun(run);
      return sendJson(response, { ok: true, zipPath });
    }

    if (request.method === "GET" && url.pathname === "/api/gallery") {
      const runs = (await listRuns()).filter((run) => ["closed", "partial", "reports_ready"].includes(run.status));
      return sendJson(response, { count: runs.length, runs: runs.map(publicRun) });
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
      hasGroqApiKey: Boolean(process.env.GROQ_API_KEY),
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
      partial: runs.filter((run) => run.status === "partial").length
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
    created_at: run.created_at,
    updated_at: run.updated_at,
    title: run.original?.title,
    workspace: run.workspace,
    workspaceDir: run.workspaceDir,
    github: run.github,
    lark: run.lark,
    reports: run.artifacts
  };
}

function sendJson(response, value, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(value, null, 2)}\n`);
}

function renderHome() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Coding Cold Cases Cracker</title>
    <style>
      :root { color-scheme: dark; --ink: #eef8f2; --muted: #9fb6aa; --accent: #56e08c; --warn: #f5cf64; --bg: #07100c; --panel: #101a15; --line: #2a4135; --danger: #ff7f7f; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; background: #07100c; color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0; }
      main { width: min(1240px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0; }
      h1 { margin: 0 0 8px; font-size: clamp(30px, 5vw, 62px); line-height: 0.98; }
      h2 { margin: 0 0 12px; font-size: 18px; }
      p { color: var(--muted); line-height: 1.55; }
      .eyebrow { color: var(--accent); font-weight: 800; text-transform: uppercase; font-size: 13px; }
      .grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 14px; margin-top: 22px; }
      .panel { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 16px; }
      .status { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .chip { min-height: 52px; border: 1px solid var(--line); border-radius: 6px; padding: 9px; background: #0b1510; }
      .chip strong { display: block; color: var(--accent); font-size: 12px; text-transform: uppercase; }
      .chip span { color: var(--ink); font-size: 14px; overflow-wrap: anywhere; }
      a.button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 6px; background: var(--accent); color: #06100b; font-weight: 900; text-decoration: none; }
      code { color: var(--accent); }
      pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; color: var(--muted); }
      iframe { width: 100%; height: 650px; border: 1px solid var(--line); border-radius: 8px; background: #000; }
      .pixel { display: grid; grid-template-columns: repeat(16, 1fr); gap: 2px; width: 128px; margin-left: auto; }
      .pixel i { aspect-ratio: 1; background: #13251c; }
      .pixel i:nth-child(3n) { background: #1d3b2b; }
      .pixel i:nth-child(5n) { background: var(--accent); }
      @media (max-width: 900px) { .grid, .status { grid-template-columns: 1fr; } .pixel { display: none; } }
    </style>
  </head>
  <body>
    <main>
      <div style="display:flex; gap:16px; align-items:start">
        <div>
          <div class="eyebrow">Support incident reproduction lab</div>
          <h1>Coding Cold Cases Cracker</h1>
          <p>Kiro investigates. Lark verifies. Groq writes the case file. The terminal desk is the product surface.</p>
        </div>
        <div class="pixel" aria-hidden="true">${"<i></i>".repeat(64)}</div>
      </div>

      <section class="panel">
        <h2>Readiness</h2>
        <div id="status" class="status">
          <div class="chip"><strong>Status</strong><span>Loading...</span></div>
        </div>
      </section>

      <div class="grid">
        <section class="panel">
          <h2>Judge Path</h2>
          <p>Install Docker, add keys to <code>.env</code>, then run <code>docker compose up --build</code>.</p>
          <p><a class="button" href="${terminalUrl}" target="_blank" rel="noreferrer">Open Terminal Desk</a></p>
          <pre id="cases"></pre>
        </section>
        <section class="panel">
          <h2>Pipeline</h2>
          <pre>Indexed -> Workspace -> Kiro Reproduction -> Lark Repro Evidence -> Kiro Repair -> Lark Verification -> Closed/Partial/Blocked</pre>
        </section>
      </div>

      <section class="panel" style="margin-top:14px">
        <h2>Embedded Terminal</h2>
        <iframe src="${terminalUrl}" title="Coding Cold Cases terminal"></iframe>
      </section>
    </main>
    <script>
      async function refresh() {
        const response = await fetch('/api/status');
        const data = await response.json();
        const chip = (name, value) => '<div class="chip"><strong>' + name + '</strong><span>' + value + '</span></div>';
        document.getElementById('status').innerHTML = [
          chip('Kiro', data.kiro.mode),
          chip('Lark', data.env.hasLarkApiKey ? 'ready' : 'missing key'),
          chip('Groq', data.env.hasGroqApiKey ? 'ready' : 'missing key'),
          chip('GitHub', data.env.hasGithubToken ? 'ready' : 'local only')
        ].join('');
        document.getElementById('cases').textContent = 'Cases: ' + data.cases.count + ' (' + data.cases.shortlistCount + ' shortlist)\\nRuns: ' + data.runs.total + ' | Closed: ' + data.runs.closed + ' | Partial: ' + data.runs.partial;
      }
      refresh();
      setInterval(refresh, 5000);
    </script>
  </body>
</html>`;
}
