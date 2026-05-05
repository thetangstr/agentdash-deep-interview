## STEP 7: Initialize Session via CLI

### 7a. Construct the seed

Build the seed string from all collected values:

**Seed format:**
```
[motivation] | [project_type] | [project_description] | Company: [company_name] ([sector], [size])
```

**Example:**
```
Cut costs / do more with less | Internal operations agent | AI agent that auto-processes expense reports | Acme Corp (Manufacturing, 500 employees)
```

### 7b. Run CLI init

Run via Bash:
```
deep-interview init --seed "[seed]" --depth [depth] --track [assessment_track] 2>&1
```

If `deep-interview` is not found, display:

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

### 7c. Confirmation gate — MANDATORY, do not skip

Display this block with the ACTUAL recorded values substituted (not template placeholders):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERVIEW READY — please confirm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Motivation:     [actual primary_motivation value]
  Project type:  [actual project_type value]
  Description:   [actual project_description — first 80 chars]
  Company:       [actual company_name]
  Website:       [actual company_website]
  Sector:        [actual sector]
  Size:          [actual size]
  Track:         [company | project]
  Depth:         [depth] ([maxRounds] rounds max)
  Session ID:    [sessionId from CLI init]

AskUserQuestion
  question: "Everything look right? We can adjust before we start the interview rounds."
  header: "Confirm Details"
  options:
    - label: "Looks good — start the interview"
    - label: "Update something"
      description: "Tell me what to change"
  multiSelect: false

**If "Update something":** ask which value needs correcting, update the record, re-display the confirmation block with actual values, and ask again until confirmed. Only after "Looks good" may you proceed to Phase 2.
