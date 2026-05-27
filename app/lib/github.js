import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCommand } from "./runner.js";

export async function publishRunToGitHub(run, { onData } = {}) {
  const repoUrl = process.env.GITHUB_REPO_URL;
  const token = process.env.GITHUB_TOKEN;
  if (!repoUrl || !token) {
    return {
      published: false,
      output: "GITHUB_REPO_URL or GITHUB_TOKEN is missing. Skipping remote publish.",
      branch: null,
      remoteUrl: null
    };
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cccc-publish-"));
  const authUrl = withToken(repoUrl, token);
  const branch = `cold-case/${run.case_id}/${run.run_id}`;
  const targetPath = path.join("cases", "workspaces", run.case_id, run.run_id);
  const redactedOnData = (chunk, stream) => onData?.(redactToken(chunk, token), stream);

  try {
    const clone = await runCommand(`git clone --depth 1 ${shellQuote(authUrl)} repo`, { cwd: tempRoot, timeoutMs: 5 * 60 * 1000, onData: redactedOnData });
    if (clone.code !== 0) return publishFailure(clone.output, branch, token);

    const repoDir = path.join(tempRoot, "repo");
    const branchExists = await runCommand(`git ls-remote --exit-code --heads origin ${shellQuote(branch)}`, { cwd: repoDir, onData: redactedOnData });
    const checkoutCommand = branchExists.code === 0
      ? `git fetch origin ${shellQuote(branch)} && git checkout -B ${shellQuote(branch)} FETCH_HEAD`
      : `git checkout -b ${shellQuote(branch)}`;
    const checkout = await runCommand(checkoutCommand, { cwd: repoDir, onData: redactedOnData });
    if (checkout.code !== 0) return publishFailure(`${clone.output}\n${checkout.output}`, branch, token);

    await fs.mkdir(path.join(repoDir, targetPath), { recursive: true });
    await fs.cp(run.workspaceDir, path.join(repoDir, targetPath), {
      recursive: true,
      filter: (source) => {
        const parts = source.split(path.sep);
        return !parts.includes(".git") && !parts.includes("target") && !parts.includes("node_modules") && !parts.includes(".m2");
      }
    });

    const commit = await runCommand(
      [
        "git add cases/workspaces",
        "git -c user.name='Coding Cold Cases Bot' -c user.email='cold-cases@example.invalid' commit -m " + shellQuote(`Add cold case run ${run.case_id} ${run.run_id}`),
        `git push origin ${shellQuote(branch)}`
      ].join(" && "),
      { cwd: repoDir, timeoutMs: 5 * 60 * 1000, onData: redactedOnData }
    );

    if (commit.code !== 0) return publishFailure(`${clone.output}\n${checkout.output}\n${commit.output}`, branch, token);

    return {
      published: true,
      output: redactToken(`${clone.output}\n${checkout.output}\n${commit.output}`, token),
      branch,
      remoteUrl: publicRunUrl(repoUrl, branch, targetPath)
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function publishFailure(output, branch, token = "") {
  return {
    published: false,
    output: token ? redactToken(output, token) : output,
    branch,
    remoteUrl: null
  };
}

function withToken(repoUrl, token) {
  if (repoUrl.startsWith("https://")) {
    return repoUrl.replace("https://", `https://x-access-token:${encodeURIComponent(token)}@`);
  }
  return repoUrl;
}

function publicRunUrl(repoUrl, branch, targetPath) {
  const clean = repoUrl.replace(/\.git$/, "").replace(/^git@github\.com:/, "https://github.com/").replace(/\/\/x-access-token:[^@]+@/, "//");
  return `${clean}/tree/${encodeURIComponent(branch).replace(/%2F/g, "/")}/${targetPath}`;
}

function redactToken(output, token) {
  return output.replaceAll(token, "[redacted]");
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}
