# Module Manifest: platform/map-style.json
## 1. Purpose
- **Fact:** JSON specifying Mapbox GL style version 8 with a single raster source `carto-dark` pointing to `https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png`.
- **Fact:** Used by the platform map to render the basemap background.
## 2. System Role
- Referenced by the compiled dashboard to supply styling instructions for map tiles.
## 3. Logic Breakdown
- Static config: `glyphs` path `/fonts/{fontstack}/{range}.pbf`, `sources` section, and a single layer `carto-dark-layer`.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** None internally; depends on Carto CDN availability.
- **Outputs:** Mapbox GL uses this file to fetch tiles.
- **Side effects:** If Carto limits access, the base map disappears but overlays remain, confusing users.
## 5. Tradeoffs
- Chose free Carto tiles instead of paid Mapbox/hosted tiles; reduces cost but introduces dependency we don’t control.
## 6. Silent Failure Risks
- Carto CDN outages or API changes cause blank basemap with no UI warning—users just see markers floating on solid background.
## 7. Senior Engineer/CTO Questions
1. Do we have licensing rights and SLA for Carto’s `dark_all` tiles at our usage volume?
2. Should we host tiles ourselves or switch to Mapbox with API keys for reliability?
3. How do we detect when tile requests fail and surface errors?
4. Is `/fonts/{fontstack}` path actually hosted? (No font assets exist in repo.)
## 8. Unknowns
- Whether `/fonts` endpoint exists on our CDN; it’s referenced but not present here.
## 9. Risk Scoring
business_criticality:3, complexity:1, coupling:2, test_coverage:0, observability:1, comprehensibility:4, change_risk:2, dark_code_score:2, refactor_priority:2.
## 10. Recommended Actions
- Verify licensing, provide fallback basemap or error state, and host required glyphs/fonts.
## 11. Founder Brief
“Our map style JSON hardcodes Carto’s dark tiles. If Carto throttles us or if the `/fonts` assets aren’t on our CDN, the map quietly degrades—we need a fallback and clarity on licensing.”
