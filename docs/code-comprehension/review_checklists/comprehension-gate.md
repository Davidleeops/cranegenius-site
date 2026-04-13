# Comprehension Gate Checklist
Use this before accepting new code, data files, or operational scripts.

1. **Business Purpose** – Can you explain (in one sentence) what the change does and why the business needs it? If not, pause.
2. **Data Truth** – Identify every data input and output. Is the source owned, validated, and documented? Mark unknowns explicitly.
3. **Dependencies & Secrets** – List internal modules, APIs, and secrets touched. Are they referenced in manifests? Are secrets pulled from secure stores?
4. **Side Effects** – Does the change expose new URLs, datasets, or customer-facing behavior? Note any public exposure.
5. **Tradeoffs & Alternatives** – State what approach you chose, why, and what was rejected.
6. **Failure Modes** – What happens when data is missing, stale, or malformed? Describe silent failure scenarios and user-visible behavior.
7. **Testing/Validation** – Have you added schema checks, telemetry, or monitoring? If not, why?
8. **Manifest/Brief Updates** – Which module manifests, dependency maps, or subsystem briefs must be updated? Attach PR references.
9. **Escalation Trigger** – Does the change touch financial data, customer datasets, auth, secrets, or compiled artifacts? If yes and the answer to any question above is “unknown,” escalate for senior design review.
