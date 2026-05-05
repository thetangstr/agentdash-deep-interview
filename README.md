# @agentdash/deep-interview

Dual-track Socratic deep-interview — company-level (strategic) and project-level (tactical) assessment with mathematical ambiguity gating. Blends AgentDash consulting context, gstack methodology, and Seven-Layer Stack architecture.

## Two tracks

| Track | Use when | Output |
|---|---|---|
| `--track company` | CTO / leadership AI adoption readiness | Portfolio scan, tier recommendation, strategic roadmap |
| `--track project` | Specific agentic workflow requirements | Project charter with pilot scope, RACI, success metrics |

## Installation

```bash
git clone https://github.com/thetangstr/agentdash-deep-interview.git
cd agentdash-deep-interview
pnpm install
pnpm link --global
```

**Requirements:** Node.js >= 20, `ANTHROPIC_API_KEY` in environment.

## Required skill: last30days

The deep-interview skill uses `last30days` for competitive research before crystallisation. Install it once:

```bash
# It lives at ~/.claude/skills/last30days/ — verify it exists:
ls ~/.claude/skills/last30days/

# If not installed, clone it:
git clone https://github.com/mvanhorn/last30days-skill.git ~/.claude/skills/last30days
```

Then inside Claude Code: `last30days AI agent adoption FinTech 2026`

## Quick start

```bash
# Company-level (strategic)
deep-interview init --seed "Acme Corp AI adoption readiness" --track company --depth deep

# Project-level (tactical)
deep-interview init --seed "customer support AI agent for Acme Corp" --track project

deep-interview ask --round 1
deep-interview score --round 1
deep-interview crystal --output-dir ./specs
```

## Interview depth

| Depth | Max rounds | Exit condition |
|---|---|---|
| `quick` | 5 (warn at 5) | Exits early — for early-stage ideas. Lightning ~10 min. |
| `standard` | 20 (warn at 10) | Balanced thoroughness. Standard ~30 min. |
| `deep` | 40 | Maximum depth. ~60-90 min for complex, high-stakes. |

## Assessment dimensions

**Project-level (tactical):**

| Dimension | Weight | What it measures |
|---|---|---|
| **specificity** | 30% | Is the primary opportunity concrete? Named workflow, inputs/outputs? |
| **systems** | 25% | Are the systems and data the agent touches named? |
| **success** | 20% | How will the customer know it worked? Named metric, baseline, target? |
| **risk** | 15% | Error tolerance, regulatory load, approval cadence. What happens when the agent is wrong? |
| **fit** | 10% | Timeline, budget, DRI, stakeholder buy-in |

**Company-level (strategic):**

| Dimension | Weight | What it measures |
|---|---|---|
| **strategy** | 30% | Is the AI adoption strategy concrete? Named priorities, tier targets, org structure? |
| **readiness** | 25% | Org maturity: AI fluency, data quality, integration complexity, executive sponsorship |
| **portfolio** | 20% | Has the company named specific agent projects? Prioritized? Sized? |
| **risk** | 15% | Error tolerance, regulatory load, change management, audit needs |
| **fit** | 10% | Timeline, budget envelope, DRI, stakeholder alignment |

**Ambiguity formula:**
```
ambiguity = 1 - (dimension × weight + ...)
```

**GO condition:** ambiguity ≤ 0.2 AND all dimensions ≥ 0.5
**CONDITIONAL:** ambiguity ≤ 0.35 OR one dimension at 0.4–0.5

## Challenge agents

| Round | Agent | Role |
|---|---|---|
| 4+ | CONTRARIAN | Devil's advocate — find hidden flaws |
| 6+ | SIMPLIFIER | Cut to essentials — minimum viable version |
| 8+ | ONTOLOGIST | Name entities and relationships |

## CLI commands

```
deep-interview init --seed "..." [--depth quick|standard|deep] [--track company|project]
deep-interview ask --round N [--session-id <uuid>]
deep-interview score --round N [--threshold 0.2]
deep-interview status [session-id]
deep-interview ont [session-id]
deep-interview crystal [--output-dir <path>]
```

## Programmatic API

```js
import { createSession, loadSession, generateNextQuestion, scoreRound, crystallise } from '@agentdash/deep-interview';

const state = createSession({ seed: 'my idea', depth: 'standard' });

const q = await generateNextQuestion({
  seed: state.seed,
  round: 1,
  answers: [],
  dimensions: state.dimensions,
  challengeAgents: [],
});

// ... collect answer from user ...

await scoreRound({ seed, answers, round });
const spec = await crystallise(state);
```

Or run the full loop with a custom `onAsk` callback:

```js
import { runInterview } from '@agentdash/deep-interview';

const state = await runInterview({
  seed: 'my idea',
  depth: 'standard',
  threshold: 0.2,
  outputDir: './specs',
  onAsk: async (question) => {
    // Return user's answer as string
    return askUserSomehow(question);
  },
  onRound: async (state) => {
    console.log(`Round ${state.round} complete — ambiguity ${state.ambiguity.toFixed(3)}`);
  },
});
```

## Output

- **State:** `~/.agentic-readiness/state/{sessionId}.json`
- **Spec:** `{output-dir}/deep-interview-{slug}.md`

## Architecture

```
src/
  index.js    — programmatic API, interview loop
  cli.js      — CLI argument parser, command dispatch
  state.js    — JSON file persistence (no OMC/OMX)
  score.js    — Claude API calls for ambiguity scoring
  question.js — Socratic question generation
  spec.js     — spec crystalliser
  output.js   — path resolution, slug derivation

skills/deep-interview/
  SKILL.md    — Claude Code skill (invoke via /deep-interview)

knowledge.md   — Consultant frameworks (IT-layer trap, tier classification, WACT, Seven-Layer Stack)
strategy.md    — Report templates (company/project assessment formats, DOCX config)
docs/
  CONSULTANT_GUIDE.md  — Quick-start guide for consultants running engagements
clients/
  README.md    — Engagement lifecycle, privacy guide
  .engagements/ — Active engagement records (gitignored)
  examples/   — Anonymized sample outputs
```

## Using with Claude Code

**Prerequisite:** Install `last30days` (see above) before running company-level assessments.

Add to your `~/.claude/CLAUDE.md`:

```
@import ~/agentdash-deep-interview/skills/deep-interview/SKILL.md
@import ~/agentdash-deep-interview/knowledge.md
@import ~/agentdash-deep-interview/strategy.md
```

Then inside Claude Code:

```
/deep-interview
```

Or use the skill directly:

```
Use the deep-interview skill to clarify my project: an AI agent that handles...
```

The skill runs the full interview loop: init → ask → score → (research via last30days) → crystal → present.

## Key design decisions

- **No OMC/OMX dependency** — all state stored in JSON files under `~/.agentic-readiness/state/`
- **API key from environment** — `ANTHROPIC_API_KEY` or `CLADE_API_KEY`
- **Model preference** — `claude-opus-4-7`, falls back to `claude-sonnet-4-6` if unavailable
- **CLI is a utility** — the `SKILL.md` is the primary interface when run inside Claude Code
- **Standalone** — no agent execution bridge, only spec crystallisation

## License

MIT