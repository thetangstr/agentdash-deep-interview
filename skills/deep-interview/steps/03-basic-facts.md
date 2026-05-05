## STEP 3: Basic Facts — MANDATORY, do not skip

Collect company name, sector, and size. This step is mandatory — do not proceed to STEP 4 until all three fields are recorded.

### 3a. Company name + website

AskUserQuestion
  question: "What is the company name and website?\n\nExample: \"Acme Corp — acme.com\""
  header: "Company"
  options:
    - label: "I have the details"
      description: "I'll type it in the next step"
    - label: "Use placeholder"
      description: "Use \"Acme Corp / acme.com\" as placeholder"
  multiSelect: false

**If "I have the details":** immediately follow with a second AskUserQuestion (no LLM call):

AskUserQuestion
  question: "What is the company name and website?"
  header: "Company"
  options:
    - label: "Use placeholder instead"
  multiSelect: false

Record as `company_name` and `company_website`. If placeholder selected, use: company: "Acme Corp", website: "acme.com".

### 3b. Industry / sector

AskUserQuestion
  question: "What industry or sector is the company in?"
  header: "Sector"
  options:
    - label: "I have the details"
      description: "I'll type it in the next step"
    - label: "Use placeholder"
      description: "Use \"unknown\" as placeholder"
  multiSelect: false

**If "I have the details":** immediately follow with a second AskUserQuestion:

AskUserQuestion
  question: "What industry or sector?"
  header: "Sector"
  options:
    - label: "Use placeholder instead"
  multiSelect: false

Record as `sector`. If placeholder selected, use: "unknown".

### 3c. Approximate size

AskUserQuestion
  question: "What is the approximate size of the company? (employees or revenue range)"
  header: "Size"
  options:
    - label: "I have the details"
      description: "I'll type it in the next step"
    - label: "Use placeholder"
      description: "Use \"unknown\" as placeholder"
  multiSelect: false

**If "I have the details":** immediately follow with a second AskUserQuestion:

AskUserQuestion
  question: "What is the approximate size? (employees or revenue range)"
  header: "Size"
  options:
    - label: "Use placeholder instead"
  multiSelect: false

Record as `size`. If placeholder selected, use: "unknown".
