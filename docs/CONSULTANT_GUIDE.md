# Consultant Quick-Start Guide

This guide helps forward-deployed consultants run a client assessment engagement from first contact to delivery.

## Prerequisites

1. **Assess skill installed** — one-time: `git clone https://github.com/thetangstr/agentdash-assess-skill.git ~/.claude/skills/agentic-readiness`
2. **One supported runtime installed**
   - Claude Code + OMC: Claude Code plugin — inside Claude Code, run `/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode` then `/plugin install oh-my-claudecode`
   - Codex CLI + OMX: npm package — `npm install -g @openai/codex oh-my-codex` then `omx setup`
3. **pandoc for DOCX** — `brew install pandoc` (required; the skill verifies this before intake)

## Running an Assessment

### 1. Intake (15 min)

Collect from the client:
- Company name and website URL
- Assessment type: **company** (full portfolio) or **project** (single workflow)
- For project: name and one-line description

### 2. Pre-Interview Pulse (15 min)

Before the deep interview, establish business context:
- What business problem are we solving?
- What does success look like in dollars/time?
- What is the cost of doing nothing?
- Who is the DRI?
- What is the timeline?
- What is the budget envelope?

### 3. Run the Skill

```
/agentic-readiness
```

The skill handles:
- Runtime detection: OMC for Claude Code, OMX for Codex
- Website research and industry detection
- Deep-interview Socratic loop
- Report generation (markdown + JSON)
- DOCX export (pandoc required)

### 4. Delivery

The report is saved to:
- `.omc/specs/assess-{slug}.md` or `.omx/specs/assess-{slug}.md` — markdown report
- `.omc/specs/assess-{slug}.json` or `.omx/specs/assess-{slug}.json` — structured data
- `.omc/specs/assess-{slug}.docx` or `.omx/specs/assess-{slug}.docx` — client-ready Word document

Present the deliverable and stop. Do not launch planning, execution, or refinement from this skill; the DOCX is the stakeholder review artifact.

### 5. Track the Engagement

Update `clients/.engagements/engagements.json` with:
```json
{
  "id": "eng-XXX",
  "company": "Client Name",
  "type": "company",
  "stage": "delivery",
  "outcome": "in_progress",
  "assessmentSlug": "client-YYYY-MM-DD"
}
```

## Pro Tips

**Never accept an IT problem as the goal.** If the client says "fix SharePoint," dig until you find the dollar cost.

**Closed-loop is non-negotiable.** Every agent needs: outcome signal → judge → memory → update mechanism.

**Tier-downgrade when needed.** If a client wants Tier 5 but has zero agents in production, start at Tier 2.

**The pilot must be 4-6 weeks.** If the scope is bigger, shrink it. Fixed scope, fixed timeline.

## Sample Opening Script

```
"Hi, I'm here from AgentDash Consulting. Our assessment typically takes 
45-60 minutes. We'll start with some quick context questions — about your 
business goals, not your tech stack — then I'll run a structured interview.

The output is a crystallized spec: a project charter for an AI agent 
workload, with go/no-go reasoning, agent architecture, success metrics, 
and a 6-week rollout plan.

Shall we begin?"
```

## Common Client Objections

| Objection | Response |
|-----------|----------|
| "We already have AI strategy" | "Great — where are your agents in production? This assessment maps your current state to a concrete pilot." |
| "We need a full audit first" | "A full audit takes months. This is a 1-hour assessment that produces a ready-to-execute pilot spec." |
| "Our data isn't ready" | "What specific data quality issue? Most 'not ready' situations are actually solvable within the pilot scope." |
| "We need to talk to legal" | "Totally reasonable. Can you loop in legal for a 30-min call after the assessment? The report will flag any compliance items." |
