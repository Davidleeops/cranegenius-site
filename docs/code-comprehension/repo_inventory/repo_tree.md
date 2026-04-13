# Repository Tree

```
cranegenius-site/
├── index.html                      # Main marketing landing page
├── for-gcs.html                    # Google Cloud Summit landing variant
├── operator-track-intake.html      # Intake form for operator track
├── capexlayer/
│   └── index.html                 # CapexLayer co-brand landing page
├── command-center/                # Static dashboards + scripts for financial & ops ops
│   ├── *.html                     # Dashboard, pipeline, kanban, prompts, etc
│   ├── _finance_loader.js         # Shared client-side P&L binding
│   └── supabase-loader.js         # Lightweight PostgREST client wrapper
├── newsletter/                    # Archived prospect brief pages (index + localized briefs)
├── platform/
│   ├── index.html                 # Platform detail landing
│   ├── dashboard.html             # Pre-rendered Next.js dashboard shell
│   ├── map-style.json             # Mapbox style config
│   ├── cables.geojson             # Sample cable routes dataset
│   ├── cranegenius_opportunities.json # Permit + project intelligence feed
│   ├── cranegenius_signals.json   # Global signal catalog
│   ├── 404.html, *.txt            # Platform assets / stubs
│   └── _next/                     # Next.js build artifacts for dashboard
├── tools/
│   ├── README.md
│   └── gdelt_healthcheck.py       # Monitoring script for signal feed + translator
├── .github/workflows/
│   └── gdelt-healthcheck.yml      # Hourly CI job running healthcheck
└── docs/
    └── code-comprehension/        # Generated comprehension artifacts
```

Key areas:
- Static marketing pages at repo root and `capexlayer/`, `newsletter/`.
- "command-center" dashboards rely on `/data/financials.json` and optional Supabase PostgREST.
- "platform" hosts signal/opportunity datasets and a compiled Next.js dashboard shell.
- "tools" + `.github` implement the only automation (GDELT healthcheck).
