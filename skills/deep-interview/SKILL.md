---
name: deep-interview
description: Dual-track Socratic deep-interview for AI adoption — company-level (strategic) and project-level (tactical) assessment with mathematical ambiguity gating
level: 3
---

<Purpose>
Run a Socratic deep-interview to assess AI adoption readiness. Supports two tracks:
- **Company-level (strategic):** Assess a CTO's or leadership team's AI adoption maturity, portfolio readiness, and operating model — delivered as a portfolio scan with tier recommendation
- **Project-level (tactical):** Crystallise requirements for a specific agentic workflow project before execution — delivered as a project charter with pilot scope

The interview uses weighted assessment dimensions and a mathematical ambiguity gate (threshold 0.2) to determine when assessment is complete.
</Purpose>

<Use_When>
- User says "deep-interview", "/deep-interview", "assess my company", "assess this project", "AI readiness", "help me understand our AI maturity"
- User is a CTO or leadership team member wanting to understand their AI adoption readiness
- User has a vague project idea for an AI agent and wants structured requirements gathering
- User says "advisor", "interview founders", "CTO assessment"
</Use_When>

<Do_Not_Use_When>
- User already has a detailed PRD, assessment report, or plan file — use a planning skill directly
- User wants competitive intelligence or market research — use AgentDash Research (washington-smoky.vercel.app) first
- User wants to execute something — this skill only does assessment/requirements crystallisation
- User is asking a single one-off question — answer it directly without invoking this skill
</Do_Not_Use_When>

<Why_This_Exists>
Most AI adoption failures don't stem from technology — they stem from unclear strategy. This skill applies Socratic methodology (office-hours discipline: 6 forcing questions, CEO review modes) with mathematical clarity gates before any execution begins.
</Why_This_Exists>

<Execution_Policy>
- **Every interview is a NEW session** — do not carry over, reference, or resume from any prior interview state. Start fresh with a clean slate.
- The CLI is the STATE MACHINE — always read/write via `deep-interview init`, `ask`, `score`, `crystal`
- The interview loop is INTERACTIVE — use AskUserQuestion for every user-facing question
- Do NOT use `Skill()` invocations — this is a standalone skill with no sub-skills
- Consultant framing and dimension tables are in `shared/consultant-context.md`
</Execution_Policy>

<Steps>

## READ FIRST: How to use this skill

This skill is split into separate files. **Read them in order.** Do not skip any step.

**Step files** (in `steps/`):
1. `steps/01-expectations.md` — What You Get + begin confirmation
2. `steps/02-track.md` — Assessment track (company vs project)
3. `steps/03-basic-facts.md` — Company name, sector, size (**MANDATORY**)
4. `steps/04-motivation.md` — Primary motivation
5. `steps/05-depth.md` — Interview depth (Lightning/Standard/Deep)
6. `steps/06-project.md` — Project type + description
7. `steps/07-init.md` — CLI init + confirmation gate (**MANDATORY — do not skip**)

**Phase files** (in `phases/`):
- `phases/phase-02-loop.md` — Interview rounds loop + Phase 3 + Phase 4
- `phases/phase-05-crystal.md` — Crystallisation + Phase 6 session summary
- `phases/phase-06-present.md` — HTML slideshow generation

**Shared reference:**
- `shared/consultant-context.md` — Consultant framing, IT-layer trap, tier classification, Seven-Layer Stack

## Complete each step in order:

**PHASE 1 — Intake (Steps 1–7):**
→ Complete steps/01-expectations.md
→ Complete steps/02-track.md
→ Complete steps/03-basic-facts.md
→ Complete steps/04-motivation.md
→ Complete steps/05-depth.md
→ Complete steps/06-project.md
→ Complete steps/07-init.md

**PHASE 2 — Interview Loop:**
→ Read and follow phases/phase-02-loop.md
  (continue rounds until ambiguity ≤ 0.2 OR round cap reached)

**PHASE 3 — Crystallisation:**
→ Read and follow phases/phase-05-crystal.md

**PHASE 4 — Presentation:**
→ Read and follow phases/phase-06-present.md

**Phase 5 — Session Summary** (inline in phase-05-crystal.md)

</Steps>

<Tool_Usage>
- `Bash` with `deep-interview init`, `deep-interview ask`, `deep-interview score`, `deep-interview crystal` for all state management
- `AskUserQuestion` for all user-facing questions
- `Read` to load step files and phase files as you progress through the interview
- `Write` only if you need to manually save (normally the CLI handles this)
</Tool_Usage>

<Final_Checklist>
- [ ] STEP 7 confirmation gate passed before any round question asked
- [ ] Confirmation shows ACTUAL values (not template placeholders)
- [ ] Every round uses `deep-interview ask` to generate questions
- [ ] Ambiguity score checked after every round
- [ ] GO / CONDITIONAL / NO-GO verdict presented after each round
- [ ] Assessment crystallised via `deep-interview crystal` when exit conditions met
- [ ] IT-layer framing translated to business-layer language in every question
- [ ] Tier shortcut correction applied if Tier 5 requested with zero production agents
</Final_Checklist>

<References>
- AgentDash Research: https://washington-smoky.vercel.app/
- Consultant context (IT-layer trap, tier classification, Seven-Layer Stack): shared/consultant-context.md
</References>

Task: {{ARGUMENTS}}
