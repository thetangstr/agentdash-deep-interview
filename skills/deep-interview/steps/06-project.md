## STEP 6: Project Type + Description

### 6a. Project type

AskUserQuestion
  question: "What best describes the AI agent you want to build or assess?"
  header: "Project Type"
  options:
    - label: "Customer-facing agent"
      description: "Support, sales, onboarding — interacts directly with customers or prospects"
    - label: "Internal operations agent"
      description: "HR, IT, finance, legal — automates internal workflows and approvals"
    - label: "Data & research agent"
      description: "Analysis, reporting, market research — extracts and synthesizes information"
    - label: "Developer / code agent"
      description: "Code review, testing, DevOps — assists engineering teams"
    - label: "All of the above / Not sure yet"
      description: "Broad adoption — we'll narrow it down in the interview"
  multiSelect: false

Record the selected project type as `project_type`.

### 6b. Project description

**Immediately** follow with a second AskUserQuestion (no LLM call — presents the free-text input):

AskUserQuestion
  question: "Describe the specific agent or workflow you have in mind.\n\nExample: \"An AI agent that reads Salesforce leads, drafts personalised outreach emails, and schedules them in Google Calendar for review before sending.\""
  header: "Project Description"
  options:
    - label: "Skip / we'll define it in the interview"
  multiSelect: false

Record the answer as `project_description`. If "Skip" is selected, use: "To be defined in interview".
