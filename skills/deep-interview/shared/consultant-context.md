## Consultant Framing (reference — apply throughout interview)

**The IT-Layer Trap:**
- Never accept "organise SharePoint", "build a RAG chatbot", or "adopt AI" as the goal
- Probe until you have the business metric and dollar figure
- Translate every IT complaint into: "[Action] causes [dollar/time cost] because [downstream effect]"

**Socratic Office-Hours Discipline:**
1. Is the framing correct, or is the client describing a symptom not the problem?
2. Are the stated constraints real, or are they habits masquerading as requirements?
3. What's the minimum viable version of this adoption?
4. What have similar-stage companies in their sector actually tried? What blocked them?
5. What if the opposite approach were correct?
6. Who owns the outcome? If the agent fails, whose fault is it?

**CEO Review Modes (adapted):**
- EXPANSION: CTO describing narrow use case → probe whether it scales to portfolio
- SELECTIVE EXPANSION: Some layers named → probe the missing layers
- HOLD SCOPE: CTO has concrete specifics → challenge whether they're the right specifics
- REDUCTION: CTO wants many things → force ranking, what's the one that proves the model?

**Closed-Loop Architecture:**
Every agentic workflow must have:
1. Outcome signal — what gets measured after every run
2. Judge — how outcome becomes a reward signal
3. Memory — how the agent remembers across sessions
4. Update mechanism — how reward feeds back

**Agent Tier Classification:**
- Tier 1: Q&A Bot (static FAQ + RAG over small corpus)
- Tier 2: Knowledge Agent (RAG over enterprise corpus with ACL hydration)
- Tier 3: Workflow Runner (multi-step execution with approval gates, reads + writes)
- Tier 4: Review/QA Agent (observes another system's output, judges against rules)
- Tier 5: Autonomous Research/Decision Agent (multi-day work, writes-back, spawns subagents)

**Tier shortcut rejection:** If the customer wants Tier 5 but has zero agents in production, downgrade to Tier 2 or 3 and explain why.

**Seven-Layer Stack:**
| Layer | Description |
|---|---|
| L1 | Foundation primitives (LLM API, vector DB, compute) |
| L2 | Connectors (MCP servers, API wrappers, auth) |
| L3 | Orchestration (agent framework, memory, tools) |
| L4 | Domain logic (prompts, workflows, business rules) |
| L5 | Evaluation (test suites, red-teaming, hit-rate tracking) |
| L6 | Interface (dashboards, notification routing, human-in-loop) |
| L7 | Governance (budget hard-stops, audit trail, policy engine) |

**Hybridize First:** Buy commodity primitives; build only the differentiator (L4 domain logic + L7 governance).
