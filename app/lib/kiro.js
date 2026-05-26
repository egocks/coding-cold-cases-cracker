import fs from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./runner.js";

export async function generateKiroArtifacts(run) {
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-investigator.json"), `${JSON.stringify(agentConfig(), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "product.md"), productSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "tech.md"), techSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "structure.md"), structureSteering());
  await fs.writeFile(path.join(run.workspaceDir, "prompts", "kiro-handoff.md"), handoffPrompt(run));
}

export function kiroCommand(run, { interactive = false } = {}) {
  const promptFile = "prompts/kiro-handoff.md";
  if (interactive) {
    return `kiro-cli chat --tui --agent case-investigator "$(cat ${promptFile})"`;
  }
  return `kiro-cli chat --no-interactive --agent case-investigator --trust-tools=read,write,shell,grep,glob,web_fetch,web_search "$(cat ${promptFile})"`;
}

export async function runKiro(run, { onData } = {}) {
  if (!process.env.KIRO_API_KEY) {
    const whoami = await runCommand("kiro-cli whoami", {
      cwd: run.workspaceDir,
      timeoutMs: 30_000
    });

    if (whoami.code === 0) {
      return runCommand(kiroCommand(run), {
        cwd: run.workspaceDir,
        timeoutMs: Number(process.env.KIRO_TIMEOUT_MS || 30 * 60 * 1000),
        onData
      });
    }

    return {
      mode: "interactive-required",
      code: 2,
      output: [
        "KIRO_API_KEY is blank and no persisted Kiro login was detected.",
        "Supervised mode is available through the terminal desk.",
        "Run this inside the case workspace after device login:",
        kiroCommand(run, { interactive: true })
      ].join("\n")
    };
  }

  return runCommand(kiroCommand(run), {
    cwd: run.workspaceDir,
    timeoutMs: Number(process.env.KIRO_TIMEOUT_MS || 30 * 60 * 1000),
    onData
  });
}

function agentConfig() {
  return {
    name: "case-investigator",
    description: "Reconstructs unresolved programming cold cases, creates evidence-first reproductions, repairs the smallest useful path, and writes technical notes for Lark verification.",
    prompt: [
      "You are the Coding Cold Cases Cracker investigator.",
      "Treat the Stack Overflow question as an unresolved support incident.",
      "Build the smallest responsible reproduction, run it, fix only what the evidence justifies, and write reports/technical-report.md.",
      "Do not mark the case closed. Lark verification owns closure."
    ].join(" "),
    tools: ["read", "write", "shell", "grep", "glob", "web_fetch", "web_search", "todo", "thinking", "report", "introspect"],
    allowedTools: [],
    resources: [],
    hooks: {},
    toolsSettings: {},
    includeMcpJson: true,
    model: "auto"
  };
}

function handoffPrompt(run) {
  const original = run.original;
  return `# Coding Cold Cases Cracker: Kiro Handoff

You are inside an isolated case workspace.

## Cold Case

Title: ${original.title}
URL: ${original.url}
Posted: ${original.posted}
Score: ${original.score}
Views: ${original.views}
Answers: ${original.answers}
Cold signal: ${original.cold_signal}
Tags: ${original.tags.join(", ")}

## Preserved Excerpt

${original.why_interesting || "No excerpt available in source index."}

## Required Investigation

1. Read \`case.json\`, \`case-state.json\`, and \`original/original-question.md\`.
2. Browse or fetch the original Stack Overflow page if more detail is needed beyond the preserved source text.
3. Create the smallest runnable reproduction in \`repro/\`.
4. Prefer Java 21, Maven, or Gradle where the case suggests Java build tooling. Use another minimal runtime only if the case demands it.
5. Write exact reproduction and verification commands back into \`case.json\` if you discover them.
6. Run the reproduction command and capture the original failure or a responsible modeled equivalent.
7. Apply the smallest justified fix in \`repaired/\` or update the generated project in place with a clear diff.
8. Rerun verification until it passes, or document why the case is partial/blocked.
9. Write \`reports/technical-report.md\` with:
   - reproduced or modeled failure
   - exact commands
   - important logs
   - root cause
   - fix
   - verification result
   - assumptions and caveats

## Closure Rule

Do not claim the case is Closed. Lark verification is the independent forensic gate.
`;
}

function productSteering() {
  return `# Product Steering

Coding Cold Cases Cracker turns old unanswered programming questions into support-incident reproduction labs. The product wins only if evidence is reproducible and Lark's role is obvious.
`;
}

function techSteering() {
  return `# Technical Steering

Prefer small runnable projects, exact commands, and machine-verifiable evidence. Java 21 with Maven or Gradle is the default runtime family, but do not force Java where the case requires another stack.
`;
}

function structureSteering() {
  return `# Structure Steering

- Original case material lives in \`original/\`.
- Reproduction work belongs in \`repro/\`.
- Candidate repair work belongs in \`repaired/\`.
- Kiro reports belong in \`reports/technical-report.md\`.
- Lark artifacts belong in \`lark/\`.
- Raw command output belongs in \`logs/\`.
`;
}
