# Module Manifest: platform/index.html
## 1. Purpose
- **Fact:** Static HTML landing page located at `/platform/index.html` promoting “CraneGenius Platform — Powered by CapexLayer.”
- **Fact:** Contains only inline CSS, GA4 snippet (`G-F8C5G2JQ8Q`), and CTA buttons pointing to demo/Calendly links.
- **Inference:** Serves as the marketing funnel for visitors who drill into the platform dashboard.
## 2. System Role
- Entry point within the `/platform` namespace; linked assets (`fonts.googleapis.com`, `_next` bundles) load from this page.
- No data fetching or dynamic logic—any messaging change requires editing this file.
## 3. Logic Breakdown
- Sections: hero, platform pillars, CTA buttons; all text literals defined inline.
- Fonts loaded via `<link>` tags; GA script fires immediately.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** None programmatic.
- **Outputs:** CTA hyperlinks (`href="https://calendly.com/..."`, `href="/platform/dashboard.html"`).
- **Side effects:** GA4 pageview events; downloads Google Fonts.
## 5. Tradeoffs
- **Design choice:** copy + styling duplicated from root `index.html`; no shared stylesheet, so updates require touching multiple files.
- **Alternative:** centralize layout via templating or Next.js page.
## 6. Failure Modes
- Broken links or outdated copy must be caught manually—no tests.
- GA script failure results in missing analytics but page still renders (silent failure for marketing ops).
## 7. Silent Failure Risks
- If Calendly slug changes, CTAs silently 404; there’s no monitoring.
## 8. Senior Engineer/CTO Challenge Questions
1. Who owns refresh cadence so messaging stays aligned with the main site?
2. Should CTA clicks emit GA events for conversion tracking?
3. Can we dedupe CSS/common components across marketing pages to reduce drift?
4. Is there an accessibility review process for this page?
5. Do we track which campaigns drive traffic here?
## 9. Unknowns
- Whether any CDN caching invalidation is required when the file updates.
- Whether this page is referenced by paid campaigns.
## 10. Silent Failure Summary
- GA snippet blocked → analytics gap.
- Broken CTA links → leads drop with no alert.
## 11. Risk Scoring
business_criticality:2, complexity:1, coupling:1, test_coverage:0, observability:1, comprehensibility:5, change_risk:2, dark_code_score:1, refactor_priority:2.
## 12. Recommended Actions
- Add GA event tracking for CTAs; document owner + update cadence.
## 13. Founder Brief
“`platform/index.html` is just our static landing page. If the Calendly link or copy changes, we have to edit the file manually, and no one gets alerted if analytics or CTAs break.”
