/**
 * CraneGenius Intelligence Feed Layers
 * Adds GDELT incidents, ADS-B aviation, and AIS maritime layers
 * to the MapLibre map via Supabase edge function proxy.
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://qdnaglhailuflynirqtt.supabase.co';
  const FEED_BASE = `${SUPABASE_URL}/functions/v1/live-feeds`;

  const FEEDS = {
    gdelt: { url: `${FEED_BASE}?feed=gdelt`, interval: 300000, label: 'Global Incidents', color: '#10b981' },
    adsb: { url: `${FEED_BASE}?feed=adsb`, interval: 60000, label: 'Aviation (ADS-B)', color: '#22d3ee' },
    ais:  { url: `${FEED_BASE}?feed=ais`, interval: 120000, label: 'Maritime (AIS)', color: '#3b82f6' },
  };

  // ── State ────────────────────────────────────────────────────────────────
  const layerState = { gdelt: true, adsb: true, ais: true };
  const LS_KEY = 'cg_intel_layers';
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved) Object.assign(layerState, saved);
  } catch (_) {}
  function saveState() { try { localStorage.setItem(LS_KEY, JSON.stringify(layerState)); } catch (_) {} }

  let mapRef = null;
  const timers = {};

  // ── Find MapLibre map (same pattern as equipment_layers.js) ──────────
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

  // ── Data parsers ─────────────────────────────────────────────────────
  function parseGDELT(data) {
    // GDELT geo API returns GeoJSON FeatureCollection
    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      return {
        type: 'FeatureCollection',
        features: data.features.filter(f => f.geometry && f.geometry.coordinates).map((f, i) => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: {
            id: `gdelt-${i}`,
            title: f.properties?.name || f.properties?.html || 'Event',
            source: f.properties?.domain || f.properties?.sourcecountry || '',
            date: f.properties?.dateadded || f.properties?.DATEADDED || '',
            url: f.properties?.url || f.properties?.shareimage || '',
            tone: parseFloat(f.properties?.tone || f.properties?.avgtone || '0'),
          },
        })),
      };
    }
    return { type: 'FeatureCollection', features: [] };
  }

  function parseADSB(data) {
    // ADS-B Exchange / adsb.lol returns { ac: [...] }
    const aircraft = data?.ac || data?.aircraft || [];
    const features = [];
    for (const ac of aircraft) {
      const lat = ac.lat ?? ac.latitude;
      const lon = ac.lon ?? ac.longitude ?? ac.lng;
      if (lat == null || lon == null) continue;
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id: `adsb-${ac.hex || ac.icao || features.length}`,
          callsign: (ac.flight || ac.callsign || ac.hex || '').trim(),
          altitude: ac.alt_baro ?? ac.alt_geom ?? ac.altitude ?? 0,
          speed: ac.gs ?? ac.ground_speed ?? ac.spd ?? 0,
          type: ac.t ?? ac.aircraft_type ?? ac.desc ?? '',
          heading: ac.track ?? ac.true_heading ?? 0,
        },
      });
    }
    return { type: 'FeatureCollection', features };
  }

  function parseAIS(data) {
    // Digitraffic AIS returns { features: [...] } (GeoJSON) or array
    let vessels = [];
    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      vessels = data.features;
    } else if (Array.isArray(data)) {
      vessels = data;
    }
    const features = [];
    for (const v of vessels) {
      let lon, lat, props;
      if (v.geometry && v.geometry.coordinates) {
        [lon, lat] = v.geometry.coordinates;
        props = v.properties || {};
      } else {
        lon = v.lon ?? v.longitude;
        lat = v.lat ?? v.latitude;
        props = v;
        if (lat == null || lon == null) continue;
      }
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id: `ais-${props.mmsi || features.length}`,
          name: props.name || props.shipName || `MMSI ${props.mmsi || '?'}`,
          speed: props.sog ?? props.speed ?? 0,
          heading: props.cog ?? props.heading ?? props.trueHeading ?? 0,
          mmsi: props.mmsi || '',
        },
      });
    }
    return { type: 'FeatureCollection', features };
  }

  const parsers = { gdelt: parseGDELT, adsb: parseADSB, ais: parseAIS };

  // ── Fetch feed data ──────────────────────────────────────────────────
  async function fetchFeed(feedKey) {
    try {
      const resp = await fetch(FEEDS[feedKey].url);
      if (!resp.ok) { console.warn(`[CG Intel] ${feedKey} returned ${resp.status}`); return null; }
      const data = await resp.json();
      return parsers[feedKey](data);
    } catch (e) {
      console.warn(`[CG Intel] ${feedKey} fetch failed:`, e.message);
      return null;
    }
  }

  // ── Map layer management ─────────────────────────────────────────────
  function addOrUpdateSource(map, sourceId, geojson) {
    const existing = map.getSource(sourceId);
    if (existing) {
      existing.setData(geojson);
    } else {
      map.addSource(sourceId, { type: 'geojson', data: geojson });
    }
  }

  function ensureGDELTLayer(map) {
    const src = 'cg-intel-gdelt';
    const layerId = 'cg-intel-gdelt-circles';
    if (map.getLayer(layerId)) return;
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: src,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 6, 4, 10, 6],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'tone'],
          -5, '#ef4444',   // negative = red
          0, '#eab308',    // neutral = yellow
          5, '#10b981',    // positive = green
        ],
        'circle-opacity': 0.75,
        'circle-stroke-width': 0.5,
        'circle-stroke-color': 'rgba(255,255,255,0.3)',
      },
    });
    // Popup
    map.on('click', layerId, (e) => {
      if (!e.features?.length) return;
      const p = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates.slice();
      const toneColor = (p.tone || 0) >= 0 ? '#10b981' : '#ef4444';
      const urlLink = p.url ? `<a href="${p.url}" target="_blank" style="color:#22d3ee;font-size:10px;">Source</a>` : '';
      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '300px', className: 'cg-intel-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:280px;">
            <div style="font-size:10px;color:#10b981;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">GDELT INCIDENT</div>
            <div style="font-size:12px;font-weight:600;color:#e8f0ff;margin-bottom:4px;line-height:1.3;">${p.title || 'Event'}</div>
            <div style="font-size:11px;color:#8899aa;">${p.source || ''} · <span style="color:${toneColor}">tone ${(p.tone || 0).toFixed(1)}</span></div>
            ${p.date ? `<div style="font-size:10px;color:#667788;margin-top:2px;">${p.date}</div>` : ''}
            <div style="margin-top:4px;">${urlLink}</div>
          </div>
        `).addTo(map);
    });
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
  }

  function ensureADSBLayer(map) {
    const src = 'cg-intel-adsb';
    const layerId = 'cg-intel-adsb-circles';
    if (map.getLayer(layerId)) return;
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: src,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 1.5, 6, 2.5, 10, 4],
        'circle-color': '#22d3ee',
        'circle-opacity': 0.7,
        'circle-stroke-width': 0,
      },
    });
    map.on('click', layerId, (e) => {
      if (!e.features?.length) return;
      const p = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates.slice();
      const alt = p.altitude ? `${Number(p.altitude).toLocaleString()} ft` : '?';
      const spd = p.speed ? `${Math.round(p.speed)} kts` : '?';
      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '260px', className: 'cg-intel-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;">
            <div style="font-size:10px;color:#22d3ee;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">AIRCRAFT</div>
            <div style="font-size:13px;font-weight:600;color:#e8f0ff;margin-bottom:4px;">${p.callsign || 'Unknown'}</div>
            <div style="font-size:11px;color:#8899aa;">Alt: ${alt} · Speed: ${spd}</div>
            ${p.type ? `<div style="font-size:10px;color:#667788;margin-top:2px;">Type: ${p.type}</div>` : ''}
          </div>
        `).addTo(map);
    });
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
  }

  function ensureAISLayer(map) {
    const src = 'cg-intel-ais';
    const layerId = 'cg-intel-ais-circles';
    if (map.getLayer(layerId)) return;
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: src,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2, 6, 3.5, 10, 5],
        'circle-color': '#3b82f6',
        'circle-opacity': 0.75,
        'circle-stroke-width': 0.5,
        'circle-stroke-color': 'rgba(59,130,246,0.4)',
      },
    });
    map.on('click', layerId, (e) => {
      if (!e.features?.length) return;
      const p = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates.slice();
      const spd = p.speed != null ? `${Number(p.speed).toFixed(1)} kts` : '?';
      const hdg = p.heading != null ? `${Math.round(p.heading)}°` : '?';
      new (window.maplibregl || window.mapboxgl).Popup({ closeButton: true, maxWidth: '260px', className: 'cg-intel-popup' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;">
            <div style="font-size:10px;color:#3b82f6;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">VESSEL</div>
            <div style="font-size:13px;font-weight:600;color:#e8f0ff;margin-bottom:4px;">${p.name || 'Unknown'}</div>
            <div style="font-size:11px;color:#8899aa;">Speed: ${spd} · Heading: ${hdg}</div>
            ${p.mmsi ? `<div style="font-size:10px;color:#667788;margin-top:2px;">MMSI: ${p.mmsi}</div>` : ''}
          </div>
        `).addTo(map);
    });
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
  }

  const layerSetup = { gdelt: ensureGDELTLayer, adsb: ensureADSBLayer, ais: ensureAISLayer };

  function setVisibility(map, feedKey, visible) {
    const layerId = `cg-intel-${feedKey}-circles`;
    try { map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none'); } catch (_) {}
  }

  // ── Refresh loop ─────────────────────────────────────────────────────
  async function refreshFeed(map, feedKey) {
    const geojson = await fetchFeed(feedKey);
    if (!geojson) return;
    const sourceId = `cg-intel-${feedKey}`;
    addOrUpdateSource(map, sourceId, geojson);
    layerSetup[feedKey](map);
    setVisibility(map, feedKey, layerState[feedKey]);
    console.log(`[CG Intel] ${feedKey}: ${geojson.features.length} features loaded`);
  }

  function startRefreshLoop(map, feedKey) {
    if (timers[feedKey]) clearInterval(timers[feedKey]);
    refreshFeed(map, feedKey);
    timers[feedKey] = setInterval(() => refreshFeed(map, feedKey), FEEDS[feedKey].interval);
  }

  // ── Sidebar section ──────────────────────────────────────────────────
  function wireSidebar(map) {
    function tryInsert() {
      const infraHeader = (() => {
        for (const span of document.querySelectorAll('span')) {
          if (span.textContent.trim() === 'INFRASTRUCTURE') return span;
        }
        return null;
      })();
      if (!infraHeader) return false;
      if (document.getElementById('cg-intel-feeds-section')) return true;

      const headerRow = infraHeader.parentElement;
      const infraSection = headerRow?.parentElement;
      if (!infraSection?.parentElement) return false;

      const section = document.createElement('div');
      section.id = 'cg-intel-feeds-section';
      section.className = 'flex flex-col';

      const header = document.createElement('div');
      header.className = 'flex items-center gap-2 mb-2 mt-2 pt-2 border-t border-[var(--border-primary)]/30';
      header.innerHTML = '<span class="text-[8px] font-mono tracking-[0.2em] font-bold text-[var(--text-muted)]">INTELLIGENCE FEEDS</span>';
      section.appendChild(header);

      const ICONS = {
        gdelt: '<circle cx="12" cy="12" r="10" stroke-width="1.5" fill="none"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>',
        adsb: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1L11 12l-2 3H6l-1 1 3 2 2 3 1-1v-3l3-2 3.7 7.3c.2.4.7.5 1.1.3l.5-.3c.4-.2.6-.6.5-1.1z"/>',
        ais: '<path d="M2 20l2-2h16l2 2"/><path d="M5 18V12a7 7 0 0 1 14 0v6"/><path d="M12 2v4"/><circle cx="12" cy="9" r="2"/>',
      };

      for (const [key, feed] of Object.entries(FEEDS)) {
        const row = document.createElement('div');
        row.className = 'flex flex-col';
        row.innerHTML = `
          <div class="flex items-start justify-between group cursor-pointer" data-intel-layer="${key}">
            <div class="flex gap-3">
              <div class="mt-1" style="color:${feed.color}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[key]}</svg>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-[var(--text-primary)] tracking-wide">${feed.label}</span>
                <span class="text-[9px] text-[var(--text-muted)] font-mono tracking-wider mt-0.5 cg-intel-count" data-feed="${key}">loading\u2026</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="intel-toggle text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border cursor-pointer select-none transition-all" data-intel-key="${key}" style="border-color:${feed.color};color:${feed.color};background:rgba(0,0,0,0.3);box-shadow:0 0 10px ${feed.color}33;">ON</div>
            </div>
          </div>
        `;
        section.appendChild(row);
      }

      infraSection.parentElement.insertBefore(section, infraSection);

      // Wire toggles
      section.querySelectorAll('.intel-toggle').forEach(toggle => {
        const key = toggle.dataset.intelKey;
        const feed = FEEDS[key];
        function applyStyle(t, on) {
          t.textContent = on ? 'ON' : 'OFF';
          t.style.borderColor = on ? feed.color : 'var(--border-primary, rgba(255,255,255,0.15))';
          t.style.color = on ? feed.color : 'var(--text-muted, rgba(255,255,255,0.4))';
          t.style.background = on ? 'rgba(0,0,0,0.3)' : 'transparent';
          t.style.boxShadow = on ? `0 0 10px ${feed.color}33` : 'none';
        }
        applyStyle(toggle, layerState[key]);
        toggle.addEventListener('click', e => {
          e.preventDefault(); e.stopPropagation();
          layerState[key] = !layerState[key];
          saveState();
          applyStyle(toggle, layerState[key]);
          setVisibility(map, key, layerState[key]);
        });
      });

      return true;
    }

    tryInsert();
    const observer = new MutationObserver(() => {
      if (!document.getElementById('cg-intel-feeds-section')) tryInsert();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => { if (!document.getElementById('cg-intel-feeds-section')) tryInsert(); }, 2000);
  }

  // Update sidebar counts after data loads
  function updateCount(feedKey, count) {
    const el = document.querySelector(`.cg-intel-count[data-feed="${feedKey}"]`);
    if (el) {
      const interval = FEEDS[feedKey].interval / 1000;
      el.textContent = `${count.toLocaleString()} items \u00b7 ${interval}s refresh`;
    }
  }

  // Patch refreshFeed to update counts
  const _origRefresh = refreshFeed;
  async function refreshFeedWithCount(map, feedKey) {
    const geojson = await fetchFeed(feedKey);
    if (!geojson) return;
    const sourceId = `cg-intel-${feedKey}`;
    addOrUpdateSource(map, sourceId, geojson);
    layerSetup[feedKey](map);
    setVisibility(map, feedKey, layerState[feedKey]);
    updateCount(feedKey, geojson.features.length);
    console.log(`[CG Intel] ${feedKey}: ${geojson.features.length} features loaded`);
  }

  // ── Popup styles ─────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cg-intel-popup .mapboxgl-popup-content,
      .cg-intel-popup .maplibregl-popup-content {
        background: #0d1628 !important;
        border: 1px solid rgba(34,211,238,0.22) !important;
        border-radius: 8px !important;
        padding: 12px 14px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
      }
      .cg-intel-popup .mapboxgl-popup-tip,
      .cg-intel-popup .maplibregl-popup-tip {
        border-top-color: #0d1628 !important;
      }
      .cg-intel-popup .mapboxgl-popup-close-button,
      .cg-intel-popup .maplibregl-popup-close-button {
        color: #8899aa !important; font-size: 16px !important; padding: 4px 8px !important;
      }
      .cg-intel-popup .mapboxgl-popup-close-button:hover,
      .cg-intel-popup .maplibregl-popup-close-button:hover {
        color: #e8f0ff !important; background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Main ─────────────────────────────────────────────────────────────
  async function init() {
    injectStyles();

    // Poll for map instance
    let mapAttempts = 0;
    const startPoll = () => {
      mapRef = findMap();
      if (mapRef) {
        console.log('[CG Intel] Map instance found, initializing intelligence feeds...');
        wireSidebar(mapRef);

        // Initialize empty sources first, then start refresh loops
        for (const feedKey of Object.keys(FEEDS)) {
          addOrUpdateSource(mapRef, `cg-intel-${feedKey}`, { type: 'FeatureCollection', features: [] });
          layerSetup[feedKey](mapRef);
          setVisibility(mapRef, feedKey, layerState[feedKey]);
        }

        // Start refresh loops (staggered to avoid hammering)
        setTimeout(() => {
          refreshFeedWithCount(mapRef, 'gdelt');
          if (timers.gdelt) clearInterval(timers.gdelt);
          timers.gdelt = setInterval(() => refreshFeedWithCount(mapRef, 'gdelt'), FEEDS.gdelt.interval);
        }, 500);

        setTimeout(() => {
          refreshFeedWithCount(mapRef, 'adsb');
          if (timers.adsb) clearInterval(timers.adsb);
          timers.adsb = setInterval(() => refreshFeedWithCount(mapRef, 'adsb'), FEEDS.adsb.interval);
        }, 1500);

        setTimeout(() => {
          refreshFeedWithCount(mapRef, 'ais');
          if (timers.ais) clearInterval(timers.ais);
          timers.ais = setInterval(() => refreshFeedWithCount(mapRef, 'ais'), FEEDS.ais.interval);
        }, 2500);

        console.log('[CG Intel] All 3 intelligence feed layers initialized');
        window.__cg_intel = { layerState, FEEDS, timers, mapRef };
        return;
      }
      mapAttempts++;
      if (mapAttempts < 120) setTimeout(startPoll, 1000);
      else console.warn('[CG Intel] Map not found after 120 attempts');
    };
    setTimeout(startPoll, 3000); // start after equipment layers have had time
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
  } else {
    setTimeout(init, 1500);
  }
})();
