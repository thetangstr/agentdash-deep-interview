## STEP 2: Assessment Track

Extract from `{{ARGUMENTS}}` if the user specified it. Look for keywords:

- **Company-level signals:** "company", "CTO", "enterprise", "org", "team", "adoption", "strategy", "maturity", "portfolio", "Diana Hu"
- **Project-level signals:** "project", "build", "agent", "workflow", "automate", "implement", "tool"

If ambiguous or not specified, ask:

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
