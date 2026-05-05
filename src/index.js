/**
 * index.js — Main entry point for the deep-interview package.
 *
 * Provides programmatic API for the interview loop.
 * The CLI delegates to this module.
 *
 * Usage (programmatic):
 *   import { initSession, askQuestion, recordAnswer, scoreSession, crystallise } from '@agentdash/deep-interview';
 *
 * Usage (CLI):
 *   deep-interview init --seed "..."
 *   deep-interview ask --round 1
 *   deep-interview score --round 1
 *   deep-interview crystal
 */

export { createSession, loadSession, loadLatestSession, writeState, recordAnswer, updateDimensions, setPhase, finishSession } from './state.js';
export { scoreRound, computeAmbiguity, getChallengeAgents, getVerdict } from './score.js';
export { generateNextQuestion, buildQuestionPrompt, DIMENSION_WEIGHTS } from './question.js';
export { crystallise, extractOntology } from './spec.js';
export { specPath, stateDir, deriveSlug, ensureDir } from './output.js';

/**
 * Full interview loop (programmatic, non-interactive).
 *
 * Call this with an iterator of user answers to run the interview end-to-end.
 *
 * @param {object} options
 * @param {string} options.seed
 * @param {string} [options.depth]           - 'quick' | 'standard' | 'deep'
 * @param {number} [options.threshold]        - Ambiguity threshold (default 0.2)
 * @param {string} [options.outputDir]       - Spec output directory
 * @param {async function(question: string): string} options.onAsk - Called to get user answers
 * @param {async function(state: object): void} [options.onRound] - Called after each round
 * @returns {Promise<object>} final state with spec
 */
export async function runInterview({ seed, depth = 'standard', threshold = 0.2, outputDir = './specs', onAsk, onRound }) {
  if (!onAsk) throw new Error('onAsk callback is required');

  const { createSession, recordAnswer, updateDimensions, setPhase, finishSession, writeState } = await import('./state.js');
  const { scoreRound } = await import('./score.js');
  const { generateNextQuestion } = await import('./question.js');
  const { getChallengeAgents } = await import('./score.js');
  const { crystallise } = await import('./spec.js');
  const { specPath } = await import('./output.js');
  const { writeFileSync, mkdirSync } = await import('fs');
  const path = await import('path');

  // Initialise
  const state = createSession({ seed, depth });
  setPhase(state, 'phase-1');

  console.log(`[deep-interview] Starting interview — session ${state.sessionId}, depth=${depth}, maxRounds=${state.maxRounds}`);

  let done = false;

  while (!done) {
    const round = state.round + 1; // next round

    // Safety cap
    if (round > state.maxRounds) {
      console.log(`[deep-interview] Round ${round} exceeds max (${state.maxRounds}) — stopping.`);
      break;
    }

    // Generate question
    const challengeAgents = getChallengeAgents(round);
    const q = await generateNextQuestion({
      seed,
      round,
      answers: state.answers,
      dimensions: state.dimensions,
      challengeAgents,
    });

    console.log(`\n[Round ${round}] ${q.dimension} / ${q.phase}${q.challengeAgent ? ` [${q.challengeAgent}]` : ''}`);
    console.log(`Q: ${q.question}`);

    // Ask the user
    const answer = await onAsk(q.question);
    if (!answer || answer.trim() === '') {
      console.log('[deep-interview] Empty answer — ending interview.');
      break;
    }

    // Record the answer
    recordAnswer(state, { question: q.question, answer, dimension: q.dimension });
    setPhase(state, q.phase);

    // Run scoring
    const score = await scoreRound({
      seed,
      answers: state.answers,
      round,
    });

    updateDimensions(state, {
      specificity: score.specificity ?? state.dimensions.specificity,
      systems: score.systems ?? state.dimensions.systems,
      success: score.success ?? state.dimensions.success,
      risk: score.risk ?? state.dimensions.risk,
      fit: score.fit ?? state.dimensions.fit,
    });
    writeState(state);

    console.log(`  ambiguity: ${state.ambiguity.toFixed(3)} (threshold: ${threshold}) | verdict: ${score.verdict ?? '?'}`);
    if (score.concerns?.length) {
      console.log(`  concerns: ${score.concerns.join('; ')}`);
    }

    // Call round callback
    if (onRound) await onRound(state);

    // Check exit conditions
    const ambiguityMet = state.ambiguity <= threshold;
    const allAboveMinimum = Object.values(state.dimensions).every(v => (v ?? 0) >= 0.5);

    if (ambiguityMet && allAboveMinimum) {
      console.log(`\n[deep-interview] Ambiguity threshold met (${state.ambiguity.toFixed(3)} ≤ ${threshold}) — crystallising.`);
      done = true;
    } else if (round >= state.maxRounds) {
      console.log(`\n[deep-interview] Round cap reached (${round}/${state.maxRounds}) — crystallising.`);
      done = true;
    } else if (score.verdict === 'NO-GO' && round >= 10) {
      // Early exit with warning if still no-go at round 10
      console.log(`\n[deep-interview] WARNING: Score is NO-GO at round ${round} — continuing may not improve clarity.`);
      // Continue unless hard cap
      if (round >= 15) {
        console.log('[deep-interview] Hard cap reached — crystallising.');
        done = true;
      }
    }
  }

  // Crystallise
  console.log('\n[deep-interview] Crystallising spec...');
  const spec = await crystallise(state);

  const outDir = path.resolve(outputDir);
  mkdirSync(outDir, { recursive: true });
  const filePath = specPath(outputDir, state.slug);
  writeFileSync(filePath, spec, 'utf8');

  const reason = state.ambiguity <= threshold ? 'threshold-met' : 'round-cap';
  finishSession(state, reason, spec);

  console.log(`\n[deep-interview] Done. Spec written to: ${filePath}`);
  return state;
}

/**
 * Convenience: run an interview from a seed with a readline-based onAsk.
 * @param {string} seed
 * @param {object} [options]
 */
export async function runInterviewInteractive(seed, options = {}) {
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question) => new Promise(resolve => {
    rl.question(`\n${question}\n> `, answer => resolve(answer));
  });

  try {
    return await runInterview({ ...options, seed, onAsk: ask });
  } finally {
    rl.close();
  }
}