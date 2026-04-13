# ADR: Public Static Datasets for Platform Delivery
## Problem
The platform needs to serve large opportunity and signal datasets to render maps and tables, but building a backend API would take more time.
## Current Approach
The repo commits `platform/cranegenius_opportunities.json` and `platform/cranegenius_signals.json`, which the compiled Next.js dashboard downloads directly. No authentication, pagination, or freshness metadata is provided.
## Why This Was Likely Chosen
Static files allowed instant demos and avoided building data services or dealing with rate limits. Hosting everything on a CDN simplified deployment.
## Tradeoffs Accepted
- **Pros:** Simple hosting, deterministic dataset for demos, zero backend maintenance.
- **Cons:** Anyone can scrape the entire dataset, there is no schema or freshness guarantee, payloads are large, and updates require manual export + deploy.
## Risks of Current Approach
- Data may violate licensing/contract terms by being publicly downloadable.
- Customers may see stale or partial data with no warning, damaging trust.
- Large payloads create performance issues on lower-end devices.
- No audit trail or visibility into who accessed which data.
## Plausible Alternatives
- Serve data via authenticated API with query filters and pagination.
- Use signed URLs per session tied to the customer’s plan.
- Generate per-customer slices or cached tiles to reduce exposure.
## What Would Force Redesign
- Need to enforce entitlements or paid tiers.
- Security/compliance review demanding access control.
- Dataset growth making static payloads impractical (>10 MB) or requiring frequent updates.
