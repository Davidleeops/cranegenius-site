# Folder Summary: marketing-intake
## Role
Public-facing marketing copy, campaign microsites, and the lone intake workflow that feeds the "Operator Track" sales funnel. These files set messaging, capture leads, and embed tracking pixels for attribution.

## Key Files and Modules
- `index.html`: flagship landing page describing CraneGenius positioning and CTA buttons.
- `for-gcs.html`: targeted landing for general contractors/developers with embedded Formspree collection.
- `capexlayer/index.html`: co-branded CapexLayer microsite.
- `operator-track-intake.html`: two-stage qualification flow before sending data to Formspree.
- `newsletter/*.html`: static archives for the monthly intelligence brief (index + ES/PT translations).

## Main Data Flows
- All pages load Google Analytics 4; operator intake additionally loads Microsoft Clarity + RB2B pixels.
- Intake form posts directly to Formspree (`/f/mgoldjjb`) with hidden fields capturing Stage 1 answers; no internal persistence.
- No server-side rendering—everything is static HTML styled with inline CSS.

## Dependencies
- External: Google Fonts, GA4, Clarity, RB2B script, Formspree HTTPS endpoint, Calendly links.
- Internal: None of the pages consume repo data, but operator intake shares CTA destinations with other folders.

## Top Risks
- **PII exposure:** Intake form transmits details about fleet size/revenue without encryption assurances or privacy notice.
- **Client-side gating:** Eligibility logic runs entirely in the browser; qualified leads can be rejected due to JS errors.
- **Tracking-only scripts:** Analytics IDs are hard-coded; no consent flow or environment toggles.

## Darkest Areas
- `operator-track-intake.html` due to multi-script dependencies and hidden gating logic.
- `for-gcs.html` because it duplicates intake behavior without shared validation.

## Open Questions
- Where are Formspree submissions stored/triaged after receipt?
- Who monitors Clarity/RB2B projects and updates IDs/keys?
- Is there an alternate channel when the gating script fails or is disabled?
