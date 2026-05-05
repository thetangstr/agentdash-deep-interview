/**
 * present.js — HTML slideshow generator from a crystallised spec.
 *
 * Generates a self-contained HTML presentation from the spec markdown.
 * 8 slides: Cover, Opportunity, Maturity, Tier, Gap, Pilot, Roadmap, CTA.
 *
 * Usage:
 *   deep-interview present --session-id <id> --output-dir ./specs
 *   deep-interview present --spec-path ./specs/deep-interview-xxx.md --output-dir ./specs
 */

import { readFileSync } from 'fs';
import { loadSession, loadLatestSession } from './state.js';
import { specPath } from './output.js';

/**
 * Parse a spec markdown file and extract key sections.
 * Returns an object with extracted content.
 */
function parseSpec(specMarkdown) {
  const sections = {};

  // Split on ## headings
  const parts = specMarkdown.split(/^##\s+/m);
  for (const part of parts) {
    const lines = part.split('\n');
    const heading = lines[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    sections[heading] = lines.slice(1).join('\n').trim();
  }

  return sections;
}

/**
 * Extract text content from a markdown section (strip markdown syntax).
 */
function stripMarkdown(md) {
  return md
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '$1. ')
    .replace(/\|/g, ' | ')
    .replace(/^\s*[-—]+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Truncate text to a max number of words.
 */
function truncate(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

/**
 * Build the HTML for the maturity level indicator.
 */
function maturityLevelHTML(currentLevel, maxLevel = 5) {
  const levels = [
    { n: 1, name: 'Unregulated Chatbots', desc: 'Copy-paste AI, no governance' },
    { n: 2, name: 'Claude Code & Internal Workflows', desc: 'Structured AI-assisted development' },
    { n: 3, name: 'Open-Loop Agents', desc: 'Autonomous action, no feedback loop' },
    { n: 4, name: 'Closed-Loop Self-Learning', desc: 'Agents improve from outcomes' },
    { n: 5, name: 'Ubiquitous Agent Workforce', desc: '>80% tasks handled by agents' },
  ];

  const dots = levels.map(l => {
    const active = l.n <= currentLevel;
    const current = l.n === currentLevel;
    const cls = current ? 'dot current' : active ? 'dot active' : 'dot';
    return `<div class="${cls}" title="${l.name}: ${l.desc}">
      <div class="dot-inner"></div>
      <div class="dot-label">L${l.n}</div>
    </div>`;
  }).join('');

  const current = levels.find(l => l.n === currentLevel) || levels[0];

  return `
  <div class="maturity-track">
    <div class="maturity-dots">${dots}</div>
    <div class="maturity-line"></div>
  </div>
  <div class="maturity-current">
    <div class="maturity-badge">Level ${current.n}</div>
    <div class="maturity-name">${current.name}</div>
    <div class="maturity-desc">${current.desc}</div>
  </div>`;
}

/**
 * Generate the full HTML presentation.
 */
function generateHTML({ companyName, specMarkdown, sections, slug }) {
  // Extract content
  const problemStatement = stripMarkdown(sections['problem_statement'] || sections['executive_summary'] || '');
  const executiveSummary = stripMarkdown(sections['executive_summary'] || '');
  const aiMaturity = stripMarkdown(sections['ai_adoption_maturity___current_state'] || '');
  const tierSection = stripMarkdown(sections['tier_recommendation'] || '');
  const layerSection = stripMarkdown(sections['layer_inflection_exposure'] || '');
  const pilotSection = stripMarkdown(sections['pilot_scope'] || '');
  const roadmap = stripMarkdown(sections['strategic_roadmap'] || '');
  const blockers = stripMarkdown(sections['key_blockers_identified'] || '');
  const orgReadiness = stripMarkdown(sections['org_readiness_breakdown'] || '');

  // Company name from slug or seed
  const company = companyName || slug.replace(/deep_interview_/g, '').replace(/_/g, ' ').replace(/-/g, ' ');
  const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  // Estimate current maturity level from content
  const maturityLevel = 2; // default; model should ideally pass this in

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Adoption Readiness — ${company}</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --surface2: #1a1a24;
      --border: #2a2a3a;
      --accent: #00d4aa;
      --accent2: #7c3aed;
      --text: #e8e8f0;
      --text-dim: #8888a0;
      --green: #22c55e;
      --yellow: #eab308;
      --red: #ef4444;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      height: 100vh;
      overflow: hidden;
    }

    .deck {
      width: 100vw;
      height: 100vh;
      position: relative;
    }

    .slide {
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      padding: 64px 80px;
      background: var(--bg);
      overflow: hidden;
    }

    .slide.active { display: flex; }

    .slide-num {
      position: absolute;
      bottom: 32px;
      right: 48px;
      font-size: 13px;
      color: var(--text-dim);
      letter-spacing: 0.05em;
    }

    .logo {
      position: absolute;
      top: 32px;
      right: 48px;
      font-size: 13px;
      color: var(--accent);
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    /* Slide 1: Cover */
    .slide-cover {
      justify-content: center;
      align-items: flex-start;
    }

    .slide-cover::before {
      content: '';
      position: absolute;
      top: -200px;
      right: -200px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .cover-eyebrow {
      font-size: 13px;
      letter-spacing: 0.15em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 24px;
      font-weight: 600;
    }

    .cover-title {
      font-size: 56px;
      font-weight: 700;
      line-height: 1.1;
      max-width: 800px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #fff 0%, #8888a0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-company {
      font-size: 28px;
      color: var(--accent);
      margin-bottom: 40px;
      font-weight: 600;
    }

    .cover-meta {
      font-size: 14px;
      color: var(--text-dim);
    }

    .cover-meta span {
      margin-right: 24px;
    }

    /* Slide 2: Opportunity */
    .slide-opportunity .section-label {
      font-size: 12px;
      letter-spacing: 0.15em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 32px;
      font-weight: 600;
    }

    .slide-opportunity h2 {
      font-size: 40px;
      font-weight: 700;
      margin-bottom: 32px;
      max-width: 900px;
      line-height: 1.2;
    }

    .opportunity-body {
      font-size: 20px;
      line-height: 1.7;
      color: var(--text-dim);
      max-width: 800px;
    }

    .opportunity-stat {
      display: inline-block;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px 32px;
      margin-top: 32px;
    }

    .opportunity-stat .stat-num {
      font-size: 48px;
      font-weight: 700;
      color: var(--accent);
    }

    .opportunity-stat .stat-label {
      font-size: 14px;
      color: var(--text-dim);
      margin-top: 4px;
    }

    /* Slide 3: Maturity */
    .maturity-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      flex: 1;
      align-items: center;
    }

    .maturity-track {
      position: relative;
      padding: 32px 0;
    }

    .maturity-dots {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .maturity-line {
      position: absolute;
      top: calc(32px + 20px);
      left: 32px;
      right: 32px;
      height: 2px;
      background: var(--border);
      z-index: 0;
    }

    .dot {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .dot-inner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--border);
      background: var(--surface);
      transition: all 0.3s;
    }

    .dot.active .dot-inner {
      border-color: var(--accent);
      background: rgba(0, 212, 170, 0.15);
    }

    .dot.current .dot-inner {
      border-color: var(--accent);
      background: var(--accent);
      box-shadow: 0 0 20px rgba(0, 212, 170, 0.4);
    }

    .dot-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-dim);
    }

    .dot.active .dot-label { color: var(--text); }
    .dot.current .dot-label { color: var(--accent); }

    .maturity-current {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .maturity-badge {
      display: inline-block;
      background: rgba(0, 212, 170, 0.15);
      border: 1px solid var(--accent);
      color: var(--accent);
      font-size: 13px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 4px;
      width: fit-content;
    }

    .maturity-name {
      font-size: 32px;
      font-weight: 700;
    }

    .maturity-desc {
      font-size: 16px;
      color: var(--text-dim);
      line-height: 1.5;
    }

    .level-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .level-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 14px;
    }

    .level-item.active {
      border-color: var(--accent);
      background: rgba(0, 212, 170, 0.08);
    }

    .level-item .level-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text-dim);
      flex-shrink: 0;
    }

    .level-item.active .level-num {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg);
    }

    /* Slide 4: Tier */
    .tier-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-top: 32px;
    }

    .tier-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tier-card.recommended {
      border-color: var(--accent);
      background: rgba(0, 212, 170, 0.08);
    }

    .tier-card.recommended::before {
      content: 'RECOMMENDED';
      font-size: 10px;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: 0.1em;
    }

    .tier-card .tier-num {
      font-size: 24px;
      font-weight: 700;
      color: var(--accent2);
    }

    .tier-card .tier-name {
      font-size: 14px;
      font-weight: 600;
    }

    .tier-card .tier-cost,
    .tier-card .tier-duration,
    .tier-card .tier-metric {
      font-size: 11px;
      color: var(--text-dim);
    }

    .tier-card .tier-cost span,
    .tier-card .tier-duration span,
    .tier-card .tier-metric span {
      color: var(--text);
      font-weight: 600;
    }

    /* Slide 5: Gap / Layers */
    .layers-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      font-size: 14px;
    }

    .layers-table th {
      text-align: left;
      padding: 10px 16px;
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--text-dim);
      text-transform: uppercase;
      border-bottom: 1px solid var(--border);
    }

    .layers-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    .layers-table tr:last-child td { border-bottom: none; }

    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .status-confirmed { background: rgba(34, 197, 94, 0.15); color: var(--green); }
    .status-missing { background: rgba(239, 68, 68, 0.15); color: var(--red); }
    .status-buy { background: rgba(0, 212, 170, 0.15); color: var(--accent); }
    .status-wait { background: rgba(234, 179, 8, 0.15); color: var(--yellow); }
    .status-skip { background: rgba(136, 136, 160, 0.15); color: var(--text-dim); }

    /* Slide 6: Pilot */
    .pilot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-top: 32px;
    }

    .pilot-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px;
    }

    .pilot-box h3 {
      font-size: 13px;
      letter-spacing: 0.1em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .pilot-box p, .pilot-box li {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-dim);
    }

    .pilot-box ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pilot-box li::before {
      content: '→ ';
      color: var(--accent);
    }

    .pilot-timeline {
      margin-top: 24px;
      display: flex;
      gap: 0;
    }

    .timeline-week {
      flex: 1;
      padding: 16px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-right: 8px;
      font-size: 13px;
    }

    .timeline-week:last-child { margin-right: 0; }

    .timeline-week strong {
      display: block;
      color: var(--accent);
      margin-bottom: 4px;
      font-size: 11px;
      letter-spacing: 0.05em;
    }

    /* Slide 7: Roadmap */
    .roadmap-phases {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 32px;
    }

    .roadmap-phase {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
    }

    .roadmap-phase .phase-tag {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent2);
      margin-bottom: 12px;
    }

    .roadmap-phase h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .roadmap-phase ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .roadmap-phase li {
      font-size: 14px;
      color: var(--text-dim);
      padding-left: 16px;
      position: relative;
    }

    .roadmap-phase li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--accent);
    }

    /* Slide 8: CTA */
    .slide-cta {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .slide-cta::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.1) 0%, transparent 60%);
      pointer-events: none;
    }

    .cta-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 24px;
      max-width: 700px;
      line-height: 1.15;
    }

    .cta-body {
      font-size: 18px;
      color: var(--text-dim);
      max-width: 560px;
      line-height: 1.7;
      margin-bottom: 48px;
    }

    .cta-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
    }

    .cta-btn {
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .cta-btn-primary {
      background: var(--accent);
      color: var(--bg);
    }

    .cta-btn-primary:hover {
      background: #00e8bb;
      transform: translateY(-1px);
    }

    .cta-btn-secondary {
      background: var(--surface2);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .cta-btn-secondary:hover {
      border-color: var(--accent);
    }

    .cta-benefits {
      display: flex;
      gap: 32px;
      justify-content: center;
    }

    .cta-benefit {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-dim);
    }

    .cta-benefit::before {
      content: '✓';
      color: var(--accent);
      font-weight: 700;
    }

    /* Nav */
    .nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
    }

    .nav-prev, .nav-next {
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .nav-prev:hover, .nav-next:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .nav-dots {
      display: flex;
      gap: 6px;
    }

    .nav-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border);
      cursor: pointer;
      transition: all 0.15s;
    }

    .nav-dot.active {
      background: var(--accent);
      width: 24px;
      border-radius: 4px;
    }

    /* Section label */
    .section-label {
      font-size: 12px;
      letter-spacing: 0.15em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 24px;
      font-weight: 600;
    }

    .slide-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .slide-subtitle {
      font-size: 18px;
      color: var(--text-dim);
      margin-bottom: 32px;
    }

    /* Blockers */
    .blockers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .blocker-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--red);
      border-radius: 0 6px 6px 0;
      padding: 16px 20px;
      font-size: 15px;
      color: var(--text-dim);
    }

    /* Org readiness */
    .readiness-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
    }

    .readiness-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
    }

    .readiness-item h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }

    .readiness-item p {
      font-size: 13px;
      color: var(--text-dim);
      line-height: 1.5;
    }

    /* Print */
    @media print {
      body { background: white; color: black; }
      .nav { display: none; }
      .slide { position: relative; display: flex !important; page-break-after: always; height: auto; min-height: 100vh; }
    }
  </style>
</head>
<body>

<div class="deck" id="deck">

  <!-- Slide 1: Cover -->
  <div class="slide slide-cover active" data-slide="1">
    <div class="logo">AgentDash</div>
    <div>
      <div class="cover-eyebrow">AI Adoption Readiness Assessment</div>
      <div class="cover-title">Is Your Organisation Ready for AI Agents?</div>
      <div class="cover-company">${company}</div>
      <div class="cover-meta">
        <span>${date}</span>
        <span>Strategic Assessment</span>
      </div>
    </div>
    <div class="slide-num">1 / 8</div>
  </div>

  <!-- Slide 2: The Opportunity -->
  <div class="slide slide-opportunity" data-slide="2">
    <div class="logo">AgentDash</div>
    <div class="section-label">The Problem</div>
    <h2>${truncate(problemStatement || executiveSummary, 60) || 'Every organisation is evaluating AI adoption — but most are moving without a clear map.'}</h2>
    <div class="opportunity-body">
      <p>${truncate(problemStatement || executiveSummary, 150) || 'The gap between organisations experimenting with AI and those systematically deploying agents at scale is growing. The difference is not technology — it\'s readiness.'}</p>
    </div>
    ${blockers ? `<div class="blockers-list">${blockers.split('\n').filter(l => l.trim()).slice(0, 3).map(b => `<div class="blocker-item">${b}</div>`).join('')}</div>` : ''}
    <div class="slide-num">2 / 8</div>
  </div>

  <!-- Slide 3: Where You Are (Maturity) -->
  <div class="slide slide-maturity" data-slide="3">
    <div class="logo">AgentDash</div>
    <div class="section-label">Current State</div>
    <h2 class="slide-title">Where Does Your Organisation Sit?</h2>
    <p class="slide-subtitle">The Five Levels of AI Adoption</p>
    <div class="maturity-grid">
      <div>
        ${maturityLevelHTML(maturityLevel)}
      </div>
      <div>
        <div class="level-list">
          <div class="level-item ${maturityLevel >= 1 ? 'active' : ''}">
            <div class="level-num">1</div>
            <div>Unregulated Chatbots — copy-paste AI, no governance</div>
          </div>
          <div class="level-item ${maturityLevel >= 2 ? 'active' : ''}">
            <div class="level-num">2</div>
            <div>Claude Code & Internal Workflows — structured AI-assisted development</div>
          </div>
          <div class="level-item ${maturityLevel >= 3 ? 'active' : ''}">
            <div class="level-num">3</div>
            <div>Open-Loop Agents — autonomous action, no feedback loop</div>
          </div>
          <div class="level-item ${maturityLevel >= 4 ? 'active' : ''}">
            <div class="level-num">4</div>
            <div>Closed-Loop Self-Learning — agents improve from outcomes</div>
          </div>
          <div class="level-item ${maturityLevel >= 5 ? 'active' : ''}">
            <div class="level-num">5</div>
            <div>Ubiquitous Agent Workforce — >80% tasks handled by agents</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-num">3 / 8</div>
  </div>

  <!-- Slide 4: The Tier That Fits -->
  <div class="slide slide-tier" data-slide="4">
    <div class="logo">AgentDash</div>
    <div class="section-label">Starting Point</div>
    <h2 class="slide-title">Which Agent Tier Is Right for You?</h2>
    <p class="slide-subtitle">Build cost, pilot duration, and success metric by tier</p>
    <div class="tier-grid">
      <div class="tier-card">
        <div class="tier-num">T1</div>
        <div class="tier-name">Q&amp;A Bot</div>
        <div class="tier-cost">Build: <span>£5–15k</span></div>
        <div class="tier-duration">Pilot: <span>2–4 wks</span></div>
        <div class="tier-metric">Metric: <span>Ticket reduction</span></div>
      </div>
      <div class="tier-card">
        <div class="tier-num">T2</div>
        <div class="tier-name">Knowledge Agent</div>
        <div class="tier-cost">Build: <span>£15–50k</span></div>
        <div class="tier-duration">Pilot: <span>4–8 wks</span></div>
        <div class="tier-metric">Metric: <span>Weekly adoption</span></div>
      </div>
      <div class="tier-card recommended">
        <div class="tier-num">T3</div>
        <div class="tier-name">Workflow Runner</div>
        <div class="tier-cost">Build: <span>£50–150k</span></div>
        <div class="tier-duration">Pilot: <span>6–12 wks</span></div>
        <div class="tier-metric">Metric: <span>Time saved/run</span></div>
      </div>
      <div class="tier-card">
        <div class="tier-num">T4</div>
        <div class="tier-name">Review/QA Agent</div>
        <div class="tier-cost">Build: <span>£30–100k</span></div>
        <div class="tier-duration">Pilot: <span>6–10 wks</span></div>
        <div class="tier-metric">Metric: <span>Catch rate</span></div>
      </div>
      <div class="tier-card">
        <div class="tier-num">T5</div>
        <div class="tier-name">Autonomous Research</div>
        <div class="tier-cost">Build: <span>£150k+</span></div>
        <div class="tier-duration">Pilot: <span>12–24 wks</span></div>
        <div class="tier-metric">Metric: <span>Decision quality</span></div>
      </div>
    </div>
    <div class="slide-num">4 / 8</div>
  </div>

  <!-- Slide 5: The Gap (Layers) -->
  <div class="slide slide-gap" data-slide="5">
    <div class="logo">AgentDash</div>
    <div class="section-label">Technical Gap</div>
    <h2 class="slide-title">The Agent Factory Layers</h2>
    <p class="slide-subtitle">Where you want to go vs. what you have today</p>
    <table class="layers-table">
      <thead>
        <tr>
          <th>Layer</th>
          <th>What It Is</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>L1</strong> Inference</td>
          <td>Model serving (vLLM, Azure, AWS Bedrock)</td>
          <td><span class="status-badge status-missing">MISSING</span></td>
          <td><span class="status-badge status-buy">BUY</span></td>
        </tr>
        <tr>
          <td><strong>L2</strong> Agent Primitives</td>
          <td>Tool calling, memory, planning patterns</td>
          <td><span class="status-badge status-missing">MISSING</span></td>
          <td><span class="status-badge status-buy">BUY</span></td>
        </tr>
        <tr>
          <td><strong>L3</strong> Orchestration</td>
          <td>Durable workflows, replay, failure recovery</td>
          <td><span class="status-badge status-missing">MISSING</span></td>
          <td><span class="status-badge status-buy">BUY</span></td>
        </tr>
        <tr>
          <td><strong>L4</strong> Protocol (MCP)</td>
          <td>MCP servers, agent-to-agent communication</td>
          <td><span class="status-badge status-missing">MISSING</span></td>
          <td><span class="status-badge status-buy">BUY</span></td>
        </tr>
        <tr>
          <td><strong>L5</strong> Workspace</td>
          <td>IDE, app builder, deployment environments</td>
          <td><span class="status-badge status-missing">MISSING</span></td>
          <td><span class="status-badge status-wait">BUILD</span></td>
        </tr>
        <tr>
          <td><strong>L6</strong> Control Plane</td>
          <td>Governance, audit, cost attribution, policy</td>
          <td><span class="status-badge status-missing">MISSING</span></td>
          <td><span class="status-badge status-wait">BUILD</span></td>
        </tr>
        <tr>
          <td><strong>L7</strong> Trust &amp; Safety</td>
          <td>Guardrails, compliance</td>
          <td><span class="status-badge status-confirmed">DEBUNKED</span></td>
          <td><span class="status-badge status-skip">SKIP</span></td>
        </tr>
      </tbody>
    </table>
    <div class="slide-num">5 / 8</div>
  </div>

  <!-- Slide 6: Your First Pilot -->
  <div class="slide slide-pilot" data-slide="6">
    <div class="logo">AgentDash</div>
    <div class="section-label">First 4 Weeks</div>
    <h2 class="slide-title">Your First Pilot</h2>
    <p class="slide-subtitle">${truncate(pilotSection || 'A scoped, measurable first deployment.', 40)}</p>
    <div class="pilot-grid">
      <div class="pilot-box">
        <h3>What Ships</h3>
        <ul>
          <li>Named workflow agent in production</li>
          <li>Human approval gate before live data</li>
          <li>Measurement instrumentation in place</li>
          <li>DRI assigned and accountable</li>
        </ul>
      </div>
      <div class="pilot-box">
        <h3>Success Criteria</h3>
        <ul>
          <li>Agent runs X times per week</li>
          <li>Error rate below Y%</li>
          <li>Time saved: Z hours/week</li>
          <li>User satisfaction score: W/10</li>
        </ul>
      </div>
    </div>
    <div class="pilot-timeline">
      <div class="timeline-week"><strong>Week 1</strong>L1/L2 setup, data audit</div>
      <div class="timeline-week"><strong>Week 2</strong>Agent build + first test run</div>
      <div class="timeline-week"><strong>Week 3</strong>Closed-loop wiring, human review</div>
      <div class="timeline-week"><strong>Week 4</strong>Live production, baseline set</div>
    </div>
    <div class="slide-num">6 / 8</div>
  </div>

  <!-- Slide 7: Path Forward -->
  <div class="slide slide-roadmap" data-slide="7">
    <div class="logo">AgentDash</div>
    <div class="section-label">Strategic Roadmap</div>
    <h2 class="slide-title">The Path to Scale</h2>
    <p class="slide-subtitle">Three phases from pilot to agent workforce</p>
    <div class="roadmap-phases">
      <div class="roadmap-phase">
        <div class="phase-tag">Phase 1</div>
        <h3>Foundation (Weeks 1–4)</h3>
        <ul>
          <li>L1/L2/L3 infrastructure</li>
          <li>Data quality audit</li>
          <li>First pilot agent deployed</li>
          <li>Baseline metrics established</li>
        </ul>
      </div>
      <div class="roadmap-phase">
        <div class="phase-tag">Phase 2</div>
        <h3>Pilot (Weeks 5–12)</h3>
        <ul>
          <li>Expand to 3–5 agents</li>
          <li>Closed-loop wiring</li>
          <li>L4/L5 MCP integration</li>
          <li>Governance framework defined</li>
        </ul>
      </div>
      <div class="roadmap-phase">
        <div class="phase-tag">Phase 3</div>
        <h3>Scale (Months 4–6)</h3>
        <ul>
          <li>L6 Control Plane live</li>
          <li>Agent portfolio: 10+ agents</li>
          <li>AI team headcount: 2–5 FTEs</li>
          <li>Measurable ROI reported</li>
        </ul>
      </div>
    </div>
    <div class="slide-num">7 / 8</div>
  </div>

  <!-- Slide 8: Why AgentDash -->
  <div class="slide slide-cta" data-slide="8">
    <div class="logo">AgentDash</div>
    <div class="cta-title">Here's What It Takes to Get to the Next Level</div>
    <div class="cta-body">
      Moving from Level 2 to Level 3 — deploying your first open-loop agents — requires a different skill set than building internal tools. AgentDash gives your team the platform, playbook, and expert guidance to make that move without the common failure modes.
    </div>
    <div class="cta-actions">
      <a href="https://agentdash.ai" class="cta-btn cta-btn-primary">Start with AgentDash</a>
      <button class="cta-btn cta-btn-secondary" onclick="window.print()">Download PDF</button>
    </div>
    <div class="cta-benefits">
      <div class="cta-benefit">No vendor lock-in</div>
      <div class="cta-benefit">Week-1 kickoff available</div>
      <div class="cta-benefit">Existing tool integration</div>
    </div>
    <div class="slide-num">8 / 8</div>
  </div>

</div>

<!-- Navigation -->
<div class="nav">
  <button class="nav-prev" onclick="prevSlide()">← Prev</button>
  <div class="nav-dots" id="dots"></div>
  <button class="nav-next" onclick="nextSlide()">Next →</button>
</div>

<script>
  const TOTAL = 8;
  let current = 1;

  function show(n) {
    if (n < 1 || n > TOTAL) return;
    current = n;
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-slide="' + n + '"]').classList.add('active');
    document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === n - 1));
  }

  function nextSlide() { show(current + 1); }
  function prevSlide() { show(current - 1); }

  function goTo(n) { show(n); }

  // Build dots
  const dotsEl = document.getElementById('dots');
  for (let i = 1; i <= TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'nav-dot' + (i === 1 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
  }

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); nextSlide(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevSlide(); }
    if (e.key === 'Home') show(1);
    if (e.key === 'End') show(TOTAL);
  });

  // Touch swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide(); }
  });
</script>

</body>
</html>`;
}

/**
 * Generate presentation from a session state object or spec path.
 * @param {object} options
 * @param {string} [options.sessionId]
 * @param {string} [options.specPath]
 * @param {string} [options.outputDir]
 * @returns {string} output file path
 */
export async function generatePresentation({ sessionId = null, specPath = null, outputDir = './specs' }) {
  let specMarkdown = '';
  let slug = 'presentation';
  let companyName = '';

  if (specPath) {
    specMarkdown = readFileSync(specPath, 'utf8');
    slug = specPath.replace(/\\/g, '/').replace(/.*\//, '').replace('.md', '');
    companyName = slug.replace(/^deep[-_]?interview[-_]/i, '').replace(/[-_]/g, ' ');
  } else if (sessionId) {
    const state = loadSession(sessionId);
    if (!state) throw new Error(`Session not found: ${sessionId}`);
    slug = state.slug || 'presentation';
    // Try to read the spec file
    try {
      const { specPath: autoPath } = await import('./output.js');
      const path = autoPath(outputDir, state.slug);
      specMarkdown = readFileSync(path, 'utf8');
    } catch {
      // No spec file — use state data only
      specMarkdown = '';
    }
    // Extract company name from seed if available
    if (state.seed) {
      const match = state.seed.match(/Company:\s*(.+?)\s*\(/);
      if (match) companyName = match[1].trim();
    }
  } else {
    const state = loadLatestSession();
    if (!state) throw new Error('No session found. Run "deep-interview init" first.');
    slug = state.slug;
    try {
      const { specPath: autoPath } = await import('./output.js');
      specMarkdown = readFileSync(autoPath(outputDir, state.slug), 'utf8');
    } catch {
      specMarkdown = '';
    }
    if (state.seed) {
      const match = state.seed.match(/Company:\s*(.+?)\s*\(/);
      if (match) companyName = match[1].trim();
    }
  }

  const sections = parseSpec(specMarkdown);
  const html = generateHTML({ companyName, specMarkdown, sections, slug });

  const { writeFileSync, mkdirSync } = await import('fs');
  const path = await import('path');
  const { ensureDir } = await import('./output.js');

  const outputFile = path.resolve(outputDir, `${slug}-presentation.html`);
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, html, 'utf8');

  return outputFile;
}
