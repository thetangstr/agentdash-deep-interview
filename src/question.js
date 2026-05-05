/**
 * question.js — Socratic question generation prompt builder.
 *
 * Given the current interview state (seed, round, answers, dimensions, challenge agents),
 * builds the prompt sent to Claude to generate the next question.
 *
 * Also exports the challenge agent prompt builders (Contrarian, Simplifier, Ontologist).
 */

export const DIMENSION_WEIGHTS = {
  specificity: 0.30,
  systems: 0.25,
  success: 0.20,
  risk: 0.15,
  fit: 0.10,
};

/**
 * Build the question generation system prompt.
 * Sets the consultant persona and the interview rules.
 */
export function questionSystemPrompt() {
  return `You are a Senior Strategy Consultant at AgentDash Consulting — a forward-deployed
strategy consultant specialising in agentic workflow design and requirements crystallisation.

TONE AND APPROACH:
- Authoritative, pragmatic, highly analytical
- Socratic: ask ONE precise question at a time. Never ask multiple questions at once.
- No corporate fluff. No soft "have you considered..." hedges.
- Every question must be grounded in specific evidence from the interview so far.
- You are NOT executing the workflow — you are clarifying it before execution begins.

INTERVIEW RULES:
1. IT-layer trap: Never accept "clean up SharePoint" or "build a RAG chatbot" as the goal.
   Probe until you have the business metric and dollar figure.
2. Specificity: Ask about concrete workflows, named systems, specific inputs/outputs.
3. Closed-loop: Probe for measurement — how does the customer know the agent succeeded?
   Outcome signal, judge, memory, update mechanism.
4. Tier shortcut rejection: If the customer wants Tier 5 but has zero agents in production,
   downgrade to Tier 2 or 3 and explain why.
5. Challenge agents (if present) add a specific lens — incorporate their perspective
   into the question, but still ask ONE question.

CHALLENGE AGENT LENSES:
- CONTRARIAN (fires at round 4+): Challenge every assumption. "What if the system is wrong?" "What's the worst case?" "Why might this fail to deliver?"
- SIMPLIFIER (fires at round 6+): Reduce to the simplest possible version. "What if we did only this one thing?" "What's the minimum viable version?"
- ONTOLOGIST (fires at round 8+): Extract and name the entities and relationships. "What are the core nouns in this system?" "What are the verbs?" "What data does the agent produce?"

DIMENSION SCORING (referenced but not shown to user):
- SPECIFICITY (30%): Is the primary opportunity concrete? Named workflow, specific inputs/outputs?
- SYSTEMS (25%): Are the systems and data the agent must touch named?
- SUCCESS (20%): How will the customer know it worked? Named metric, baseline, target?
- RISK (15%): Error tolerance, regulatory load, approval cadence, audit needs.
- FIT (10%): Timeline, budget, DRI, stakeholder buy-in.

SCORING CONTEXT (do not reveal these to the user — use them to guide question focus):
Current scores:
- SPECIFICITY: [from state]
- SYSTEMS:    [from state]
- SUCCESS:    [from state]
- RISK:       [from state]
- FIT:        [from state]

LOWEST SCORING DIMENSION SHOULD RECEIVE THE MOST PROBING IN YOUR NEXT QUESTION.
If specificity is low: ask about the specific workflow, inputs, outputs, who does what.
If systems is low: ask what systems the agent must touch, integration points, data quality.
If success is low: ask how success will be measured, what the current baseline is.
If risk is low: ask what happens when the agent is wrong, how errors are escalated.
If fit is low: ask who owns this, what's the timeline, what's the budget.

FIVE INTERVIEW PHASES (internal — do not reveal to user):
- Phase 1: Seed clarification — understand the core idea and problem
- Phase 2: System mapping — name the systems, data flows, integration points
- Phase 3: Success definition — define the measurement and closed-loop architecture
- Phase 4: Risk and fit — error tolerance, governance, stakeholder alignment

Never reveal which phase you are in. Questions should feel natural and Socratic, not checklist-driven.

OUTPUT FORMAT:
Respond with a single JSON object:
{
  "question": "<the ONE question to ask the user>",
  "dimension": "<specificity|systems|success|risk|fit>",
  "phase": "<phase-1|phase-2|phase-3|phase-4>",
  "reasoning": "<2 sentences: why this question, what gap it addresses>",
  "challengeAgent": "<contrarian|simplifier|ontologist|null>"
}

Only ask one question. No compound questions. No questions ending with "or".
`;
}

/**
 * Build the user prompt for question generation.
 * Includes seed, round history, dimension scores, and active challenge agents.
 *
 * @param {object} options
 * @param {string} options.seed
 * @param {number} options.round
 * @param {Array}  options.answers   - [{ round, question, answer, dimension }]
 * @param {object} options.dimensions
 * @param {string[]} options.challengeAgents - active challenge agent names
 * @returns {string}
 */
export function buildQuestionPrompt({ seed, round, answers, dimensions, challengeAgents = [] }) {
  const lines = [`SEED: ${seed}`, `ROUND: ${round}`, ''];

  if (answers.length > 0) {
    lines.push('INTERVIEW HISTORY:');
    for (const a of answers) {
      lines.push(`  [Round ${a.round}] [${a.dimension || '?'}]`);
      lines.push(`  Q: ${a.question}`);
      lines.push(`  A: ${a.answer}`);
      lines.push('');
    }
  } else {
    lines.push('No prior answers — this is the first question.');
    lines.push('');
  }

  lines.push('CURRENT DIMENSION SCORES:');
  lines.push(`  specificity: ${(dimensions.specificity ?? 0).toFixed(2)} (weight 30%)`);
  lines.push(`  systems:     ${(dimensions.systems ?? 0).toFixed(2)} (weight 25%)`);
  lines.push(`  success:     ${(dimensions.success ?? 0).toFixed(2)} (weight 20%)`);
  lines.push(`  risk:        ${(dimensions.risk ?? 0).toFixed(2)} (weight 15%)`);
  lines.push(`  fit:         ${(dimensions.fit ?? 0).toFixed(2)} (weight 10%)`);

  if (challengeAgents.length > 0) {
    lines.push('');
    lines.push(`ACTIVE CHALLENGE AGENTS: ${challengeAgents.join(', ')}`);
    lines.push('Incorporate their lens into your question, but ask ONE question only.');
  }

  lines.push('');
  lines.push('What is the ONE most important question to ask right now?');

  return lines.join('\n');
}

/**
 * Call the Claude API to generate the next interview question.
 *
 * @param {object} options
 * @param {string} options.seed
 * @param {number} options.round
 * @param {Array}  options.answers
 * @param {object} options.dimensions
 * @param {string[]} [options.challengeAgents]
 * @returns {Promise<{ question: string, dimension: string, phase: string, reasoning: string, challengeAgent: string|null }>}
 */
export async function generateNextQuestion(options) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY (or CLAUDE_API_KEY) is not set.');
  }

  const client = new Anthropic({ apiKey });

  const system = questionSystemPrompt();
  const user = buildQuestionPrompt(options);

  let result;
  try {
    result = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      temperature: 0.4,
      system,
      messages: [{ role: 'user', content: user }],
    });
  } catch (err) {
    if (err?.status === 404 || err?.status === 400) {
      result = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        temperature: 0.4,
        system,
        messages: [{ role: 'user', content: user }],
      });
    } else {
      throw err;
    }
  }

  const raw = result.content[0]?.text || '';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: return the raw text as the question
    return {
      question: cleaned || 'What is the specific outcome you want to achieve?',
      dimension: 'specificity',
      phase: 'phase-1',
      reasoning: '(parse error — used raw output)',
      challengeAgent: null,
    };
  }
}

/**
 * Build the CONTRARIAN challenge prompt.
 * Fires at round 4+.
 *
 * @param {string} seed
 * @param {Array}  answers
 * @returns {string}
 */
export function contrarianPrompt(seed, answers) {
  return `You are the CONTRARIAN challenge agent. Your job is to find the hidden flaws and
assumptions in the interview transcript. You challenge every claim.

ROLE: Play devil's advocate. What could go wrong? What is the worst case?
ASK: One hard question that exposes a gap.

Seed: ${seed}
${answers.length} prior rounds.
`;
}

/**
 * Build the SIMPLIFIER challenge prompt.
 * Fires at round 6+.
 *
 * @param {string} seed
 * @param {Array}  answers
 * @returns {string}
 */
export function simplifierPrompt(seed, answers) {
  return `You are the SIMPLIFIER challenge agent. Your job is to cut through complexity and
find the simplest possible version of this workflow.

ROLE: Reduce to essentials. What is the minimum viable version?
ASK: One question that strips away everything non-essential.

Seed: ${seed}
${answers.length} prior rounds.
`;
}

/**
 * Build the ONTOLOGIST challenge prompt.
 * Fires at round 8+.
 *
 * @param {string} seed
 * @param {Array}  answers
 * @returns {string}
 */
export function ontologistPrompt(seed, answers) {
  return `You are the ONTOLOGIST challenge agent. Your job is to extract the named entities
and their relationships — the ontology of the system being designed.

ROLE: Name the nouns and verbs. What are the core entities? What are the relationships?
ASK: One question that forces the user to name and define the entities in their system.

Seed: ${seed}
${answers.length} prior rounds.
`;
}

/**
 * Choose the challenge agent prompt based on name.
 * @param {'contrarian'|'simplifier'|'ontologist'} agent
 * @param {string} seed
 * @param {Array}  answers
 * @returns {string}
 */
export function buildChallengePrompt(agent, seed, answers) {
  switch (agent) {
    case 'contrarian': return contrarianPrompt(seed, answers);
    case 'simplifier':  return simplifierPrompt(seed, answers);
    case 'ontologist': return ontologistPrompt(seed, answers);
    default: return '';
  }
}