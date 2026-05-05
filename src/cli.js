/**
 * cli.js — CLI argument parser and main entry point.
 *
 * Handles: init, score, question, crystallize, status commands.
 * All commands read/write state via the state module.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// We use native minimist-style parsing to avoid adding a dependency
function parseArgs(argv) {
  const args = {};
  let i = 0;

  function next() {
    return argv[i++] || null;
  }

  while (i < argv.length) {
    const tok = argv[i];
    if (tok.startsWith('--')) {
      const key = tok.slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i += 2;
      } else {
        args[key] = true;
        i++;
      }
    } else {
      // positional or bare flag
      if (!args._) args._ = [];
      args._.push(tok);
      i++;
    }
  }
  return args;
}

/**
 * Print usage information.
 */
function usage() {
  console.log(`\
deep-interview — Socratic deep interview CLI (company-level + project-level)

USAGE
  deep-interview <command> [options]

COMMANDS
  init    Initialise a new interview session
  score   Score the current round's answers
  ask     Generate the next question (interactive)
  status  Show current session state
  ont     Extract ontology from transcript
  crystal Crystallise the spec and write to output path

INIT
  deep-interview init --seed "your idea here"
  deep-interview init --seed "..." --depth quick|standard|deep
  deep-interview init --seed "..." --track company|project

TRACK OPTIONS
  --track        "company" (strategic) or "project" (tactical). Default: project

SCORE
  deep-interview score --round <N> [--threshold <0.0-1.0>]

ASK
  deep-interview ask --round <N>

STATUS
  deep-interview status [session-id]

ONT
  deep-interview ont [session-id]

CRYSTAL
  deep-interview crystal [--output-dir <path>]

PRESENT
  deep-interview present [--session-id <id>] [--output-dir <path>]
  deep-interview present --spec-path ./specs/deep-interview-xxx.md [--output-dir <path>]

EXAMPLES
  # Company-level (strategic) assessment
  deep-interview init --seed "Acme Corp AI adoption readiness" --track company --depth deep

  # Project-level (tactical) project charter
  deep-interview init --seed "customer support agent for Acme Corp" --track project

  deep-interview score --round 3
  deep-interview ask --round 4
  deep-interview crystal --output-dir ./specs
`);
}

/**
 * Entry point — dispatch to the appropriate command handler.
 */
async function main(argv) {
  const args = parseArgs(argv.slice(2)); // strip node + script

  if (args.help || args._?.includes('help')) {
    usage();
    return;
  }

  const [command, ...positionals] = args._ || ['help'];

  switch (command) {
    case 'init':       await cmdInit(args); break;
    case 'score':      await cmdScore(args); break;
    case 'ask':        await cmdAsk(args); break;
    case 'status':     await cmdStatus(args); break;
    case 'ont':
    case 'ontology':   await cmdOntology(args); break;
    case 'crystal':
    case 'crystallize': await cmdCrystallize(args); break;
    case 'present':    await cmdPresent(args); break;
    default:
      if (!command || command === 'help') {
        usage();
        process.exit(1);
      }
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

/**
 * init command — create a new interview session.
 */
async function cmdInit(args) {
  const seed = args.seed || '';
  if (!seed) {
    console.error('deep-interview init: --seed is required');
    process.exit(1);
  }

  const { createSession } = await import('./state.js');
  const { mkdirSync } = await import('fs');

  mkdirSync('./specs', { recursive: true });

  const track = args.track || 'project';
  if (!['company', 'project'].includes(track)) {
    console.error('deep-interview init: --track must be "company" or "project"');
    process.exit(1);
  }

  const state = createSession({
    seed,
    sessionId: args['session-id'] || null,
    depth: args.depth || 'standard',
    track,
  });

  console.log(`\
Session initialised:
  ID:      ${state.sessionId}
  slug:    ${state.slug}
  track:   ${state.track}
  depth:   ${state.depth} (max ${state.maxRounds} rounds)
  state:   ~/.agentic-readiness/state/${state.sessionId}.json
  spec:    ./specs/deep-interview-${state.slug}.md
`);
}

/**
 * score command — score the current/indicated round.
 */
async function cmdScore(args) {
  const round = parseInt(args.round || '0', 10);
  const threshold = parseFloat(args.threshold || '0.2');

  const { loadSession, loadLatestSession, updateDimensions } = await import('./state.js');
  const { scoreRound } = await import('./score.js');

  const sessionId = args['session-id'] || null;
  const state = sessionId ? loadSession(sessionId) : loadLatestSession();

  if (!state) {
    console.error('No session found. Run "deep-interview init --seed ..." first.');
    process.exit(1);
  }

  const result = await scoreRound({
    seed: state.seed,
    answers: state.answers,
    priorDimensions: state.dimensions,
    round: state.round,
    track: state.track || 'project',
  });

  // Update state with new scores — merge only the dimensions that exist for this track
  const scoreUpdate = {};
  if (state.track === 'company') {
    scoreUpdate.strategy = result.strategy ?? state.dimensions.strategy;
    scoreUpdate.readiness = result.readiness ?? state.dimensions.readiness;
    scoreUpdate.portfolio = result.portfolio ?? state.dimensions.portfolio;
  } else {
    scoreUpdate.specificity = result.specificity ?? state.dimensions.specificity;
    scoreUpdate.systems = result.systems ?? state.dimensions.systems;
    scoreUpdate.success = result.success ?? state.dimensions.success;
  }
  scoreUpdate.risk = result.risk ?? state.dimensions.risk;
  scoreUpdate.fit = result.fit ?? state.dimensions.fit;

  updateDimensions(state, scoreUpdate);

  const { writeState } = await import('./state.js');
  writeState(state);

  const verdict = result.verdict || 'NO-GO';
  const emoji = verdict === 'GO' ? '✅' : verdict === 'CONDITIONAL' ? '⚠️' : '❌';

  if (state.track === 'company') {
    console.log(`\
Round ${state.round} scoring [COMPANY]:
  strategy:  ${(result.strategy ?? 0).toFixed(2)} (weight 30%)
  readiness: ${(result.readiness ?? 0).toFixed(2)} (weight 25%)
  portfolio: ${(result.portfolio ?? 0).toFixed(2)} (weight 20%)
  risk:      ${(result.risk ?? 0).toFixed(2)} (weight 15%)
  fit:       ${(result.fit ?? 0).toFixed(2)} (weight 10%)
  ─────────────────────────────────
  ambiguity: ${(result.ambiguity ?? 1).toFixed(3)}
  threshold: ${threshold.toFixed(3)}
  verdict:   ${emoji} ${verdict}
  ${result.rationale ? 'rationale: ' + result.rationale : ''}
  ${result.concerns?.length ? 'concerns: ' + result.concerns.join('; ') : ''}
`);
  } else {
    console.log(`\
Round ${state.round} scoring [PROJECT]:
  specificity: ${(result.specificity ?? 0).toFixed(2)} (weight 30%)
  systems:     ${(result.systems ?? 0).toFixed(2)} (weight 25%)
  success:     ${(result.success ?? 0).toFixed(2)} (weight 20%)
  risk:        ${(result.risk ?? 0).toFixed(2)} (weight 15%)
  fit:         ${(result.fit ?? 0).toFixed(2)} (weight 10%)
  ─────────────────────────────────
  ambiguity:   ${(result.ambiguity ?? 1).toFixed(3)}
  threshold:   ${threshold.toFixed(3)}
  verdict:     ${emoji} ${verdict}
  ${result.rationale ? 'rationale: ' + result.rationale : ''}
  ${result.concerns?.length ? 'concerns: ' + result.concerns.join('; ') : ''}
`);
  }
}

/**
 * ask command — generate and print the next question.
 */
async function cmdAsk(args) {
  const { loadSession, loadLatestSession } = await import('./state.js');
  const { generateNextQuestion } = await import('./question.js');
  const { getChallengeAgents } = await import('./score.js');

  const sessionId = args['session-id'] || null;
  const state = sessionId ? loadSession(sessionId) : loadLatestSession();

  if (!state) {
    console.error('No session found. Run "deep-interview init --seed ..." first.');
    process.exit(1);
  }

  if (state.phase === 'done') {
    console.log('Interview is complete. Run "deep-interview crystal" to generate the spec.');
    return;
  }

  const round = parseInt(args.round || String(state.round + 1), 10);
  const challengeAgents = getChallengeAgents(round);

  const q = await generateNextQuestion({
    seed: state.seed,
    round,
    answers: state.answers,
    dimensions: state.dimensions,
    challengeAgents,
    track: state.track || 'project',
  });

  console.log(JSON.stringify({
    sessionId: state.sessionId,
    round,
    track: state.track,
    dimension: q.dimension,
    phase: q.phase,
    question: q.question,
    reasoning: q.reasoning,
    whyContext: q.whyContext || q.reasoning,
    options: q.options || [
      { label: 'My answer (describe)', description: 'Free-text answer' },
      { label: "I don't know / skip", description: 'Skip this question' },
    ],
    challengeAgent: q.challengeAgent,
    ambiguity: state.ambiguity?.toFixed(3) ?? '?',
    maxRounds: state.maxRounds,
  }, null, 2));
}

/**
 * status command — print a human-readable session summary.
 */
async function cmdStatus(args) {
  const { loadSession, loadLatestSession } = await import('./state.js');

  const sessionId = args['session-id'] || null;
  const state = sessionId ? loadSession(sessionId) : loadLatestSession();

  if (!state) {
    console.log('No sessions found. Run "deep-interview init --seed ..." to start.');
    return;
  }

  const d = state.dimensions;
  const verdict = state.ambiguity <= 0.2 ? 'GO' : state.ambiguity <= 0.35 ? 'CONDITIONAL' : 'NO-GO';
  const emoji = verdict === 'GO' ? '✅' : verdict === 'CONDITIONAL' ? '⚠️' : '❌';

  const bar = (v) => '█'.repeat(Math.round((v ?? 0) * 10)) + '░'.repeat(10 - Math.round((v ?? 0) * 10));

  if (state.track === 'company') {
    console.log(`\
deep-interview session
─────────────────────────────────────────────
  session:   ${state.sessionId}
  slug:      ${state.slug}
  track:     COMPANY (strategic)
  phase:     ${state.phase}
  started:   ${state.startedAt}
  rounds:    ${state.round} / ${state.maxRounds}
  depth:     ${state.depth}
─────────────────────────────────────────────
  STRATEGY   ${(d.strategy ?? 0).toFixed(2)} (30%)  ${bar(d.strategy)}
  READINESS  ${(d.readiness ?? 0).toFixed(2)} (25%)  ${bar(d.readiness)}
  PORTFOLIO  ${(d.portfolio ?? 0).toFixed(2)} (20%)  ${bar(d.portfolio)}
  RISK       ${(d.risk ?? 0).toFixed(2)} (15%)  ${bar(d.risk)}
  FIT        ${(d.fit ?? 0).toFixed(2)} (10%)  ${bar(d.fit)}
─────────────────────────────────────────────
  ambiguity:  ${(state.ambiguity ?? 1).toFixed(3)} / 0.200  ${emoji} ${verdict}
  exit:       ${state.exitReason || 'in-progress'}
  ${state.finishedAt ? `finished:  ${state.finishedAt}` : ''}
─────────────────────────────────────────────
  spec path:  ./specs/deep-interview-${state.slug}.md
`);
  } else {
    console.log(`\
deep-interview session
─────────────────────────────────────────────
  session:   ${state.sessionId}
  slug:      ${state.slug}
  track:     PROJECT (tactical)
  phase:     ${state.phase}
  started:   ${state.startedAt}
  rounds:    ${state.round} / ${state.maxRounds}
  depth:     ${state.depth}
─────────────────────────────────────────────
  SPECIFICITY  ${(d.specificity ?? 0).toFixed(2)} (30%)  ${bar(d.specificity)}
  SYSTEMS      ${(d.systems ?? 0).toFixed(2)} (25%)  ${bar(d.systems)}
  SUCCESS      ${(d.success ?? 0).toFixed(2)} (20%)  ${bar(d.success)}
  RISK         ${(d.risk ?? 0).toFixed(2)} (15%)  ${bar(d.risk)}
  FIT          ${(d.fit ?? 0).toFixed(2)} (10%)  ${bar(d.fit)}
─────────────────────────────────────────────
  ambiguity:  ${(state.ambiguity ?? 1).toFixed(3)} / 0.200  ${emoji} ${verdict}
  exit:       ${state.exitReason || 'in-progress'}
  ${state.finishedAt ? `finished:  ${state.finishedAt}` : ''}
─────────────────────────────────────────────
  spec path:  ./specs/deep-interview-${state.slug}.md
`);
  }
}

/**
 * ontology / ont command — extract and print the ontology.
 */
async function cmdOntology(args) {
  const { loadSession, loadLatestSession } = await import('./state.js');
  const { extractOntology } = await import('./spec.js');

  const sessionId = args['session-id'] || null;
  const state = sessionId ? loadSession(sessionId) : loadLatestSession();

  if (!state) {
    console.error('No session found.');
    process.exit(1);
  }

  const ontology = await extractOntology(state);
  state.ontology = ontology;
  state.stabilityScore = ontology.stability ?? 0;
  const { writeState } = await import('./state.js');
  writeState(state);

  console.log(JSON.stringify({
    sessionId: state.sessionId,
    stability: ontology.stability ?? 0,
    entities: ontology.entities ?? [],
    relationships: ontology.relationships ?? [],
  }, null, 2));
}

/**
 * crystal / crystallize command — generate and write the spec.
 */
async function cmdCrystallize(args) {
  const { loadSession, loadLatestSession, finishSession } = await import('./state.js');
  const { crystallise } = await import('./spec.js');
  const { specPath } = await import('./output.js');
  const { ensureDir } = await import('./output.js');
  const { writeFileSync, mkdirSync, readFileSync, existsSync } = await import('fs');
  const path = await import('path');

  const sessionId = args['session-id'] || null;
  const state = sessionId ? loadSession(sessionId) : loadLatestSession();

  if (!state) {
    console.error('No session found.');
    process.exit(1);
  }

  const outputDir = args['output-dir'] || './specs';
  const filePath = specPath(outputDir, state.slug);

  // Ensure output dir
  mkdirSync(path.resolve(outputDir), { recursive: true });

  // Load research context if available (written by last30days research step)
  let researchContext = null;
  const researchPath = path.resolve(
    process.env.HOME || '',
    '.agentic-readiness',
    'research',
    `${state.sessionId}.md`
  );
  if (existsSync(researchPath)) {
    try {
      researchContext = readFileSync(researchPath, 'utf8');
      console.log('Research context loaded from:', researchPath);
    } catch {
      // ignore — research is optional
    }
  }

  console.log('Crystallising spec...');
  const spec = await crystallise(state, researchContext);

  writeFileSync(filePath, spec, 'utf8');

  const threshold = parseFloat(args.threshold || '0.2');
  const reason = state.ambiguity <= threshold ? 'threshold-met' : 'round-cap';
  finishSession(state, reason, spec);

  const verdict = state.ambiguity <= threshold ? 'GO' : 'CONDITIONAL';
  console.log(`\
Spec crystallised and written to:
  ${filePath}
  ambiguity: ${state.ambiguity.toFixed(3)} → ${verdict}
  exit reason: ${reason}
`);
}

/**
 * present command — generate an HTML slideshow from a crystallised spec.
 */
async function cmdPresent(args) {
  const { generatePresentation } = await import('./present.js');

  const sessionId = args['session-id'] || null;
  const specPath = args['spec-path'] || null;
  const outputDir = args['output-dir'] || './specs';

  console.log('Generating presentation...');
  try {
    const outputFile = await generatePresentation({ sessionId, specPath, outputDir });
    console.log(`Presentation written to:
  ${outputFile}

Open in any browser. Use arrow keys or click to navigate.`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run
const argv = process.argv.slice();
main(argv).catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});