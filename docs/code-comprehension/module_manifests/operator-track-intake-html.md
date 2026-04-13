# Module Manifest: operator-track-intake.html
## 1. Purpose
- Two-stage gate for the "Operator Track" program that screens prospects (<3 cranes, <$2M revenue, no salesperson) before collecting full intake data.
- Ensures the self-serve tier only onboards the intended segment while routing larger firms to higher tiers.

## 2. System Role
- Serves as both marketing and qualification workflow; shared Formspree endpoint (same as `for-gcs.html`) handles submission.
- Called directly by users; only outbound calls are analytics pixels and the Formspree POST.
- Shares copy + CTA with other marketing assets but contains unique gating logic.

## 3. Logic Breakdown
- Stage 1 dropdowns gather fleet size, revenue, sales hire, and platform subscription state.
- `checkEligibility()` toggles Stage 2 visibility when answers match the strict combination (1-3 cranes, under $2M, no salesperson, not already on platform). Otherwise shows disqualification copy linking to Tier 01/02.
- Hides Stage 1 panel after qualify; stores answers into hidden inputs so Stage 2 POST carries gating context.
- Stage 2 `<form>` requires name/company/email/market/equipment/goals; `action="https://formspree.io/f/mgoldjjb"). No async JS or success handling—user stays on Formspree thank-you page.
- Scripts load GA4, Microsoft Clarity, and RB2B tracking pixel immediately on page load.

## 4. Inputs / Outputs / Side Effects
### Inputs
- Visitor-entered dropdown selections + text inputs.
### Outputs
- POST body with fields `source`, `fleet`, `revenue_band`, `sales_hire`, `platform_subscriber`, and Stage 2 answers.
### Side Effects
- Analytics beacons to GA4/Clarity/RB2B with page metadata.
### External Dependencies
- GA4, Clarity, RB2B, Formspree, Google Fonts.

## 5. Tradeoffs
- **Benefits:** Entire workflow is static; zero backend work needed and immediate feedback to users.
- **Risks:** Eligibility logic is client-side and brittle—typos or JS blockers can hide the real form. No audit trail for disqualified leads. PII sent to third-party service with no explicit consent statement.
- **Alternatives:** Move gating to backend/CRM, or use feature flags to tune thresholds without redeploy.

## 6. Failure Modes
- Formspree downtime blocks submissions with minimal UI erroring.
- Users with disabled JS never see Stage 2, effectively blocking all leads.
- Hidden field mapping can get out of sync if Stage 1 options change (no schema or unit tests).

## 7. Senior Engineer Challenge Questions
- How do we capture analytics for disqualified leads to evaluate gating accuracy?
- Are we allowed to store fleet/revenue data inside Formspree (privacy/compliance)?
- Who rotates RB2B/Clarity project IDs and ensures they’re not collecting beyond policy scope?

## 8. Risk Scoring
- business_criticality: 4
- complexity: 3
- coupling: 3
- test_coverage: 1
- observability: 2
- comprehensibility: 3
- change_risk: 4
- dark_code_score: 3
- refactor_priority: 4
- confidence_level: medium

## 9. Recommended Actions
- add_docs — Document gating criteria, owners, and fallback contact method when JS fails.
- add_instrumentation — Log both qualified/disqualified events to GA or Segment to validate funnel quality.
- refactor — Move eligibility evaluation server-side or to shared JS module with tests.
- add_tests — Browser-based smoke test that submits sample payload daily.

## 10. Founder Brief
This page is the self-serve gate for small operators. Right now it silently blocks anyone who fails a JS check or if Formspree is down, and there’s no record of who tried. Invest in measurable gating (even a Google Sheet log) or risk losing the very operators this tier targets.
