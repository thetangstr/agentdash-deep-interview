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
