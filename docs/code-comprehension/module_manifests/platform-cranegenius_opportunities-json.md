# Module Manifest: platform/cranegenius_opportunities.json
## 1. Purpose
- **Fact:** JSON array containing >2,000 objects (IDs like `"proj-0"`, `"global-2300"`) with attributes `project_name`, `city`, `state`, `lat`, `lng`, `project_type`, `priority_band`, `signal_score`, `recommended_lift_categories`, etc.
- **Fact:** File size is very large (hundreds of KBs/MBs), indicating full dataset delivery.
- **Inference:** Powers the platform’s opportunity map/table when `dashboard.html` loads.
## 2. System Role
- Served directly to browsers under `/platform/cranegenius_opportunities.json`; no auth, caching hints, or API gateway.
- Acts as single source of opportunity data for customers and any scraper.
## 3. Logic Breakdown
- Pure data file; no logic. Schema implied by keys listed above.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Not generated in repo—source pipeline unknown (likely external ETL).
- **Outputs:** Browser downloads entire dataset on each visit.
- **Side effects:** Large payload increases load time; entire dataset can be copied by anyone.
## 5. Tradeoffs
- Rapid static delivery vs. governance. Without API/filters we can’t restrict access or know which rows users consume.
## 6. Silent Failure Risks
- If upstream export fails or grows stale, UI still renders previous snapshot with no freshness indicator.
- Corrupted JSON (missing bracket) would break entire platform and fail only in browser console.
## 7. Senior Engineer/CTO Questions
1. What job exports this file, and how often? Where’s the schema contract?
2. Are we allowed to expose every record to anonymous visitors?
3. How do we redact sensitive or premium data for non-paying customers?
4. Can we chunk/paginate to reduce load time?
5. Do we log download metrics to detect abuse?
## 8. Unknowns
- Data provenance (permit sources, licensing) and transformation process.
- Whether file is compressed or cached at CDN level.
## 9. Risk Scoring
business_criticality:5, complexity:3, coupling:4, test_coverage:0, observability:1, comprehensibility:2, change_risk:4, dark_code_score:3, refactor_priority:5.
## 10. Recommended Actions
- Introduce governed pipeline with versioning/timestamps, restrict access via authenticated API, add client-visible “last updated” indicator, and implement schema validation before publish.
## 11. Founder Brief
“This JSON file is literally our opportunity inventory. We drop it on the public site, so anyone—including competitors—can download it wholesale, and there’s no signal when it goes stale or corrupt.”
