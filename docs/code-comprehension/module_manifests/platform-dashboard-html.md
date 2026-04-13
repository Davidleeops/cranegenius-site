# Module Manifest: platform/dashboard.html
## 1. Purpose
- **Fact:** Single-line minified HTML file that bootstraps the platform dashboard by referencing hashed Next.js bundles (e.g., `/platform/_next/static/chunks/app/dashboard/page-dab0f7946075fac4.js`).
- **Fact:** Includes preload links for CSS (`930c6664672201c6.css`, etc.) and scripts for chunks like `webpack-2e471561dd868877.js`.
## 2. System Role
- Acts as the browser entry point to the customer-facing dashboard; loads `_next` assets and serialized payloads from `platform/dashboard.txt`.
- Without this file, the compiled React app cannot bootstrap.
## 3. Logic Breakdown
- HTML `<head>` sets meta tags and loads CSS/JS from `_next/static`. `<body>` contains minimal placeholder `<div>` and Next.js streaming script.
- All runtime logic lives in the referenced chunks—not visible in this repo.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Requires `_next/2eNlC0pNXEsxXu4sdsWsy` directory plus `dashboard.txt`. If any chunk is missing, hydration fails.
- **Outputs:** Renders dashboard UI in browser; no server-side templating.
- **Side effects:** Pulls assets from `/platform/_next/**` and writes to DOM.
## 5. Tradeoffs
- Shipping compiled output without source enables static hosting but leaves no visibility into authentication, data fetching, or error handling. Debugging requires external repo (unknown).
## 6. Silent Failure Risks
- If `_next` hash changes or a chunk is omitted, the dashboard becomes blank with errors hidden in console—no monitoring in repo.
- There’s no cache-busting metadata; mismatched HTML/JS could persist via CDN.
## 7. Senior Engineer/CTO Questions
1. Where is the Next.js source and build pipeline for these chunks?
2. How do we regenerate this file when dashboard code changes?
3. What auth guard (if any) exists inside the compiled JS?
4. How do we log client errors so we know when hydration fails?
5. Are environment secrets embedded in these chunks?
## 8. Unknowns
- Whether `_next` assets are generated manually or via CI.
- Whether the compiled code calls external APIs beyond the static JSON files.
## 9. Risk Scoring
business_criticality:5, complexity:5, coupling:4, test_coverage:0, observability:1, comprehensibility:1, change_risk:5, dark_code_score:5, refactor_priority:5.
## 10. Recommended Actions
- Recover and version the Next.js source; document build hash `2eNlC0pNXEsxXu4sdsWsy` generation; add client-side logging to detect failures.
## 11. Founder Brief
“Our platform dashboard HTML is just compiled Next.js output pointing to hashed bundles. Without the missing source repo and build process, we can’t patch bugs or ensure the dashboard even loads—any broken chunk would fail silently for customers.”
