import fs from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./runner.js";

export async function generateLarkWorkflows(run) {
  const reproduction = workflowPayload(run, "reproduction");
  const verification = workflowPayload(run, "verification");
  await fs.writeFile(path.join(run.workspaceDir, "lark", "reproduction-workflow.json"), `${JSON.stringify(reproduction, null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, "lark", "verification-workflow.json"), `${JSON.stringify(verification, null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, "lark", "README.md"), larkReadme(run));
}

export async function runLarkVerification(run, { onData } = {}) {
  const apiKey = process.env.GETLARK_API_KEY || process.env.LARKCI_API_KEY;
  if (!apiKey) {
    return {
      code: 2,
      output: "GETLARK_API_KEY is missing. Lark workflows were generated but not provisioned.",
      provisioned: false,
      passed: false
    };
  }

  const env = { GETLARK_API_KEY: apiKey };
  const groupName = `Coding Cold Cases - Hackathon - ${run.case_id} - ${run.run_id}`;
  const group = await runCommand(`getlark workflow-groups create --name ${shellQuote(groupName)}`, {
    cwd: run.workspaceDir,
    env,
    timeoutMs: 2 * 60 * 1000,
    onData
  });
  const groupId = extractId(group.output, /wfl_grp_[A-Za-z0-9_-]+/);

  const repro = await createWorkflow(run, "reproduction", groupId, env, onData);
  const verify = await createWorkflow(run, "verification", groupId, env, onData);
  const workflowIds = [repro.workflowId, verify.workflowId].filter(Boolean);

  if (!workflowIds.length) {
    return {
      code: 1,
      output: [group.output, repro.output, verify.output].join("\n"),
      provisioned: false,
      passed: false,
      groupId,
      workflowIds
    };
  }

  const invocation = await runCommand(`getlark workflows invoke --workflow-ids ${workflowIds.map(shellQuote).join(" ")} --wait --timeout ${Number(process.env.LARK_TIMEOUT_SECONDS || 600)} --verbose`, {
    cwd: run.workspaceDir,
    env,
    timeoutMs: Number(process.env.LARK_TIMEOUT_SECONDS || 600) * 1000 + 30_000,
    onData
  });

  return {
    code: invocation.code,
    output: [group.output, repro.output, verify.output, invocation.output].join("\n"),
    provisioned: true,
    passed: larkInvocationPassed(invocation),
    groupId,
    workflowIds,
    executionIds: [...new Set(invocation.output.match(/wflw_exec_[A-Za-z0-9_-]+/g) || [])]
  };
}

function larkInvocationPassed(invocation) {
  if (invocation.code !== 0) return false;
  const output = invocation.output || "";
  if (/HTTP \d+|Error:|executed with failure|Workflows finished with status "failure"|Status: failure/i.test(output)) return false;
  return /Status: success|executed successfully/i.test(output);
}

function workflowPayload(run, kind) {
  const isVerification = kind === "verification";
  return {
    name: `Coding Cold Cases - Hackathon - ${run.original.title} - ${isVerification ? "Verification" : "Reproduction Evidence"}`,
    mode: isVerification ? "deterministic" : "ai_driven",
    description: workflowDescription(run, kind)
  };
}

function workflowDescription(run, kind) {
  const command = kind === "verification" ? run.commands?.verify : run.commands?.reproduce;
  const remote = run.github?.remote_url || "PUBLISH_URL_PENDING";
  if (kind === "verification") {
    return [
      "You are Lark acting as an independent forensic verifier for Coding Cold Cases Cracker.",
      `Remote workspace: ${remote}`,
      `Original case: ${run.original.url}`,
      `Verification command: ${command || "discover from case.json and reports/technical-report.md"}`,
      "Clone or inspect the reachable workspace, run the verification command when possible, and confirm whether the original failure is fixed.",
      "Return pass/fail evidence, exact logs, and any residual risk. The case may be Closed only if this verification passes."
    ].join("\n");
  }
  return [
    "You are Lark acting as the forensic lab for Coding Cold Cases Cracker.",
    `Remote workspace: ${remote}`,
    `Original case: ${run.original.url}`,
    `Reproduction command: ${command || "discover from case.json and generated project files"}`,
    "Inspect the workspace and run or evaluate the reproduction path.",
    "Confirm whether the observed failure matches the Stack Overflow cold case or a responsible minimal model of it.",
    "Return the exact evidence that Kiro should use for repair."
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

function larkReadme(run) {
  return `# Lark Verification

These workflow payloads are generated for Lark CLI. Lark is the closure gate for this case.

If the workspace must be reachable remotely, publish it to GitHub before invoking Lark.

Suggested manual commands:

\`\`\`bash
getlark workflow-groups create --name "Coding Cold Cases - Hackathon - ${run.case_id}"
getlark workflows create --name "Coding Cold Cases - Hackathon - ${run.case_id} - Reproduction" --description "$(jq -r .description lark/reproduction-workflow.json)" --mode ai_driven
getlark workflows create --name "Coding Cold Cases - Hackathon - ${run.case_id} - Verification" --description "$(jq -r .description lark/verification-workflow.json)" --mode deterministic
\`\`\`
`;
}

function extractId(output, pattern) {
  return output.match(pattern)?.[0] || null;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}
