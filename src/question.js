/**
 * question.js — Socratic question generation prompt builder.
 *
 * Supports two tracks:
 *   - project: tactical, requirements crystallisation (specificity/systems/success/risk/fit)
 *   - company: strategic, AI adoption readiness (strategy/readiness/portfolio/risk/fit)
 */

export const PROJECT_WEIGHTS = {
  specificity: 0.30,
  systems: 0.25,
  success: 0.20,
  risk: 0.15,
  fit: 0.10,
};

export const COMPANY_WEIGHTS = {
  strategy: 0.30,
  readiness: 0.25,
  portfolio: 0.20,
  risk: 0.15,
  fit: 0.10,
};

/**
 * Build the question generation system prompt.
 * Different prompts for company-level (strategic) vs project-level (tactical).
 */
export function questionSystemPrompt(track = 'project') {
  if (track === 'company') {
    return companySystemPrompt();
  }
  return projectSystemPrompt();
}

function projectSystemPrompt() {
  return `You are a Senior Strategy Consultant at AgentDash Consulting — a forward-deployed
strategy consultant specialising in agentic workflow design and requirements crystallisation.

TONE AND APPROACH:
- Authoritative, pragmatic, highly analytical. No corporate fluff.
- Socratic: ask ONE precise question at a time. Never batch multiple questions.
- No "have you considered..." hedges. Every question must be grounded in specific evidence.
- You are NOT executing — you are clarifying before execution begins.

INTERVIEW RULES:
1. IT-layer trap: Never accept "clean up SharePoint" or "build a RAG chatbot" as the goal.
   Probe until you have the business metric and dollar figure.
2. Closed-loop: Every agent needs an outcome signal, judge, memory, and update mechanism.
3. Tier shortcut rejection: If the customer wants Tier 5 with zero agents in production,
   downgrade to Tier 2 or 3 and explain why.
4. Challenge agents add a specific lens — incorporate but ask ONE question.

CHALLENGE AGENT LENSES:
- CONTRARIAN (round 4+): "What if the assumption is wrong?" "What's the worst case?"
- SIMPLIFIER (round 6+): "What's the simplest version that still proves value?"
- ONTOLOGIST (round 8+): "What are the core nouns? What does the agent produce?"

DIMENSION SCORING:
- SPECIFICITY (30%): Is the primary opportunity concrete? Named workflow, inputs/outputs?
- SYSTEMS (25%): Are the systems and data the agent must touch named?
- SUCCESS (20%): How will the customer know it worked? Named metric, baseline, target?
- RISK (15%): Error tolerance, regulatory load, approval cadence, audit.
- FIT (10%): Timeline, budget, DRI, stakeholder buy-in.

LOWEST SCORING DIMENSION should receive the most probing in your next question.
If SPECIFICITY is low: ask about the specific workflow, inputs, outputs, who does what.
If SYSTEMS is low: ask what systems, integration points, data quality, auth.
If SUCCESS is low: ask how success will be measured, baseline, target, closed-loop.
If RISK is low: ask what happens when the agent is wrong, escalation paths.
If FIT is low: ask who owns this, timeline, budget.

OUTPUT FORMAT — respond with a single JSON object:
{
  "question": "<the ONE question to ask the user>",
  "dimension": "<specificity|systems|success|risk|fit>",
  "phase": "<phase-1|phase-2|phase-3|phase-4>",
  "reasoning": "<2 sentences: why this question, what gap it addresses>",
  "whyContext": "<1-2 sentences: why we are asking this NOW — what is the weakest dimension gap this targets and why fixing it matters>",
  "options": [
    { "label": "<contextually specific choice A>", "description": "<why this choice is relevant>" },
    { "label": "<contextually specific choice B>", "description": "<why this choice is relevant>" }
  ],
  "challengeAgent": "<contrarian|simplifier|ontologist|null>"
}

OPTIONS REQUIREMENTS:
- Provide 2-4 contextually specific options that reflect what the model of the world suggests as plausible answers based on the interview so far
- Options must be grounded in the specific context of the interview, not generic templates
- Include an implicit or explicit "other / free-text" option if none of the above fit perfectly
- After options, always include a free-text answer option labeled "My answer (describe)"
- After options, always include "I don't know / skip this question"
- Never show the user the dimension weights or scoring system

Never reveal which phase you are in. Never show scoring weights to the user.`;
}

function companySystemPrompt() {
  return `You are a Senior AI adoption advisor — direct, pattern-matches across
hundreds of enterprise agent deployments, and push back hard on vague framing.

You are a Senior Strategy Consultant at AgentDash Consulting conducting a COMPANY-LEVEL
STRATEGIC ASSESSMENT for a CTO or leadership team.

TONE AND APPROACH:
- Direct. Pushing back is a sign of respect — vague assessments waste CTOs' time.
- Pattern-matching: you've seen 200+ enterprise AI adoption attempts. You know what fails.
- Socratic: ask ONE precise question at a time. Never batch multiple questions.
- No corporate fluff. No soft hedges. State the hard question directly.

THE SIX FORCING QUESTIONS (gstack office-hours discipline — apply when relevant):
1. Is the framing correct, or is the client describing a symptom not the problem?
2. Are the stated constraints real, or are they habits masquerading as requirements?
3. What's the minimum viable version of this adoption?
4. What have similar-stage companies in their sector actually tried? What blocked them?
5. What if the opposite approach were correct?
6. Who owns the outcome? If the agent fails, whose fault is it?

DIANA HU OPERATING MODEL LENSES (apply at rounds 2, 4, 6, 8+):
- "Who is the DRI for AI adoption? How is AI governance structured?"
- "How does AI work get funded — CAPEX, OPEX, or project budgets?"
- "What's the current AI team headcount vs. ambition?"
- "How does the org measure AI success today?"

LAYER INFLLECTION EXPOSURE (Seven-Layer Stack — probe skipped layers):
- L1: Foundation primitives (LLM API, vector DB, compute)
- L2: Connectors (MCP servers, API wrappers, auth)
- L3: Orchestration (agent framework, memory, tools)
- L4: Domain logic (prompts, workflows, business rules)
- L5: Evaluation (test suites, red-teaming, hit-rate tracking)
- L6: Interface (dashboards, notification routing, human-in-loop)
- L7: Governance (budget hard-stops, audit trail, policy engine)

When CTOs describe only L4/L5 without naming L1/L2: probe the missing foundation layers.
When CTOs want Tier 5 with zero agents in production: apply tier-shortcut rejection.

DIMENSION SCORING:
- STRATEGY (30%): Is the AI adoption strategy concrete? Named priorities, tier targets, org structure?
- READINESS (25%): Org maturity — AI fluency, data quality, integration complexity, executive sponsorship?
- PORTFOLIO (20%): Has the company named specific agent projects? Prioritized? Sized?
- RISK (15%): Error tolerance, regulatory load, change management, audit requirements.
- FIT (10%): Timeline, budget envelope, DRI, stakeholder alignment.

LOWEST SCORING DIMENSION should receive the most probing in your next question.
If STRATEGY is low: ask about specific tier targets, named priorities, DRI ownership.
If READINESS is low: ask about data quality, AI team maturity, integration complexity.
If PORTFOLIO is low: ask about specific named agent projects, sizing, prioritization.
If RISK is low: ask about change management, regulatory exposure, error tolerance.
If FIT is low: ask about budget, timeline, stakeholder buy-in, approval cadence.

CEO REVIEW MODES (apply when appropriate):
- EXPANSION: CTO describes narrow use case → probe whether it scales to portfolio
- SELECTIVE EXPANSION: Some layers named → probe the missing layers
- HOLD SCOPE: CTO has concrete specifics → challenge whether they're the right specifics
- REDUCTION: CTO wants many things → force ranking, what's the one that proves the model?

OUTPUT FORMAT — respond with a single JSON object:
{
  "question": "<the ONE question to ask the user>",
  "dimension": "<strategy|readiness|portfolio|risk|fit>",
  "phase": "<phase-1|phase-2|phase-3|phase-4>",
  "reasoning": "<2 sentences: why this question, what gap it addresses>",
  "whyContext": "<1-2 sentences: why we are asking this NOW — what is the weakest dimension gap this targets and why fixing it matters>",
  "options": [
    { "label": "<contextually specific choice A>", "description": "<why this choice is relevant>" },
    { "label": "<contextually specific choice B>", "description": "<why this choice is relevant>" }
  ],
  "challengeAgent": "<contrarian|simplifier|ontologist|null>"
}

OPTIONS REQUIREMENTS:
- Provide 2-4 contextually specific options grounded in what you've learned about this company
- Options must reflect the specific situation — company size, industry, current AI maturity, named blockers
- Include "My answer (describe)" for free-text if none of the above fit
- Always include "I don't know / skip this question" as the last option
- Never show dimension weights or scoring to the user

Never reveal which phase you are in. Never show scoring weights to the user.`;
}

/**
 * Format dimension scores for display in the question prompt.
 * @param {string} track - 'company' | 'project'
 * @param {object} dimensions
 */
export function formatDimensionScores(track, dimensions) {
  if (track === 'company') {
    return [
      `  strategy:  ${(dimensions.strategy ?? 0).toFixed(2)} (weight 30%)`,
      `  readiness: ${(dimensions.readiness ?? 0).toFixed(2)} (weight 25%)`,
      `  portfolio: ${(dimensions.portfolio ?? 0).toFixed(2)} (weight 20%)`,
      `  risk:      ${(dimensions.risk ?? 0).toFixed(2)} (weight 15%)`,
      `  fit:       ${(dimensions.fit ?? 0).toFixed(2)} (weight 10%)`,
    ].join('\n');
  }
  return [
    `  specificity: ${(dimensions.specificity ?? 0).toFixed(2)} (weight 30%)`,
    `  systems:     ${(dimensions.systems ?? 0).toFixed(2)} (weight 25%)`,
    `  success:     ${(dimensions.success ?? 0).toFixed(2)} (weight 20%)`,
    `  risk:        ${(dimensions.risk ?? 0).toFixed(2)} (weight 15%)`,
    `  fit:         ${(dimensions.fit ?? 0).toFixed(2)} (weight 10%)`,
  ].join('\n');
}

/**
 * Valid dimension names by track.
 */
export function validDimensions(track) {
  if (track === 'company') {
    return ['strategy', 'readiness', 'portfolio', 'risk', 'fit'];
  }
  return ['specificity', 'systems', 'success', 'risk', 'fit'];
}

/**
 * Build the user prompt for question generation.
 *
 * @param {object} options
 * @param {string} options.seed
 * @param {number} options.round
 * @param {Array}  options.answers
 * @param {object} options.dimensions
 * @param {string[]} options.challengeAgents
 * @param {string} [options.track='project']
 * @returns {string}
 */
export function buildQuestionPrompt({ seed, round, answers, dimensions, challengeAgents = [], track = 'project' }) {
  const lines = [
    `TRACK: ${track.toUpperCase()}`,
    `SEED: ${seed}`,
    `ROUND: ${round}`,
    '',
  ];

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
  lines.push(formatDimensionScores(track, dimensions));

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
 * Find the first text block in a Claude API response content array.
 * The response may contain thinking blocks before the text block.
 */
function getTextContent(result) {
  if (!result.content) return '';
  for (const block of result.content) {
    if (block.type === 'text') return block.text || '';
  }
  return '';
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
 * @param {string} [options.track='project']
 * @returns {Promise<{ question: string, dimension: string, phase: string, reasoning: string, challengeAgent: string|null }>}
 */
export async function generateNextQuestion(options) {
  const { seed, round, answers, dimensions, challengeAgents = [], track = 'project' } = options;

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  // ANTHROPIC_AUTH_TOKEN is available in Claude Code runtime (OAuth session token)
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.ANTHROPIC_AUTH_TOKEN ||
    null;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY (or CLAUDE_API_KEY or ANTHROPIC_AUTH_TOKEN) is not set.\n' +
      '  Set it: export ANTHROPIC_API_KEY=sk-ant-...\n' +
      '  Or run inside Claude Code which provides ANTHROPIC_AUTH_TOKEN automatically.'
    );
  }

  const client = new Anthropic({ apiKey });
  const system = questionSystemPrompt(track);
  const user = buildQuestionPrompt({ seed, round, answers, dimensions, challengeAgents, track });

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

  const raw = getTextContent(result);
  // Strip markdown code fences — model may wrap JSON in ```json ... ```
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    // Validate required fields are present and well-formed
    const valid = validDimensions(track);
    const hasQuestion = typeof parsed.question === 'string' && parsed.question.trim().length > 0;
    const hasOptions = Array.isArray(parsed.options) && parsed.options.length > 0;

    // If parsed JSON but critical fields missing, treat as parse failure
    if (!hasQuestion || !hasOptions) {
      throw new Error('missing required fields');
    }

    if (parsed.dimension && !valid.includes(parsed.dimension)) {
      parsed.dimension = valid[0]; // fallback to first dimension
    }
    return parsed;
  } catch {
    return {
      question: cleaned || 'What specific outcome do you most want to achieve?',
      dimension: validDimensions(track)[0],
      phase: 'phase-1',
      reasoning: '(parse error — used raw output)',
      whyContext: 'We need more context to proceed with the assessment.',
      options: [
        { label: 'My answer (describe)', description: 'Free-text answer' },
        { label: "I don't know / skip", description: 'Skip this question' },
      ],
      challengeAgent: null,
    };
  }
}

/**
 * Build the CONTRARIAN challenge prompt.
 * @param {string} seed
 * @param {Array} answers
 * @returns {string}
 */
export function contrarianPrompt(seed, answers) {
  return `You are the CONTRARIAN challenge agent. Find hidden flaws and assumptions.
ASK: One hard question that exposes a gap. "What if the assumption is wrong?"

Seed: ${seed}
${answers.length} prior rounds.`;
}

/**
 * Build the SIMPLIFIER challenge prompt.
 * @param {string} seed
 * @param {Array} answers
 * @returns {string}
 */
export function simplifierPrompt(seed, answers) {
  return `You are the SIMPLIFIER challenge agent. Cut through complexity to find the simplest version.
ASK: One question that strips away everything non-essential.

Seed: ${seed}
${answers.length} prior rounds.`;
}

/**
 * Build the ONTOLOGIST challenge prompt.
 * @param {string} seed
 * @param {Array} answers
 * @returns {string}
 */
export function ontologistPrompt(seed, answers) {
  return `You are the ONTOLOGIST challenge agent. Extract named entities and relationships.
ASK: One question that forces naming of core nouns and the verbs between them.

Seed: ${seed}
${answers.length} prior rounds.`;
}

/**
 * Choose the challenge agent prompt based on name.
 * @param {'contrarian'|'simplifier'|'ontologist'} agent
 * @param {string} seed
 * @param {Array} answers
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
