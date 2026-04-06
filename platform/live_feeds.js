/**
 * CraneGenius Live Data Feeds — Earthquakes (USGS) + Fire Hotspots (NASA FIRMS)
 * Browser-only, no backend needed. Fetches public APIs and renders on MapLibre.
 */
(function () {
  'use strict';

  const EARTHQUAKE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
  // NASA EONET — public, CORS-friendly wildfire events (no key needed)
  const FIRE_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&days=7&status=open&limit=200';

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
    try {
      const res = await fetch(FIRE_URL);
      if (!res.ok) throw new Error(`EONET ${res.status}`);
      const data = await res.json();
      return parseEONET(data);
    } catch (e) {
      console.warn('[CG Live Feeds] Fire fetch failed:', e.message);
      return null;
    }
  }

  function parseEONET(data) {
    const features = [];
    for (const event of (data.events || [])) {
      // Each event can have multiple geometry entries; use the latest
      const geoms = event.geometry || [];
      for (const g of geoms) {
        if (g.type !== 'Point' || !g.coordinates) continue;
        const [lng, lat] = g.coordinates;
        if (isNaN(lat) || isNaN(lng)) continue;
        features.push({
          type: 'Feature',
          properties: {
            title: event.title || 'Wildfire',
            date: g.date || '',
            source: (event.sources && event.sources[0]?.url) || '',
            category: 'wildfire',
          },
          geometry: { type: 'Point', coordinates: [lng, lat] },
        });
      }
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
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 6, 10, 9, 14, 12],
        'circle-color': '#f97316',
        'circle-opacity': 0.8,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ef4444',
      },
    });

    // Popup on click
    map.on('click', layerId, (e) => {
      if (!e.features || !e.features.length) return;
      const f = e.features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice(0, 2);
      const date = p.date ? new Date(p.date).toLocaleString() : '';

      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '280px', className: 'cg-equip-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:260px;padding:2px;">
            <div style="font-size:10px;color:#f97316;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">WILDFIRE</div>
            <div style="font-size:13px;font-weight:600;color:#e8f0ff;margin-bottom:4px;line-height:1.3;">${p.title || 'Active Fire'}</div>
            <div style="font-size:10px;color:#667788;">${date}</div>
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
        { key: 'fires', label: 'Wildfires (NASA EONET)', color: '#f97316', count: counts.fires, icon: '<path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z"/><path d="M12 22v-4"/>' },
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
