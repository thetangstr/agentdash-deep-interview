/**
 * score.js — Ambiguity scoring via direct Claude API calls.
 *
 * Calls the Anthropic API (claude-opus-4-7 or claude-sonnet-4-6 fallback)
 * with a structured scoring prompt to rate each dimension
 * (specificity, systems, success, risk, fit) on a 0–1 scale,
 * then computes the composite ambiguity score.
 */

import Anthropic from '@anthropic-ai/sdk';

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey =
      process.env.ANTHROPIC_API_KEY ||
      process.env.CLAUDE_API_KEY ||
      null;
    if (!apiKey) {
      throw new Error(
        'deep-interview: ANTHROPIC_API_KEY (or CLAUDE_API_KEY) is not set.\n' +
        '  Set it in your environment:  export ANTHROPIC_API_KEY=sk-ant-...'
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

// Model preference: prefer opus, fall back to sonnet
const SCORING_MODEL = 'claude-opus-4-7';
const SCORING_MODEL_FALLBACK = 'claude-sonnet-4-6';

/**
 * Build the system prompt for the scoring agent.
 * Uses the consultant framework from the knowledge base.
 */
function scoringSystemPrompt() {
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
- Dimensions are independent — do not normalise to sum to 1.0.
- Ground scores in specific evidence from the interview transcript.
- The seed idea alone scores very low; answers build up the score.

OUTPUT FORMAT:
Return a JSON object with this exact shape:
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

Respond ONLY with the JSON object. No markdown code fences, no extra text.`;
}

/**
 * Score a round's transcript using the Claude API.
 *
 * @param {object} options
 * @param {string} options.seed       - The original seed idea
 * @param {Array}  options.answers    - Array of { round, question, answer, dimension }
 * @param {object} [options.priorDimensions] - Previous round's scores (if any)
 * @param {number} [options.round]    - Current round number
 * @returns {Promise<object>} the scoring result
 */
export async function scoreRound({ seed, answers, priorDimensions = {}, round = 0 }) {
  const client = getClient();

  // Build the transcript string for context
  const transcriptLines = answers.map(a =>
    `Round ${a.round}: Q: ${a.question}\nA: ${a.answer}`
  );
  const transcript = transcriptLines.join('\n\n');

  const systemPrompt = scoringSystemPrompt();
  const userPrompt = `SEED IDEA: ${seed}

INTERVIEW TRANSCRIPT (${answers.length} round${answers.length !== 1 ? 's' : ''}):
${transcript}

${answers.length === 0 ? 'No answers recorded yet — score based on seed idea only.' : ''}

Round: ${round}`;

  // Try opus first, fall back to sonnet
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

  const raw = result.content[0]?.text || result.content?.[0?.text] || '';
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to regex extraction if JSON is malformed
    const scores = {};
    const dimNames = ['specificity', 'systems', 'success', 'risk', 'fit', 'ambiguity'];
    for (const dim of dimNames) {
      const m = cleaned.match(new RegExp(`"${dim}"\\s*:\\s*([\\d.]+)`, 'i'));
      scores[dim] = m ? parseFloat(m[1]) : 0;
    }
    return {
      ...scores,
      specificity: scores.specificity ?? 0,
      systems: scores.systems ?? 0,
      success: scores.success ?? 0,
      risk: scores.risk ?? 0,
      fit: scores.fit ?? 0,
      ambiguity: scores.ambiguity ?? 1.0,
      rationale: '(parse error — scores estimated from raw output)',
      concerns: [],
      verdict: 'NO-GO',
    };
  }
}

/**
 * Compute the composite ambiguity score from individual dimension scores.
 * @param {{ specificity: number, systems: number, success: number, risk: number, fit: number }} dims
 * @returns {number}
 */
export function computeAmbiguity(dims) {
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
 *
 * Challenge agents:
 *   Round 4+  → Contrarian
 *   Round 6+  → Simplifier
 *   Round 8+  → Ontologist
 *
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
 * @returns {'GO'|'CONDITIONAL'|'NO-GO'}
 */
export function getVerdict(dims, threshold = 0.2) {
  const ambiguity = computeAmbiguity(dims);
  const allDimensionsMeetMinimum = Object.values(dims).every(v => (v ?? 0) >= 0.5);

  if (ambiguity <= threshold && allDimensionsMeetMinimum) return 'GO';
  if (ambiguity <= 0.35) return 'CONDITIONAL';
  return 'NO-GO';
}