import { mkdirSync } from 'fs';
import path from 'path';

/**
 * Derive a URL-safe slug from the seed text for use in filenames.
 * Strips non-alphanumeric, collapses to lowercase, max 60 chars.
 */
export function deriveSlug(seed) {
  return (seed || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

/**
 * Resolve the spec output path.
 * @param {string|undefined} outputDir - Override output directory (CLI flag). Defaults to ./specs
 * @param {string} slug - Derived slug
 * @returns {string} absolute path
 */
export function specPath(outputDir, slug) {
  const dir = path.resolve(outputDir || './specs');
  return path.join(dir, `deep-interview-${slug}.md`);
}

/**
 * Resolve the state directory.
 * Uses XDG-style path under HOME: ~/.agentic-readiness/state/
 */
export function stateDir() {
  const home = process.env.HOME || '/tmp';
  return path.join(home, '.agentic-readiness', 'state');
}

/**
 * Resolve the state file path for a given session.
 * @param {string} sessionId
 * @returns {string}
 */
export function stateFilePath(sessionId) {
  return path.join(stateDir(), `${sessionId}.json`);
}

/**
 * Ensure a directory exists (recursively), creating it if missing.
 * @param {string} dir
 */
export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}