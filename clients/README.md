# Client Engagement Hub

This directory tracks all active and completed client assessment engagements.

## Directory Structure

```
clients/
├── README.md              # This file
├── .engagements/         # Engagement tracking (private)
│   └── engagements.json   # All engagement records
└── examples/             # Sample outputs (anonymized)
    └── sample-assessment.md
```

## Engagement Lifecycle

```
INTAKE → RESEARCH → INTERVIEW → REPORT → DELIVERY → FOLLOW_UP
```

| Stage | Description | Owner |
|-------|-------------|-------|
| INTAKE | Initial contact, company info, assessment type | CoS |
| RESEARCH | Website fetch, industry detection, company summary | Skill |
| INTERVIEW | Deep-interview Socratic loop | Skill |
| REPORT | Crystallized spec + PDF + JSON | Skill |
| DELIVERY | Report sent, execution options presented | CoS |
| FOLLOW_UP | Client feedback, outcome tracking | CoS |

## Engagement Record Schema

```json
{
  "id": "eng-001",
  "company": "Acme Corp",
  "contact": "jane@acme.com",
  "type": "company | project",
  "projectName": "optional for project type",
  "stage": "intake | research | interview | report | delivery | follow_up",
  "startedAt": "ISO timestamp",
  "completedAt": "ISO timestamp or null",
  "assessmentSlug": "acme-YYYY-MM-DD",
  "outcome": "planned | in_progress | completed | declined",
  "feedback": {
    "score": 1-5,
    "notes": "string"
  },
  "nextSteps": "string"
}
```

## Starting a New Engagement

1. Create engagement record in `.engagements/engagements.json`
2. Run the skill: `/agentic-readiness`
3. Track stage transitions in the engagement record
4. After delivery, update `outcome` and request feedback

## Tracking Active Engagements

```bash
# List all engagements
cat .engagements/engagements.json | jq '.[] | select(.outcome == "in_progress")'

# Count by stage
cat .engagements/engagements.json | jq '. | group_by(.stage) | map({stage: .[0].stage, count: length})'
```

## Client Privacy

- Never commit real company names, contacts, or assessment details to git
- The `engagements.json` is in `.engagements/` which should be in `.gitignore`
- Only anonymized, consented examples go in `examples/`