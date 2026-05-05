## STEP 1: What You Get

Display this block verbatim, then ask the confirmation question:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE WE START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Here's what you'll get when we're done:

• **Markdown report** — saved to `./specs/deep-interview-[slug].md` on your machine
• **DOCX report** — Word document version, ready to share with your team

Both include: AI readiness score, dimension breakdown, tier recommendation, strategic roadmap (company-level) or project charter (project-level), and next steps.

All files stay on your machine — nothing is uploaded or shared.
Every interview starts fresh — no carry-over from previous sessions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Then ask:

AskUserQuestion
  question: "Ready to begin?"
  header: "Begin"
  options:
    - label: "Let's begin"
    - label: "I have questions first"
  multiSelect: false

If "I have questions first" — answer their questions, then ask again until they say "Let's begin".
