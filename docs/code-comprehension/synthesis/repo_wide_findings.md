# Repo-Wide Findings
- **Static data as truth:** Core KPIs and customer datasets are delivered as static JSON without schema validation, ownership, or freshness metadata. Missing files are treated as acceptable states, leading to silent failure.
- **Compiled artifacts without source:** Platform dashboard and its serialized payloads live in this repo without the original Next.js source or build pipeline, blocking audits, patches, and telemetry.
- **Client-side secret handling:** Supabase access relies on browser globals and anon keys, exposing sensitive data and failing quietly when config is absent.
- **Pseudo-authentication:** Command Center “login” is a hard-coded password, allowing anyone to view financials and pipeline data if they know the URL.
- **Operational monitoring gaps:** Only a single GitHub cron job monitors upstream feeds, and it stores secrets in code with no escalation path when it fails.
- **Data provenance blind spots:** Large datasets (`cranegenius_*`, `cables.geojson`) lack documented sources, licensing, or update cadence, creating legal and accuracy risks.
- **Marketing/intake fragility:** Formspree-based intake and static landing pages rely entirely on client-side logic; failures or copy drift go unnoticed.
- **Governance drift risk:** The new comprehension and CTO-prep artifacts depend on manual updates; without process, they will fall out of sync with code.
