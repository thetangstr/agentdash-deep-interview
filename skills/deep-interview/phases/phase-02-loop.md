## Phase 2: Interview Loop

**Prerequisite:** STEP 7 confirmation gate passed — user confirmed all intake values.

### Track A: Company-Level (Strategic)

**Persona:** Senior AI adoption advisor — direct, pattern-matches across enterprise agent deployments, pushes back on framing, surfaces what's actually blocking the org.

**Six Forcing Questions (office-hours discipline, adapted for AI adoption):**

1. **Premise challenge:** "Is the framing correct, or is the CTO describing a symptom not the problem?"
2. **Constraint pressure:** "Are the stated constraints real, or are they habits masquerading as requirements?"
3. **Simplification probe:** "What's the minimum viable version of this adoption?"
4. **Peer pattern match:** "What have similar-stage companies in their sector actually tried? What blocked them?"
5. **Reversal test:** "What if the opposite approach were correct?"
6. **Ownership stress:** "Who owns the outcome? If the agent fails, whose fault is it?"

**Company-Level Dimensions:**

| Dimension | Weight | What it measures |
|---|---|---|
| **strategy** | 30% | Is the AI adoption strategy concrete? Named priorities, tier targets, org structure? |
| **readiness** | 25% | Org maturity: AI fluency, data quality, integration complexity, executive sponsorship |
| **portfolio** | 20% | Has the company named specific agent projects? Prioritized? Sized? |
| **risk** | 15% | Error tolerance, regulatory load, change management, audit requirements |
| **fit** | 10% | Timeline, budget envelope, DRI, stakeholder alignment |

**Ambiguity formula:**
```
ambiguity = 1 - (strategy × 0.30 + readiness × 0.25 + portfolio × 0.20 + risk × 0.15 + fit × 0.10)
```

**Diana Hu Operating Model lenses** (inject at rounds 2, 4, 6, 8+):
- "Who is the DRI for AI adoption? How is AI governance structured?"
- "How does AI work get funded — CAPEX, OPEX, or project budgets?"
- "What's the current AI team headcount vs. ambition?"
- "How does the org measure AI success today?"

**Layer Inflection Exposure** (Seven-Layer Stack):
Probe which layer the org is trying to transform and whether they're skipping layers. If CTO describes only L4/L5 without naming L1/L2: probe the missing foundation layers.

---

### Track B: Project-Level (Tactical)

**Persona:** Neutral requirements clarifier — systematic, exposes hidden assumptions, measures across five dimensions.

**Project-Level Dimensions:**

| Dimension | Weight | What it measures |
|---|---|---|
| **specificity** | 30% | Is the primary opportunity concrete? Named workflow, specific inputs/outputs? |
| **systems** | 25% | Are the systems and data the agent must touch named? Integration points, data quality known? |
| **success** | 20% | How will the customer know it worked? Named metric, baseline, target? |
| **risk** | 15% | Error tolerance, regulatory load, approval cadence, audit. What happens when the agent is wrong? |
| **fit** | 10% | Timeline, budget envelope, DRI, stakeholder buy-in |

**Ambiguity formula:**
```
ambiguity = 1 - (specificity × 0.30 + systems × 0.25 + success × 0.20 + risk × 0.15 + fit × 0.10)
```

---

### Round Loop

For round = 1 to maxRounds:

**Step A: Generate question**

Run via Bash:
```
deep-interview ask --round [round] --session-id [sessionId] 2>&1
```

Parse the JSON output. Extract: `question`, `dimension`, `track`, `reasoning`, `whyContext`, `options`, `challengeAgent`, `ambiguity`.

**Step B: Ask the question**

Display (substitute actual parsed values from JSON):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUND [round from JSON] / [maxRounds from JSON] — [dimension from JSON] / [track from JSON]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[If challengeAgent is set: `[Challenge agent: ${challengeAgent}]`]
Why we're asking: [whyContext from JSON]
Current ambiguity: [ambiguity from JSON]

[question from JSON]

AskUserQuestion
  question: "[question from JSON]"
  header: "Round [round] — [dimension]"
  options: [from JSON options array — include all choices verbatim. Ensure "My answer (describe)" is present as an option if not already in the list]
  multiSelect: false

**Step C: Handle answer**

If user answers:
Run via Bash:
```
deep-interview score --round [round] --session-id [sessionId] --threshold 0.2 2>&1
```
Parse: `ambiguity`, `verdict`, `rationale`, `concerns`.

Display:
```
Round [round] result:
  dimension scores:
    [dimension]: X.XX (XX%)  ████████░░
    ...
  ambiguity:  X.XXXX
  threshold:  X.XXXX
  verdict:    ✅ GO | ⚠️ CONDITIONAL | ❌ NO-GO
  [concerns ? 'concerns: ' + concerns.join(', ') : '']
```

If skip: proceed without scoring.

If exit early:
AskUserQuestion
  question: "Exit early? The assessment will be crystallised from what we have so far, even if ambiguity is above threshold."
  options:
    - label: "Yes — exit and crystallise"
    - label: "No — continue the interview"
  multiSelect: false
If yes: jump to Phase 5.

**Step D: Check exit conditions**

- GO: ambiguity ≤ 0.2 AND all dimensions ≥ 0.5 → proceed to Phase 3
- CONDITIONAL: ambiguity ≤ 0.35 OR one dimension at 0.4–0.5 → continue with warning
- NO-GO and round < 10 → continue
- NO-GO and round ≥ 10 → offer continue or exit

**Round 10 soft warning if NO-GO:**
AskUserQuestion
  question: "Round 10 and ambiguity is still [X.XXX] — above the 0.2 threshold. The interview can continue, but you may be hitting diminishing returns."
  options:
    - label: "Continue — keep going"
    - label: "Stop here — crystallise what we have"
  multiSelect: false

---

## Phase 3: Ambiguity Threshold Met

**Trigger:** ambiguity ≤ 0.2 AND all dimensions ≥ 0.5

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AMBIGUITY THRESHOLD MET ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All dimensions scored above minimum.
Ambiguity: [X.XXX] ≤ 0.200
Ready for assessment crystallisation.

---

## Phase 4: Challenge Agents (shared, both tracks)

| Round | Agent | Role |
|---|---|---|
| 4+ | CONTRARIAN | Devil's advocate — find hidden flaws and assumptions |
| 6+ | SIMPLIFIER | Cut to essentials — minimum viable version |
| 8+ | ONTOLOGIST | Name entities and relationships |
