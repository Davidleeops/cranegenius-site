# ADR: Static Financial JSON as Source of Truth
## Problem
Command Center dashboards need a single data source for revenue, burn, and pipeline metrics, but no backend service exists to serve authenticated data.
## Current Approach
All dashboards load `/data/financials.json` via `command-center/_finance_loader.js`. The JSON is assumed to be updated manually alongside the site and is not versioned or validated in this repo. When the file is missing or malformed, dashboards silently show placeholders.
## Why This Was Likely Chosen
Static JSON avoided building an API or securing backend access, letting the team ship dashboards quickly with zero hosting cost.
## Tradeoffs Accepted
- **Pros:** Fast delivery, zero runtime infrastructure, instant propagation of updates across dashboards.
- **Cons:** No schema checks, no auth, no freshness metadata, and no alerting when data fails to load. Anyone visiting the site can fetch sensitive KPIs.
## Risks of Current Approach
- Leadership may rely on stale or missing data without realizing.
- Manual uploads can leak confidential data or introduce typos with no rollback.
- Attackers/competitors can download client/pipeline info from the same public endpoint.
## Plausible Alternatives
- Build an authenticated API (Supabase, Edge Function) returning signed data with schema validation.
- Generate the dashboards server-side from secured data sources (e.g., Notion/CRM integration, scheduled build step).
- Store JSON in a private bucket with signed URLs per session.
## What Would Force Redesign
- Need for SOC2/compliance-level controls on financial data.
- Requirement to audit who saw which numbers when.
- Frequent breakages due to missing or stale JSON updates.
