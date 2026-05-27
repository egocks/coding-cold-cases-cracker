import fs from "node:fs/promises";
import path from "node:path";
import { ensureDir, nowRunId, relativeToRoot, workspacesDir, writeJson } from "./paths.js";
import { fetchOriginalQuestion } from "./source-fetcher.js";

export async function createRunWorkspace(coldCase) {
  const runId = nowRunId();
  const workspaceDir = path.join(workspacesDir, coldCase.id, runId);
  const dirs = [
    "original",
    "repro",
    "repaired",
    "lark",
    "logs",
    "prompts",
    "reports",
    "artifacts",
    "tests/lark/red",
    "tests/lark/green",
    ".kiro/agents",
    ".kiro/steering"
  ];

  for (const dir of dirs) {
    await ensureDir(path.join(workspaceDir, dir));
  }

  const run = {
    case_id: coldCase.id,
    run_id: runId,
    status: "workspace_created",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspace: relativeToRoot(workspaceDir),
    original: {
      title: coldCase.title,
      url: coldCase.url,
      posted: coldCase.posted,
      score: coldCase.score,
      views: coldCase.views,
      answers: coldCase.answers,
      tags: coldCase.tags,
      cold_signal: coldCase.cold_signal,
      why_interesting: coldCase.why_interesting,
      narrative_teaser: coldCase.narrative_teaser
    },
    commands: {
      reproduce: "TO_BE_DISCOVERED_BY_KIRO",
      verify: "TO_BE_DISCOVERED_BY_KIRO"
    },
    assumptions: [],
    lark: {
      group_id: null,
      workflow_ids: [],
      execution_ids: [],
      reproduction: {
        workflow_id: null,
        execution_ids: [],
        passed: false,
        output: "lark/reproduction-output.md",
        evidence: "lark/reproduction-evidence.json"
      },
      verification: {
        workflow_id: null,
        execution_ids: [],
        passed: false,
        output: "lark/verification-output.md",
        evidence: "lark/verification-evidence.json"
      },
      verification_passed: false
    },
    kiro: {
      reconstruction: {
        agent: ".kiro/agents/case-reconstructor.json",
        prompt: "prompts/kiro-reconstruction.md",
        report: "reports/reconstruction-report.md"
      },
      repair: {
        agent: ".kiro/agents/case-repairer.json",
        prompt: "prompts/kiro-repair-from-lark.md",
        report: "reports/technical-report.md"
      },
      debrief: {
        agent: ".kiro/agents/case-debriefer.json"
      }
    },
    github: {
      branch: null,
      remote_url: null
    },
    writer: {
      provider: "kiro-cli",
      quality: {
        accepted: false,
        attempts: 0,
        issues: []
      }
    },
    artifacts: {
      original_question: "original/original-question.md",
      kiro_reconstruction_prompt: "prompts/kiro-reconstruction.md",
      kiro_repair_prompt: "prompts/kiro-repair-from-lark.md",
      lark_reproduction_workflow: "lark/reproduction-workflow.json",
      lark_verification_workflow: "lark/verification-workflow.json",
      lark_reproduction_output: "lark/reproduction-output.md",
      lark_verification_output: "lark/verification-output.md",
      lark_test_coverage_summary: "lark/test-coverage-summary.md",
      lark_red_replay: "tests/lark/red/replay-reproduction.sh",
      lark_green_replay: "tests/lark/green/replay-verification.sh",
      reconstruction_report: "reports/reconstruction-report.md",
      technical_report: "reports/technical-report.md",
      case_file: "reports/case-file.md",
      user_summary: "reports/user-summary.md",
      evidence_map: "reports/evidence-map.json"
    },
    timeline: [
      event("workspace_created", "Created isolated investigation workspace.")
    ]
  };

  const originalFetch = await fetchOriginalQuestion(coldCase);
  run.original.fetched_source = originalFetch.source;
  run.original.fetched = originalFetch.fetched;
  run.original.owner = originalFetch.owner || null;
  run.timeline.push(event(originalFetch.fetched ? "source_fetched" : "source_fetch_fallback", originalFetch.note));

  await writeJson(path.join(workspaceDir, "case.json"), run);
  await writeJson(path.join(workspaceDir, "case-state.json"), run);
  await fs.writeFile(path.join(workspaceDir, "original", "original-question.md"), originalQuestionMarkdown(coldCase, originalFetch));
  await fs.writeFile(path.join(workspaceDir, "original", "source-fetch-note.md"), `# Source Fetch Note\n\n${originalFetch.note}\n\nSource: ${originalFetch.source}\n`);
  await fs.writeFile(path.join(workspaceDir, "README.md"), runReadme(coldCase, run));
  return { ...run, workspaceDir };
}

export async function loadRun(workspaceDir) {
  const run = JSON.parse(await fs.readFile(path.join(workspaceDir, "case-state.json"), "utf8"));
  return { ...run, workspaceDir };
}

export async function saveRun(run) {
  const updated = {
    ...run,
    updated_at: new Date().toISOString()
  };
  const { workspaceDir, ...serializable } = updated;
  await writeJson(path.join(workspaceDir, "case-state.json"), serializable);
  await writeJson(path.join(workspaceDir, "case.json"), serializable);
  return updated;
}

export async function updateRun(run, status, message, patch = {}) {
  const next = {
    ...run,
    ...patch,
    status,
    timeline: [...(run.timeline || []), event(status, message)]
  };
  return saveRun(next);
}

export async function appendLog(run, name, content) {
  const filePath = path.join(run.workspaceDir, "logs", name);
  await ensureDir(path.dirname(filePath));
  await fs.appendFile(filePath, content);
  return filePath;
}

export async function listRuns() {
  const results = [];
  try {
    const caseIds = await fs.readdir(workspacesDir);
    for (const caseId of caseIds) {
      const caseDir = path.join(workspacesDir, caseId);
      const stat = await fs.stat(caseDir);
      if (!stat.isDirectory()) continue;
      const runIds = await fs.readdir(caseDir);
      for (const runId of runIds) {
        const workspaceDir = path.join(caseDir, runId);
        try {
          results.push(await loadRun(workspaceDir));
        } catch {
          // Ignore incomplete run directories.
        }
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return results.sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)));
}

export async function listCaseRuns(caseId) {
  return (await listRuns()).filter((run) => run.case_id === caseId);
}

export async function findRunById(runId) {
  const run = (await listRuns()).find((candidate) => candidate.run_id === runId);
  if (!run) {
    const error = new Error(`Unknown run: ${runId}`);
    error.statusCode = 404;
    throw error;
  }
  return run;
}

function event(type, message) {
  return {
    at: new Date().toISOString(),
    type,
    message
  };
}

function originalQuestionMarkdown(coldCase, originalFetch) {
  return `# ${coldCase.title}

Source: ${coldCase.url}

- Posted: ${coldCase.posted || "unknown"}
- Score: ${coldCase.score}
- Views: ${coldCase.views}
- Answers: ${coldCase.answers}
- Cold signal: ${coldCase.cold_signal}
- Tags: ${coldCase.tags.map((tag) => `\`${tag}\``).join(" ")}
${originalFetch.owner?.display_name ? `- Original poster: ${originalFetch.owner.display_name}${originalFetch.owner.link ? ` (${originalFetch.owner.link})` : ""}` : "- Original poster: unknown from fetched source"}

## Narrative Teaser

${coldCase.narrative_teaser || "No teaser has been written for this case yet."}

## Preserved Case Text

${originalFetch.text || coldCase.why_interesting || "No excerpt was available in the source index."}

## Expected Evidence

${coldCase.expected_lark_evidence}

## Risk Hints

${coldCase.risk_hints.length ? coldCase.risk_hints.map((hint) => `- ${hint}`).join("\n") : "- No unusual risk hints detected from tags/title."}
`;
}

function runReadme(coldCase, run) {
  return `# Coding Cold Cases Cracker Run

Case: ${coldCase.title}

Run: ${run.run_id}

This workspace is generated for a reproducible support-incident investigation. Kiro reconstructs and repairs; Lark verifies; a focused Kiro writer creates the case file only from collected evidence.

## Source

${coldCase.url}

## Status

${run.status}
`;
}
