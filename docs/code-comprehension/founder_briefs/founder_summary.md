# Founder Summary
## What the System Does
CraneGenius ships three main surfaces: marketing/lead capture pages, an internal Command Center dashboard, and the customer-facing platform. Everything runs as static files on a CDN with optional Supabase calls for “live” data.
## Critical Paths
- `_finance_loader.js` + `/data/financials.json` feed every KPI in the Command Center.
- Platform dashboard depends on compiled Next.js bundles plus public `cranegenius_*` datasets for customer data.
- Supabase loader injects live opportunities/signals when browser globals are set.
- Operator Track intake runs entirely client-side and posts to Formspree.
- GDELT healthcheck GitHub Action is the only automated monitor for upstream feeds.
## Biggest Risks
- Financial and customer data is exposed publicly as static JSON and fails silently when missing or stale.
- We don’t have the platform source code in this repo, so we can’t patch bugs or inspect security.
- Supabase access relies on shipping anon keys to the browser and has no user-visible status when it fails.
- Intake forms and predictive dashboards look live but are actually static, risking bad decisions and lost leads.
- Monitoring secrets are hard-coded; cron failures don’t alert anyone outside GitHub.
## What Needs Attention Now
1. Secure and authenticate the financial data pipeline; add schema validation and error banners.
2. Bring the Next.js source/build pipeline under version control and add client telemetry.
3. Move the `cranegenius_*` datasets behind an authenticated, versioned API with freshness indicators.
4. Proxy Supabase access server-side or add a configuration/alerting path for the loader.
5. Replace Formspree + client password with real auth and intake processing.
## Founder Talking Points
- “Our dashboards rely on a single JSON file; we’re moving that into a secure API so leadership data can’t go stale silently.”
- “We’re pulling the platform’s Next.js source into version control so we can actually inspect, patch, and monitor the customer app.”
- “Customer datasets are currently shipped as public JSON—we’re locking them behind auth and adding data freshness monitoring.”
- “Supabase keys live in the browser today; we’re standing up a proxy and adding visible status when ‘live’ data goes offline.”
- “Operator Track will move off Formspree and gain a server-side audit trail so no qualified lead gets blocked by a front-end glitch.”
