# Module Manifest Standard
Every meaningful module must document the following (use the existing manifest format):

1. **Purpose & Business Role** – Plain-English explanation of what the module does and why it exists.
2. **System Role & Dependencies** – Internal modules, data files, APIs, env vars, or globals required. Mark any unknowns explicitly.
3. **Logic Breakdown** – Describe key functions and data transformations.
4. **Inputs/Outputs/Side Effects** – Enumerate data sources, outputs, and external effects (e.g., public endpoints, telemetry).
5. **Tradeoffs & Alternatives** – Note why this implementation was chosen.
6. **Failure Modes (loud & silent)** – Detail what happens on missing data, stale data, or API failure.
7. **Escalation Criteria** – If module touches financial data, customer-facing runtime, auth, secrets, or background jobs, add a “Senior Review Required” note.
8. **Recommended Next Improvements** – Concrete actions to reduce risk.
9. **Founder/CTO Brief** – Include a 60-second spoken summary.
10. **Confidence Level** – Mark High/Medium/Low and state uncertainty.

A manifest must be updated whenever: schema changes, dependencies shift, new data sources are introduced, or confidence level drops below “High.”
