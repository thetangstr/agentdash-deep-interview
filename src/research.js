/**
 * research.js — Auto-invoke last30days research before crystallisation.
 *
 * Installs last30days-skill if missing, runs the Python engine against
 * session-derived queries, and saves output to:
 *   ~/.agentic-readiness/research/{sessionId}.md
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const LAST30DAYS_SKILL_DIR = path.join(process.env.HOME || '/tmp', '.claude', 'skills', 'last30days');
const LAST30DAYS_SCRIPT = path.join(
  LAST30DAYS_SKILL_DIR,
  'skills',
  'last30days',
  'scripts',
  'last30days.py'
);
const RESEARCH_DIR = path.join(process.env.HOME || '/tmp', '.agentic-readiness', 'research');
const RESEARCH_FILE_RE = /^(.*)-(\w+)-research\.md$/;

const LAST30DAYS_REPO = 'https://github.com/mvanhorn/last30days-skill.git';

/**
 * Ensure last30days skill is installed at ~/.claude/skills/last30days.
 * Silently skips if already present.
 */
function ensureLast30DaysInstalled() {
  if (existsSync(LAST30DAYS_SCRIPT)) return;

  console.log('Installing last30days research skill...');
  mkdirSync(path.dirname(LAST30DAYS_SKILL_DIR), { recursive: true });

  try {
    execSync(
      `git clone --depth=1 ${LAST30DAYS_REPO} ${LAST30DAYS_SKILL_DIR}`,
      { stdio: 'pipe' }
    );
    console.log('last30days installed.');
  } catch (err) {
    throw new Error(
      `Failed to install last30days skill. Run manually: git clone ${LAST30DAYS_REPO} ${LAST30DAYS_SKILL_DIR}`
    );
  }
}

/**
 * Derive research queries from session state.
 * Returns [{topic, args}] array — multiple queries run in parallel.
 */
function buildResearchQueries(state) {
  const seed = state.seed || '';
  const track = state.track || 'project';
  const sector = state.basicFacts?.sector || extractSector(seed);

  const queries = [];

  if (track === 'company') {
    // Company-level: sector trends + competitor intel
    queries.push({
      topic: `AI agent adoption ${sector} enterprise 2026`,
      args: ['--emit=md', '--quick'],
    });
    // Also search for named competitors if mentioned in seed
    const competitors = extractCompetitors(seed);
    if (competitors.length > 0) {
      competitors.forEach(comp => {
        queries.push({
          topic: `${comp} AI automation`,
          args: ['--emit=md', '--quick'],
        });
      });
    }
  } else {
    // Project-level: tool/technique + failure modes
    queries.push({
      topic: `${seed} AI agent ROI 2026`,
      args: ['--emit=md', '--quick'],
    });
    queries.push({
      topic: `enterprise AI agent failure modes ${sector} 2026`,
      args: ['--emit=md', '--quick'],
    });
  }

  return queries;
}

/**
 * Run a single last30days query. Returns the markdown synthesis text.
 */
function runQuery(topic, args) {
  const cmd = ['python3', LAST30DAYS_SCRIPT, ...args, `--save-dir=${RESEARCH_DIR}`, topic];
  try {
    const result = execSync(cmd.join(' '), {
      encoding: 'utf8',
      timeout: 120_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return result;
  } catch (err) {
    // last30days prints its output to stdout; stderr may have warnings
    if (err.stdout) return err.stdout;
    throw new Error(`last30days query failed for "${topic}": ${err.stderr || err.message}`);
  }
}

/**
 * Find the most recent last30days output file written to RESEARCH_DIR.
 */
function findLatestOutputFile(sessionId) {
  if (!existsSync(RESEARCH_DIR)) return null;
  const files = readdirSync(RESEARCH_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const s = statSync(path.join(RESEARCH_DIR, f));
      return { file: f, mtime: s.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? path.join(RESEARCH_DIR, files[0].file) : null;
}

/**
 * Load research for a session — returns content string or null if not found.
 */
export function loadResearch(sessionId) {
  const researchFile = path.join(RESEARCH_DIR, `${sessionId}-research.md`);
  if (existsSync(researchFile)) {
    return readFileSync(researchFile, 'utf8');
  }
  return null;
}

/**
 * Main entry point: run research for a session and save to research file.
 *
 * @param {object} state - Session state
 * @returns {string|null} - Path to saved research file, or null if skipped
 */
export async function runResearch(state) {
  if (!state || !state.sessionId) {
    throw new Error('runResearch: state with sessionId required');
  }

  ensureLast30DaysInstalled();

  const queries = buildResearchQueries(state);
  const outputs = [];

  mkdirSync(RESEARCH_DIR, { recursive: true });

  for (const { topic, args } of queries) {
    process.stdout.write(`\n  🔍 ${topic}...\n`);
    try {
      const result = runQuery(topic, args);
      if (result && result.trim().length > 100) {
        outputs.push(`## Research: ${topic}\n\n${result.trim()}`);
      }
    } catch (err) {
      process.stderr.write(`  ⚠️  ${err.message}\n`);
    }
  }

  if (outputs.length === 0) {
    process.stdout.write('  ⚠️  No research results obtained — continuing without research.\n');
    return null;
  }

  const researchFile = path.join(RESEARCH_DIR, `${state.sessionId}-research.md`);
  writeFileSync(researchFile, outputs.join('\n\n---\n\n'), 'utf8');
  process.stdout.write(`\n  ✅ Research saved: ${researchFile}\n`);

  return researchFile;
}

/**
 * Very lightweight sector extractor — pulls the most likely industry word from seed text.
 */
function extractSector(seed) {
  const sectorWords = [
    'fintech', 'healthcare', 'education', 'retail', 'manufacturing',
    'logistics', 'legal', 'media', 'saas', 'banking', 'insurance',
    'real estate', 'construction', 'energy', 'telecom', 'government',
    '非营利', 'nonprofit',
  ];
  const lower = (seed || '').toLowerCase();
  for (const s of sectorWords) {
    if (lower.includes(s)) return s;
  }
  return 'enterprise';
}

/**
 * Crude competitor extractor — looks for company-like capitalized words in seed.
 */
function extractCompetitors(seed) {
  const matches = seed.match(/[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*/g) || [];
  // Filter to 2-4 word company/name-like strings that aren't common words
  const stopWords = new Set(['The', 'This', 'That', 'With', 'From', 'About', 'For', 'And', 'Or', 'Using', 'Using AI', 'AI Agent', 'Customer Support']);
  return [...new Set(matches)].filter(w => !stopWords.has(w) && w.split(/\s+/).length <= 3).slice(0, 2);
}
