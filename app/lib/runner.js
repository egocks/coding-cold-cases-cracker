import { spawn } from "node:child_process";

export function runCommand(command, options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = { ...process.env, ...(options.env || {}) };
  const timeoutMs = options.timeoutMs || 10 * 60 * 1000;

  return new Promise((resolve) => {
    const child = spawn("bash", ["-lc", command], { cwd, env });
    let output = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      output += `\n[timeout] Command exceeded ${timeoutMs}ms and was terminated.\n`;
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      options.onData?.(chunk.toString(), "stdout");
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
      options.onData?.(chunk.toString(), "stderr");
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, signal, output });
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: 1, signal: null, output: `${output}\n${error.stack || error.message}\n` });
    });
  });
}
