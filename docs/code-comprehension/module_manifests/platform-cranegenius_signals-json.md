# Module Manifest: platform/cranegenius_signals.json
## 1. Purpose
- **Fact:** JSON array listing signal events with fields `signal_type`, `signal_category`, `geography`, `lat`, `lng`, `confidence`, `signal_date`, `vertical_tags`. IDs like `"sig-0-0"`, `"global-sig-2325-2"` show both domestic/global coverage.
- **Inference:** Drives the platform’s signal layers and filters.
## 2. System Role
- Exposed at `/platform/cranegenius_signals.json`; downloaded whole by every visitor and any crawler.
- Supplies the only structured signal feed in this repo.
## 3. Logic Breakdown
- Data-only file; schema visible via keys.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Generated elsewhere (pipeline not in repo).
- **Outputs:** Full signal dataset delivered client-side.
- **Side effects:** Large payload → slower loads; unprotected data → scraping risk.
## 5. Tradeoffs
- Static file gives immediate demos but zero governance, no incremental updates, and no metadata about recency.
## 6. Silent Failure Risks
- Upstream feed outage leaves stale data indefinitely; UI doesn’t warn users.
- Partial export producing malformed JSON would break signal rendering with only console errors.
## 7. Senior Engineer/CTO Questions
1. What ingestion pipeline populates this file and ensures data accuracy?
2. Are we violating any data-sharing agreements by serving raw signal events publicly?
3. How do we signal “last updated” to users or alert ourselves when data stops refreshing?
4. Can we secure this feed behind auth tiers and query filters?
5. How do we prevent the payload from growing beyond what browsers can handle?
## 8. Unknowns
- Whether any deduplication or data quality checks run before publishing.
- Whether translation/localization is applied upstream.
## 9. Risk Scoring
business_criticality:5, complexity:3, coupling:4, test_coverage:0, observability:1, comprehensibility:2, change_risk:4, dark_code_score:3, refactor_priority:5.
## 10. Recommended Actions
- Build traceable data pipeline with validation + timestamps, gate download via API keys, add client banners for freshness, and implement pagination/filtering to cut payload size.
## 11. Founder Brief
“This file is our entire signal history. Right now anyone can grab it, and if the feed stalls there’s no banner or alert—the dashboard quietly shows stale signals.”
