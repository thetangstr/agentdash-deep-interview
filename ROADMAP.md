# AgentDash Assess Skill — Roadmap

## Overview

This skill delivers forward-deployed consulting engagements for AI agent adoption readiness. Each assessment requires pandoc and produces a crystallized spec plus stakeholder-ready DOCX through the user's active runtime: OMC for Claude Code or OMX for Codex.

## Current Status

**Maturity:** v1.0 — Functional, used for pilot engagements
**Active Issues:** See [GitHub Issues](https://github.com/thetangstr/agentdash-assess-skill/issues)

---

## Backlog

### Phase 1: Foundation (Current)

- [x] Core skill structure (SKILL.md, README.md, Dockerfile)
- [x] Consultant frameworks (knowledge.md)
- [x] Report templates (strategy.md)
- [x] Client engagement infrastructure (clients/, engagements.json, .gitignore)
- [x] Sample anonymized assessment (clients/examples/)
- [x] Consultant quick-start guide (CONSULTANT_GUIDE.md)
- [ ] Issue #1: Client feedback loop tracking
- [ ] Issue #2: Assessment versioning and comparison

### Phase 2: Vertical Expansion

- [ ] Issue #3: Multi-industry vertical templates
- [ ] Issue #4: Automated assessment quality scoring

### Phase 3: Scale

- [ ] Issue #5: Onboard first 5 pilot clients
- [ ] Create case study templates (anonymized)
- [ ] Build reusable prompt library for common industries

---

## Skill Pipeline

```
agentic-readiness → deep-interview → markdown/json artifacts → DOCX
```

After the assessment crystallizes, the skill exports the deliverable and stops.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -am 'Add some feature'`
4. Push: `git push origin feature/your-feature`
5. Open a PR

---

## Version History

### v1.0 (2026-05-04)
- Initial release with 6-phase pipeline
- Company-level and project-level assessment support
- Closed-loop architecture probing
- Agent tier classification
- DOCX export via pandoc
