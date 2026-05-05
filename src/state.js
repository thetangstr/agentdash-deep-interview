import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

function _stateDir() {
  const home = process.env.HOME || '/tmp';
  return path.join(home, '.agentic-readiness', 'state');
}

function _stateFilePath(sessionId) {
  return path.join(_stateDir(), `${sessionId}.json`);
}

/**
 * Ensure the state directory exists.
 */
export function ensureStateDir() {
  mkdirSync(_stateDir(), { recursive: true });
}

/**
 * Creates and initialises a new interview session.
 * Writes the initial state file to ~/.agentic-readiness/state/{sessionId}.json
 *
 * @param {object} options
 * @param {string} options.seed   - The initial seed / idea
 * @param {string} [options.sessionId] - Optional session ID; a UUID is generated if omitted
 * @param {string} [options.depth] - 'quick' | 'standard' | 'deep'
 * @param {string} [options.track] - 'company' | 'project'. Default: 'project'
 * @returns {object} the initial state
 */
export function createSession({ seed, sessionId = null, depth = 'standard', track = 'project' } = {}) {
  const id = sessionId || uuidv4();

  // Derive slug from first 60 chars of seed (alphanumeric only)
  const slug = (seed || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';

  const depthLimits = { quick: 5, standard: 20, deep: 40 };
  const maxRounds = depthLimits[depth] ?? 20;

  const projectDimensions = {
    specificity: 0.0,
    systems: 0.0,
    success: 0.0,
    risk: 0.0,
    fit: 0.0,
  };

  const companyDimensions = {
    strategy: 0.0,
    readiness: 0.0,
    portfolio: 0.0,
    risk: 0.0,
    fit: 0.0,
  };

  const state = {
    sessionId: id,
    slug,
    seed,
    depth,
    track,              // 'company' | 'project'
    maxRounds,
    round: 0,
    phase: 'phase-1', // phase-1 | phase-2 | phase-3 | phase-4 | done
    dimensions: track === 'company' ? companyDimensions : projectDimensions,
    answers: [],         // Array of { round, question, answer, dimension }
    questions: [],       // Array of { round, text }
    ontology: {},        // Extracted entity/relationship map
    stabilityScore: 0,   // 0–1: how stable is the ontology
    challengeAgents: [], // Track which challenge agents fired each round
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    finishedAt: null,
    ambiguity: 1.0,      // Starts at maximum ambiguity
    exitReason: null,    // 'threshold-met' | 'round-cap' | 'early-exit'
    spec: null,          // Crystallised spec once done
  };

  ensureStateDir();
  _writeState(state);
  return state;
}

/**
 * Load an existing session state from disk.
 * @param {string} sessionId
 * @returns {object|null}
 */
export function loadSession(sessionId) {
  try {
    return JSON.parse(readFileSync(_stateFilePath(sessionId), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Load the most recently modified session.
 * @returns {object|null}
 */
export function loadLatestSession() {
  try {
    const files = readdirSync(_stateDir()).filter(f => f.endsWith('.json'));
    if (!files.length) return null;

    let latestFile = null;
    let latestMtime = 0;
    for (const file of files) {
      const mtime = statSync(path.join(_stateDir(), file)).mtimeMs;
      if (mtime > latestMtime) {
        latestMtime = mtime;
        latestFile = file;
      }
    }
    return latestFile ? loadSession(latestFile.replace('.json', '')) : null;
  } catch {
    return null;
  }
}

/**
 * Save/update the session state to disk.
 * @param {object} state
 */
export function writeState(state) {
  ensureStateDir();
  state.updatedAt = new Date().toISOString();
  writeFileSync(_stateFilePath(state.sessionId), JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Record an answer to the current round.
 * @param {object} state
 * @param {{ question: string, answer: string, dimension: string }} answer
 */
export function recordAnswer(state, { question, answer, dimension }) {
  state.answers.push({ round: state.round, question, answer, dimension });
  state.questions.push({ round: state.round, text: question });
  state.round++;
}

/**
 * Update the dimension scores after scoring.
 * @param {object} state
 * @param {object} scores - dimension scores appropriate to track
 */
export function updateDimensions(state, scores) {
  state.dimensions = { ...state.dimensions, ...scores };
  const d = state.dimensions;

  let ambiguity;
  if (state.track === 'company') {
    // Company-level: strategy 30%, readiness 25%, portfolio 20%, risk 15%, fit 10%
    ambiguity = Math.max(0, 1 - (
      (d.strategy ?? 0) * 0.30 +
      (d.readiness ?? 0) * 0.25 +
      (d.portfolio ?? 0) * 0.20 +
      (d.risk ?? 0) * 0.15 +
      (d.fit ?? 0) * 0.10
    ));
  } else {
    // Project-level: specificity 30%, systems 25%, success 20%, risk 15%, fit 10%
    ambiguity = Math.max(0, 1 - (
      (d.specificity ?? 0) * 0.30 +
      (d.systems ?? 0) * 0.25 +
      (d.success ?? 0) * 0.20 +
      (d.risk ?? 0) * 0.15 +
      (d.fit ?? 0) * 0.10
    ));
  }
  state.ambiguity = ambiguity;
}

/**
 * Advance the session phase.
 * @param {object} state
 * @param {string} phase
 */
export function setPhase(state, phase) {
  state.phase = phase;
  writeState(state);
}

/**
 * Mark the session as finished and persist.
 * @param {object} state
 * @param {string} reason - 'threshold-met' | 'round-cap' | 'early-exit'
 * @param {string} spec   - The crystallised spec content
 */
export function finishSession(state, reason, spec) {
  state.phase = 'done';
  state.exitReason = reason;
  state.spec = spec;
  state.finishedAt = new Date().toISOString();
  writeState(state);
}

// Private: write without updating updatedAt (used internally by createSession)
function _writeState(state) {
  ensureStateDir();
  writeFileSync(_stateFilePath(state.sessionId), JSON.stringify(state, null, 2), 'utf8');
}