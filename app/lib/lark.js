import fs from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./runner.js";

export async function generateLarkWorkflows(run) {
  const reproduction = workflowPayload(run, "reproduction");
  const verification = workflowPayload(run, "verification");
  await fs.writeFile(path.join(run.workspaceDir, "lark", "reproduction-workflow.json"), `${JSON.stringify(reproduction, null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, "lark", "verification-workflow.json"), `${JSON.stringify(verification, null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, "lark", "README.md"), larkReadme(run));
  await writeReplayArtifacts(run);
}

export async function runLarkReproduction(run, options = {}) {
  return runLarkPhase(run, "reproduction", options);
}

export async function runLarkVerification(run, options = {}) {
  return runLarkPhase(run, "verification", options);
}

async function runLarkPhase(run, kind, { onData } = {}) {
  const apiKey = process.env.GETLARK_API_KEY || process.env.LARKCI_API_KEY;
  if (!apiKey) {
    const output = "GETLARK_API_KEY is missing. Lark workflows were generated but not provisioned.";
    await writePhaseArtifacts(run, kind, {
      code: 2,
      output,
      provisioned: false,
      passed: false,
      groupId: run.lark?.group_id || null,
      workflowId: null,
      executionIds: []
    });
    return {
      code: 2,
      output,
      provisioned: false,
      passed: false,
      groupId: run.lark?.group_id || null,
      workflowId: null,
      executionIds: []
    };
  }

  const env = { GETLARK_API_KEY: apiKey };
  const group = await ensureWorkflowGroup(run, env, onData);
  const workflow = await createWorkflow(run, kind, group.groupId, env, onData);

  if (!workflow.workflowId) {
    const output = [group.output, workflow.output].join("\n");
    const result = {
      code: 1,
      output,
      provisioned: false,
      passed: false,
      groupId: group.groupId,
      workflowId: null,
      executionIds: []
    };
    await writePhaseArtifacts(run, kind, result);
    return result;
  }

  const invocation = await runCommand(`getlark workflows invoke --workflow-ids ${shellQuote(workflow.workflowId)} --wait --timeout ${Number(process.env.LARK_TIMEOUT_SECONDS || 600)} --verbose`, {
    cwd: run.workspaceDir,
    env,
    timeoutMs: Number(process.env.LARK_TIMEOUT_SECONDS || 600) * 1000 + 30_000,
    onData
  });

  const result = {
    code: invocation.code,
    output: [group.output, workflow.output, invocation.output].join("\n"),
    provisioned: true,
    passed: larkInvocationPassed(invocation, kind),
    groupId: group.groupId,
    workflowId: workflow.workflowId,
    executionIds: [...new Set(invocation.output.match(/wflw_exec_[A-Za-z0-9_-]+/g) || [])]
  };
  await writePhaseArtifacts(run, kind, result);
  return result;
}

async function ensureWorkflowGroup(run, env, onData) {
  if (run.lark?.group_id) {
    return { groupId: run.lark.group_id, output: `Reusing Lark workflow group ${run.lark.group_id}` };
  }

  const groupName = `Coding Cold Cases - ${run.case_id} - ${run.run_id}`;
  const group = await runCommand(`getlark workflow-groups create --name ${shellQuote(groupName)}`, {
    cwd: run.workspaceDir,
    env,
    timeoutMs: 2 * 60 * 1000,
    onData
  });
  return {
    groupId: extractId(group.output, /wfl_grp_[A-Za-z0-9_-]+/),
    output: group.output
  };
}

function larkInvocationPassed(invocation, kind) {
  if (invocation.code !== 0) return false;
  const output = invocation.output || "";
  if (/HTTP \d+|executed with failure|Workflows finished with status "failure"|Status: failure/i.test(output)) return false;
  if (kind === "verification" && /Error:/i.test(output)) return false;
  return /Status: success|executed successfully/i.test(output);
}

function workflowPayload(run, kind) {
  const isVerification = kind === "verification";
  return {
    name: `Coding Cold Cases - ${run.original.title} - ${isVerification ? "Verification" : "Reproduction Evidence"}`,
    mode: isVerification ? "deterministic" : "ai_driven",
    description: workflowDescription(run, kind)
  };
}

function workflowDescription(run, kind) {
  const command = kind === "verification" ? run.commands?.verify : run.commands?.reproduce;
  const remote = run.github?.remote_url || "PUBLISH_URL_PENDING";
  if (kind === "verification") {
    return [
      "You are Lark acting as the closure court for Coding Cold Cases Cracker.",
      `Remote workspace: ${remote}`,
      `Original case: ${run.original.url}`,
      `Verification command: ${command || "discover from case.json and reports/technical-report.md"}`,
      "Clone or inspect the reachable workspace, run the verification command when possible, and confirm whether the original failure is fixed.",
      "Also inspect lark/reproduction-evidence.json and reports/technical-report.md so the final verdict accounts for the original failure model.",
      "When possible, produce or validate green replay/test artifacts. If command-level verification is the responsible model, explain why.",
      "Return pass/fail evidence, exact logs, residual risk, and a concise final verdict. The case may be Closed only if this verification passes."
    ].join("\n");
  }
  return [
    "You are Lark acting as the forensic reproduction lab for Coding Cold Cases Cracker.",
    `Remote workspace: ${remote}`,
    `Original case: ${run.original.url}`,
    `Reproduction command: ${command || "discover from case.json and generated project files"}`,
    "Inspect the workspace and run or evaluate the reproduction path before any repair occurs.",
    "Confirm whether the observed failure matches the Stack Overflow cold case or a responsible minimal model of it.",
    "When possible, produce or validate red replay/test artifacts: shell replay, unit/integration test, minimal fixture, deterministic assertion, or failure classifier.",
    "Return the exact evidence that Kiro should use for repair. Include logs, assumptions, and any concern that would make the case partial or blocked."
  ].join("\n");
}

async function createWorkflow(run, kind, groupId, env, onData) {
  const payloadPath = path.join("lark", `${kind}-workflow.json`);
  const payload = JSON.parse(await fs.readFile(path.join(run.workspaceDir, payloadPath), "utf8"));
  const command = [
    "getlark workflows create",
    "--name", shellQuote(payload.name),
    "--description", shellQuote(payload.description),
    "--mode", shellQuote(payload.mode),
    groupId ? `--group-id ${shellQuote(groupId)}` : ""
  ].filter(Boolean).join(" ");
  const result = await runCommand(command, { cwd: run.workspaceDir, env, timeoutMs: 2 * 60 * 1000, onData });
  return {
    output: result.output,
    workflowId: extractId(result.output, /wflw_[A-Za-z0-9_-]+/)
  };
}

async function writePhaseArtifacts(run, kind, result) {
  const evidence = {
    phase: kind,
    passed: Boolean(result.passed),
    provisioned: Boolean(result.provisioned),
    group_id: result.groupId || null,
    workflow_id: result.workflowId || null,
    execution_ids: result.executionIds || [],
    verdict: phaseVerdict(kind, result),
    output_excerpt: excerpt(result.output)
  };
  await fs.writeFile(path.join(run.workspaceDir, "lark", `${kind}-output.md`), `# Lark ${title(kind)} Output\n\n\`\`\`text\n${result.output || ""}\n\`\`\`\n`);
  await fs.writeFile(path.join(run.workspaceDir, "lark", `${kind}-evidence.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  await writeReplayArtifacts(run);
  return evidence;
}

async function writeReplayArtifacts(run) {
  const redCommand = normalizeCommand(run.commands?.reproduce);
  const greenCommand = normalizeCommand(run.commands?.verify);
  await fs.mkdir(path.join(run.workspaceDir, "tests", "lark", "red"), { recursive: true });
  await fs.mkdir(path.join(run.workspaceDir, "tests", "lark", "green"), { recursive: true });
  const redPath = path.join(run.workspaceDir, "tests", "lark", "red", "replay-reproduction.sh");
  const greenPath = path.join(run.workspaceDir, "tests", "lark", "green", "replay-verification.sh");
  await fs.writeFile(redPath, replayScript("red reproduction", redCommand));
  await fs.writeFile(greenPath, replayScript("green verification", greenCommand));
  await fs.chmod(redPath, 0o755);
  await fs.chmod(greenPath, 0o755);
  await fs.writeFile(path.join(run.workspaceDir, "lark", "test-coverage-summary.md"), coverageSummary(run, redCommand, greenCommand));
}

function replayScript(label, command) {
  return `#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../.."

if [ ${shellQuote(command)} = "TO_BE_DISCOVERED_BY_KIRO" ]; then
  echo "No ${label} command has been discovered yet."
  exit 2
fi

${command}
`;
}

function coverageSummary(run, redCommand, greenCommand) {
  return `# Lark Test Coverage Summary

Lark is asked to produce or validate concrete test/replay artifacts whenever responsible. Some old Stack Overflow cases are better represented by command-level forensic replay than by a synthetic unit test.

## Red Reproduction Replay

\`\`\`bash
${redCommand}
\`\`\`

Artifact: \`tests/lark/red/replay-reproduction.sh\`

## Green Verification Replay

\`\`\`bash
${greenCommand}
\`\`\`

Artifact: \`tests/lark/green/replay-verification.sh\`

## Closure Rule

The case can be marked Closed only when Lark verification passes after the repair workspace is published or otherwise inspectable.
`;
}

function normalizeCommand(command) {
  return command && command !== "TO_BE_DISCOVERED_BY_KIRO" ? command : "TO_BE_DISCOVERED_BY_KIRO";
}

function phaseVerdict(kind, result) {
  if (!result.provisioned) return "Lark could not be provisioned for this phase.";
  if (!result.passed) return kind === "verification" ? "Repair not verified by Lark." : "Reproduction evidence not confirmed by Lark.";
  return kind === "verification" ? "Repair verified by Lark." : "Failure reproduction evidence captured by Lark.";
}

function excerpt(output, maxChars = 3000) {
  const text = String(output || "").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.floor(maxChars * 0.65))}\n\n[...truncated...]\n\n${text.slice(-Math.floor(maxChars * 0.35))}`;
}

function title(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function larkReadme(run) {
  return `# Lark Forensic Workflows

These workflow payloads are generated for Lark CLI. Lark appears twice in the investigation:

1. Reproduction evidence before repair.
2. Verification after repair.

If the workspace must be reachable remotely, publish it to GitHub before invoking Lark.

Suggested manual commands:

\`\`\`bash
getlark workflow-groups create --name "Coding Cold Cases - ${run.case_id}"
getlark workflows create --name "Coding Cold Cases - ${run.case_id} - Reproduction" --description "$(jq -r .description lark/reproduction-workflow.json)" --mode ai_driven
getlark workflows create --name "Coding Cold Cases - ${run.case_id} - Verification" --description "$(jq -r .description lark/verification-workflow.json)" --mode deterministic
\`\`\`
`;
}

function extractId(output, pattern) {
  return output.match(pattern)?.[0] || null;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}
