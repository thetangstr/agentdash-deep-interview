## STEP 5: Interview Depth

AskUserQuestion
  question: "How thorough should we be?\n\nThe interview exits early once clarity threshold is met (ambiguity ≤ 0.2). Depth controls how long we keep going if it's not converging."
  header: "Interview Depth"
  options:
    - label: "Lightning (~10 min)"
      description: "Fast check — caps at 5 rounds, warns if not clear. For early-stage ideas."
    - label: "Standard (~30 min, default)"
      description: "Balanced — caps at 20 rounds, warns at round 10 if not clear. Right for most assessments."
    - label: "Deep (~60 min)"
      description: "Maximum depth — up to 40 rounds. For complex, multi-system, high-stakes assessments."
  multiSelect: false

Record the selected depth label (quick | standard | deep). Default to "standard".
