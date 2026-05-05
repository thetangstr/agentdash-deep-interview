## Phase 5: Assessment Crystallisation

### Step 0: Research (required — do this before crystallising)

**This step is mandatory for company-level assessments.** It injects competitive intelligence into the spec so the output is grounded in real market data, not just the interview transcript.

**Auto-install `last30days` if not present:**
Run via Bash:
```bash
if [ ! -d ~/.claude/skills/last30days ]; then
  echo "Installing last30days dependency..."
  mkdir -p ~/.claude/skills
  git clone https://github.com/mvanhorn/last30days-skill.git ~/.claude/skills/last30days
fi
```

Run `last30days` research to gather:
1. **Sector trends:** What are companies in this industry saying about AI agent adoption? What's working? What's failing?
2. **Competitor case studies:** Any public case studies of AI agent deployments in this sector?
3. **ROI benchmarks:** What ROI or efficiency gains are reported?
4. **Failure modes:** What are the common failure patterns for AI adoption in this domain?

**For company-level**, run these queries:
- `last30days AI agent adoption [sector] enterprise 2026`
- `last30days [known competitor or peer company] AI automation`

**For project-level**, run:
- `last30days [tool/technique named in interview] AI agent ROI 2026`
- `last30days enterprise AI agent failure modes [domain] 2026`

**Save research to file** so `deep-interview crystal` can inject it:
```
~/.agentic-readiness/research/[sessionId].md
```

Example — run via Bash:
```bash
mkdir -p ~/.agentic-readiness/research
# After last30days completes, copy the output to:
cp /tmp/last30days-output.md ~/.agentic-readiness/research/[sessionId].md
```

**CRITICAL:** The research file must exist before running `deep-interview crystal`. If no research is available, crystallise will still run (research is optional for project-level).

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
