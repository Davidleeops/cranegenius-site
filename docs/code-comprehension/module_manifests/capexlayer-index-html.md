# Module Manifest: capexlayer/index.html
## 1. Purpose
- Presents the CapexLayer co-brand narrative and links into CraneGenius offerings.
- Serves as a standalone microsite for investors/partners exploring CapexLayer-powered solutions.

## 2. System Role
- Static HTML located under `/capexlayer/`; referenced by other marketing decks.
- No upstream data; downstream effect is directing traffic to Calendly or email CTAs.

## 3. Logic Breakdown
- Similar structure to root landing: hero block, cards describing "Signal Grid", "Command Center", etc.
- No dynamic JS beyond GA snippet; all content is inline.
- Uses fonts + design tokens defined at top of file; replicates styling from root page.

## 4. Inputs / Outputs / Side Effects
### Inputs
- None.
### Outputs
- CTA links to scheduling/contacts.
### Side Effects
- GA4 pageview tracking.
### External Dependencies
- Google Fonts, GA4.

## 5. Tradeoffs
- **Benefits:** Quick to deploy; ensures CapexLayer gets dedicated messaging.
- **Risks:** Duplicated CSS/copy; any rebrand requires editing multiple files. No analytics segmentation per campaign except GA event filters.
- **Alternatives:** Consolidate into templated system or Next.js to share layout + components.

## 6. Failure Modes
- Content divergence from core site (since it’s hand-copied).
- Missing CTA updates when Calendly links change.

## 7. Senior Engineer Challenge Questions
- Can marketing manage multiple microsites without a CMS?
- Why not reuse layout/styling through includes or build step?

## 8. Risk Scoring
- business_criticality: 2
- complexity: 2
- coupling: 2
- test_coverage: 1
- observability: 2
- comprehensibility: 3
- change_risk: 2
- dark_code_score: 2
- refactor_priority: 2
- confidence_level: medium

## 9. Recommended Actions
- add_docs — Document which audiences this microsite targets and who owns updates.
- refactor — Factor shared CSS/fonts into a shared file to reduce duplication.

## 10. Founder Brief
This page mirrors the main site but speaks directly to CapexLayer partners. It’s easy to forget when messaging changes; without a template system, it will drift unless someone explicitly owns it.
