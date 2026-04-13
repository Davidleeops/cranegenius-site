# Module Manifest: index.html
## 1. Purpose
- Main marketing landing for CraneGenius, describing product pillars (signals, outreach, command center) and pointing to demos or Calendly.
- Exists to convert anonymous visitors into meetings via CTA buttons and to broadcast positioning to partners/investors.

## 2. System Role
- Served as a static page from the repo root; linked from other microsites and referenced by campaigns.
- Calls out CTA anchors (`#platform`, `#signals`, etc.) and offloads booking to external Calendly links.
- Only downstream dependency is Google Analytics 4 for tracking; no upstream data sources.

## 3. Logic Breakdown
- Pure HTML/CSS: hero block with statement + CTA, followed by cards describing “Command Center”, “Signal Grid”, etc.
- Decorative sections (signal panels, kanban, heat maps) are baked-in markup with placeholder statistics (e.g., `68 signals live`).
- No runtime JS beyond GA snippet; assumptions include: visitors have JS enabled for analytics and that numbers can remain static between site updates.

## 4. Inputs / Outputs / Side Effects
### Inputs
- None programmatic; content compiled inline.
### Outputs
- DOM content + CTA links.
### Side Effects
- Loads GA4 script which transmits pageview + metadata to Google servers.
### External Dependencies
- GA4 (`G-F8C5G2JQ8Q`), Google Fonts.

## 5. Tradeoffs
- **Benefits:** Zero build tooling; easy to tweak copy; loads fast.
- **Risks:** All metrics and testimonials are static text—high risk of drift vs real product. No localization or personalization.
- **Alternatives:** Move to CMS or Next.js page to reuse layout, or inject stats from real data sources.

## 6. Failure Modes
- GA script blocked: analytics lost silently.
- Copy drift: static numbers mislead customers when product metrics change.
- Layout assumes fonts load; fallback fonts may break aesthetic.

## 7. Senior Engineer Challenge Questions
- Where is the content governance (who updates static numbers)?
- Why is there no experiment framework or per-channel tracking for CTA buttons?
- Should we expose GA IDs publicly, or route via GTM/consent layer?

## 8. Risk Scoring
- business_criticality: 3
- complexity: 2
- coupling: 2
- test_coverage: 1
- observability: 2
- comprehensibility: 3
- change_risk: 2
- dark_code_score: 2
- refactor_priority: 3
- confidence_level: medium

## 9. Recommended Actions
- add_docs — Document ownership of marketing copy and metrics refresh cadence.
- add_tests — Snapshot or visual regression tests for hero sections to catch accidental edits.
- refactor — Consider templating/partial system to avoid repeated inline CSS across microsites.

## 10. Founder Brief
This is the public face of CraneGenius; it currently shows hard-coded stats and runs GA only. If the story changes, no automation keeps it honest, so marketing claims can drift from reality and erode trust. Treat it as a living asset with an owner and update cadence, or move to a managed content system.
