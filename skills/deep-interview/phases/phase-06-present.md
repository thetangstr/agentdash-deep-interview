## Phase 6: Presentation

### Step 1: Generate the presentation

Run via Bash:

```
deep-interview present --session-id [sessionId] --output-dir ./specs 2>&1
```

### Step 2: Present to the user

Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRESENTATION READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your presentation is ready: ./specs/[slug]-presentation.html

Open it in any browser. Arrow keys or click to navigate.

8 slides:
  1. Cover
  2. The Opportunity
  3. Where You Are — AI Maturity
  4. The Tier That Fits
  5. The Gap — Agent Factory Layers
  6. Your First Pilot
  7. The Path Forward
  8. Why AgentDash (subscription CTA)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Ask what to do next

AskUserQuestion
  question: "The presentation is ready. What would you like to do with it?"
  header: "Presentation Ready"
  options:
    - label: "Save and close"
      description: "You're done. Files are on your machine."
    - label: "Add another round"
      description: "Go back to the interview for more depth on a specific area."
    - label: "Start a new interview"
      description: "Fresh session, fresh start."
  multiSelect: false

**If "Add another round":** Return to Phase 2 loop. Run `deep-interview ask --round [next] --session-id [sessionId]` and continue.

**If "Start a new interview":** Begin from Step 1 of Phase 1.

**If "Save and close":** Display the Phase 6 session summary block.
