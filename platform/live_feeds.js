/**
 * CraneGenius Live Data Feeds — Earthquakes (USGS) + Fire Hotspots (NASA FIRMS)
 * Browser-only, no backend needed. Fetches public APIs and renders on MapLibre.
 */
(function () {
  'use strict';

  const EARTHQUAKE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
  const FIRE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/d0a43f563a39810ec3e498cdd64bee7a/VIIRS_SNPP_NRT/world/1';

  // ── Map discovery (same pattern as equipment_layers.js) ────────────────────
  function findMap() {
    if (window.__cg_map && window.__cg_map.addSource) return window.__cg_map;
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

  // ── Earthquake layer ───────────────────────────────────────────────────────
  async function loadEarthquakes() {
    try {
      const res = await fetch(EARTHQUAKE_URL);
      if (!res.ok) throw new Error(`USGS ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[CG Live Feeds] Earthquake fetch failed:', e.message);
      return null;
    }
  }

  function addEarthquakeLayer(map, geojson) {
    const srcId = 'cg-live-earthquakes';
    const layerId = 'cg-live-earthquakes-circles';

    try { if (map.getLayer(layerId)) map.removeLayer(layerId); } catch (_) {}
    try { if (map.getSource(srcId)) map.removeSource(srcId); } catch (_) {}

    map.addSource(srcId, { type: 'geojson', data: geojson });

    map.addLayer({
      id: layerId,
      type: 'circle',
      source: srcId,
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'mag'],
          2.5, 4,
          5, 10,
          7, 18,
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'mag'],
          2.5, '#facc15',  // yellow
          4, '#f97316',    // orange
          5, '#ef4444',    // red
          7, '#991b1b',    // dark red
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(255,255,255,0.3)',
      },
    });

    // Popup on click
    map.on('click', layerId, (e) => {
      if (!e.features || !e.features.length) return;
      const f = e.features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice(0, 2);
      const time = new Date(p.time).toLocaleString();

      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '280px', className: 'cg-equip-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:260px;padding:2px;">
            <div style="font-size:10px;color:#facc15;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">EARTHQUAKE</div>
            <div style="font-size:15px;font-weight:700;color:#e8f0ff;margin-bottom:4px;">M ${p.mag}</div>
            <div style="font-size:11px;color:#8899aa;margin-bottom:2px;">${p.place || 'Unknown location'}</div>
            <div style="font-size:10px;color:#667788;">${time}</div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });

    console.log(`[CG Live Feeds] Earthquake layer added: ${geojson.features.length} events`);
  }

  // ── Fire hotspot layer ─────────────────────────────────────────────────────
  async function loadFires() {
    // Try direct first, then CORS proxy fallback
    const urls = [
      FIRE_URL,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(FIRE_URL)}`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const csv = await res.text();
        const result = parseFireCSV(csv);
        if (result && result.features.length > 0) {
          console.log(`[CG Live Feeds] Fire data loaded from ${url === FIRE_URL ? 'direct' : 'proxy'}`);
          return result;
        }
      } catch (_) {}
    }
    console.warn('[CG Live Feeds] Fire fetch failed from all sources');
    return null;
  }

  function parseFireCSV(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const latIdx = headers.indexOf('latitude');
    const lngIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4');
    const confIdx = headers.indexOf('confidence');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');

    if (latIdx < 0 || lngIdx < 0) {
      console.warn('[CG Live Feeds] Fire CSV missing lat/lng columns');
      return null;
    }

    const features = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const lat = parseFloat(cols[latIdx]);
      const lng = parseFloat(cols[lngIdx]);
      if (isNaN(lat) || isNaN(lng)) continue;

      const brightness = parseFloat(cols[brightIdx]) || 300;
      const confidence = cols[confIdx] || 'n';
      const acqDate = cols[dateIdx] || '';
      const acqTime = cols[timeIdx] || '';

      features.push({
        type: 'Feature',
        properties: { brightness, confidence, acq_date: acqDate, acq_time: acqTime },
        geometry: { type: 'Point', coordinates: [lng, lat] },
      });
    }

    return { type: 'FeatureCollection', features };
  }

  function addFireLayer(map, geojson) {
    const srcId = 'cg-live-fires';
    const layerId = 'cg-live-fires-circles';

    try { if (map.getLayer(layerId)) map.removeLayer(layerId); } catch (_) {}
    try { if (map.getSource(srcId)) map.removeSource(srcId); } catch (_) {}

    map.addSource(srcId, { type: 'geojson', data: geojson });

    map.addLayer({
      id: layerId,
      type: 'circle',
      source: srcId,
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'brightness'],
          300, 3,
          350, 5,
          400, 8,
          500, 12,
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'brightness'],
          300, '#fb923c',   // orange
          350, '#f97316',   // deeper orange
          400, '#ef4444',   // red
          500, '#991b1b',   // dark red
        ],
        'circle-opacity': 0.7,
        'circle-stroke-width': 0.5,
        'circle-stroke-color': 'rgba(255,200,100,0.4)',
      },
    });

    // Popup on click
    map.on('click', layerId, (e) => {
      if (!e.features || !e.features.length) return;
      const f = e.features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice(0, 2);
      const confLabel = p.confidence === 'h' ? 'High' : p.confidence === 'n' ? 'Nominal' : p.confidence === 'l' ? 'Low' : p.confidence;

      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '280px', className: 'cg-equip-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:260px;padding:2px;">
            <div style="font-size:10px;color:#f97316;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">FIRE HOTSPOT</div>
            <div style="font-size:15px;font-weight:700;color:#e8f0ff;margin-bottom:4px;">Brightness: ${p.brightness}K</div>
            <div style="font-size:11px;color:#8899aa;margin-bottom:2px;">Confidence: ${confLabel}</div>
            <div style="font-size:10px;color:#667788;">${p.acq_date} ${p.acq_time ? p.acq_time.toString().padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2') + ' UTC' : ''}</div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });

    console.log(`[CG Live Feeds] Fire layer added: ${geojson.features.length} hotspots`);
  }

  // ── Sidebar toggles ────────────────────────────────────────────────────────
  const feedState = { earthquakes: true, fires: true };
  const LS_KEY = 'cg_live_feeds_state';
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved) Object.assign(feedState, saved);
  } catch (_) {}

  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(feedState)); } catch (_) {}
  }

  function wireSidebarToggles(map, counts) {
    function findInfrastructureHeader() {
      const allSpans = document.querySelectorAll('span');
      for (const span of allSpans) {
        if (span.textContent.trim() === 'INFRASTRUCTURE') return span;
      }
      return null;
    }

    function tryInsert() {
      const infraHeader = findInfrastructureHeader();
      if (!infraHeader) return false;
      if (document.getElementById('cg-live-feeds-section')) return true;

      const headerRow = infraHeader.parentElement;
      const infraSection = headerRow?.parentElement;
      if (!infraSection || !infraSection.parentElement) return false;

      const section = document.createElement('div');
      section.id = 'cg-live-feeds-section';
      section.className = 'flex flex-col';

      const header = document.createElement('div');
      header.className = 'flex items-center gap-2 mb-2 mt-2 pt-2 border-t border-[var(--border-primary)]/30';
      header.innerHTML = '<span class="text-[8px] font-mono tracking-[0.2em] font-bold text-[var(--text-muted)]">LIVE HAZARD FEEDS</span>';
      section.appendChild(header);

      const feeds = [
        { key: 'earthquakes', label: 'Earthquakes (USGS)', color: '#facc15', count: counts.earthquakes, icon: '<circle cx="12" cy="12" r="8" fill="none"/><path d="M4 12h2l1-3 2 6 2-6 2 6 1-3h2"/>' },
        { key: 'fires', label: 'Fire Hotspots (NASA)', color: '#f97316', count: counts.fires, icon: '<path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z"/><path d="M12 22v-4"/>' },
      ];

      feeds.forEach(({ key, label, color, count, icon }) => {
        const row = document.createElement('div');
        row.className = 'flex flex-col';
        row.innerHTML = `
          <div class="flex items-start justify-between group cursor-pointer">
            <div class="flex gap-3">
              <div class="mt-1 transition-colors" style="color:${color}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-[var(--text-primary)] tracking-wide">${label}</span>
                <span class="text-[9px] text-[var(--text-muted)] font-mono tracking-wider mt-0.5">${count.toLocaleString()} points · LIVE 24h</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="lf-toggle text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border cursor-pointer select-none transition-all" data-lf-key="${key}" style="border-color:${color};color:${color};background:rgba(0,0,0,0.3);box-shadow:0 0 10px ${color}33;">ON</div>
            </div>
          </div>
        `;
        section.appendChild(row);
      });

      infraSection.parentElement.insertBefore(section, infraSection);

      section.querySelectorAll('.lf-toggle').forEach((toggle) => {
        const key = toggle.dataset.lfKey;
        const feed = feeds.find(f => f.key === key);

        function applyStyle(t, isOn) {
          t.textContent = isOn ? 'ON' : 'OFF';
          t.style.borderColor = isOn ? feed.color : 'var(--border-primary, rgba(255,255,255,0.15))';
          t.style.color = isOn ? feed.color : 'var(--text-muted, rgba(255,255,255,0.4))';
          t.style.background = isOn ? 'rgba(0,0,0,0.3)' : 'transparent';
          t.style.boxShadow = isOn ? `0 0 10px ${feed.color}33` : 'none';
        }

        applyStyle(toggle, feedState[key]);

        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          feedState[key] = !feedState[key];
          saveState();
          applyStyle(toggle, feedState[key]);
          const layerId = key === 'earthquakes' ? 'cg-live-earthquakes-circles' : 'cg-live-fires-circles';
          try { map.setLayoutProperty(layerId, 'visibility', feedState[key] ? 'visible' : 'none'); } catch (_) {}
        });
      });

      console.log('[CG Live Feeds] Sidebar toggles injected');
      return true;
    }

    tryInsert();
    const observer = new MutationObserver(() => {
      if (!document.getElementById('cg-live-feeds-section')) tryInsert();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => {
      if (!document.getElementById('cg-live-feeds-section')) tryInsert();
    }, 3000);
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  async function init() {
    console.log('[CG Live Feeds] Initializing...');

    // Fetch data in parallel
    const [earthquakeData, fireData] = await Promise.all([loadEarthquakes(), loadFires()]);

    const eqCount = earthquakeData ? earthquakeData.features.length : 0;
    const fireCount = fireData ? fireData.features.length : 0;
    console.log(`[CG Live Feeds] Loaded ${eqCount} earthquakes, ${fireCount} fire hotspots`);

    if (!eqCount && !fireCount) {
      console.warn('[CG Live Feeds] No live feed data available');
      return;
    }

    // Poll for map instance
    let added = false;
    let attempts = 0;
    const poll = () => {
      if (added) return;
      const map = findMap();
      if (!map) {
        attempts++;
        if (attempts < 120) setTimeout(poll, 1000);
        return;
      }

      console.log('[CG Live Feeds] Map found, adding layers...');

      let retries = 0;
      const tryAdd = () => {
        if (added) return;
        try {
          if (earthquakeData) addEarthquakeLayer(map, earthquakeData);
          if (fireData) addFireLayer(map, fireData);

          // Apply saved visibility
          if (!feedState.earthquakes) {
            try { map.setLayoutProperty('cg-live-earthquakes-circles', 'visibility', 'none'); } catch (_) {}
          }
          if (!feedState.fires) {
            try { map.setLayoutProperty('cg-live-fires-circles', 'visibility', 'none'); } catch (_) {}
          }

          wireSidebarToggles(map, { earthquakes: eqCount, fires: fireCount });
          added = true;
        } catch (e) {
          retries++;
          if (retries < 60) {
            setTimeout(tryAdd, 1000);
          } else {
            console.warn('[CG Live Feeds] Gave up after 60 retries:', e.message);
          }
        }
      };
      tryAdd();
    };

    setTimeout(poll, 3000); // start after equipment_layers has had time
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 2000));
  } else {
    setTimeout(init, 2000);
  }
})();
