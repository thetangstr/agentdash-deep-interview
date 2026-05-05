/**
 * score.js — Ambiguity scoring via direct Claude API calls.
 *
 * Supports two tracks:
 *   - project: specificity/systems/success/risk/fit (tactical)
 *   - company: strategy/readiness/portfolio/risk/fit (strategic)
 */

import Anthropic from '@anthropic-ai/sdk';

let _client = null;

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

function getClient() {
  if (!_client) {
    // ANTHROPIC_AUTH_TOKEN is available in Claude Code runtime (OAuth session token)
    const apiKey =
      process.env.ANTHROPIC_API_KEY ||
      process.env.CLAUDE_API_KEY ||
      process.env.ANTHROPIC_AUTH_TOKEN ||
      null;
    if (!apiKey) {
      throw new Error(
        'deep-interview: ANTHROPIC_API_KEY (or CLAUDE_API_KEY or ANTHROPIC_AUTH_TOKEN) is not set.\n' +
        '  Set it in your environment:  export ANTHROPIC_API_KEY=sk-ant-...\n' +
        '  Or run inside Claude Code which provides ANTHROPIC_AUTH_TOKEN automatically.'
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

const SCORING_MODEL = 'claude-opus-4-7';
const SCORING_MODEL_FALLBACK = 'claude-sonnet-4-6';

/**
 * Build the scoring system prompt based on track.
 */
function scoringSystemPrompt(track = 'project') {
  if (track === 'company') {
    return companyScoringPrompt();
  }
  return projectScoringPrompt();
}

function projectScoringPrompt() {
  return `You are a Senior Strategy Consultant at AgentDash Consulting — a
forward-deployed strategy consultant specialising in agentic workflow design.

SCORING CONTEXT:
You receive a transcript of a Socratic interview (seed idea + Q&A rounds).
Your job is to score five dimensions of the interview on a 0.0–1.0 scale.

FIVE DIMENSIONS AND THEIR MEANING:

1. SPECIFICITY (weight 30%)
   - Is the customer's primary opportunity concrete? Specific function, workflow, input/output?
   - Score 1.0 = named workflow, specific inputs/outputs, concrete use case
   - Score 0.0 = vague intent, no named workflow, pure abstraction

2. SYSTEMS (weight 25%)
   - Are the systems and data the agent must touch named?
   - Integrations, MCP-readiness, data quality known?
   - Score 1.0 = named systems, known integration points, understood data quality
   - Score 0.0 = no systems named, integration unknown, no data quality signal

3. SUCCESS (weight 20%)
   - How will the customer know the agent works?
   - Specific metric, baseline, target?
   - Score 1.0 = named metric, measurable baseline, specific target
   - Score 0.0 = no metric, "success is when it works" language

4. RISK (weight 15%)
   - Error tolerance, regulatory load, approval cadence, audit needs.
   - What happens when the agent is wrong?
   - Score 1.0 = error tolerance named, approval cadence clear, audit path defined
   - Score 0.0 = no risk discussion, assume zero-failure operation

5. FIT (weight 10%)
   - Pilot fit: timeline, budget envelope, DRI, skunk-works candidate.
   - Score 1.0 = named DRI, budget range, timeline constraint, stakeholder buy-in
   - Score 0.0 = no timeline, no budget, no owner, exploratory only

AMBIGUITY FORMULA:
ambiguity = 1 - (specificity × 0.30 + systems × 0.25 + success × 0.20 + risk × 0.15 + fit × 0.10)

SCORING RULES:
- Be conservative. Ambiguity > 0.2 is not ready for execution.
- If any dimension is below 0.5, flag it prominently.
- Ground scores in specific evidence from the interview transcript.

OUTPUT FORMAT — return ONLY a JSON object:
{
  "specificity": <float 0.0–1.0>,
  "systems":     <float 0.0–1.0>,
  "success":     <float 0.0–1.0>,
  "risk":        <float 0.0–1.0>,
  "fit":         <float 0.0–1.0>,
  "ambiguity":   <float 0.0–1.0>,
  "rationale":  "<2-3 sentence explanation of overall score>",
  "concerns":    ["<specific dimension or gap>", ...],
  "verdict":     "GO | CONDITIONAL | NO-GO"
}

verdict: GO if ambiguity ≤ 0.2 and all dimensions ≥ 0.5.
verdict: CONDITIONAL if ambiguity ≤ 0.35 or one dimension 0.4–0.5.
verdict: NO-GO otherwise.

Respond ONLY with the JSON object. No markdown, no extra text.`;
}

function companyScoringPrompt() {
  return `You are a Senior Strategy Consultant at AgentDash Consulting — a
forward-deployed strategy consultant specialising in AI adoption readiness assessments.

SCORING CONTEXT:
You receive a transcript of a company-level strategic assessment interview with a CTO or
leadership team. Your job is to score five dimensions of the interview on a 0.0–1.0 scale.

FIVE DIMENSIONS AND THEIR MEANING:

1. STRATEGY (weight 30%)
   - Is the AI adoption strategy concrete? Named priorities, tier targets, org structure?
   - Score 1.0 = named tier targets, specific priorities, DRI ownership, governance structure
   - Score 0.0 = vague "we want to do AI", no named priorities, no org structure

2. READINESS (weight 25%)
   - Org maturity: AI fluency, data quality, integration complexity, executive sponsorship?
   - Score 1.0 = named data quality level, known AI fluency gaps, integration complexity assessed
   - Score 0.0 = no assessment of current state, "we'll figure it out" language

3. PORTFOLIO (weight 20%)
   - Has the company named specific agent projects? Prioritized? Sized?
   - Score 1.0 = named projects with sizing, prioritisation, pilot scope defined
   - Score 0.0 = "we want to adopt AI broadly", no specific projects named

4. RISK (weight 15%)
   - Error tolerance, regulatory load, change management, audit requirements.
   - What happens when an AI initiative fails or produces wrong output?
   - Score 1.0 = change management plan, named regulatory concerns, error handling defined
   - Score 0.0 = no risk discussion, assume smooth adoption

5. FIT (weight 10%)
   - Timeline, budget envelope, DRI, stakeholder alignment.
   - Score 1.0 = named budget range, timeline constraint, DRI, executive sponsor
   - Score 0.0 = no timeline, no budget, no owner, exploratory only

AMBIGUITY FORMULA:
ambiguity = 1 - (strategy × 0.30 + readiness × 0.25 + portfolio × 0.20 + risk × 0.15 + fit × 0.10)

SCORING RULES:
- Be conservative. Ambiguity > 0.2 means the company is not ready for execution.
- If any dimension is below 0.5, flag it prominently.
- Ground scores in specific evidence from the interview transcript.

OUTPUT FORMAT — return ONLY a JSON object:
{
  "strategy":  <float 0.0–1.0>,
  "readiness": <float 0.0–1.0>,
  "portfolio": <float 0.0–1.0>,
  "risk":      <float 0.0–1.0>,
  "fit":       <float 0.0–1.0>,
  "ambiguity": <float 0.0–1.0>,
  "rationale": "<2-3 sentence explanation of overall score>",
  "concerns":  ["<specific dimension or gap>", ...],
  "verdict":   "GO | CONDITIONAL | NO-GO"
}

verdict: GO if ambiguity ≤ 0.2 and all dimensions ≥ 0.5.
verdict: CONDITIONAL if ambiguity ≤ 0.35 or one dimension 0.4–0.5.
verdict: NO-GO otherwise.

Respond ONLY with the JSON object. No markdown, no extra text.`;
}

/**
 * Score a round's transcript using the Claude API.
 *
 * @param {object} options
 * @param {string} options.seed
 * @param {Array}  options.answers
 * @param {object} [options.priorDimensions]
 * @param {number} [options.round]
 * @param {string} [options.track='project'] - 'company' | 'project'
 * @returns {Promise<object>} the scoring result
 */
export async function scoreRound({ seed, answers, priorDimensions = {}, round = 0, track = 'project' }) {
  const client = getClient();

  const transcriptLines = answers.map(a =>
    `Round ${a.round}: Q: ${a.question}\nA: ${a.answer}`
  );
  const transcript = transcriptLines.join('\n\n');

  const systemPrompt = scoringSystemPrompt(track);
  const userPrompt = `SEED IDEA: ${seed}

INTERVIEW TRANSCRIPT (${answers.length} round${answers.length !== 1 ? 's' : ''}):
${transcript}

${answers.length === 0 ? 'No answers recorded yet — score based on seed idea only.' : ''}

Round: ${round}
Track: ${track.toUpperCase()}`;

  let result;
  try {
    result = await client.messages.create({
      model: SCORING_MODEL,
      max_tokens: 4096,
      temperature: 0.1,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
  } catch (err) {
    if (err?.status === 404 || err?.status === 400) {
      result = await client.messages.create({
        model: SCORING_MODEL_FALLBACK,
        max_tokens: 4096,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
    } else {
      throw err;
    }
  }

  const raw = getTextContent(result);
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to regex extraction
    const scores = {};
    const projectDims = ['specificity', 'systems', 'success', 'risk', 'fit', 'ambiguity'];
    const companyDims = ['strategy', 'readiness', 'portfolio', 'risk', 'fit', 'ambiguity'];
    const dimNames = track === 'company' ? companyDims : projectDims;

    for (const dim of dimNames) {
      const m = cleaned.match(new RegExp(`"${dim}"\\s*:\\s*([\\d.]+)`, 'i'));
      scores[dim] = m ? parseFloat(m[1]) : 0;
    }
    return {
      ...scores,
      ambiguity: scores.ambiguity ?? 1.0,
      rationale: '(parse error — scores estimated from raw output)',
      concerns: [],
      verdict: 'NO-GO',
    };
  }
}

/**
 * Compute the composite ambiguity score from individual dimension scores.
 * @param {object} dims
 * @param {string} [track='project']
 * @returns {number}
 */
export function computeAmbiguity(dims, track = 'project') {
  if (track === 'company') {
    return Math.max(0, Math.min(1,
      1 - (
        (dims.strategy ?? 0) * 0.30 +
        (dims.readiness ?? 0) * 0.25 +
        (dims.portfolio ?? 0) * 0.20 +
        (dims.risk ?? 0) * 0.15 +
        (dims.fit ?? 0) * 0.10
      )
    ));
  }
  return Math.max(0, Math.min(1,
    1 - (
      (dims.specificity ?? 0) * 0.30 +
      (dims.systems ?? 0) * 0.25 +
      (dims.success ?? 0) * 0.20 +
      (dims.risk ?? 0) * 0.15 +
      (dims.fit ?? 0) * 0.10
    )
  ));
}

/**
 * Determine which challenge agents should fire at a given round.
 * @param {number} round
 * @returns {string[]}
 */
export function getChallengeAgents(round) {
  const agents = [];
  if (round >= 4) agents.push('contrarian');
  if (round >= 6) agents.push('simplifier');
  if (round >= 8) agents.push('ontologist');
  return agents;
}

/**
 * Check GO/CONDITIONAL/NO-GO verdict from dimension scores.
 * @param {object} dims
 * @param {number} threshold - ambiguity threshold (default 0.2)
 * @param {string} [track='project']
 * @returns {'GO'|'CONDITIONAL'|'NO-GO'}
 */
export function getVerdict(dims, threshold = 0.2, track = 'project') {
  const ambiguity = computeAmbiguity(dims, track);
  const allDimensionsMeetMinimum = Object.values(dims).every(v => (v ?? 0) >= 0.5);

  if (ambiguity <= threshold && allDimensionsMeetMinimum) return 'GO';
  if (ambiguity <= 0.35) return 'CONDITIONAL';
  return 'NO-GO';
}
