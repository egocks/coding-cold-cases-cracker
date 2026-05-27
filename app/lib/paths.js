import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const sourceCaseMarkdown = path.join(projectRoot, "coding-cold-cases-java-stackoverflow.md");
export const casesDir = path.join(projectRoot, "cases");
export const caseIndexDir = path.join(casesDir, "index");
export const caseIndexPath = path.join(caseIndexDir, "cases.json");
export const workspacesDir = path.join(casesDir, "workspaces");
export const artifactsDir = path.join(projectRoot, "artifacts");
export const galleryDir = path.join(artifactsDir, "gallery");
export const zipsDir = path.join(artifactsDir, "zips");
export const logsDir = path.join(artifactsDir, "logs");

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function relativeToRoot(filePath) {
  return path.relative(projectRoot, filePath);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function nowRunId() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
