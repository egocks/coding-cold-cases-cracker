import fs from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./runner.js";

const PHASES = {
  reconstruction: {
    agent: "case-reconstructor",
    prompt: "prompts/kiro-reconstruction.md",
    trustedTools: "read,write,shell,grep,glob,web_fetch,web_search"
  },
  repair: {
    agent: "case-repairer",
    prompt: "prompts/kiro-repair-from-lark.md",
    trustedTools: "read,write,shell,grep,glob,web_fetch,web_search"
  },
  debrief: {
    agent: "case-debriefer",
    prompt: "prompts/kiro-debrief.md",
    trustedTools: "read,grep,glob,web_fetch,web_search"
  },
  writer: {
    agent: "case-writer",
    prompt: "prompts/kiro-writer.md",
    trustedTools: "read,write,grep,glob"
  }
};

export async function generateKiroArtifacts(run) {
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-reconstructor.json"), `${JSON.stringify(agentConfig("case-reconstructor"), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-repairer.json"), `${JSON.stringify(agentConfig("case-repairer"), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-debriefer.json"), `${JSON.stringify(agentConfig("case-debriefer"), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-writer.json"), `${JSON.stringify(agentConfig("case-writer"), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-investigator.json"), `${JSON.stringify(agentConfig("case-repairer", "case-investigator"), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "product.md"), productSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "tech.md"), techSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "structure.md"), structureSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "evidence-discipline.md"), evidenceDisciplineSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "lark-first.md"), larkFirstSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "narrative-boundaries.md"), narrativeBoundariesSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "read-only-debrief.md"), readOnlyDebriefSteering());
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "creative-case-writing.md"), creativeCaseWritingSteering());
  await fs.writeFile(path.join(run.workspaceDir, "prompts", "kiro-reconstruction.md"), reconstructionPrompt(run));
  await fs.writeFile(path.join(run.workspaceDir, "prompts", "kiro-handoff.md"), reconstructionPrompt(run));
  await fs.writeFile(path.join(run.workspaceDir, "prompts", "kiro-debrief.md"), debriefPrompt(run));
}

export async function generateKiroRepairPrompt(run, larkEvidence = null) {
  const evidence = larkEvidence || await readLarkEvidence(run);
  await fs.writeFile(path.join(run.workspaceDir, "prompts", "kiro-repair-from-lark.md"), repairPrompt(run, evidence));
}

export async function generateKiroWriterPrompt(run, evidence, { strict = false } = {}) {
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "agents", "case-writer.json"), `${JSON.stringify(agentConfig("case-writer"), null, 2)}\n`);
  await fs.writeFile(path.join(run.workspaceDir, ".kiro", "steering", "creative-case-writing.md"), creativeCaseWritingSteering());
  await fs.writeFile(path.join(run.workspaceDir, "prompts", "kiro-writer.md"), writerPrompt(run, evidence, { strict }));
}

export function kiroCommand(run, { phase = "reconstruction", interactive = false } = {}) {
  const config = PHASES[phase] || PHASES.reconstruction;
  if (interactive) {
    return `kiro-cli chat --tui --agent ${config.agent} "$(cat ${config.prompt})"`;
  }
  return `kiro-cli chat --no-interactive --agent ${config.agent} --trust-tools=${config.trustedTools} "$(cat ${config.prompt})"`;
}

export async function runKiroPhase(run, phase, { onData } = {}) {
  const auth = await kiroAuthReady(run);
  if (!auth.ready) {
    return {
      mode: "interactive-required",
      code: 2,
      output: [
        "KIRO_API_KEY is blank and no persisted Kiro login was detected.",
        "Supervised mode is available through the terminal desk.",
        `Run this inside the case workspace after device login for ${phase}:`,
        kiroCommand(run, { phase, interactive: true })
      ].join("\n")
    };
  }

  return runCommand(kiroCommand(run, { phase }), {
    cwd: run.workspaceDir,
    timeoutMs: Number(process.env.KIRO_TIMEOUT_MS || 30 * 60 * 1000),
    onData
  });
}

export async function runKiro(run, options = {}) {
  return runKiroPhase(run, "repair", options);
}

async function kiroAuthReady(run) {
  if (process.env.KIRO_API_KEY) return { ready: true, mode: "api-key" };
  const whoami = await runCommand("kiro-cli whoami", {
    cwd: run.workspaceDir,
    timeoutMs: 30_000
  });
  return { ready: whoami.code === 0, mode: whoami.code === 0 ? "persisted-login" : "missing" };
}

function agentConfig(kind, name = kind) {
  const baseTools = ["read", "write", "shell", "grep", "glob", "web_fetch", "web_search", "todo", "thinking", "report", "introspect"];
  const debriefTools = ["read", "grep", "glob", "web_fetch", "web_search", "thinking", "report", "introspect"];
  const writerTools = ["read", "write", "grep", "glob", "thinking", "report", "introspect"];
  const baseResources = [
    "file://case.json",
    "file://case-state.json",
    "file://original/**/*.md",
    "file://.kiro/steering/**/*.md"
  ];
  const evidenceResources = [
    ...baseResources,
    "file://reports/**/*.md",
    "file://lark/**/*",
    "file://logs/kiro-*.log",
    "file://logs/lark-*.log"
  ];
  const descriptions = {
    "case-reconstructor": "Reconstructs unresolved programming cold cases into the smallest responsible failing reproduction and stops before repair.",
    "case-repairer": "Repairs a reconstructed cold case using Lark's forensic reproduction evidence and writes evidence-first technical notes.",
    "case-debriefer": "Reads closed case artifacts and explains the evidence trail without modifying files.",
    "case-writer": "Writes vivid, noir-tinged, evidence-grounded cold case narratives from preserved Kiro and Lark artifacts."
  };
  const prompts = {
    "case-reconstructor": [
      "You are the Coding Cold Cases Cracker reconstructor.",
      "Create the smallest responsible failing reproduction.",
      "Do not repair the issue.",
      "Write reports/reconstruction-report.md and exact commands into case.json."
    ],
    "case-repairer": [
      "You are the Coding Cold Cases Cracker repairer.",
      "Read Lark reproduction evidence before changing code.",
      "Repair only what the evidence justifies and write reports/technical-report.md.",
      "Do not mark the case closed; Lark verification owns closure."
    ],
    "case-debriefer": [
      "You are the Coding Cold Cases Cracker debriefer.",
      "Read artifacts only and explain the evidence trail.",
      "Do not write, edit, delete, or run mutating commands."
    ],
    "case-writer": [
      "You are the Coding Cold Cases Cracker creative case writer.",
      "Write vivid noir technical case files grounded only in preserved artifacts.",
      "Use Larkule Quirot as the combined investigator persona for the Kiro/Lark system.",
      "Use imagination for scene texture and character personality, but never invent technical facts.",
      "Write reports/case-file.md, reports/technical-report.md, reports/user-summary.md, and reports/evidence-map.json."
    ]
  };

  return {
    name,
    description: descriptions[kind] || descriptions["case-repairer"],
    prompt: prompts[kind].join(" "),
    tools: kind === "case-debriefer" ? debriefTools : kind === "case-writer" ? writerTools : baseTools,
    allowedTools: kind === "case-debriefer"
      ? ["read", "grep", "glob"]
      : kind === "case-writer"
        ? ["read", "write", "grep", "glob"]
        : ["read", "write", "shell", "grep", "glob"],
    resources: kind === "case-writer" || kind === "case-debriefer" ? evidenceResources : baseResources,
    hooks: {},
    toolsSettings: toolSettings(kind),
    includeMcpJson: true,
    model: "auto"
  };
}

function toolSettings(kind) {
  if (kind === "case-writer") {
    return {
      write: {
        allowedPaths: [
          "reports/technical-report.md",
          "reports/case-file.md",
          "reports/user-summary.md",
          "reports/evidence-map.json",
          "reports/writer-note.md"
        ]
      }
    };
  }
  if (kind === "case-debriefer") {
    return {
      shell: {
        deniedCommands: [".*"]
      }
    };
  }
  return {
    write: {
      allowedPaths: [
        "repro/**",
        "repaired/**",
        "reports/**",
        "prompts/**",
        "case.json",
        "case-state.json"
      ]
    },
    shell: {
      deniedCommands: [
        "git push.*",
        "git commit.*",
        "rm -rf /.*",
        "rm -rf ~.*"
      ],
      autoAllowReadonly: true
    }
  };
}

function writerPrompt(run, evidence, { strict }) {
  return `# Coding Cold Cases Cracker: Creative Case Writer

You are inside an isolated case workspace. Your only job is writing. Do not change source code, prompts, Lark artifacts, Kiro logs, tests, or case state.

## Cold Case

${coldCaseBlock(run)}

## Evidence Packet

${JSON.stringify(evidence, null, 2)}

## Required Outputs

Write these files:

1. \`reports/technical-report.md\`
   - sober, terse, replayable, evidence-first
   - include commands, root cause, fix or partial/blocker status, Lark evidence, and caveats

2. \`reports/case-file.md\`
   - the showpiece
   - literary technical fiction about a real debugging mystery, with a little noir and a little sly detective wit
   - do not start with "Case Summary", "Original Clue", "Root Cause", or report-like headings
   - do not include a User Summary section inside this file
   - avoid generic filler such as "typical Monday morning", "hours ticked by", and "debugging tools like Kiro and Lark"
   - write at least 1000 words unless the evidence is too thin; if evidence is thin, state that in the factual appendix
   - if the original Stack Overflow poster handle is available, use that handle or display name exactly as given, preserving spelling and capitalization; do not replace it with an invented name
   - include the exact original poster handle token in the opening scene when available; for example, if the handle is \`nathan\`, write \`nathan\`, not \`Nathan\`
   - give the original developer a memorable personality, setting, pressure, and small human details
   - put the reader inside the original developer's problem before the investigator appears
   - treat Kiro and Lark as one black-box investigative system from the user's point of view, personified as **Larkule Quirot**
   - Larkule Quirot should feel like a meticulous, theatrical debugging detective: observant, a little mysterious, precise, and faintly amused by bad abstractions
   - do not split the story into "Kiro did X, Lark did Y" as if they are separate characters; use the factual appendix or technical report for internal mechanics when needed
   - include identifiable narrative parts through scene and flow: opening scene, original clue, cold trail, reconstruction, first forensic finding, intervention, final verdict or partial verdict, epilogue, and factual replay appendix
   - the first forensic finding and final/partial verdict must still name Lark evidence because closure depends on Lark verification
   - fictionalize scene texture and character names only; technical sequence, commands, findings, versions, failures, and fixes must remain faithful to evidence
   - vary paragraph rhythm: short beats, longer atmospheric paragraphs, and technical reveals
   - do not copy distinctive wording or scene objects from the reference example; borrow only its energy, specificity, humor, and confidence
   ${strict ? "- The first seven paragraphs must establish scene, character, conflict, technical mystery, and Larkule Quirot's noir presence before any report-style explanation." : ""}

3. \`reports/user-summary.md\`
   - short, persuasive, and explicit about why Lark mattered

4. \`reports/evidence-map.json\`
   - valid JSON only
   - shape: { "claims": [{ "claim": "...", "artifact": "..." }], "artifacts": ["..."] }
   - every major technical claim in the story must be backed by an artifact path

## Evidence Rules

- Do not claim Closed unless \`case-state.json\` says Lark verification passed.
- Distinguish original facts, reconstructed assumptions, Kiro actions, Lark observations, and caveats.
- If the case is Partial or Blocked, make that clear without weakening the narrative.
- Do not call external APIs.
- Do not post anything to Stack Overflow.
`;
}

function coldCaseBlock(run) {
  const original = run.original;
  return `Title: ${original.title}
URL: ${original.url}
Original poster exact handle/display name: ${original.owner?.display_name || "unknown"}${original.owner?.link ? ` (${original.owner.link})` : ""}
Posted: ${original.posted}
Score: ${original.score}
Views: ${original.views}
Answers: ${original.answers}
Cold signal: ${original.cold_signal}
Tags: ${original.tags.join(", ")}

Preserved excerpt:
${original.why_interesting || "No excerpt available in source index."}`;
}

function reconstructionPrompt(run) {
  return `# Coding Cold Cases Cracker: Kiro Reconstruction

You are inside an isolated case workspace.

## Cold Case

${coldCaseBlock(run)}

## Required Reconstruction

1. Read \`case.json\`, \`case-state.json\`, and \`original/original-question.md\`.
2. Browse or fetch the original Stack Overflow page if more detail is needed.
3. Create the smallest runnable failing reproduction in \`repro/\`.
4. Prefer Java 21, Maven, or Gradle where the case suggests Java build tooling. Use another minimal runtime only if the case demands it.
5. Write the exact reproduction command to \`case.json.commands.reproduce\`.
6. Run the reproduction command and capture the original failure or a responsible modeled equivalent.
7. Write \`reports/reconstruction-report.md\` with:
   - what was reconstructed
   - exact reproduction command
   - important failure logs
   - assumptions and caveats
   - why this is a responsible model of the Stack Overflow case

## Hard Stop

Do not repair the case. Lark must inspect the failing reproduction before repair begins.
`;
}

function repairPrompt(run, evidence) {
  return `# Coding Cold Cases Cracker: Kiro Repair From Lark Evidence

You are inside an isolated case workspace.

## Cold Case

${coldCaseBlock(run)}

## Lark Reproduction Evidence

${formatEvidence(evidence)}

## Required Repair

1. Read \`case.json\`, \`case-state.json\`, \`reports/reconstruction-report.md\`, and all files under \`lark/\`.
2. Treat Lark's reproduction evidence as the forensic handoff. Cite the Lark observations that guided each major repair decision.
3. Apply the smallest justified fix in \`repaired/\` or update the generated project in place with a clear diff.
4. Write the exact verification command to \`case.json.commands.verify\`.
5. Run verification until it passes, or document why the case remains partial/blocked.
6. Write \`reports/technical-report.md\` with:
   - Lark observations used
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

function debriefPrompt(run) {
  return `# Coding Cold Cases Cracker: Read-Only Debrief

Read the artifacts for this run and explain the evidence trail to a user.

Case: ${run.original.title}
Workspace: ${run.workspace}

You may read files and summarize. Do not write, edit, delete, or run mutating commands.
Focus on:
- original Stack Overflow clue
- Kiro reconstruction
- Lark first finding
- Kiro repair
- Lark final verdict
- replay commands and caveats
`;
}

async function readLarkEvidence(run) {
  try {
    return JSON.parse(await fs.readFile(path.join(run.workspaceDir, "lark", "reproduction-evidence.json"), "utf8"));
  } catch {
    return { verdict: "No structured Lark reproduction evidence is available yet." };
  }
}

function formatEvidence(evidence) {
  if (!evidence) return "No Lark reproduction evidence was provided.";
  if (typeof evidence === "string") return evidence;
  return JSON.stringify(evidence, null, 2);
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
- Reconstruction notes belong in \`reports/reconstruction-report.md\`.
- Repair notes belong in \`reports/technical-report.md\`.
- Lark artifacts belong in \`lark/\`.
- Lark replay/test artifacts belong in \`tests/lark/\`.
- Raw command output belongs in \`logs/\`.
`;
}

function evidenceDisciplineSteering() {
  return `# Evidence Discipline

Do not confuse hypothesis with evidence. Every technical claim should tie back to the original question, a command result, source code, Kiro work, or Lark output.
`;
}

function larkFirstSteering() {
  return `# Lark-First Closure

Kiro reconstructs first, then stops. Lark inspects the failing reproduction before Kiro repairs. After repair, Lark alone grants closure.
`;
}

function narrativeBoundariesSteering() {
  return `# Narrative Boundaries

Creative scene texture belongs in the case file. Technical reports must remain sober, replayable, and evidence-first.
`;
}

function creativeCaseWritingSteering() {
  return `# Creative Case Writing

The case writer creates the memorable story layer after evidence exists. It may invent scene texture, character names, and noir mood, but all technical claims must come from artifacts. The story should feel literary, not like a template.

For the case-file narrative, present the Kiro/Lark system as one black-box investigator from the user's point of view: Larkule Quirot. Larkule Quirot is meticulous, theatrical, observant, precise, and a little amused by bad abstractions. Internal Kiro and Lark mechanics may appear in the factual appendix, evidence map, user summary, and technical report, but the story should not feel like two separate mascots taking turns.
`;
}

function readOnlyDebriefSteering() {
  return `# Read-Only Debrief

The debriefer must not write files, change code, delete artifacts, or run mutating commands.
`;
}
