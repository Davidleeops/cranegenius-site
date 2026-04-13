# CTO Subsystem Brief: operator-track-intake
## 1. What This System Does
Implements a two-stage qualification flow on `operator-track-intake.html`. Stage 1 gates prospects based on fleet size, revenue, salesperson presence, and existing subscription; Stage 2 posts intake data to Formspree.
## 2. Why It Matters
This is the only self-serve application path for the Operator Track offering. Bad gating means lost revenue or onboarding the wrong customers.
## 3. Critical Dependencies
- Internal: Client-side JS function `checkEligibility()` controlling DOM visibility.
- External: Formspree endpoint `https://formspree.io/f/mgoldjjb`, Google Analytics, Microsoft Clarity, RB2B tracking scripts, email workflows triggered downstream.
## 4. Key Tradeoffs
- Chose pure static HTML for speed (no backend), sacrificing audit trails, auth, and resiliency. Client-only gating avoids server costs but is easy to bypass or break.
## 5. Main Risks
- Reliability: JS errors or disabled scripts block qualified leads.
- Security/privacy: PII sent to Formspree without explicit consent signage; no spam mitigation.
- Maintainability: Criteria hard-coded; any change requires editing HTML.
## 6. Silent Failure Risks
- Formspree downtime or quota issues produce generic errors; no monitoring.
- Disqualified users are never logged, so we can’t see if we’re filtering too aggressively.
## 7. What a CTO Would Ask
1. Where do submissions go after Formspree—CRM, email?
2. Do we have a privacy notice/consent for collecting fleet + revenue data?
3. How do we adjust gating without redeploying?
4. What’s our fallback if Formspree blocks us?
5. Are we validating emails to avoid spam?
6. Can we capture analytics on disqualified applicants?
7. Why not use ReCAPTCHA or similar to prevent abuse?
8. How do we notify sales instantly upon submission?
9. Do we have rate limits to prevent scraping/spam?
10. Can we support localization or additional questions without breaking gating?
## 8. Recommended Next Improvements
- Add monitoring + logging for submitted/disqualified attempts.
- Move form handling to first-party backend or CRM integration with proper consent text.
- Externalize gating rules to config and add tests.
- Implement error handling/UI for Formspree failures.
## 9. 60-Second Founder Explanation
“Our Operator Track intake page is just a static form with some JS gating. It’s quick, but if JS fails or Formspree has issues we lose leads, and we have no record of who was rejected. We should bring the form in-house, log every attempt, and add a proper privacy disclosure before we scale this program.”
## 10. Confidence Level
Medium — we’ve read the full file and understand the flow, but we lack visibility into Formspree pipelines and downstream handling.
