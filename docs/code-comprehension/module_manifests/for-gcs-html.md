# Module Manifest: for-gcs.html
## 1. Purpose
- Dedicated landing page pitching "free crane planning tools" to general contractors and developers.
- Captures contact info + project context via embedded form to route leads into the sales cycle.

## 2. System Role
- Lives at `/for-gcs.html`; linked from campaigns or QR codes.
- Upstream dependency: none (static assets). Downstream: posts to Formspree endpoint `https://formspree.io/f/mgoldjjb`, same as Operator Track intake.
- Includes GA4 to feed marketing attribution dashboards.

## 3. Logic Breakdown
- Hero section plus cards describing toolkits; all content static.
- `<form>` collects name/company/email/role/project type/city/timeline + optional notes; hidden `source` field marks `gcs-landing`.
- Submit button sends POST directly to Formspree; no client-side validation beyond HTML `required` attributes.
- Assumes Formspree is configured to forward to internal inbox.

## 4. Inputs / Outputs / Side Effects
### Inputs
- User-supplied contact + project details via form.
### Outputs
- HTTP POST payload to Formspree, standard pageview events to GA4.
### Side Effects
- GA4 network calls, Formspree email/webhook triggers.
### External Dependencies
- Google Fonts, GA4, Formspree infrastructure.

## 5. Tradeoffs
- **Benefits:** Lightweight—no backend required; consistent with other forms.
- **Risks:** No spam protection or rate limiting; PII flows through third-party service with minimal disclosure. Failure of Formspree disables lead capture silently.
- **Alternatives:** Proxy through own backend or CRM with auth + rate controls.

## 6. Failure Modes
- Formspree quota exceeded: submissions drop with only a generic error.
- Script blocked: analytics lost; marketing can't measure conversions.
- Fields outdated: lacking consent/checkbox may violate privacy policies.

## 7. Senior Engineer Challenge Questions
- Where is privacy policy / consent for storing PII via Formspree?
- Can we de-duplicate leads or detect abuse when multiple submissions share email?
- Should we unify forms so changes to endpoint/fields propagate safely?

## 8. Risk Scoring
- business_criticality: 3
- complexity: 2
- coupling: 3
- test_coverage: 1
- observability: 2
- comprehensibility: 3
- change_risk: 3
- dark_code_score: 3
- refactor_priority: 3
- confidence_level: medium

## 9. Recommended Actions
- add_docs — Document Formspree workflow: owners, routing, quotas.
- add_tests — Implement synthetic submission monitoring or simple uptime ping.
- add_instrumentation — Fire custom GA/Amplitude events and log errors for failed posts.
- refactor — Centralize forms to a shared JS/util instead of duplicating markup.

## 10. Founder Brief
This page is how GCs raise their hand. Right now it posts raw data to Formspree without visibility into failures or spam, meaning high-value contacts could disappear. Decide whether to keep trusting a basic webhook or invest in a first-party intake service.
