# Module Manifest: platform/cables.geojson
## 1. Purpose
- **Fact:** GeoJSON `FeatureCollection` containing `LineString` entries such as `"name": "TAT-14"` with coordinate arrays.
- **Inference:** Provides additional infrastructure overlays on the platform map.
## 2. System Role
- Served as static asset at `/platform/cables.geojson`; consumed by client map.
## 3. Logic Breakdown
- Simple JSON; each feature has `properties.name` and `geometry.coordinates` arrays.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Upstream dataset not stored here.
- **Outputs:** Entire feature list delivered to browser.
- **Side effects:** If dataset grows, performance may degrade; there is no tiling.
## 5. Tradeoffs
- Static overlay ensures deterministic map but lacks metadata (version, source) and could become outdated.
## 6. Silent Failure Risks
- Invalid GeoJSON structure would break map overlays with only console errors.
- Lack of version info means we may display obsolete cable routes without realizing.
## 7. Senior Engineer/CTO Questions
1. Where do these cable geometries come from and are we licensed to show them?
2. Should we compress/tile for performance if the layer grows?
3. How do we ensure coordinate accuracy and update cadence?
4. Are there other overlays we should standardize using the same format?
## 8. Unknowns
- Update frequency and data source (no README references).
## 9. Risk Scoring
business_criticality:2, complexity:2, coupling:2, test_coverage:0, observability:1, comprehensibility:3, change_risk:2, dark_code_score:2, refactor_priority:2.
## 10. Recommended Actions
- Document source/licensing, add validation in build pipeline, consider splitting into vector tiles.
## 11. Founder Brief
“The cables GeoJSON is just a static overlay we ship. Without knowing where it comes from or how often it’s updated, we risk showing bad infrastructure data and have no warning if the file corrupts.”
