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

---

## Five-Level AI Adoption Maturity Model

Companies rarely move up levels linearly — they try to skip. The interview probe identifies the current level and the gap to the target level.

| Level | Name | What It Looks Like | Business Implication |
|-------|------|-------------------|---------------------|
| **Level 1** | Unregulated Chatbots | Team members copy-pasting into ChatGPT, Grok, or Claude.ai with company data | No ROI tracking. No governance. IP risk. Shadow AI. |
| **Level 2** | Claude Code & Internal Workflows | Developers using AI to build internal tools, automations, and apps. Structured usage. | Productivity gains are real but ad hoc. Some visibility. No autonomous action. |
| **Level 3** | Open-Loop Agents | Level 2 outputs deployed as agents that run autonomously — act without human approval per run. | Scaled productivity. Emerging risk: who approves? who audits? who fixes errors? |
| **Level 4** | Closed-Loop Self-Learning | Agents with outcome signals, judges, memory, and update mechanisms. Agents improve from feedback. | High ROI. Requires governance infrastructure. Most companies are not here yet. |
| **Level 5** | Ubiquitous Agent Workforce | >80% of business questions answered by agents. Humans supervise, not execute. | Transformative. Requires full org redesign, new roles (AI supervisors, agent auditors). |

**The Skipping Trap:** Most companies attempt to jump from Level 1 to Level 5. The interview exposes this and forces a conversation about what Level 3 or 4 actually requires before Level 5 is viable.

**Probe question:** "Where does your company sit on the adoption ladder — are people using AI tools individually, building with AI, deploying AI agents, or running AI feedback loops?"

---

## Agent Tier Classification (Plain-English)

Each tier is explained in terms of what it actually does, what it costs to build, and how you know it's working.

| Tier | Name | What It Does | Build Cost | Pilot Duration | Success Metric |
|------|------|-------------|------------|----------------|----------------|
| **Tier 1** | Q&A Bot | Static FAQ + RAG over a small document corpus. Answers known questions. | £5–15k | 2–4 weeks | Reduction in support tickets for covered topics |
| **Tier 2** | Knowledge Agent | RAG over enterprise corpus with ACL hydration. Knows company context. | £15–50k | 4–8 weeks | Adoption rate (% of employees using it weekly) |
| **Tier 3** | Workflow Runner | Multi-step execution with approval gates. Reads AND writes to systems. | £50–150k | 6–12 weeks | Time saved per workflow run; error rate reduction |
| **Tier 4** | Review/QA Agent | Observes another system's output, judges against rules, flags or rejects | £30–100k | 6–10 weeks | Catch rate vs. human reviewers; false positive rate |
| **Tier 5** | Autonomous Research/Decision Agent | Multi-day work, writes back, spawns subagents. Full autonomy. | £150k+ | 12–24 weeks | Decision quality vs. human baseline; ROI against替代 cost |

**Tier shortcut rejection:** If the customer wants Tier 5 but has zero agents in production, downgrade to Tier 2 or 3. Explain: "You need to learn to run before you can sprint. Tier 5 requires infrastructure that Tier 3 builds."

---

## The Agent Factory Layers (Source: AgentDash Research)

Reference: [AgentDash Research](https://washington-smoky.vercel.app/factory-layers)

This is the technical stack underlying every agentic system. Companies skip layers at their peril.

| Layer | Name | What It Is | Market Reality | BUY / WAIT / AVOID |
|-------|------|-----------|---------------|-------------------|
| **L1** | Inference | Model serving — vLLM, Fireworks, Azure OpenAI, AWS Bedrock | vLLM is OSS default for self-hosted. Fireworks: 13T tokens/day, +416% YoY ARR. | BUY — commodity, shop around |
| **L2** | Agent Primitives | Tool calling, function execution, code interpretation, memory, planning | LangChain: 135k stars, 63% of enterprises in production. Over 97M MCP downloads. | BUY — pick one framework, stick with it |
| **L3** | Orchestration | Durable multi-step workflows, replay, failure recovery, stateful long-running execution | OpenAI uses Temporal for Codex. LangGraph offers time-travel debugging. | BUY — Temporal or equivalent is the standard |
| **L4** | Protocol | MCP servers, A2A (agent-to-agent), manifest/identity schemas | MCP adopted by Google, Microsoft, AWS. 97M+ downloads. | BUY — MCP is the standard, build on it |
| **L5** | Workspace | IDE, app builder, deployment environments | Cursor: 1M+ developers, $450M ARR. No single platform owns this layer yet. | WAIT — fragmented, pick proof-of-concept tools |
| **L6** | Control Plane | Governance: policy, identity, audit, cost attribution, traffic management | Microsoft Agent 365 announced but no converged product. | WAIT — define governance now, buy later |
| **L7** | Trust & Safety | Guardrails, evaluation, compliance | Model providers own safety by default. No converged third-party market. | DEBUNKED — don't buy, rely on your provider |

**Hybridize First:** Buy commodity at L1/L2/L3/L4. Build only your differentiator at L5/L6. Do not build L7 — your model provider handles it.

---

## Diana Hu Operating Model (apply at rounds 2, 4, 6, 8+)

These four questions reveal whether AI adoption is structurally funded or a hobby:

1. **DRI & Governance:** "Who is the DRI for AI adoption? How is AI governance structured?"
2. **Funding:** "How does AI work get funded — CAPEX, OPEX, or project budgets?"
3. **Team Size:** "What's the current AI team headcount vs. ambition?"
4. **Measurement:** "How does the org measure AI success today?"
