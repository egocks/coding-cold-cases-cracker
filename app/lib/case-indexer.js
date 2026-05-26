import fs from "node:fs/promises";
import path from "node:path";
import { caseIndexDir, caseIndexPath, ensureDir, slugify, sourceCaseMarkdown, writeJson } from "./paths.js";

export async function loadCaseIndex({ refresh = false } = {}) {
  if (!refresh) {
    try {
      return JSON.parse(await fs.readFile(caseIndexPath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return buildCaseIndex();
}

export async function buildCaseIndex() {
  const markdown = await fs.readFile(sourceCaseMarkdown, "utf8");
  const cases = parseColdCases(markdown);
  const index = {
    generated_at: new Date().toISOString(),
    source: path.basename(sourceCaseMarkdown),
    count: cases.length,
    shortlist_count: cases.filter((item) => item.shortlist).length,
    cases
  };

  await ensureDir(caseIndexDir);
  await fs.copyFile(sourceCaseMarkdown, path.join(caseIndexDir, "coding-cold-cases-java-stackoverflow.md"));
  await writeJson(caseIndexPath, index);
  return index;
}

export function parseColdCases(markdown) {
  const byUrl = new Map();
  parseShortlist(markdown, byUrl);
  parseCandidateTable(markdown, byUrl);
  return [...byUrl.values()]
    .map(enrichCase)
    .sort((left, right) => Number(right.shortlist) - Number(left.shortlist) || left.rank - right.rank || left.title.localeCompare(right.title));
}

export async function getCase(caseId) {
  const index = await loadCaseIndex();
  const found = index.cases.find((item) => item.id === caseId);
  if (!found) {
    const error = new Error(`Unknown cold case: ${caseId}`);
    error.statusCode = 404;
    throw error;
  }
  return found;
}

function parseShortlist(markdown, byUrl) {
  const shortlistMatch = markdown.match(/## Shortlist: 20 Top Cold Case Picks([\s\S]*?)## Dump:/);
  if (!shortlistMatch) return;
  const blocks = shortlistMatch[1].split(/\n###\s+/).map((block) => block.trim()).filter(Boolean);

  for (const rawBlock of blocks) {
    const block = rawBlock.startsWith("###") ? rawBlock : `### ${rawBlock}`;
    const header = block.match(/^###\s+(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)/m);
    if (!header) continue;
    const meta = block.match(/-\s+Posted:\s+([^|]+)\|\s+Score:\s+([^|]+)\|\s+Views:\s+([^|]+)\|\s+Answers:\s+([^|]+)\|\s+(.+)/);
    const tags = block.match(/-\s+Tags:\s+(.+)/);
    const why = block.match(/-\s+Why it is interesting:\s+([\s\S]*)/);
    const item = normalizeCase({
      rank: Number(header[1]),
      title: header[2].trim(),
      url: header[3].trim(),
      posted: meta?.[1]?.trim(),
      score: parseNumber(meta?.[2]),
      views: parseNumber(meta?.[3]),
      answers: parseNumber(meta?.[4]),
      cold_signal: meta?.[5]?.trim(),
      tags: parseTags(tags?.[1] || ""),
      why_interesting: collapse(why?.[1] || ""),
      shortlist: true
    });
    byUrl.set(item.url, item);
  }
}

function parseCandidateTable(markdown, byUrl) {
  const tableMatch = markdown.match(/## Dump: 150 Candidate Questions([\s\S]*)$/);
  if (!tableMatch) return;
  const rows = tableMatch[1].split(/\r?\n/).filter((line) => /^\|\s*\d+\s*\|/.test(line));

  for (const row of rows) {
    const columns = splitTableRow(row);
    if (columns.length < 8) continue;
    const link = columns[1].match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!link) continue;
    const existing = byUrl.get(link[2].trim());
    if (existing) {
      existing.candidate_rank = Number(columns[0]);
      continue;
    }
    const item = normalizeCase({
      rank: Number(columns[0]),
      candidate_rank: Number(columns[0]),
      title: link[1].trim(),
      url: link[2].trim(),
      posted: columns[2],
      score: parseNumber(columns[3]),
      views: parseNumber(columns[4]),
      answers: parseNumber(columns[5]),
      cold_signal: columns[6],
      tags: parseTags(columns[7]),
      why_interesting: "",
      shortlist: false
    });
    byUrl.set(item.url, item);
  }
}

function normalizeCase(item) {
  const questionId = item.url.match(/questions\/(\d+)/)?.[1];
  const id = slugify(`${questionId || ""}-${item.title}`);
  return {
    id,
    question_id: questionId || null,
    status: "indexed",
    ...item,
    title: decodeEntities(item.title),
    url: item.url,
    posted: item.posted || null,
    score: item.score ?? 0,
    views: item.views ?? 0,
    answers: item.answers ?? 0,
    cold_signal: item.cold_signal || "Unknown",
    tags: item.tags || [],
    why_interesting: decodeEntities(item.why_interesting || "")
  };
}

function enrichCase(item) {
  const tags = new Set(item.tags.map((tag) => tag.toLowerCase()));
  const riskHints = [];
  const runtimeHints = [];

  if (tags.has("java")) runtimeHints.push("java21");
  if (tags.has("maven") || item.title.toLowerCase().includes("maven")) runtimeHints.push("maven");
  if (tags.has("gradle") || item.title.toLowerCase().includes("gradle")) runtimeHints.push("gradle");
  if (tags.has("android")) riskHints.push("Android stack may need hostless emulation or a narrowed JVM reproduction.");
  if (tags.has("docker")) riskHints.push("Docker-specific case may require the optional Docker socket profile.");
  if (tags.has("vagrant") || tags.has("visualvm")) riskHints.push("VM or desktop-tool dependency may make full closure harder.");
  if (tags.has("ssl") || tags.has("saml") || tags.has("jmx")) riskHints.push("Network/security configuration may require synthetic fixtures.");
  if (tags.has("hibernate") || tags.has("jpa") || tags.has("spring")) runtimeHints.push("maven");

  return {
    ...item,
    runtime_hints: [...new Set(runtimeHints.length ? runtimeHints : ["java21"])],
    risk_hints: riskHints,
    expected_lark_evidence: expectedLarkEvidence(item)
  };
}

function expectedLarkEvidence(item) {
  const title = item.title.toLowerCase();
  if (title.includes("maven") || item.tags.includes("maven")) return "Build lifecycle command output, dependency-resolution failure, then passing verification.";
  if (title.includes("gradle") || item.tags.includes("gradle")) return "Gradle classpath/build output, failing assertion or dependency graph evidence, then passing verification.";
  if (item.tags.some((tag) => ["hibernate", "jpa", "spring"].includes(tag))) return "Executable test or integration harness showing the original behavior and the fixed behavior.";
  if (item.tags.includes("docker")) return "Container/API command logs demonstrating the original failure and corrected archive/build behavior.";
  return "Runnable reproduction command, raw logs, and a final verification command with pass/fail evidence.";
}

function splitTableRow(row) {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((value) => value.trim());
}

function parseTags(value) {
  return [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
}

function parseNumber(value) {
  if (value === undefined) return 0;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function collapse(value) {
  return decodeEntities(value.replace(/\s+/g, " ").trim());
}

function decodeEntities(value) {
  return String(value)
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}
