# PR Review Template
Copy/paste into PR reviews to enforce anti-dark-code standards.

- **Scope Summary:** What business problem does this PR solve? Link related manifest/brief updates.
- **Data Inputs/Outputs:** List files, APIs, datasets touched. Are schema changes documented? Any unknowns?
- **Dependencies & Secrets:** Are new env vars or secrets introduced? Confirm they’re stored securely.
- **Failure Modes:** What breaks if inputs go missing or external services fail? Is there visible error handling?
- **Tradeoffs:** What alternatives were considered? Is the chosen approach justified in plain English?
- **Tests/Monitoring:** Are schema checks, telemetry, or alerts added/updated? If not, why?
- **Documentation:** Were relevant module manifests, subsystem briefs, or ADRs updated? Link to commits.
- **Escalation:** Does this touch financial data, customer datasets, auth, or compiled assets? If yes and any uncertainty remains, require senior review before merge.
