# @agentdash/deep-interview

Standalone Socratic deep-interview with mathematical ambiguity gating for agentic workflow requirements crystallisation.

## What it does

`@agentdash/deep-interview` runs an adaptive Socratic interview to clarify requirements for an AI agent workflow project before any execution begins. It uses five weighted assessment dimensions and a mathematical ambiguity gate to determine when the spec is ready.

## Installation

```bash
npm install -g @agentdash/deep-interview
```

Or from source (in the package directory):

```bash
npm link
```

**Requirements:**
- Node.js >= 20
- `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) set in your environment

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Quick start

```bash
# 1. Initialise a session
deep-interview init --seed "customer support agent for Acme Corp"

# 2. Ask a question (generates via Claude API)
deep-interview ask --round 1

# 3. Answer it — then score
deep-interview score --round 1

# 4. Repeat until ambiguity ≤ 0.2

# 5. Crystallise the spec
deep-interview crystal --output-dir ./specs
```

## Interview depth

| Depth | Max rounds | Use case |
|---|---|---|
| `quick` | 5 | Small projects, early-stage ideas |
| `standard` | 20 | Most agentic workflow projects |
| `deep` | 40 | Complex, multi-system, high-stakes |

## Five assessment dimensions

| Dimension | Weight | What it measures |
|---|---|---|
| **specificity** | 30% | Is the primary opportunity concrete? Named workflow, inputs/outputs? |
| **systems** | 25% | Are the systems and data the agent touches named? |
| **success** | 20% | How will the customer know it worked? Named metric, baseline, target? |
| **risk** | 15% | Error tolerance, regulatory load, approval cadence. What happens when the agent is wrong? |
| **fit** | 10% | Timeline, budget, DRI, stakeholder buy-in |

**Ambiguity formula:**
```
ambiguity = 1 - (specificity × 0.30 + systems × 0.25 + success × 0.20 + risk × 0.15 + fit × 0.10)
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
deep-interview init --seed "..." [--depth quick|standard|deep]
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
  SKILL.md    — Claude Code skill definition (invoked via /deep-interview)
```

## Key design decisions

- **No OMC/OMX dependency** — all state stored in JSON files under `~/.agentic-readiness/state/`
- **API key from environment** — `ANTHROPIC_API_KEY` or `CLADE_API_KEY`
- **Model preference** — `claude-opus-4-7`, falls back to `claude-sonnet-4-6` if unavailable
- **CLI is a utility** — the `SKILL.md` is the primary interface when run inside Claude Code
- **Standalone** — no agent execution bridge, only spec crystallisation

## License

MIT