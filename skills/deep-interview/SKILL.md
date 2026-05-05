---
name: deep-interview
description: Socratic deep-interview with mathematical ambiguity gating for agentic workflow requirements crystallisation
level: 3
---

<Purpose>
Run a Socratic deep-interview to clarify and crystallise requirements for an agentic workflow project before any execution begins. The interview uses five assessment dimensions (specificity 30%, systems 25%, success 20%, risk 15%, fit 10%) and a mathematical ambiguity gate (threshold 0.2) to determine when the spec is ready for execution. Output is a crystallised markdown spec.
</Purpose>

<Use_When>
- User says "deep-interview", "/deep-interview", "requirements interview", "clarify this project", "help me spec this"
- User has a new project or idea that is vague or ill-defined and wants structured Socratic questioning to crystallise it
- User has been talking about an agentic workflow but the requirements keep shifting
- This skill is the correct tool when the user needs REQUIREMENTS CLARITY, not execution
</Use_When>

<Do_Not_Use_When>
- User already has a detailed PRD or spec file — use a planning or execution skill directly
- User wants competitive intelligence or market research — use a research skill
- User wants to execute something — this skill only does requirements crystallisation
- User is asking a single one-off question — answer it directly without invoking this skill
</Do_Not_Use_When>

<Why_This_Exists>
Most agentic workflow failures don't stem from technology — they stem from unclear requirements: nobody defined what "success" means, nobody named the systems that need to integrate, nobody established error tolerance or escalation paths. This skill applies a Socratic interview methodology with mathematical clarity gates (ambiguity score ≤ 0.2) before any execution begins.
</Why_This_Exists>

<Execution_Policy>
- Phase 1: Initialise the interview session using the `deep-interview` CLI (`deep-interview init --seed "..." --depth standard`)
- Phase 2: Loop — generate question, ask via AskUserQuestion, record answer, score via CLI
- Phase 3: After each round, check ambiguity score and dimension scores
- Phase 4: Exit when ambiguity ≤ 0.2 AND all dimensions ≥ 0.5 (GO verdict), or round cap reached
- Phase 5: Crystallise spec via `deep-interview crystal`
- The interview loop is INTERACTIVE — use AskUserQuestion for every user-facing question
- The CLI is the STATE MACHINE — do not manage state manually; always read/write via the CLI
- Do NOT use `Skill()` invocations — this is a standalone skill with no sub-skills
</Execution_Policy>

<Steps>

## Phase 1: Initialise — Intake

### Step 1: Collect seed and depth upfront

The skill is invoked with a seed string. Extract it from `{{ARGUMENTS}}`. If no arguments are provided, ask both questions at once:

**Self-check before asking:**
- [ ] Question covers both the project idea AND interview depth
- [ ] Depth options have clear time/effort descriptions
- [ ] multiSelect: false

AskUserQuestion
  question: "Two things before we start:\n\n1. **Your project or idea** — What do you want to clarify? Describe it in a sentence or two. A rough idea is fine; we are here to sharpen it.\n\n2. **Interview depth** — How thorough should we be?"
  header: "Your Idea + Interview Depth"
  options:
    - label: "Quick (5 rounds)"
      description: "Fast clarity for small projects or early-stage ideas. 15–20 min."
    - label: "Standard (20 rounds, default)"
      description: "Full Socratic interview. Thorough enough for most agentic workflows. 30–45 min."
    - label: "Deep (40 rounds)"
      description: "Maximum thoroughness for complex, multi-system, or high-stakes projects. 60–90 min."
  multiSelect: false

Record the free-text answer as `seed`. Record the selected option label, stripped of the round count prefix, as `depth` (quick | standard | deep). Default to "standard" if no selection.

**Parse depth from seed argument:** If `{{ARGUMENTS}}` includes `--quick`, `--standard`, or `--deep`, use that as the depth and skip the depth question. If `--output-dir <path>` is present, record it.

### Step 2: Initialise state via CLI

Run via Bash:
```
deep-interview init --seed "[seed]" --depth [depth] 2>&1
```

If `deep-interview` is not found, show installation instructions first:

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
deep-interview CLI NOT FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The `@agentdash/deep-interview` CLI is not installed. Install it with:

```bash
npm install -g @agentdash/deep-interview
```

Or if you are in the agentdash-deep-interview package directory:

```bash
npm link
```

AskUserQuestion
  question: "Has the deep-interview CLI been installed? Try running: deep-interview status"
  header: "CLI Install"
  options:
    - label: "Yes — continue"
      description: "Re-run the init command."
    - label: "No — show me how"
      description: "Display installation instructions."
    - label: "Exit"
      description: "Exit the skill."
  multiSelect: false

If user wants install instructions:
  Display the install commands above, then re-ask this question.

If CLI is ready, run init.

### Step 3: Parse init output

The init command prints the session ID. Extract it and record as `sessionId`.

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERVIEW INITIALISED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  seed:      [first 80 chars of seed]...
  depth:     [depth] ([maxRounds] rounds max)
  session:   [sessionId]
  state:     ~/.agentic-readiness/state/[sessionId].json
  spec out:  [output-dir]/deep-interview-[slug].md

Proceed to Phase 2.

---

## Phase 2: Interview Loop

**Prerequisite:** Phase 1 must be complete with sessionId confirmed.

This is the main interview loop. Repeat rounds until:
- ambiguity ≤ 0.2 AND all dimensions ≥ 0.5 (GO verdict)
- OR round cap reached (depth-based)
- OR user requests early exit

### Round setup

For round = 1 to maxRounds:

### Step A: Generate question

Run via Bash:
```
deep-interview ask --round [round] --session-id [sessionId] 2>&1
```

Parse the JSON output. Extract:
- `question` — the question to ask
- `dimension` — which dimension this probes
- `phase` — which interview phase
- `challengeAgent` — which challenge agent fired (if any)
- `ambiguity` — current ambiguity score

### Step B: Ask the question

Display the round header and challenge agent note (if applicable):

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUND [round] / [maxRounds] — [dimension] / [phase]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${challengeAgent ? `[Challenge agent: ${challengeAgent}]` : ''}
Current ambiguity: [ambiguity]

AskUserQuestion
  question: "[question]"
  header: "Round [round] — [dimension]"
  options:
    - label: "Answer"
    - label: "I don't know / skip"
    - label: "Exit interview early"
  multiSelect: false

### Step C: Handle answer

**If user answers:**
  Run via Bash to record:
  ```
  deep-interview score --round [round] --session-id [sessionId] --threshold [threshold]
  ```
  The score command reads the latest state, scores the round, and updates the state file.

  Parse the score output. Extract:
  - `ambiguity` — updated ambiguity score
  - `verdict` — GO | CONDITIONAL | NO-GO
  - `rationale` — 2-3 sentence explanation
  - `concerns` — list of dimension gaps

  Display the round result:
  ```
  Round [round] result:
    dimension scores:
      specificity: X.XX (30%)  ████████░░
      systems:     X.XX (25%)  ███████░░░
      ...
    ambiguity:  X.XXX
    threshold:  X.XXX
    verdict:    ✅ GO | ⚠️ CONDITIONAL | ❌ NO-GO
    ${concerns ? 'concerns: ' + concerns.join(', ') : ''}
  ```

**If user says "skip" or "I don't know":**
  Proceed to the next round without scoring. Note in the transcript that the user skipped this round.
  Do not treat a skip as an answer — the dimension score for this round stays as-is.

**If user says "exit early":**
  AskUserQuestion
    question: "Are you sure you want to exit the interview early? The spec will be crystallised from what we have so far, even if ambiguity is above threshold."
    options:
      - label: "Yes — exit and crystallise"
      - label: "No — continue the interview"
    multiSelect: false
  If yes: jump to Phase 4 (crystallise).

### Step D: Check exit conditions

**GO condition (all must be true):**
- ambiguity ≤ 0.2
- all five dimensions ≥ 0.5

**CONDITIONAL condition:**
- ambiguity ≤ 0.35
- OR one dimension at 0.4–0.5

**Exit rules:**
- If GO: display "AMBIGUITY THRESHOLD MET — ready for execution" and proceed to Phase 3.
- If CONDITIONAL: display warning and continue unless round cap reached.
- If NO-GO and round < 10: continue.
- If NO-GO and round ≥ 10: display warning, offer to continue or exit.
- If round cap reached: proceed to Phase 3.

### Early exit offer at round 10

If at round 10 the score is still NO-GO:

AskUserQuestion
  question: "We are at round 10 and the ambiguity score is still [X.XXX] — above the 0.2 threshold. The interview can continue, but you may be hitting diminishing returns. What would you like to do?"
  options:
    - label: "Continue — keep going"
      description: "Continue to round 20 (standard) or 40 (deep)."
    - label: "Stop here — crystallise what we have"
      description: "End the interview and generate the spec with current data."
  multiSelect: false

---

## Phase 3: Ambiguity Threshold Met

**Trigger:** ambiguity ≤ 0.2 AND all dimensions ≥ 0.5

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AMBIGUITY THRESHOLD MET ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All five dimensions scored above minimum.
Ambiguity: [X.XXX] ≤ 0.200
Ready for spec crystallisation.

Proceed to Phase 3 spec crystallisation.

---

## Phase 4: Spec Crystallisation

### Step 1: Run the crystal command

Run via Bash:
```
deep-interview crystal --session-id [sessionId] --output-dir [output-dir] 2>&1
```

If the command succeeds, it writes the spec to the output path and prints the path.

### Step 2: Read and present the spec

Run: Read(path="{output-dir}/deep-interview-{slug}.md")

Display the spec to the user (first 80 lines as a preview), then:

AskUserQuestion
  question: "The spec has been generated. What would you like to do with it?"
  header: "Spec Ready"
  options:
    - label: "Save and close"
      description: "Spec is saved — you are done."
    - label: "Refine one section"
      description: "Point to a section that needs more clarity — we will probe further."
    - label: "Export as JSON"
      description: "Dump the structured spec data as JSON."
  multiSelect: false

**If user selects "Refine one section":**
  AskUserQuestion
    question: "Which section needs more clarity? Point to it or describe what is missing."
    options:
      - label: "Continue"
    multiSelect: false
  Record the refinement request as a new round of questions. Run `deep-interview ask --round [next]` to generate a targeted question. Continue the loop for up to 3 additional rounds, then re-crystallise.

---

## Phase 5: Session Summary

After the spec is saved (or at any exit point):

Display:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERVIEW COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  session:   [sessionId]
  rounds:    [N]
  ambiguity: [X.XXX]
  verdict:   [GO | CONDITIONAL | NO-GO]
  exit:      [threshold-met | round-cap | early-exit]
  spec:      [output-dir]/deep-interview-[slug].md

The spec is your project charter. Share it with your implementation team.
It defines the workflow, the success metrics, the systems, and the pilot scope.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
</Steps>

<Tool_Usage>
- Use `Bash` with `deep-interview init`, `deep-interview ask`, `deep-interview score`, `deep-interview crystal` for all state management
- Use `AskUserQuestion` for all user-facing questions (this is Claude Code native — no OMC dependency)
- Use `Read` to load the crystallised spec after crystallisation
- Use `Write` only if you need to manually save a spec (normally the CLI handles this)
</Tool_Usage>

<Consultant_Framing>
When framing the interview, use these principles from the AgentDash consultant knowledge base:

**The IT-Layer Trap:**
- Never accept "organise SharePoint", "build a RAG chatbot", or "automate our workflow" as the goal
- Probe until you have the business metric and dollar figure
- Example: "What does a wrong guess cost you per deal, and how often does it happen?"
- Translate every IT complaint into: "[Action] causes [dollar/time cost] because [downstream effect]"

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
</Consultant_Framing>

<Five_Assessment_Dimensions>

| Dimension | Weight | What it measures |
|---|---|---|
| **specificity** | 30% | Is the primary opportunity concrete? Named workflow, specific inputs/outputs? |
| **systems** | 25% | Are the systems and data the agent must touch named? Integration points, data quality known? |
| **success** | 20% | How will the customer know it worked? Named metric, baseline, target? |
| **risk** | 15% | Error tolerance, regulatory load, approval cadence, audit needs. What happens when the agent is wrong? |
| **fit** | 10% | Timeline, budget envelope, DRI, stakeholder buy-in. |

**Ambiguity Formula:**
```
ambiguity = 1 - (specificity × 0.30 + systems × 0.25 + success × 0.20 + risk × 0.15 + fit × 0.10)
```

**Minimum scores for GO:**
- All five dimensions ≥ 0.5
- ambiguity ≤ 0.2

**Conditionally ready (proceed with mitigations):**
- ambiguity ≤ 0.35
- OR one dimension at 0.4–0.5

**Not ready:**
- ambiguity > 0.35
- OR two+ dimensions < 0.5
</Five_Assessment_Dimensions>

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
Round 1 question targeting low specificity:
"You mentioned the agent should handle customer support. Can you be more specific — what is the exact workflow? Who initiates it, what does the agent receive as input, what does it produce as output, and who reviews the output?"
Why good: Directly probes specificity (30% weight), the highest-weighted dimension.
</Good>

<Good>
Round 3 question targeting systems:
"You've mentioned Salesforce and Slack. What specific data does the agent need from Salesforce? Is it read-only or does it write back? How does it authenticate? Who has access to the data the agent produces?"
Why good: Systems dimension is 25% weight — naming integration points is critical for execution.
</Good>

<Good>
Round 5 question targeting success:
"How will you know the agent is working? What metric are you tracking — deflection rate, response time, CSAT score? What is the current baseline for that metric, and what improvement target are you aiming for in the pilot?"
Why good: Success (20% weight) — closed-loop measurement is non-negotiable for agentic workflows.
</Good>

<Good>
Closed-loop probe in a question:
"You mentioned the agent will draft RFP responses and send them to the sales team. How do you measure whether the drafted RFP was actually accepted or rejected by the sales team? What is the outcome signal that closes the loop?"
Why good: Directly probes the four closed-loop components without mentioning the framework by name.
</Good>

<Good>
IT-layer trap correction:
Client: "We need an AI agent to manage our SharePoint."
Consultant: "What business outcome is SharePoint disorganization blocking?"
Client: "Our sales team can't find technical specs, so they guess."
Consultant: "What does a wrong guess cost you per deal, and how often does that happen?"
Client: "Probably $50K missed revenue per deal, and it affects maybe 20% of our pipeline."
Consultant: "That's roughly $X per quarter in at-risk revenue. The agent doesn't 'organise SharePoint' — it protects that $X."
Why good: Never accepted the IT-layer framing. Translated SharePoint chaos into a dollar figure and reframed the agent's purpose.
</Good>

<Good>
Tier downgrade correction:
Client: "We want a fully autonomous AI agent that can make procurement decisions on behalf of the company."
Consultant: "How many AI agents do you currently have running in production?"
Client: "Zero. We're just starting out."
Consultant: "I'm going to downgrade that recommendation. A Tier 5 autonomous decision agent is not appropriate as your first agent — that's a trajectory, not a starting point. For a company with zero agents in production, the right first agent is Tier 3: a workflow runner that handles a specific, named, high-value task with approval gates. That builds the muscle for Tier 5 later. Starting at Tier 5 without that foundation is how agentic initiatives fail."
Why good: Applied the tier-shortcut rejection rule. Gave a concrete downgrade with a path forward.
</Good>
</Examples>

<Escalation_And_Stop_Conditions>
- If the user declines to answer more than 3 consecutive questions: offer to crystallise from current data or exit
- Hard stop at round cap (depth-based: 5 / 20 / 40)
- If ANTHROPIC_API_KEY is not set and CLI fails: display clear error with instructions to set the env var
- If the session state file is missing/corrupted: offer to restart the session
- If user asks for Tier 5 with zero agents in production: explicitly downgrade and explain why
- If the user provides an IT-layer problem without a business-outcome translation: probe until the dollar/time cost is named — do not let IT-layer framing pass
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] Session initialised via `deep-interview init --seed "..." --depth [depth]`
- [ ] Session ID extracted and confirmed
- [ ] Each round uses `deep-interview ask` to generate questions
- [ ] Each answer recorded and scored via `deep-interview score`
- [ ] Ambiguity score checked after every round
- [ ] Early exit offer made at round 10 if score is NO-GO
- [ ] GO / CONDITIONAL / NO-GO verdict presented after each round
- [ ] Spec crystallised via `deep-interview crystal` when exit conditions met
- [ ] Spec path confirmed and shared with user
- [ ] IT-layer framing translated to business-layer language in every question
- [ ] Closed-loop components probed in at least one question
- [ ] Tier shortcut correction applied if Tier 5 requested with zero production agents
</Final_Checklist>

Task: {{ARGUMENTS}}