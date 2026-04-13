# Module Manifest: command-center/index.html
## 1. Purpose
- Acts as launchpad and faux login screen for the Command Center suite, providing quick KPIs and nav to deeper dashboards.
- Meant to deter casual visitors via password prompt while surfacing curated highlights.

## 2. System Role
- Entry point for `/command-center/`; if password accepted, reveals entire `#app` containing summary cards + nav.
- No upstream data beyond static HTML; doesn’t fetch `financials.json`.
- Downstream: links to other HTML pages.

## 3. Logic Breakdown
- Uses Tailwind CDN + custom CSS for layout.
- Password gate script: stores `cg_auth` flag in `sessionStorage`; unlocks when typed password matches `dark30`. No rate limiting or hashing.
- After unlock, `initApp()` updates clock, animates numbers (pure front-end), but numbers themselves are hard-coded via `data-count` attributes.
- Sections include pipeline kanban, persona funnels, readiness grid—all static content.

## 4. Inputs / Outputs / Side Effects
### Inputs
- User enters password string.
### Outputs
- `sessionStorage` entry `cg_auth=1` persists for session.
### Side Effects
- DOM manipulations for animation; no network calls.
### External Dependencies
- Tailwind CDN, Google Fonts.

## 5. Tradeoffs
- **Benefits:** Quick to set up; no backend.
- **Risks:** Security theater—anyone viewing source sees password. Since numbers are static, page drifts from reality fast. Password protects nothing else (other pages still accessible directly).
- **Alternatives:** Real auth (Basic Auth, Netlify/Vercel password), or consolidate into behind-the-firewall tool.

## 6. Failure Modes
- If JS blocked, user can’t unlock page (but can view source). Password never rotates because it’s baked into git history.
- Animated numbers rely on `IntersectionObserver`; unsupported browsers may not animate but still show final values.

## 7. Senior Engineer Challenge Questions
- Why rely on client-side password at all when other pages bypass it? Should we enforce Basic Auth at CDN level instead?
- Who updates the static metrics and statuses? Are they meant to match the real dashboards?

## 8. Risk Scoring
- business_criticality: 3
- complexity: 3
- coupling: 2
- test_coverage: 1
- observability: 1
- comprehensibility: 3
- change_risk: 3
- dark_code_score: 4
- refactor_priority: 4
- confidence_level: medium

## 9. Recommended Actions
- refactor — Replace with real auth (Netlify/Vercel password or Supabase Auth) or remove gate entirely.
- add_docs — Document nav structure + intended audience; otherwise static copy rots.
- add_instrumentation — At minimum log unlock attempts for audit visibility.

## 10. Founder Brief
This page gives the illusion of a secure hub, but the password is in plain text and every linked page is publicly reachable. Assume anything placed here is public. If you want a true command center, invest in actual authentication and real-time data feeds.
