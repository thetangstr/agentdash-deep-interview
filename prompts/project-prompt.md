# Project Assessment Prompt

Copy and paste this into Claude Code to start a project-level (tactical) requirements interview:

```
/deep-interview
```

Then say:

```
Run a project-level assessment for a [project type] agent — [brief description]. Company: [Company Name] ([sector], [size]).
```

## What to provide

When prompted for basic facts, have these ready:

- **Company name and website**
- **Sector** (e.g., FinTech, Healthcare, SaaS, Manufacturing)
- **Company size** (e.g., 50 employees, 500 employees, 5,000 employees)
- **Project type:**
  - Customer-facing agent (support, sales, onboarding)
  - Internal operations agent (HR, IT, finance, legal)
  - Data & research agent (analysis, reporting, market research)
  - Developer / code agent (code review, testing, DevOps)
- **Project description** — what does the agent do, what are the inputs/outputs?
- **Interview depth** (quick / standard / deep)

## What you get

- Project charter with pilot scope
- Named systems and integrations
- Success metrics with baseline and targets
- Closed-loop architecture
- 4-week pilot plan with DRI

## Example seed

```
Reduce support ticket handling time | Internal operations agent | AI agent that auto-classifies and routes Zendesk tickets to the correct team based on topic | Acme Corp (SaaS, 200 employees)
```

## Example prompts

**Customer support:**
```
Build a customer support agent that reads incoming Zendesk tickets, classifies them by topic, and routes them to the correct team queue.
```

**Internal ops:**
```
Automate the expense report approval workflow — read receipts, extract line items, check against policy, route for approval.
```

**Data & research:**
```
Build a research agent that monitors competitor pricing on their website and alerts us when they run promotions.
```

**Developer:**
```
Code review agent that reads pull requests, identifies potential bugs, security issues, and style violations, and posts comments directly.
```
