# Dark Code Heatmap

| Area | Why It's Dark | Immediate Questions |
| --- | --- | --- |
| `platform/_next` bundles + `dashboard.html` | Only compiled Next.js artifacts exist; no source, no comments, no env guidance, and no test hooks. Impossible to confirm auth, rate limiting, or how JSON feeds are consumed. | Where is the source repo? How are secrets or API keys injected into this build? |
| `command-center/_finance_loader.js` dependency on `/data/financials.json` | File referenced everywhere but missing from repo. No schema, no sample, and no documented update flow. | Who owns generating `financials.json`? What validation prevents malformed numbers from shipping? |
| Supabase runtime config (`window.__CG_SUPABASE_*`) | Loader expects globals that never appear. No infrastructure doc on how these values reach prod, and anon key would be exposed client-side. | Is Supabase actually in use or already deprecated? If active, how are keys rotated? |
| Static mega-datasets (`platform/cranegenius_*.json`) | Hundreds of thousands of records committed with no provenance, versioning, or differential updates. They mix US + global data without privacy review. | How often are these refreshed? Are there licensing or privacy constraints for redistributing raw permit data? |
| Operator intake gating (`operator-track-intake.html`) | Qualification logic runs entirely client-side; disqualified leads are never logged. Form posts to Formspree without visible CAPTCHA or rate limiting. | Do we store submissions anywhere else? How do we recover high-intent leads blocked by an outdated rule? |
| GDELT healthcheck secrets (`tools/gdelt_healthcheck.py`) | Supabase anon key and bearer token committed in plaintext; GitHub workflow runs hourly without secret rotation. | Should these move to GitHub Secrets? What monitoring alerts when the healthcheck fails repeatedly? |
| Next.js RSC payloads (`platform/index.txt`, `dashboard.txt`) | Serialized React server payloads committed with opaque references to chunk IDs; no mapping back to modules. | Can we regenerate these reliably? What data filters/transformations happen before serialization? |
