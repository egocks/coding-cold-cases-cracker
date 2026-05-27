#!/usr/bin/env node
import http from "node:http";
import { execFile } from "node:child_process";

const port = Number.parseInt(process.env.TERMINAL_CONTROL_PORT || "7682", 10);
const host = process.env.TERMINAL_CONTROL_HOST || "0.0.0.0";
const allowedActions = new Set(["enter", "up", "down", "back"]);

const server = http.createServer(async (request, response) => {
  try {
    if (request.method !== "POST" || request.url !== "/input") {
      return sendJson(response, { ok: false, error: "Not found." }, 404);
    }

    const payload = await readJson(request);
    const action = String(payload.action || "");
    if (!allowedActions.has(action)) {
      return sendJson(response, { ok: false, error: "Unsupported terminal action." }, 400);
    }

    const result = await sendTmuxAction(action);
    if (!result.ok) {
      return sendJson(response, { ok: false, error: result.error }, result.status);
    }

    return sendJson(response, { ok: true, action });
  } catch (error) {
    return sendJson(response, { ok: false, error: error.message }, error.statusCode || 500);
  }
});

server.listen(port, host, () => {
  console.log(`Terminal control sidecar listening on ${host}:${port}`);
});

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

function sendTmuxAction(action) {
  return new Promise((resolve) => {
    execFile("bash", ["/workspace/scripts/tmux-send.sh", action], { cwd: "/workspace", env: process.env }, (error, stdout, stderr) => {
      if (!error) {
        resolve({ ok: true });
        return;
      }
      resolve({
        ok: false,
        status: error.code === 64 ? 400 : 503,
        error: (stderr || stdout || error.message).trim()
      });
    });
  });
}

function sendJson(response, value, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(value, null, 2)}\n`);
}
