---
name: deep-interview
description: Dual-track Socratic deep-interview for AI adoption — company-level (strategic) and project-level (tactical) assessment with mathematical ambiguity gating
level: 3
---

<Purpose>
Run a Socratic deep-interview to assess AI adoption readiness. Supports two tracks:
- **Company-level (strategic):** Assess a CTO's or leadership team's AI adoption maturity, portfolio readiness, and operating model — delivered as a portfolio scan with tier recommendation
- **Project-level (tactical):** Crystallise requirements for a specific agentic workflow project before execution — delivered as a project charter with pilot scope

The interview uses weighted assessment dimensions and a mathematical ambiguity gate (threshold 0.2) to determine when assessment is complete. Output feeds into a 3-stage pipeline: **deep-interview → ralplan (consensus refinement) → autopilot (execution)**
</Purpose>

<Use_When>
- User says "deep-interview", "/deep-interview", "assess my company", "assess this project", "AI readiness", "help me understand our AI maturity"
- User is a CTO or leadership team member wanting to understand their AI adoption readiness
- User has a vague project idea for an AI agent and wants structured requirements gathering
- User says "garry tan", "advisor", "interview founders", "CTO assessment"
</Use_When>

<Do_Not_Use_When>
- User already has a detailed PRD, assessment report, or plan file — use a planning skill directly
- User wants competitive intelligence or market research — use AgentDash Research (washington-smoky.vercel.app) first
- User wants to execute something — this skill only does assessment/requirements crystallisation
- User is asking a single one-off question — answer it directly without invoking this skill
</Do_Not_Use_When>

<Why_This_Exists>
Most AI adoption failures don't stem from technology — they stem from unclear strategy: nobody defined what "AI maturity" means for their org, nobody named which workflows are actually viable for agents, nobody established pilot criteria or rollback triggers. This skill applies Socratic methodology (refined through gstack's office-hours discipline: 6 forcing questions, CEO review modes) with mathematical clarity gates before any execution begins.

Company-level assessments surface the gap between ambition and operational readiness. Project-level assessments prevent building the wrong agent for the wrong workflow.
</Why_This_Exists>

<Execution_Policy>
- Phase 1: Detect track (company vs project) from `{{ARGUMENTS}}` or ask upfront
- Phase 2: Initialise session via `deep-interview init --seed "..." --depth [depth] --track [company|project]`
- Phase 3: Loop — generate question, ask via AskUserQuestion, record answer, score via CLI
- Phase 4: After each round, check ambiguity score and dimension scores
- Phase 5: Exit when ambiguity ≤ 0.2 AND all dimensions ≥ 0.5 (GO verdict), or round cap reached
- Phase 6: Crystallise assessment via `deep-interview crystal`
- The interview loop is INTERACTIVE — use AskUserQuestion for every user-facing question
- The CLI is the STATE MACHINE — do not manage state manually; always read/write via the CLI
- Do NOT use `Skill()` invocations — this is a standalone skill with no sub-skills
</Execution_Policy>

<Steps>

## Phase 1: Track Detection + Intake

### Step 1: Detect or ask the assessment track

Extract from `{{ARGUMENTS}}` if the user specified it. Look for keywords:

- **Company-level** signals: "company", "CTO", "enterprise", "org", "team", "adoption", "strategy", "maturity", "portfolio", "Diana Hu"
- **Project-level** signals: "project", "build", "agent", "workflow", "automate", "implement", "tool"

If ambiguous or not specified, ask:

**Self-check before asking:**
- [ ] Both options clearly described with time/effort
- [ ] multiSelect: false

AskUserQuestion
  question: "What kind of assessment are we doing?\n\n**Company-level (strategic):** For CTOs and leadership teams. Assess AI adoption maturity, operating model readiness, and portfolio of potential agent projects. Output: a portfolio scan with tier recommendation and strategic roadmap. ~45 min.\n\n**Project-level (tactical):** For specific agentic workflow ideas. Clarify requirements for one named project before execution. Output: a project charter with pilot scope and success metrics. ~30 min."
  header: "Assessment Track"
  options:
    - label: "Company-level (strategic)"
      description: "AI adoption maturity, operating model, portfolio scan. For CTOs and leadership."
    - label: "Project-level (tactical)"
      description: "Specific agent project requirements. For teams building their first or next agent."
  multiSelect: false

Record the selected track as `assessment_track`.

### Step 2: Collect seed

If `{{ARGUMENTS}}` includes a seed, use it. Otherwise ask:

AskUserQuestion
  question: "**[Company-level]** What's the company, who are we assessing, and what is the primary AI adoption question?\n\n**[Project-level]** Describe the project or idea you want to assess. One or two sentences is fine — we are here to sharpen it."
  header: "Seed"
  options:
    - label: "I don't know / need help articulating"
      description: "We'll explore it together in the interview"
  multiSelect: false

Record the free-text description as `seed`. If "I don't know" is selected, use the placeholder "AI adoption assessment".

### Step 2b: Collect depth

Then ask about interview depth:

AskUserQuestion
  question: "How thorough should we be?"
  header: "Interview Depth"
  options:
    - label: "Quick (5 rounds)"
      description: "Fast clarity for early-stage ideas. 15–20 min."
    - label: "Standard (20 rounds, default)"
      description: "Full Socratic interview. Thorough enough for most assessments. 30–45 min."
    - label: "Deep (40 rounds)"
      description: "Maximum thoroughness for complex, multi-system, or high-stakes assessments. 60–90 min."
  multiSelect: false

Record the selected depth label (quick | standard | deep). Default to "standard".

### Step 3: Round 0 — Collect company/project context

Before running `deep-interview init`, collect basic intake information in Round 0.

**Company-level — ask for company name and website:**

AskUserQuestion
  question: "**[Company-level]** What is the company's name and website?\n\nPlease provide the company name and URL (e.g. \"Acme Corp — acme.com\")."
  header: "Round 0 — Company"
  options:
    - label: "Not available"
      description: "I don't have this information right now"
  multiSelect: false

Record the free-text answer as `company_name` and `company_website`. If "Not available" is selected, use placeholders ("Acme Corp" / "acme.com").

**Project-level — ask for project context:**

AskUserQuestion
  question: "**[Project-level]** What is the project name, the company or team running it, and the primary goal in one sentence?\n\nExample: \"Customer support AI agent for Acme Corp — automatically triage and respond to support tickets.\""
  header: "Round 0 — Project"
  options:
    - label: "Not available"
      description: "I don't have this information right now"
  multiSelect: false

Record the answer as `project_context`. If "Not available" is selected, use a placeholder.

### Step 4: Initialise state via CLI

Run via Bash:
```
deep-interview init --seed "[seed]" --depth [depth] --track [assessment_track] 2>&1
```

If `deep-interview` is not found, display installation instructions:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
deep-interview CLI NOT FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Install from git:

git clone https://github.com/thetangstr/agentdash-deep-interview.git
cd agentdash-deep-interview
pnpm install
pnpm link --global
```

AskUserQuestion
  question: "Has the deep-interview CLI been installed? Try running: deep-interview status"
  header: "CLI Install"
  options:
    - label: "Yes — continue"
    - label: "No — show me how"
    - label: "Exit"
  multiSelect: false

If CLI is ready, run init. Parse the session ID.

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERVIEW INITIALISED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  track:     [company | project]
  seed:      [first 80 chars of seed]...
  depth:     [depth] ([maxRounds] rounds max)
  session:   [sessionId]
  state:     ~/.agentic-readiness/state/[sessionId].json
  spec out:  ./specs/deep-interview-[slug].md

Proceed to Phase 2.
```

---

## Phase 2: Interview Loop

**Prerequisite:** Phase 1 complete with sessionId confirmed.

Two distinct question tracks — the CLI generates questions appropriate to the track. Both tracks share the same round loop, ambiguity scoring, and challenge agents.

### Track A: Company-Level (Strategic)

**Persona:** Garry Tan-style advisor — direct, pattern-matches across 25+ agent-factory deployments, pushes back on framing, surfaces what's actually blocking the org.

**Six Forcing Questions (gstack office-hours discipline, adapted for AI adoption):**

Before each round, the question generator applies these lenses to the weakest dimension:

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

**Diana Hu Operating Model lenses** (inject into questions at appropriate rounds):
- "Who is the DRI for AI adoption? How is AI governance structured?"
- "How does AI work get funded — CAPEX, OPEX, or project budgets?"
- "What's the current AI team headcount vs. ambition?"
- "How does the org measure AI success today?"

**Layer Inflection Exposure** (from Seven-Layer Stack):
Probe which layer the org is trying to transform and whether they're skipping layers:
- "You've described wanting to go straight to L5 evaluation. But you haven't named your L2 connectors yet — how will the agent actually get data?"
- "You said 'we need an agent that reads Salesforce.' Which layer is that — L2 integration or L4 domain logic?"

### Track B: Project-Level (Tactical)

**Persona:** Neutral requirements clarifier — systematic, exposes hidden assumptions, measures across five dimensions.

**Project-Level Dimensions:**

| Dimension | Weight | What it measures |
|---|---|---|
| **specificity** | 30% | Is the primary opportunity concrete? Named workflow, specific inputs/outputs? |
| **systems** | 25% | Are the systems and data the agent must touch named? Integration points, data quality known? |
| **success** | 20% | How will the customer know it worked? Named metric, baseline, target? |
| **risk** | 15% | Error tolerance, regulatory load, approval cadence, audit needs. What happens when the agent is wrong? |
| **fit** | 10% | Timeline, budget envelope, DRI, stakeholder buy-in. |

**Ambiguity formula:**
```
ambiguity = 1 - (specificity × 0.30 + systems × 0.25 + success × 0.20 + risk × 0.15 + fit × 0.10)
```

### Round Loop

For round = 1 to maxRounds:

**Step A: Generate question**

Run via Bash:
```
deep-interview ask --round [round] --session-id [sessionId] 2>&1
```

Parse the JSON output. Extract:
- `question` — the question to ask
- `dimension` — which dimension this probes
- `track` — company or project
- `challengeAgent` — which challenge agent fired (if any)
- `ambiguity` — current ambiguity score

**Step B: Ask the question**

Run via Bash to get the JSON output:
```
deep-interview ask --round [round] --session-id [sessionId] 2>&1
```

Parse the JSON output. Extract:
- `question` — the question to ask
- `dimension` — which dimension this probes
- `track` — company or project
- `reasoning` — why this question was generated
- `whyContext` — why we are asking this NOW (the weakest dimension gap this targets)
- `options` — array of contextually specific choices from the model, each with `label` and `description`
- `challengeAgent` — which challenge agent fired (if any)
- `ambiguity` — current ambiguity score

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUND [round] / [maxRounds] — [dimension] / [track]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${challengeAgent ? `[Challenge agent: ${challengeAgent}]` : ''}
Why we're asking: [whyContext]
Current ambiguity: [ambiguity]

[question]

AskUserQuestion
  question: "[question]"
  header: "Round [round] — [dimension]"
  options: [from JSON options array — include all choices verbatim. Ensure "My answer (describe)" is present as an option if not already in the list]
  multiSelect: false

**Step C: Handle answer**

**If user answers:**
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
    ${concerns ? 'concerns: ' + concerns.join(', ') : ''}
  ```

**If skip:** Proceed without scoring.

**If exit early:**
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
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AMBIGUITY THRESHOLD MET ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All dimensions scored above minimum.
Ambiguity: [X.XXX] ≤ 0.200
Ready for assessment crystallisation.
```

---

## Phase 4: Challenge Agents (shared, both tracks)

Challenge agents activate at round thresholds to shift questioning perspective:

| Round | Agent | Role |
|---|---|---|
| 4+ | CONTRARIAN | Devil's advocate — "What if the opposite were true?" or "What if this constraint doesn't actually exist?" |
| 6+ | SIMPLIFIER | Cut to essentials — "What's the simplest version that would still prove value?" |
| 8+ | ONTOLOGIST | Name the core — "What IS the real blocker here — tech, people, or politics?" |

Incorporate the challenge agent lens into the question, but ask only ONE question per round.

---

## Phase 5: Assessment Crystallisation

### Step 1: Run the crystal command

```
deep-interview crystal --session-id [sessionId] --output-dir ./specs 2>&1
```

### Step 2: Read and present the assessment

Read: `{output-dir}/deep-interview-{slug}.md`

Display the first 80 lines as a preview.

**Company-level output** (strategic):
```
# AI Adoption Readiness: {Company Name}

## Executive Summary
## AI Maturity Score (1-5)
## Tier Recommendation (Tier 1-5)
## Portfolio Scan — Named Agent Projects
## Layer Inflection Exposure
## Org Readiness Breakdown
## Key Blockers Identified
## Strategic Roadmap (Phase 1-3)
## Recommended Next Steps
```

**Project-level output** (tactical):
```
# Project Charter: {Project Name}

## Project Brief
## Go/No-Go Decision
## Business Case
## Agent Architecture (Tier, org chart, buy/build per layer)
## Closed-Loop Architecture
## Success Metrics
## Team / RACI
## Build List
## Phased Rollout (Week 1-6)
## Risk Register
```

Then ask:

AskUserQuestion
  question: "The assessment has been generated. What would you like to do with it?"
  header: "Assessment Ready"
  options:
    - label: "Save and close"
      description: "Assessment is saved — you are done."
    - label: "Refine one section"
      description: "Point to a section that needs more clarity — we will probe further."
    - label: "Export as JSON"
      description: "Dump the structured data as JSON."
  multiSelect: false

**If "Refine one section":**
AskUserQuestion
  question: "Which section needs more clarity? Point to it or describe what is missing."
  options:
    - label: "Continue"
  multiSelect: false
Record as a new round. Run `deep-interview ask --round [next]` for up to 3 additional rounds, then re-crystallise.

---

## Phase 6: Session Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ASSESSMENT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  track:     [company | project]
  session:   [sessionId]
  rounds:    [N]
  ambiguity: [X.XXX]
  verdict:   [GO | CONDITIONAL | NO-GO]
  exit:      [threshold-met | round-cap | early-exit]
  output:    ./specs/deep-interview-[slug].md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</Steps>

<Tool_Usage>
- Use `Bash` with `deep-interview init`, `deep-interview ask`, `deep-interview score`, `deep-interview crystal` for all state management
- Use `AskUserQuestion` for all user-facing questions (Claude Code native — no OMC/OMX dependency)
- Use `Read` to load the crystallised assessment after crystallisation
- Use `Write` only if you need to manually save (normally the CLI handles this)
</Tool_Usage>

<Consultant_Framing>
When framing the interview, use these principles from the AgentDash consulting knowledge base and gstack methodology:

**The IT-Layer Trap:**
- Never accept "organise SharePoint", "build a RAG chatbot", or "adopt AI" as the goal
- Probe until you have the business metric and dollar figure
- Translate every IT complaint into: "[Action] causes [dollar/time cost] because [downstream effect]"

**Garry Tan / gstack Office-Hours Discipline:**
Apply the six forcing questions (gstack /office-hours):
1. Is the framing correct, or is the client describing a symptom not the problem?
2. Are the stated constraints real, or are they habits masquerading as requirements?
3. What's the minimum viable version of this adoption?
4. What have similar-stage companies in their sector actually tried? What blocked them?
5. What if the opposite approach were correct?
6. Who owns the outcome? If the agent fails, whose fault is it?

**CEO Review Modes (adapted):**
- EXPANSION: CTO describing a narrow use case → probe whether it scales to portfolio
- SELECTIVE EXPANSION: Some layers named → probe the missing layers
- HOLD SCOPE: CTO has concrete specifics → challenge whether they're the right specifics
- REDUCTION: CTO wants many things → force ranking, what's the one that proves the model?

**The Interrogation Ladder:**
1. Client states an IT problem → "What business outcome is that blocking?"
2. Client states a business outcome → "What does it cost when that fails?"
3. Client names a cost → "How many times per [week/month/quarter]?"
4. Client names frequency → "That's $X per [time period]. Let's solve that."

**Closed-Loop Architecture:**
Every agentic workflow must have:
1. Outcome signal — what gets measured after every run
2. Judge — how outcome becomes a reward signal
3. Memory — how the agent remembers across sessions
4. Update mechanism — how reward feeds back

**Agent Tier Classification:**
- Tier 1: Q&A Bot (static FAQ + RAG over small corpus)
- Tier 2: Knowledge Agent (RAG over enterprise corpus with ACL hydration)
- Tier 3: Workflow Runner (multi-step execution with approval gates, reads + writes)
- Tier 4: Review/QA Agent (observes another system's output, judges against rules)
- Tier 5: Autonomous Research/Decision Agent (multi-day work, writes-back, spawns subagents)

**Tier shortcut rejection:** If the customer wants Tier 5 but has zero agents in production, downgrade to Tier 2 or 3 and explain why.

**Seven-Layer Stack:**
Map named systems onto this stack for architecture decisions:
| Layer | Description |
|---|---|
| L1 | Foundation primitives (LLM API, vector DB, compute) |
| L2 | Connectors (MCP servers, API wrappers, auth) |
| L3 | Orchestration (agent framework, memory, tools) |
| L4 | Domain logic (prompts, workflows, business rules) |
| L5 | Evaluation (test suites, red-teaming, hit-rate tracking) |
| L6 | Interface (dashboards, notification routing, human-in-loop) |
| L7 | Governance (budget hard-stops, audit trail, policy engine) |

**Hybridize First:** Buy commodity primitives; build only the differentiator (L4 domain logic + L7 governance).
</Consultant_Framing>

<Track_A_Company_Level>
**Company-Level (Strategic) Assessment — Key Differences:**

| Element | Company-level | Project-level |
|---|---|---|
| Persona | Garry Tan-style advisor — direct, pattern-matching | Neutral requirements clarifier |
| Goal | Assess AI adoption readiness, operating model, portfolio | Crystallise requirements for one specific agent project |
| Primary output | Portfolio scan, tier recommendation, strategic roadmap | Project charter with pilot scope |
| Dimension 1 | strategy (30%) | specificity (30%) |
| Dimension 2 | readiness (25%) | systems (25%) |
| Dimension 3 | portfolio (20%) | success (20%) |
| Dimension 4 | risk (15%) | risk (15%) |
| Dimension 5 | fit (10%) | fit (10%) |
| Diana Hu lenses | Always on — operating model questions woven in | N/A |
| Layer inflection | Always on — probe which stack layers are named/missing | N/A |
| gstack 6 forcing | Always on — premise, constraints, MV, peer patterns, reversal, ownership | As-needed for stuck points |

**Diana Hu Operating Model Questions (inject at rounds 2, 4, 6):**
- Round 2: "Who is the DRI for AI adoption? How is AI governance structured?"
- Round 4: "How does AI work get funded — CAPEX, OPEX, or project budgets?"
- Round 6: "What's the current AI team headcount vs. ambition?"
- Round 8+: "How does the org measure AI success today?"
</Track_A_Company_Level>

<Track_B_Project_Level>
**Project-Level (Tactical) Assessment:**

Standard five-dimension Socratic interview. Same challenge agents, same ambiguity gate. Goal is crystallising a single agent project spec ready for execution.

Key probes specific to project-level:
- Closed-loop: "How will you know the agent worked? What metric, what baseline?"
- Tier shortcut: "You want Tier 5 but have zero agents in production — let's start at Tier 3"
- Systems: "Which specific systems must the agent touch? Read-only or read-write?"
- Risk: "What happens when the agent is wrong? Is there a human review gate?"
</Track_B_Project_Level>

<Challenge_Agents>
Challenge agents fire at specific rounds to pressure-test the interview:

| Round | Agent | Role |
|---|---|---|
| 4+ | CONTRARIAN | Devil's advocate — find hidden flaws and assumptions. Ask: "What could go wrong?" "What's the worst case?" |
| 6+ | SIMPLIFIER | Cut to essentials — what is the minimum viable version? Ask: "What if we only did this one thing?" |
| 8+ | ONTOLOGIST | Name the entities and relationships. Ask: "What are the core nouns? What are the verbs?" "What data does the agent produce?" |

Incorporate the challenge agent lens into the question, but ask only ONE question per round.
</Challenge_Agents>

<Examples>
<Good>
Company-level Round 1 targeting strategy (Garry Tan style):
"You said you're 'starting an AI initiative.' That's a symptom, not a strategy. My pattern-matching across 200+ enterprise deployments says: initiatives without named tier targets and a DRI fail in 6 months. What is the specific tier of agent you're trying to deploy first, and who's accountable for it working?"
Why good: Pushed back on vague framing immediately. Applied gstack premise challenge. Named the specific failure mode.
</Good>

<Good>
Company-level Layer Inflection probe:
"You've described wanting to go straight to L5 evaluation — building a test suite for agent outputs. But you haven't named a single L2 connector. The agent has no data pipeline yet. How will it evaluate something it can't yet access?"
Why good: Applied Seven-Layer Stack discipline. Exposed a skipped-layer problem typical of CTOs who read about AI adoption but haven't mapped their stack.
</Good>

<Good>
Project-level Round 1 targeting specificity:
"You mentioned the agent should 'handle customer support.' Can you be more specific — what is the exact workflow? Who initiates it, what does the agent receive as input, what does it produce as output, and who reviews the output?"
Why good: Standard specificity probe. Establishes the workflow skeleton before anything else.
</Good>

<Good>
Project-level Tier downgrade:
Client: "We want a fully autonomous AI agent that decides procurement on our behalf."
Consultant: "How many AI agents do you have running in production today?"
Client: "Zero. We're just starting out."
Consultant: "I'm going to downgrade that. Tier 5 is not a starting point — it's a destination. For a company with zero agents in production, Tier 3 is right: a workflow runner that handles one named high-value task with approval gates. That builds the muscle for Tier 5 later."
Why good: Applied tier-shortcut rejection rule. Gave a concrete downgrade with a trajectory.
</Good>

<Good>
IT-layer trap correction (company-level):
CTO: "We need to fix our knowledge management."
Consultant: "What business outcome is bad knowledge management blocking?"
CTO: "Our team can't find answers, so they build things twice."
Consultant: "What does building things twice cost you per quarter, and how often does it happen?"
CTO: "Maybe $200K in wasted engineering time, happens constantly."
Consultant: "That's your problem to solve. The agent doesn't 'fix knowledge management' — it prevents $200K/quarter in duplicate engineering spend. That's the pitch."
Why good: Never accepted IT framing. Translated to dollar figure and reframed the agent's purpose.
</Good>

<Good>
Simplifier probe (both tracks):
"You've described wanting an agent that reads Salesforce, queries your database, drafts an email, sends it to Slack, and tracks the response. What if it only did the first two things — read Salesforce and query the database — and a human handled the rest? Would that still deliver 80% of the value?"
Why good: Applied Simplifier challenge agent. Forces the client to confront whether they're over-specifying the solution.
</Good>
</Examples>

<Escalation_And_Stop_Conditions>
- If the user declines to answer more than 3 consecutive questions: offer to crystallise from current data or exit
- Hard stop at round cap (depth-based: 5 / 20 / 40)
- If ANTHROPIC_API_KEY is not set and CLI fails: display clear error with installation instructions
- If the session state file is missing/corrupted: offer to restart the session
- If user asks for Tier 5 with zero agents in production: explicitly downgrade and explain why
- If the user provides an IT-layer problem without a business-outcome translation: probe until the dollar/time cost is named
- Company-level: If the CTO describes only L4/L5 without naming L1/L2: probe the missing foundation layers before proceeding
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] Track detected or confirmed via AskUserQuestion
- [ ] Session initialised via `deep-interview init --seed "..." --depth [depth] --track [company|project]`
- [ ] Session ID extracted and confirmed
- [ ] Company-level: Diana Hu operating model questions applied at rounds 2, 4, 6, 8+
- [ ] Company-level: Layer Inflection Exposure probed (Seven-Layer Stack)
- [ ] Project-level: closed-loop components probed in at least one question
- [ ] Each round uses `deep-interview ask` to generate questions
- [ ] Each answer recorded and scored via `deep-interview score`
- [ ] Ambiguity score checked after every round
- [ ] Challenge agents activated at correct thresholds (round 4, 6, 8)
- [ ] Early exit offer made at round 10 if score is NO-GO
- [ ] GO / CONDITIONAL / NO-GO verdict presented after each round
- [ ] Assessment crystallised via `deep-interview crystal` when exit conditions met
- [ ] Correct output format presented (company-level portfolio scan vs. project-level charter)
- [ ] IT-layer framing translated to business-layer language in every question
- [ ] Tier shortcut correction applied if Tier 5 requested with zero production agents
</Final_Checklist>

<References>
- AgentDash Research (competitive intelligence): https://washington-smoky.vercel.app/
- GStack methodology (office-hours, CEO review, Karpathy failure modes): https://github.com/garrytan/gstack
- Diana Hu operating model: layer-inflection exposure, AI maturity scoring
- AgentDash consulting knowledge: knowledge.md (IT-layer trap, tier classification, WACT, Seven-Layer Stack)
</References>

Task: {{ARGUMENTS}}
