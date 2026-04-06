/**
 * CraneGenius Conflict & Geopolitical Intelligence Feeds
 * Layers: Ukraine Frontline, GDELT Conflict Events, Strait of Hormuz AIS
 * Follows the same map-discovery pattern as equipment_layers.js
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://qdnaglhailuflynirqtt.supabase.co';
  const LOG_PREFIX = '[CG Conflict Feeds]';

  // ── Layer definitions ────────────────────────────────────────────────────────
  const LAYERS = {
    ukraine_frontline: {
      id: 'ukraine-frontline',
      label: 'Ukraine Frontline',
      color: '#facc15',
      refreshInterval: 600000, // 10 min
      enabled: true,
    },
    gdelt_conflict: {
      id: 'gdelt-conflict',
      label: 'Geopolitical Conflicts',
      color: '#ef4444',
      refreshInterval: 300000, // 5 min
      enabled: true,
    },
    hormuz_shipping: {
      id: 'hormuz-shipping',
      label: 'Hormuz Shipping',
      color: '#3b82f6',
      refreshInterval: 300000, // 5 min
      enabled: true,
    },
  };

  // ── State ────────────────────────────────────────────────────────────────────
  const layerState = {};
  Object.keys(LAYERS).forEach((k) => (layerState[k] = LAYERS[k].enabled));

  const LS_KEY = 'cg_conflict_layers';
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved) Object.assign(layerState, saved);
  } catch (_) {}

  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(layerState)); } catch (_) {}
  }

  // ── Map discovery (same pattern as equipment_layers.js) ──────────────────────
  let mapRef = null;
  const activeLayers = {};
  const refreshTimers = {};

  function findMapInstance() {
    if (window.__cg_map && window.__cg_map.addSource) return window.__cg_map;

    try {
      const mapEl = document.querySelector('.maplibregl-map') || document.querySelector('.mapboxgl-map');
      if (mapEl) {
        const fiberKey = Object.keys(mapEl).find(
          (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
        );
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

  // ── Data fetchers ────────────────────────────────────────────────────────────

  // LAYER 1: Ukraine Frontline
  async function fetchUkraineFrontline() {
    let data = null;

    // Try DeepStateMap API first
    try {
      const r = await fetch('https://deepstatemap.live/api/history/last', {
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) data = await r.json();
    } catch (_) {
      console.log(LOG_PREFIX, 'DeepStateMap direct fetch failed (likely CORS), trying proxy...');
    }

    // Fallback: Supabase proxy
    if (!data) {
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/live-feeds?feed=ukraine`, {
          signal: AbortSignal.timeout(10000),
        });
        if (r.ok) data = await r.json();
      } catch (e) {
        console.warn(LOG_PREFIX, 'Ukraine proxy fetch failed:', e.message);
      }
    }

    if (!data) return null;

    // Convert to GeoJSON — DeepStateMap returns GeoJSON-like structures
    // Handle both raw GeoJSON and wrapped responses
    if (data.type === 'FeatureCollection') return data;
    if (data.features) return { type: 'FeatureCollection', features: data.features };
    if (data.geojson) return data.geojson;

    // If it's an array of coordinate sets, build polygons
    if (Array.isArray(data)) {
      const features = data
        .filter((item) => item.geometry || item.coordinates || item.lat)
        .map((item, i) => {
          let geometry = item.geometry;
          if (!geometry && item.coordinates) {
            geometry = { type: 'Polygon', coordinates: item.coordinates };
          }
          if (!geometry && item.lat && item.lng) {
            geometry = { type: 'Point', coordinates: [item.lng, item.lat] };
          }
          const control = (item.control || item.status || '').toLowerCase();
          return {
            type: 'Feature',
            properties: {
              id: item.id || `ukr-${i}`,
              control: control,
              label: item.label || item.name || '',
              date: item.date || '',
            },
            geometry,
          };
        });
      return { type: 'FeatureCollection', features };
    }

    return null;
  }

  // LAYER 2: GDELT Conflict Events
  async function fetchGDELTConflict() {
    let data = null;

    // Try Supabase proxy first
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/live-feeds?feed=gdelt-conflict`, {
        signal: AbortSignal.timeout(10000),
      });
      if (r.ok) data = await r.json();
    } catch (_) {
      console.log(LOG_PREFIX, 'GDELT proxy not available, trying direct API...');
    }

    // Fallback: direct GDELT API
    if (!data) {
      try {
        const q = encodeURIComponent(
          'iran OR hormuz OR houthi OR ukraine OR shipping disruption OR strait OR blockade'
        );
        const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${q}&mode=pointdata&format=geojson&timespan=48h`;
        const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (r.ok) data = await r.json();
      } catch (e) {
        console.warn(LOG_PREFIX, 'GDELT direct fetch failed:', e.message);
      }
    }

    if (!data) return null;

    // GDELT returns GeoJSON FeatureCollection
    if (data.type === 'FeatureCollection') {
      // Classify events
      data.features = (data.features || []).map((f) => {
        const name = (f.properties.name || f.properties.html || '').toLowerCase();
        const isLogistics =
          name.includes('shipping') ||
          name.includes('logistics') ||
          name.includes('supply chain') ||
          name.includes('port') ||
          name.includes('strait') ||
          name.includes('blockade');
        f.properties._eventType = isLogistics ? 'logistics' : 'conflict';
        f.properties._title = f.properties.name || f.properties.html || 'Event';
        f.properties._url = f.properties.url || f.properties.shareimage || '';
        f.properties._date = f.properties.date || f.properties.SQLDATE || '';
        f.properties._location = f.properties.ActionGeo_FullName || f.properties.location || '';
        return f;
      });
      return data;
    }

    return null;
  }

  // LAYER 3: Strait of Hormuz AIS (vessels)
  async function fetchHormuzAIS() {
    let data = null;

    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/live-feeds?feed=ais`, {
        signal: AbortSignal.timeout(10000),
      });
      if (r.ok) data = await r.json();
    } catch (e) {
      console.warn(LOG_PREFIX, 'AIS fetch failed:', e.message);
    }

    if (!data) return null;

    // Filter to Hormuz bounding box: lat 25-28, lng 54-58
    const HORMUZ_BBOX = { minLat: 25, maxLat: 28, minLng: 54, maxLng: 58 };

    let vessels = [];
    if (data.type === 'FeatureCollection') {
      vessels = (data.features || []).filter((f) => {
        const [lng, lat] = f.geometry?.coordinates || [0, 0];
        return (
          lat >= HORMUZ_BBOX.minLat &&
          lat <= HORMUZ_BBOX.maxLat &&
          lng >= HORMUZ_BBOX.minLng &&
          lng <= HORMUZ_BBOX.maxLng
        );
      });
    } else if (Array.isArray(data)) {
      vessels = data
        .filter((v) => {
          const lat = v.lat || v.latitude || 0;
          const lng = v.lng || v.lon || v.longitude || 0;
          return (
            lat >= HORMUZ_BBOX.minLat &&
            lat <= HORMUZ_BBOX.maxLat &&
            lng >= HORMUZ_BBOX.minLng &&
            lng <= HORMUZ_BBOX.maxLng
          );
        })
        .map((v, i) => ({
          type: 'Feature',
          properties: {
            id: v.mmsi || v.id || `ais-${i}`,
            name: v.name || v.vessel_name || 'Unknown',
            speed: v.speed || v.sog || 0,
            heading: v.heading || v.cog || 0,
            destination: v.destination || '',
          },
          geometry: {
            type: 'Point',
            coordinates: [v.lng || v.lon || v.longitude, v.lat || v.latitude],
          },
        }));
    }

    return {
      type: 'FeatureCollection',
      features: vessels,
    };
  }

  // ── Map layer rendering ──────────────────────────────────────────────────────

  function removeLayerSafe(map, layerId) {
    try { if (map.getLayer(layerId)) map.removeLayer(layerId); } catch (_) {}
  }
  function removeSourceSafe(map, sourceId) {
    try { if (map.getSource(sourceId)) map.removeSource(sourceId); } catch (_) {}
  }

  // LAYER 1: Ukraine frontline — polygons/lines
  function renderUkraineFrontline(map, geojson) {
    const srcId = 'cg-conflict-ukraine';
    const fillRus = 'cg-conflict-ukraine-fill-rus';
    const fillUkr = 'cg-conflict-ukraine-fill-ukr';
    const fillContested = 'cg-conflict-ukraine-fill-contested';
    const lineId = 'cg-conflict-ukraine-line';

    // Cleanup
    [fillRus, fillUkr, fillContested, lineId].forEach((l) => removeLayerSafe(map, l));
    removeSourceSafe(map, srcId);

    if (!geojson || !geojson.features || !geojson.features.length) return;

    map.addSource(srcId, { type: 'geojson', data: geojson });

    // Russian-controlled — red fills
    map.addLayer({
      id: fillRus,
      type: 'fill',
      source: srcId,
      filter: ['any',
        ['==', ['get', 'control'], 'russian'],
        ['==', ['get', 'control'], 'russia'],
        ['==', ['get', 'control'], 'occupied'],
      ],
      paint: {
        'fill-color': 'rgba(239, 68, 68, 0.35)',
        'fill-outline-color': 'rgba(239, 68, 68, 0.8)',
      },
    });

    // Ukrainian-controlled — blue fills
    map.addLayer({
      id: fillUkr,
      type: 'fill',
      source: srcId,
      filter: ['any',
        ['==', ['get', 'control'], 'ukrainian'],
        ['==', ['get', 'control'], 'ukraine'],
        ['==', ['get', 'control'], 'liberated'],
      ],
      paint: {
        'fill-color': 'rgba(59, 130, 246, 0.35)',
        'fill-outline-color': 'rgba(59, 130, 246, 0.8)',
      },
    });

    // Contested — yellow fills
    map.addLayer({
      id: fillContested,
      type: 'fill',
      source: srcId,
      filter: ['any',
        ['==', ['get', 'control'], 'contested'],
        ['==', ['get', 'control'], 'gray'],
        ['==', ['get', 'control'], 'grey'],
      ],
      paint: {
        'fill-color': 'rgba(250, 204, 21, 0.35)',
        'fill-outline-color': 'rgba(250, 204, 21, 0.8)',
      },
    });

    // Frontline outline for all features
    map.addLayer({
      id: lineId,
      type: 'line',
      source: srcId,
      paint: {
        'line-color': '#facc15',
        'line-width': 2,
        'line-opacity': 0.8,
      },
    });

    activeLayers.ukraine_frontline = { sourceId: srcId, layerIds: [fillRus, fillUkr, fillContested, lineId] };
    console.log(LOG_PREFIX, `Ukraine frontline: ${geojson.features.length} features rendered`);
  }

  // LAYER 2: GDELT conflict events — circles
  function renderGDELTConflict(map, geojson) {
    const srcId = 'cg-conflict-gdelt';
    const conflictId = 'cg-conflict-gdelt-conflict';
    const logisticsId = 'cg-conflict-gdelt-logistics';

    [conflictId, logisticsId].forEach((l) => removeLayerSafe(map, l));
    removeSourceSafe(map, srcId);

    if (!geojson || !geojson.features || !geojson.features.length) return;

    map.addSource(srcId, { type: 'geojson', data: geojson });

    // Conflict events — red circles
    map.addLayer({
      id: conflictId,
      type: 'circle',
      source: srcId,
      filter: ['==', ['get', '_eventType'], 'conflict'],
      paint: {
        'circle-color': 'rgba(239, 68, 68, 0.8)',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 6, 10, 8],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(180, 40, 40, 0.9)',
      },
    });

    // Logistics disruption events — orange circles
    map.addLayer({
      id: logisticsId,
      type: 'circle',
      source: srcId,
      filter: ['==', ['get', '_eventType'], 'logistics'],
      paint: {
        'circle-color': 'rgba(249, 115, 22, 0.8)',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 6, 10, 8],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(180, 80, 10, 0.9)',
      },
    });

    // Popups for both layers
    [conflictId, logisticsId].forEach((layerId) => {
      map.on('click', layerId, (e) => {
        if (!e.features || !e.features.length) return;
        const f = e.features[0];
        const p = f.properties;
        const coords = f.geometry.coordinates.slice();
        const isLogistics = p._eventType === 'logistics';

        const html = `
          <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:300px;padding:2px;">
            <div style="font-size:10px;color:${isLogistics ? '#f97316' : '#ef4444'};font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">
              ${isLogistics ? 'LOGISTICS DISRUPTION' : 'CONFLICT EVENT'}
            </div>
            <div style="font-size:13px;font-weight:600;color:#e8f0ff;margin-bottom:4px;line-height:1.3;">
              ${p._title || 'Event'}
            </div>
            <div style="font-size:11px;color:#8899aa;margin-bottom:4px;">
              ${p._location || ''} ${p._date ? '· ' + p._date : ''}
            </div>
            ${p._url ? `<a href="${p._url}" target="_blank" rel="noopener" style="font-size:10px;color:#3b82f6;text-decoration:underline;">Source</a>` : ''}
          </div>
        `;

        new (window.maplibregl || window.mapboxgl).Popup({
          closeButton: true,
          maxWidth: '320px',
          className: 'cg-conflict-popup',
        })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });

      map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
    });

    activeLayers.gdelt_conflict = { sourceId: srcId, layerIds: [conflictId, logisticsId] };
    console.log(LOG_PREFIX, `GDELT conflict: ${geojson.features.length} events rendered`);
  }

  // LAYER 3: Hormuz AIS — small blue triangles (using symbol layer with custom icon)
  function renderHormuzShipping(map, geojson) {
    const srcId = 'cg-conflict-hormuz';
    const symbolId = 'cg-conflict-hormuz-vessels';
    const circleId = 'cg-conflict-hormuz-circles';

    [symbolId, circleId].forEach((l) => removeLayerSafe(map, l));
    removeSourceSafe(map, srcId);

    if (!geojson || !geojson.features || !geojson.features.length) return;

    map.addSource(srcId, { type: 'geojson', data: geojson });

    // Render as small blue triangles using circle + symbol
    // Since custom icons require image loading, use circle markers with direction indicator
    map.addLayer({
      id: circleId,
      type: 'circle',
      source: srcId,
      paint: {
        'circle-color': 'rgba(59, 130, 246, 0.8)',
        'circle-radius': 5,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(30, 64, 175, 0.9)',
      },
    });

    // Create and add triangle icon for vessel heading
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 1);        // top point
    ctx.lineTo(size - 1, size - 1);  // bottom-right
    ctx.lineTo(1, size - 1);         // bottom-left
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const imgData = ctx.getImageData(0, 0, size, size);

    // Try adding the triangle image
    try {
      if (!map.hasImage('cg-vessel-triangle')) {
        map.addImage('cg-vessel-triangle', imgData, { sdf: false });
      }

      // Remove the circle fallback and use symbols instead
      removeLayerSafe(map, circleId);

      map.addLayer({
        id: symbolId,
        type: 'symbol',
        source: srcId,
        layout: {
          'icon-image': 'cg-vessel-triangle',
          'icon-size': 1,
          'icon-rotate': ['get', 'heading'],
          'icon-allow-overlap': true,
          'icon-rotation-alignment': 'map',
        },
      });
    } catch (_) {
      // If symbol layer fails, circles are already added as fallback
      console.log(LOG_PREFIX, 'Using circle fallback for vessel markers');
    }

    // Popups
    const clickLayer = map.getLayer(symbolId) ? symbolId : circleId;
    map.on('click', clickLayer, (e) => {
      if (!e.features || !e.features.length) return;
      const f = e.features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice();

      const html = `
        <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:260px;padding:2px;">
          <div style="font-size:10px;color:#3b82f6;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">
            VESSEL · STRAIT OF HORMUZ
          </div>
          <div style="font-size:13px;font-weight:600;color:#e8f0ff;margin-bottom:4px;">
            ${p.name || 'Unknown Vessel'}
          </div>
          <div style="font-size:11px;color:#8899aa;line-height:1.6;">
            Speed: ${p.speed || 0} kn<br>
            Heading: ${p.heading || 0}°<br>
            ${p.destination ? 'Dest: ' + p.destination : ''}
          </div>
        </div>
      `;

      new (window.maplibregl || window.mapboxgl).Popup({
        closeButton: true,
        maxWidth: '280px',
        className: 'cg-conflict-popup',
      })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map);
    });

    map.on('mouseenter', clickLayer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', clickLayer, () => { map.getCanvas().style.cursor = ''; });

    activeLayers.hormuz_shipping = {
      sourceId: srcId,
      layerIds: [symbolId, circleId].filter((l) => { try { return !!map.getLayer(l); } catch (_) { return false; } }),
    };
    console.log(LOG_PREFIX, `Hormuz AIS: ${geojson.features.length} vessels rendered`);
  }

  // ── Layer visibility ─────────────────────────────────────────────────────────

  function setVisibility(map, key, visible) {
    const info = activeLayers[key];
    if (!info) return;
    const vis = visible ? 'visible' : 'none';
    (info.layerIds || []).forEach((lid) => {
      try { map.setLayoutProperty(lid, 'visibility', vis); } catch (_) {}
    });
  }

  // ── Data refresh ─────────────────────────────────────────────────────────────

  async function refreshLayer(map, key) {
    if (!layerState[key]) return;
    try {
      let geojson = null;
      if (key === 'ukraine_frontline') {
        geojson = await fetchUkraineFrontline();
        if (geojson) renderUkraineFrontline(map, geojson);
      } else if (key === 'gdelt_conflict') {
        geojson = await fetchGDELTConflict();
        if (geojson) renderGDELTConflict(map, geojson);
      } else if (key === 'hormuz_shipping') {
        geojson = await fetchHormuzAIS();
        if (geojson) renderHormuzShipping(map, geojson);
      }
    } catch (e) {
      console.warn(LOG_PREFIX, `Refresh ${key} failed:`, e.message);
    }
  }

  function startAutoRefresh(map) {
    Object.entries(LAYERS).forEach(([key, def]) => {
      if (refreshTimers[key]) clearInterval(refreshTimers[key]);
      refreshTimers[key] = setInterval(() => refreshLayer(map, key), def.refreshInterval);
    });
  }

  // ── Sidebar wiring ───────────────────────────────────────────────────────────

  function wireSidebarToggles() {
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

        const headerRow = infraHeader.parentElement;
        const infraSection = headerRow?.parentElement;
        if (!infraSection || !infraSection.parentElement) return false;

        if (document.getElementById('cg-conflict-feeds-section')) return true;

        const section = document.createElement('div');
        section.id = 'cg-conflict-feeds-section';
        section.className = 'flex flex-col';

        const header = document.createElement('div');
        header.className = 'flex items-center gap-2 mb-2 mt-2 pt-2 border-t border-[var(--border-primary)]/30';
        header.innerHTML =
          '<span class="text-[8px] font-mono tracking-[0.2em] font-bold text-[var(--text-muted)]">GEOPOLITICAL INTEL</span>';
        section.appendChild(header);

        const LAYER_ICONS = {
          ukraine_frontline:
            '<path d="M3 3h18v18H3z" fill="none"/><path d="M3 12h18"/><path d="M7 8l5-4 5 4"/><path d="M7 16l5 4 5-4"/>',
          gdelt_conflict:
            '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/><path d="M8 15l-2 2"/><path d="M16 15l2 2"/>',
          hormuz_shipping:
            '<path d="M2 20l4-4 4 2 4-6 4 2 4-6"/><circle cx="6" cy="16" r="2"/><circle cx="18" cy="8" r="2"/>',
        };

        for (const [key, layer] of Object.entries(LAYERS)) {
          const row = document.createElement('div');
          row.className = 'flex flex-col';
          row.innerHTML = `
            <div class="flex items-start justify-between group cursor-pointer" data-conflict-layer="${key}">
              <div class="flex gap-3">
                <div class="mt-1 transition-colors" style="color:${layer.color}">
                  <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LAYER_ICONS[key]}</svg></span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-[var(--text-primary)] tracking-wide">${layer.label}</span>
                  <span class="text-[9px] text-[var(--text-muted)] font-mono tracking-wider mt-0.5">LIVE · ${Math.round(layer.refreshInterval / 60000)}m refresh</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="conflict-toggle text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border cursor-pointer select-none transition-all" data-conflict-key="${key}" style="border-color:${layer.color};color:${layer.color};background:rgba(0,0,0,0.3);box-shadow:0 0 10px ${layer.color}33;">ON</div>
              </div>
            </div>
          `;
          section.appendChild(row);
        }

        // Insert before INFRASTRUCTURE
        infraSection.parentElement.insertBefore(section, infraSection);

        // Wire toggle clicks
        section.querySelectorAll('.conflict-toggle').forEach((toggle) => {
          const key = toggle.dataset.conflictKey;
          const layer = LAYERS[key];

          function applyStyle(t, isOn) {
            if (isOn) {
              t.textContent = 'ON';
              t.style.borderColor = layer.color;
              t.style.color = layer.color;
              t.style.background = 'rgba(0,0,0,0.3)';
              t.style.boxShadow = `0 0 10px ${layer.color}33`;
            } else {
              t.textContent = 'OFF';
              t.style.borderColor = 'var(--border-primary, rgba(255,255,255,0.15))';
              t.style.color = 'var(--text-muted, rgba(255,255,255,0.4))';
              t.style.background = 'transparent';
              t.style.boxShadow = 'none';
            }
          }

          applyStyle(toggle, layerState[key]);

          toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            layerState[key] = !layerState[key];
            saveState();
            applyStyle(toggle, layerState[key]);
            if (mapRef) setVisibility(mapRef, key, layerState[key]);
          });
        });

        console.log(LOG_PREFIX, 'Sidebar section injected with 3 toggles');
        return true;
      } catch (err) {
        console.error(LOG_PREFIX, 'Sidebar inject error:', err);
        return false;
      }
    }

    tryInsert();

    const observer = new MutationObserver(() => {
      if (!document.getElementById('cg-conflict-feeds-section')) {
        tryInsert();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
      if (!document.getElementById('cg-conflict-feeds-section')) {
        tryInsert();
      }
    }, 2000);
  }

  // ── Popup styles ─────────────────────────────────────────────────────────────

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cg-conflict-popup .mapboxgl-popup-content,
      .cg-conflict-popup .maplibregl-popup-content {
        background: #0d1628 !important;
        border: 1px solid rgba(239,68,68,0.22) !important;
        border-radius: 8px !important;
        padding: 12px 14px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
      }
      .cg-conflict-popup .mapboxgl-popup-tip,
      .cg-conflict-popup .maplibregl-popup-tip {
        border-top-color: #0d1628 !important;
      }
      .cg-conflict-popup .mapboxgl-popup-close-button,
      .cg-conflict-popup .maplibregl-popup-close-button {
        color: #8899aa !important;
        font-size: 16px !important;
        padding: 4px 8px !important;
      }
      .cg-conflict-popup .mapboxgl-popup-close-button:hover,
      .cg-conflict-popup .maplibregl-popup-close-button:hover {
        color: #e8f0ff !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Main ─────────────────────────────────────────────────────────────────────

  async function init() {
    injectStyles();
    wireSidebarToggles();

    console.log(LOG_PREFIX, 'Waiting for map instance...');

    let layersAdded = false;

    async function addAllLayers(map) {
      if (layersAdded) return;
      layersAdded = true;
      mapRef = map;
      console.log(LOG_PREFIX, 'Map found, fetching conflict data...');

      // Fetch all three layers in parallel
      const [ukraine, gdelt, hormuz] = await Promise.all([
        fetchUkraineFrontline(),
        fetchGDELTConflict(),
        fetchHormuzAIS(),
      ]);

      if (ukraine) renderUkraineFrontline(map, ukraine);
      if (gdelt) renderGDELTConflict(map, gdelt);
      if (hormuz) renderHormuzShipping(map, hormuz);

      // Apply initial visibility
      Object.keys(LAYERS).forEach((k) => setVisibility(map, k, layerState[k]));

      // Start auto-refresh
      startAutoRefresh(map);

      console.log(LOG_PREFIX, 'All conflict layers initialized');
      window.__cg_conflict = { layerState, activeLayers, LAYERS, mapRef: map };
    }

    // Poll for map instance, then retry addSource until style is ready
    let mapAttempts = 0;
    const startPoll = () => {
      if (layersAdded) return;
      const m = findMapInstance();
      if (m) {
        let retries = 0;
        const tryAdd = () => {
          if (layersAdded) return;
          try {
            // Test if map is ready by trying a benign operation
            m.getCenter();
            addAllLayers(m);
          } catch (_) {
            retries++;
            if (retries < 60) setTimeout(tryAdd, 1000);
            else console.warn(LOG_PREFIX, 'Gave up after 60 retries');
          }
        };
        tryAdd();
      } else {
        mapAttempts++;
        if (mapAttempts < 120) setTimeout(startPoll, 1000);
      }
    };

    setTimeout(startPoll, 3000); // Start after equipment_layers has had a chance
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
  } else {
    setTimeout(init, 1500);
  }
})();
