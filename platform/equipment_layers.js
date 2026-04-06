/**
 * CraneGenius Equipment Vertical Data Layers
 * Injects 5 equipment-specific map layers into the compiled Next.js dashboard.
 * Each layer filters signals + opportunities by equipment intent.
 */
(function () {
  'use strict';

  // ── Equipment vertical definitions ──────────────────────────────────────────
  const VERTICALS = {
    forklifts: {
      id: 'forklifts',
      label: 'Forklifts',
      color: '#f59e0b',
      clusterColor: 'rgba(245, 158, 11, 0.85)',
      strokeColor: 'rgba(180, 120, 0, 0.9)',
      signalTypes: ['building_permit', 'site_prep'],
      verticalTags: ['specialty_lift', 'heavy_haul'],
      liftCategories: ['specialty_lift'],
      landingPage: '/forklifts',
    },
    steel_erection: {
      id: 'steel-erection',
      label: 'Steel Erection',
      color: '#ef4444',
      clusterColor: 'rgba(239, 68, 68, 0.85)',
      strokeColor: 'rgba(180, 40, 40, 0.9)',
      signalTypes: ['structural_steel', 'foundation_permit'],
      verticalTags: ['rigging', 'tower_cranes', 'mobile_cranes'],
      liftCategories: ['tower_cranes', 'mobile_cranes'],
      landingPage: '/structural-steel',
    },
    earth_moving: {
      id: 'earth-moving',
      label: 'Earth Moving',
      color: '#84cc16',
      clusterColor: 'rgba(132, 204, 22, 0.85)',
      strokeColor: 'rgba(80, 140, 10, 0.9)',
      signalTypes: ['site_prep', 'excavation', 'demolition_permit', 'foundation_permit'],
      verticalTags: ['heavy_haul'],
      liftCategories: ['mobile_cranes', 'heavy_lift'],
      landingPage: '/earth-moving',
    },
    rigging: {
      id: 'rigging',
      label: 'Rigging',
      color: '#8b5cf6',
      clusterColor: 'rgba(139, 92, 246, 0.85)',
      strokeColor: 'rgba(100, 60, 200, 0.9)',
      signalTypes: ['structural_steel', 'crane_permit', 'utility_expansion'],
      verticalTags: ['rigging', 'heavy_haul', 'heavy_lift'],
      liftCategories: ['heavy_lift', 'specialty_lift'],
      landingPage: '/rigging',
    },
    concrete_pumping: {
      id: 'concrete-pumping',
      label: 'Concrete Pumping',
      color: '#06b6d4',
      clusterColor: 'rgba(6, 182, 212, 0.85)',
      strokeColor: 'rgba(4, 120, 150, 0.9)',
      signalTypes: ['foundation_permit', 'concrete_pour'],
      verticalTags: ['tower_cranes', 'mobile_cranes'],
      liftCategories: ['tower_cranes', 'mobile_cranes'],
      landingPage: '/concrete-pumping',
    },
  };

  // ── State ───────────────────────────────────────────────────────────────────
  const layerState = {};
  Object.keys(VERTICALS).forEach((k) => (layerState[k] = true)); // all ON by default

  // Clear stale React layer state so the new defaults take effect
  try { localStorage.removeItem('cg_layer_state'); } catch (_) {}

  // Persist / restore from localStorage
  const LS_KEY = 'cg_equipment_layers';
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved) Object.assign(layerState, saved);
  } catch (_) {}

  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(layerState));
    } catch (_) {}
  }

  // ── Data loading ────────────────────────────────────────────────────────────
  const basePath = (() => {
    const s = document.querySelector('script[src*="equipment_layers"]');
    if (s) {
      const parts = s.src.split('/');
      parts.pop();
      return parts.join('/');
    }
    return '/platform';
  })();

  async function loadJSON(filename) {
    try {
      const r = await fetch(`${basePath}/${filename}`);
      if (!r.ok) return [];
      return await r.json();
    } catch (_) {
      return [];
    }
  }

  // ── Filtering logic ─────────────────────────────────────────────────────────
  function filterSignals(signals, vertical) {
    return signals.filter((s) => {
      if (!s.lat || !s.lng) return false;
      const typeMatch = vertical.signalTypes.includes(s.signal_type);
      const tagMatch =
        s.vertical_tags &&
        s.vertical_tags.some((t) => vertical.verticalTags.includes(t));
      return typeMatch || tagMatch;
    });
  }

  function filterOpportunities(opps, vertical) {
    return opps.filter((o) => {
      if (!o.lat || !o.lng) return false;
      const cats = o.recommended_lift_categories || [];
      return cats.some((c) => vertical.liftCategories.includes(c));
    });
  }

  function toGeoJSON(signals, opps, vertical) {
    const features = [];

    signals.forEach((s, i) => {
      features.push({
        type: 'Feature',
        properties: {
          id: s.id || `eq-sig-${vertical.id}-${i}`,
          type: 'equipment_signal',
          vertical: vertical.id,
          label: vertical.label,
          signal_type: s.signal_type || '',
          signal_category: s.signal_category || '',
          confidence: s.confidence || 0,
          geography: s.geography || '',
          signal_date: s.signal_date || '',
          landing_page: vertical.landingPage,
          weight: (s.confidence || 0.5) * 10,
          source: 'signal',
        },
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      });
    });

    opps.forEach((o, i) => {
      features.push({
        type: 'Feature',
        properties: {
          id: o.id || `eq-opp-${vertical.id}-${i}`,
          type: 'equipment_opportunity',
          vertical: vertical.id,
          label: vertical.label,
          project_name: o.project_name || '',
          city: o.city || '',
          state: o.state || '',
          priority_band: o.priority_band || '',
          signal_score: o.signal_score || 0,
          landing_page: vertical.landingPage,
          weight: o.priority_band === 'hot' ? 10 : o.priority_band === 'warm' ? 7 : 5,
          source: 'opportunity',
        },
        geometry: { type: 'Point', coordinates: [o.lng, o.lat] },
      });
    });

    return { type: 'FeatureCollection', features };
  }

  // ── Map integration ─────────────────────────────────────────────────────────
  function getMapInstance() {
    // react-map-gl stores the map on the canvas container's parent
    const canvas = document.querySelector('.mapboxgl-canvas');
    if (!canvas) return null;
    const container = canvas.closest('.mapboxgl-map');
    if (!container) return null;
    // Access via mapboxgl internal
    if (window.__cg_map) return window.__cg_map;
    // Try to get from mapboxgl's internal registry
    const maps = Object.values(window).filter(
      (v) => v && v._container && v.addSource && v.addLayer
    );
    if (maps.length) return maps[0];
    return null;
  }

  function waitForMap(timeout) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        // Try multiple methods to find the map
        const canvas = document.querySelector('.mapboxgl-canvas');
        if (canvas) {
          // react-map-gl exposes the map via a ref on the wrapper
          const wrapper = canvas.closest('[class*="Map"]') || canvas.parentElement?.parentElement;
          if (wrapper && wrapper.__mapInstance) {
            resolve(wrapper.__mapInstance);
            return;
          }
        }
        // Fallback: intercept addSource calls
        if (window.__cg_equipment_map) {
          resolve(window.__cg_equipment_map);
          return;
        }
        if (Date.now() - start > timeout) {
          resolve(null);
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  }

  // Since we can't easily get the Mapbox instance from compiled React,
  // we'll render our own overlay layers using HTML canvas/divs on top of the map
  function createOverlaySystem() {
    const mapContainer = document.querySelector('.mapboxgl-map') ||
      document.querySelector('[class*="mapboxgl"]') ||
      document.querySelector('[style*="mapbox"]');

    if (!mapContainer) return null;

    // Create an overlay container for our equipment markers
    let overlay = document.getElementById('cg-equipment-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cg-equipment-overlay';
      overlay.style.cssText =
        'position:absolute;inset:0;pointer-events:none;z-index:5;overflow:hidden;';
      mapContainer.style.position = 'relative';
      mapContainer.appendChild(overlay);
    }
    return overlay;
  }

  // ── Sidebar wiring ──────────────────────────────────────────────────────────
  // SVG icons for each vertical (inline, minimal)
  const ICONS = {
    forklifts: '<path d="M12 2v8l4 4"/><path d="M12 10l-4 4"/><path d="M8 14v6"/><path d="M16 14v6"/><rect x="4" y="20" width="16" height="2" rx="1"/>',
    steel_erection: '<path d="M2 20h20"/><path d="M5 20V8l7-5 7 5v12"/><path d="M9 20v-6h6v6"/>',
    earth_moving: '<path d="M2 22 16 8"/><circle cx="6" cy="16" r="3"/><circle cx="10" cy="12" r="3"/>',
    rigging: '<path d="M12 2v4"/><path d="M12 6l-4 4"/><path d="M12 6l4 4"/><path d="M8 10v8"/><path d="M16 10v8"/><rect x="6" y="18" width="12" height="4" rx="1"/>',
    concrete_pumping: '<path d="M2 20h20"/><path d="M5 20V10"/><path d="M19 20V10"/><path d="M5 10h14"/><path d="M12 10V4"/><path d="M8 4h8"/>',
  };

  function wireSidebarToggles(geojsonData) {
    // Find the sidebar panel that contains "INFRASTRUCTURE" header — we insert BEFORE it
    function findInfrastructureHeader() {
      const allSpans = document.querySelectorAll('span');
      for (const span of allSpans) {
        if (span.textContent.trim() === 'INFRASTRUCTURE') return span;
      }
      return null;
    }

    function tryInsert() {
      try {
        const infraHeader = findInfrastructureHeader();
        if (!infraHeader) return false;

        // Navigate: span → div.flex.items-center (header row) → div.flex.flex-col (section container)
        const headerRow = infraHeader.parentElement; // div.flex.items-center
        const infraSection = headerRow?.parentElement; // div.flex.flex-col (the INFRASTRUCTURE section)
        if (!infraSection || !infraSection.parentElement) {
          console.log('[CG Equipment Layers] tryInsert: infraSection or parent missing');
          return false;
        }

        // Check if we already injected
        if (document.getElementById('cg-equipment-verticals-section')) return true;

      // Create the EQUIPMENT VERTICALS section — matching existing sidebar style exactly
      const section = document.createElement('div');
      section.id = 'cg-equipment-verticals-section';
      section.className = 'flex flex-col';

      // Section header — matches CAPEX INTELLIGENCE / INFRASTRUCTURE pattern
      const header = document.createElement('div');
      header.className = 'flex items-center gap-2 mb-2 mt-2 pt-2 border-t border-[var(--border-primary)]/30';
      header.innerHTML = '<span class="text-[8px] font-mono tracking-[0.2em] font-bold text-[var(--text-muted)]">EQUIPMENT VERTICALS</span>';
      section.appendChild(header);

      // Create a toggle row for each vertical — matching Crane Opportunities / Industrial Signals pattern
      for (const [key, vertical] of Object.entries(VERTICALS)) {
        const count = geojsonData[key]?.features?.length || 0;
        const row = document.createElement('div');
        row.className = 'flex flex-col';
        row.innerHTML = `
          <div class="flex items-start justify-between group cursor-pointer" data-eq-layer="${key}">
            <div class="flex gap-3">
              <div class="mt-1 transition-colors" style="color:${vertical.color}">
                <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg></span>
              </div>
              <div class="flex flex-col">
                <a href="${vertical.landingPage}" class="text-sm font-medium text-[var(--text-primary)] tracking-wide" style="text-decoration:none;color:inherit;">${vertical.label}</a>
                <span class="text-[9px] text-[var(--text-muted)] font-mono tracking-wider mt-0.5">${count.toLocaleString()} signals · LIVE</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="eq-toggle text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border cursor-pointer select-none transition-all" data-eq-key="${key}" style="border-color:${vertical.color};color:${vertical.color};background:rgba(0,0,0,0.3);box-shadow:0 0 10px ${vertical.color}33;">ON</div>
            </div>
          </div>
        `;
        section.appendChild(row);
      }

      // Insert before INFRASTRUCTURE section
      infraSection.parentElement.insertBefore(section, infraSection);

      // Wire up toggle clicks
      section.querySelectorAll('.eq-toggle').forEach((toggle) => {
        const key = toggle.dataset.eqKey;
        const vertical = VERTICALS[key];

        function applyToggleStyle(t, isOn) {
          if (isOn) {
            t.textContent = 'ON';
            t.style.borderColor = vertical.color;
            t.style.color = vertical.color;
            t.style.background = 'rgba(0,0,0,0.3)';
            t.style.boxShadow = `0 0 10px ${vertical.color}33`;
          } else {
            t.textContent = 'OFF';
            t.style.borderColor = 'var(--border-primary, rgba(255,255,255,0.15))';
            t.style.color = 'var(--text-muted, rgba(255,255,255,0.4))';
            t.style.background = 'transparent';
            t.style.boxShadow = 'none';
          }
        }

        // Set initial state from saved
        applyToggleStyle(toggle, layerState[key]);

        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          layerState[key] = !layerState[key];
          saveState();
          applyToggleStyle(toggle, layerState[key]);
          updateMapLayers(key, geojsonData[key]);
        });
      });

      console.log('[CG Equipment Layers] Sidebar section injected with 5 toggles');
      return true;
      } catch (err) {
        console.error('[CG Equipment Layers] tryInsert error:', err);
        return false;
      }
    }

    // Use MutationObserver to detect when INFRASTRUCTURE header appears
    // AND re-inject if React re-renders and removes our section
    console.log('[CG Equipment Layers] wireSidebarToggles called, setting up persistent observer');

    tryInsert();

    const observer = new MutationObserver(() => {
      // Always check — React may have re-rendered and removed our section
      if (!document.getElementById('cg-equipment-verticals-section')) {
        tryInsert();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also poll as fallback — keeps trying forever (every 2s)
    setInterval(() => {
      if (!document.getElementById('cg-equipment-verticals-section')) {
        tryInsert();
      }
    }, 2000);
  }

  // updateBadge removed — toggle styling now handled inline in wireSidebarToggles

  // ── Map layer rendering ─────────────────────────────────────────────────────
  // We use a Mapbox-compatible approach: inject into the map via its global instance
  // or fall back to an HTML overlay with positioned markers

  let mapRef = null;
  const activeLayers = {};

  function findMapboxMap() {
    // Method 1: Check for exposed map on window
    if (window.__cg_map && window.__cg_map.addSource) return window.__cg_map;

    // Method 2: React fiber traversal on the map container (works for both Mapbox and MapLibre)
    try {
      const mapEl = document.querySelector('.maplibregl-map') || document.querySelector('.mapboxgl-map');
      if (mapEl) {
        const fiberKey = Object.keys(mapEl).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
        if (fiberKey) {
          let fiber = mapEl[fiberKey];
          let depth = 0;
          while (fiber && depth < 80) {
            if (fiber.stateNode && fiber.stateNode.getMap) {
              const m = fiber.stateNode.getMap();
              if (m && m.addSource) return m;
            }
            if (fiber.ref?.current?.getMap) {
              const m = fiber.ref.current.getMap();
              if (m && m.addSource) return m;
            }
            fiber = fiber.return;
            depth++;
          }
        }
      }
    } catch (_) {}

    return null;
  }

  function addMapboxLayers(map, key, geojson, vertical) {
    const sourceId = `cg-equip-${vertical.id}`;
    const clusterId = `cg-equip-${vertical.id}-clusters`;
    const pointId = `cg-equip-${vertical.id}-points`;
    const countId = `cg-equip-${vertical.id}-count`;

    // Remove existing if re-adding
    try {
      if (map.getLayer(countId)) map.removeLayer(countId);
      if (map.getLayer(pointId)) map.removeLayer(pointId);
      if (map.getLayer(clusterId)) map.removeLayer(clusterId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    } catch (_) {}

    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 50,
    });

    // Cluster circles
    map.addLayer({
      id: clusterId,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': vertical.clusterColor,
        'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
        'circle-stroke-width': 2,
        'circle-stroke-color': vertical.strokeColor,
        'circle-opacity': 0.9,
      },
    });

    // Cluster count labels
    map.addLayer({
      id: countId,
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 11,
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Individual points
    map.addLayer({
      id: pointId,
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': vertical.color,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 6, 5, 10, 7, 14, 9],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': vertical.strokeColor,
        'circle-opacity': 0.85,
      },
    });

    // Click handler for individual points
    map.on('click', pointId, (e) => {
      if (!e.features || !e.features.length) return;
      const f = e.features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice();

      const isOpp = p.source === 'opportunity';
      const title = isOpp
        ? (p.project_name || 'Opportunity')
        : `${p.signal_type?.replace(/_/g, ' ')} signal`;
      const location = isOpp
        ? `${p.city || ''}, ${p.state || ''}`
        : (p.geography || '');
      const score = isOpp
        ? `Score: ${p.signal_score}/10`
        : `Confidence: ${Math.round((p.confidence || 0) * 100)}%`;
      const band = isOpp && p.priority_band
        ? `<span style="color:${p.priority_band === 'hot' ? '#ef4444' : '#f59e0b'};text-transform:uppercase;font-weight:bold;font-size:10px;">${p.priority_band}</span>`
        : '';

      const html = `
        <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:260px;padding:2px;">
          <div style="font-size:10px;color:${vertical.color};font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">
            ${vertical.label} ${band}
          </div>
          <div style="font-size:13px;font-weight:600;color:#e8f0ff;margin-bottom:4px;line-height:1.3;">
            ${title}
          </div>
          <div style="font-size:11px;color:#8899aa;margin-bottom:6px;">
            ${location} · ${score}
          </div>
          <a href="${p.landing_page}"
             style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#080c14;background:${vertical.color};padding:6px 12px;text-decoration:none;border-radius:2px;">
            View ${vertical.label} Intel
          </a>
        </div>
      `;

      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '280px', className: 'cg-equip-popup' })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map);
    });

    // Cursor pointer on hover
    map.on('mouseenter', pointId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', pointId, () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', clusterId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', clusterId, () => { map.getCanvas().style.cursor = ''; });

    // Click cluster to zoom
    map.on('click', clusterId, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterId] });
      if (!features.length) return;
      const clusterId2 = features[0].properties.cluster_id;
      map.getSource(sourceId).getClusterExpansionZoom(clusterId2, (err, zoom) => {
        if (err) return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    activeLayers[key] = { sourceId, clusterId, pointId, countId };
  }

  function setLayerVisibility(map, key, visible) {
    const layers = activeLayers[key];
    if (!layers) return;
    const vis = visible ? 'visible' : 'none';
    try {
      map.setLayoutProperty(layers.clusterId, 'visibility', vis);
      map.setLayoutProperty(layers.pointId, 'visibility', vis);
      map.setLayoutProperty(layers.countId, 'visibility', vis);
    } catch (_) {}
  }

  function updateMapLayers(key, geojson) {
    if (!mapRef) return;
    if (!activeLayers[key]) {
      // First time — add layers
      addMapboxLayers(mapRef, key, geojson, VERTICALS[key]);
    }
    setLayerVisibility(mapRef, key, layerState[key]);
  }

  // ── Popup styles ────────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cg-equip-popup .mapboxgl-popup-content,
      .cg-equip-popup .maplibregl-popup-content {
        background: #0d1628 !important;
        border: 1px solid rgba(245,166,35,0.22) !important;
        border-radius: 8px !important;
        padding: 12px 14px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
      }
      .cg-equip-popup .mapboxgl-popup-tip,
      .cg-equip-popup .maplibregl-popup-tip {
        border-top-color: #0d1628 !important;
      }
      .cg-equip-popup .mapboxgl-popup-close-button,
      .cg-equip-popup .maplibregl-popup-close-button {
        color: #8899aa !important;
        font-size: 16px !important;
        padding: 4px 8px !important;
      }
      .cg-equip-popup .mapboxgl-popup-close-button:hover,
      .cg-equip-popup .maplibregl-popup-close-button:hover {
        color: #e8f0ff !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  async function init() {
    injectStyles();

    // Load data
    const [signals, opportunities] = await Promise.all([
      loadJSON('cranegenius_signals.json'),
      loadJSON('cranegenius_opportunities.json'),
    ]);

    if (!signals.length && !opportunities.length) {
      console.warn('[CG Equipment Layers] No signal/opportunity data found');
      return;
    }

    console.log(`[CG Equipment Layers] Loaded ${signals.length} signals, ${opportunities.length} opportunities`);

    // Build filtered GeoJSON for each vertical
    const geojsonData = {};
    for (const [key, vertical] of Object.entries(VERTICALS)) {
      const filteredSignals = filterSignals(signals, vertical);
      const filteredOpps = filterOpportunities(opportunities, vertical);
      geojsonData[key] = toGeoJSON(filteredSignals, filteredOpps, vertical);
      console.log(`[CG Equipment Layers] ${vertical.label}: ${filteredSignals.length} signals + ${filteredOpps.length} opps = ${geojsonData[key].features.length} features`);
    }

    // Wire sidebar toggles
    wireSidebarToggles(geojsonData);

    // Add all equipment layers to the map
    function addAllLayers(map) {
      if (map.__cg_layers_added) return; // prevent double-add
      console.log('[CG Equipment Layers] Adding all 5 layers to map...');
      for (const [key, vertical] of Object.entries(VERTICALS)) {
        addMapboxLayers(map, key, geojsonData[key], vertical);
        setLayerVisibility(map, key, layerState[key]);
      }
      map.__cg_layers_added = true;
      console.log('[CG Equipment Layers] All 5 equipment layers added');
      window.__cg_equipment = { layerState, geojsonData, VERTICALS, mapRef: map };
    }

    // Poll for the map instance, then wait for style to load
    let layersAdded = false;
    const pollMap = () => {
      if (layersAdded) return;
      mapRef = findMapboxMap();
      if (!mapRef) return; // not found yet

      console.log('[CG Equipment Layers] Map instance found, trying to add layers...');

      // Keep trying addSource until it works (style may not report as loaded via react-map-gl)
      let retries = 0;
      const tryAdd = () => {
        if (layersAdded) return;
        try {
          addAllLayers(mapRef);
          layersAdded = true;
        } catch (e) {
          retries++;
          if (retries < 60) {
            setTimeout(tryAdd, 1000); // retry every second for up to 60s
          } else {
            console.warn('[CG Equipment Layers] Gave up after 60 retries:', e.message);
          }
        }
      };
      tryAdd();
    };

    // Poll for map instance every second for up to 2 minutes
    let mapAttempts = 0;
    const startPoll = () => {
      if (layersAdded) return;
      pollMap();
      if (!mapRef) {
        mapAttempts++;
        if (mapAttempts < 120) setTimeout(startPoll, 1000);
      }
    };
    setTimeout(startPoll, 2000);
  }

  // Force the LAYERS panel open if it's collapsed after modals
  function ensureLayersPanelOpen() {
    const panel = document.querySelector('[class*="left-6"][class*="w-80"]') ||
      document.querySelector('[style*="transform"][class*="absolute"]');
    if (!panel) return;
    const style = window.getComputedStyle(panel);
    const matrix = style.transform;
    // If transform shows negative x translation, panel is hidden
    if (matrix && matrix !== 'none') {
      const match = matrix.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*(-?\d+)/);
      if (match && parseInt(match[1]) < -10) {
        // Panel is off-screen — click LAYERS button to open it
        const spans = document.querySelectorAll('span');
        for (const s of spans) {
          if (s.textContent.trim() === 'LAYERS' && s.parentElement?.tagName === 'BUTTON') {
            s.parentElement.click();
            console.log('[CG Equipment Layers] Auto-opened LAYERS panel');
            break;
          }
        }
      }
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
  } else {
    setTimeout(init, 1000);
  }

  // Enable all data layers by clicking the "Enable all layers" button
  function enableAllLayers() {
    // Find the eye/toggle button that enables all layers
    // It's near the DATA LAYERS header and has title containing "Enable all"
    const buttons = document.querySelectorAll('button[title*="Enable all"], button[title*="enable all"]');
    for (const b of buttons) {
      if (b.title.includes('Enable all')) {
        b.click();
        console.log('[CG Equipment Layers] Clicked "Enable all layers" button');
        return true;
      }
    }
    // Fallback: find the eye icon button near DATA LAYERS
    const spans = document.querySelectorAll('span');
    for (const s of spans) {
      if (s.textContent.trim() === 'DATA LAYERS') {
        const container = s.closest('div');
        if (container) {
          const eyeBtn = container.querySelector('button[title*="Enable"], button:has(svg)');
          if (eyeBtn && eyeBtn.title && eyeBtn.title.includes('Enable')) {
            eyeBtn.click();
            console.log('[CG Equipment Layers] Clicked enable button near DATA LAYERS');
            return true;
          }
        }
      }
    }
    return false;
  }

  // Ensure layers panel stays open and all layers are ON after onboarding modals close
  function autoSetup() {
    ensureLayersPanelOpen();
    // Only enable all if not already done this session
    if (!sessionStorage.getItem('cg_layers_enabled')) {
      if (enableAllLayers()) {
        sessionStorage.setItem('cg_layers_enabled', 'true');
      }
    }
  }

  setTimeout(autoSetup, 5000);
  setTimeout(autoSetup, 10000);
})();
