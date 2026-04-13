# CTO Mock Q&A
1. **Architecture – Where does the Command Center get its numbers?**
   - The dashboards rely entirely on `_finance_loader.js` fetching `/data/financials.json`. The file isn’t in repo, so we infer it’s manually uploaded alongside the site. If that file is missing or stale, every KPI shows `--` with only a console warning.
2. **Architecture – How is live data wired into the dashboards?**
   - Via `command-center/supabase-loader.js`, which expects `window.__CG_SUPABASE_URL__` and anon key globals. Only when those exist will pages like `pipeline.html` query PostgREST tables such as `signal_events` and `opportunities`.
3. **Architecture – What powers the customer-facing platform?**
   - The `platform/` directory hosts compiled Next.js bundles in `_next/` plus static datasets (`cranegenius_opportunities.json`, `cranegenius_signals.json`). We don’t have the source repo here, so any Next.js change requires working elsewhere.
4. **Reliability – What happens if `/data/financials.json` can’t be fetched?**
   - `_finance_loader.js` logs a warning and leaves placeholders in the UI; no banner or alert fires. This is a silent failure scenario we observed directly in the script.
5. **Reliability – How do we know the Supabase feed is live?**
   - We don’t have in-app indicators. If `cgSupabase.query` fails, it returns `null` and sections simply stay empty. Only the GDELT healthcheck script monitors an upstream feed, not Supabase PostgREST.
6. **Scaling – Can the current platform handle growing datasets?**
   - Probably not gracefully. `cranegenius_opportunities.json` already contains thousands of entries (>200k tokens). Loading that client-side scales poorly, and there’s no pagination. This is inferred from file size.
7. **Scaling – How does the intake form behave under heavy traffic?**
   - It posts to Formspree, which has usage limits. There’s no queueing or backpressure; if Formspree throttles, users get an error page and we have no logging.
8. **Observability – Do we log dashboard data failures anywhere?**
   - No. There’s no logging beyond console prints. Neither `_finance_loader` nor `supabase-loader` reports metrics to an external system.
9. **Observability – How do we know dataset refreshes succeeded?**
   - We don’t. `cranegenius_*` files lack timestamps or metadata. This is an uncertainty—we just see static files with no freshness signal.
10. **Security – Are sensitive financials exposed?**
    - Yes. `financials.html` references `data/financials.json` without auth. If the JSON includes client/pipeline detail, anyone with the URL can fetch it.
11. **Security – How are Supabase credentials handled?**
    - The loader expects anon keys in global JS variables. There’s no documented injection path, meaning keys likely end up in the client bundle—high risk of leakage.
12. **Security – Where are GDELT keys stored?**
    - In plain text inside `tools/gdelt_healthcheck.py`. We verified the actual key strings in the file, so they’re in git history.
13. **Technical Debt – What’s the state of the platform codebase?**
    - We only have compiled `_next` artifacts. Without source, we can’t review architecture, run tests, or upgrade dependencies—massive debt.
14. **Technical Debt – Are there tests for loaders or dashboards?**
    - None in repo. No Jest, Cypress, or even JSON schema checks exist.
15. **Team/Process – Who owns `financials.json` updates?**
    - Unknown. The file isn’t present, so there’s no documented owner or process. We must ask the finance/opps lead.
16. **Team/Process – How is intake data routed post-Formspree?**
    - Not documented. We only see the POST endpoint; downstream handling is inferred to be email-based. Need confirmation.
17. **Team/Process – How do we deploy platform changes?**
    - Likely by copying compiled `_next` output into this repo. Since we lack source, deployment pipeline is opaque—another question for the team.
18. **Reliability – What ensures upstream signals stay alive?**
    - The hourly GitHub Action running `gdelt_healthcheck.py`. It checks Supabase function response and Google Translate availability. Failures show up as failed workflow runs only.
19. **Scaling – Can Supabase handle more clients?**
    - Hard to say. Queries request up to 1000 rows without pagination; if tables grow, PostgREST responses will balloon. We’d need to add limits or server-side aggregation.
20. **Observability – Do we track operator intake conversions?**
    - Only via GA4/Clarity. There’s no server-side log of submissions or disqualifications, so analytics are incomplete.
21. **Security – Is there any auth on Command Center pages?**
    - No. `command-center/index.html` uses a client-side password (`dark30`), but direct links to other pages bypass it entirely.
22. **Technical Debt – How is multi-language newsletter handled?**
    - Through separate static HTML files (`brief-es.html`, `brief-pt.html`). There’s no CMS or translation workflow; it’s manual.
23. **Team/Process – Do we have code ownership documented?**
    - Not in this repo. No CONTRIBUTING or CODEOWNERS files exist.
24. **AI/Agent Governance – Are AI prompts or signal models governed?**
    - `command-center/prompts.html` contains an AI prompt library plus guidance (e.g., “Find all fetch() calls to AI/API endpoints”). It’s static text, so governance is policy-only; no enforcement.
25. **AI/Agent Governance – How do we vet predictive analytics runs?**
    - `predictive-analytics.html` expects `runs/predictive_analytics/dashboard.json`, which isn’t present. It falls back to canned data, so governance is aspirational right now.
26. **Build vs Buy – Why use Formspree for intake?**
    - Likely speed; no backend is needed. But this buy decision means we lack control, logging, and branding. Recommendation is to build/own the submission endpoint.
27. **Build vs Buy – Why stick with Google Translate for GDELT?**
    - Script hits public `translate.googleapis.com`; probably to avoid maintaining our own translation stack. Risk is ToS changes/throttling. A managed translation API with SLA might be better.
28. **Refactor Prioritization – What should we fix first?**
    - Secure and automate the financial data path (`financials.json`), because all executive decisions rely on it. Next, lock down Supabase access and bring the Next.js source into version control.
29. **Refactor Prioritization – How urgent is replacing client-side password gate?**
    - High for confidentiality. Without real auth, we risk leaking sensitive KPIs. It should be in the top three refactors.
30. **Reliability – How confident are we in dataset freshness?**
    - Low. There are no timestamps or pipelines in repo. We have to assume manual exports, so confidence is low until we see automation evidence.
31. **Architecture – Where is the source code for the platform dashboard?**
    - Fact: Only compiled `_next` assets, `dashboard.html`, and RSC payloads are in this repo. Inference: source likely lives elsewhere; we currently cannot rebuild or inspect it.
32. **Reliability – What happens if the Next.js bundle hash changes?**
    - Fact: `dashboard.html` references specific hashed chunk names; if `_next` assets aren’t updated in lockstep, hydration fails silently. We’d see blank screens with console errors.
33. **Scaling – Can customers filter datasets without downloading everything?**
    - Fact: `cranegenius_opportunities.json` and `_signals` are entire datasets served statically. Inference: No server-side filtering exists, so every visitor downloads the full payload regardless of need.
34. **Security – Are sensitive signal/opportunity datasets gated?**
    - Fact: Files sit in `/platform/` with no auth. Anyone who knows the URLs can download them wholesale, so competitors could scrape them.
35. **Infra/Config – How do we rotate Supabase keys used by the healthcheck?**
    - Fact: Keys are hard-coded in `gdelt_healthcheck.py`. Rotating them requires editing the file and recommitting, which is risky and leaks history. Inference: We need to move them into GitHub Secrets to rotate safely.
36. **Security – Do the marketing pages collect data we need to disclose?**
    - Fact: `index.html`, `for-gcs.html`, and `capexlayer/index.html` load GA4, Microsoft Clarity, and sometimes RB2B scripts without consent banners. We infer privacy disclosures are handled elsewhere; none exist in this repo.
37. **Reliability – What happens if Formspree throttles the Operator Track intake?**
    - Fact: `operator-track-intake.html` posts to `https://formspree.io/f/mgoldjjb` with no retry or error UI. Inference: users would see a generic Formspree error page and we’d have no record.
38. **Data Governance – How do we track dataset freshness?**
    - Fact: `cranegenius_*` files lack timestamps or version metadata. Inference: we currently can’t prove when data was last refreshed; need to add metadata or headers.
39. **Process – How will we keep the new comprehension docs in sync?**
    - Fact: Artifacts live under `docs/code-comprehension/`. Inference: we need a checklist/CI step to update manifests when critical files change; otherwise these docs will go stale.
40. **Team – Who owns the upstream `runs/predictive_analytics/dashboard.json` feed?**
    - Fact: File doesn’t exist here. Inference: either the team hasn’t built it or it lives elsewhere; we must assign ownership or remove the page.
