/*
 * CapexLayer search overlay.
 *
 * Wires the (otherwise inert) #dashboard-search input to a real search
 * across opportunities, signals, and live ADS-B aircraft. On match it
 * flyTo()s the map at window.__cg_map and drops a temporary highlight pin.
 *
 * Loaded from platform/dashboard.html as a deferred script so the
 * compiled Next.js bundle can render first and expose window.__cg_map.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://qdnaglhailuflynirqtt.supabase.co';
  var ADSB_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU';
  var ADSB_URL = SUPABASE_URL + '/functions/v1/live-feeds?feed=adsb';
  var OPPS_PATH = '/platform/cranegenius_opportunities.json';
  var SIGNALS_PATH = '/platform/cranegenius_signals.json';
  var HIDDEN_SIGNALS_PATH = '/platform/cranegenius_hidden_signals.json';
  var REGISTRY_PATH = '/platform/cranegenius_signal_registry.json';
  var ADSB_REFRESH_MS = 60000;
  var MAX_RESULTS = 8;

  // IATA -> ICAO airline prefix. ADS-B reports ICAO callsigns (DAL542),
  // public schedules use IATA (DL542). Mapping covers the majors.
  var IATA_TO_ICAO = {
    AA: 'AAL', DL: 'DAL', UA: 'UAL', WN: 'SWA', B6: 'JBU', AS: 'ASA',
    NK: 'NKS', F9: 'FFT', HA: 'HAL', G4: 'AAY', SY: 'SCX', '9E': 'EDV',
    MQ: 'ENY', OO: 'SKW', YX: 'RPA', YV: 'ASH', OH: 'JIA', QX: 'QXE',
    AC: 'ACA', WS: 'WJA', AM: 'AMX', BA: 'BAW', AF: 'AFR', KL: 'KLM',
    LH: 'DLH', EK: 'UAE', QF: 'QFA', JL: 'JAL', NH: 'ANA', CX: 'CPA',
    SQ: 'SIA', CA: 'CCA', CZ: 'CSN', MU: 'CES', EY: 'ETD', QR: 'QTR',
    TK: 'THY', VS: 'VIR', AY: 'FIN', IB: 'IBE', AZ: 'ITY', LX: 'SWR',
    OS: 'AUA', SK: 'SAS', TP: 'TAP', EI: 'EIN', VX: 'VRD', US: 'USA',
    CO: 'COA', NW: 'NWA', FX: 'FDX', '5X': 'UPS', '5Y': 'GTI'
  };

  var opportunities = [];
  var signals = [];
  var hiddenSignals = [];
  var signalMetaByType = {};
  var opportunitySourceMeta = {};
  var aircraftRaw = [];
  var aircraft = [];
  var dropdown = null;
  var highlightMarker = null;
  var highlightTimeout = null;
  var debounceTimer = null;
  var lastQuery = '';

  function waitFor(condFn, intervalMs) {
    return new Promise(function (resolve) {
      function tick() {
        var v = condFn();
        if (v) resolve(v);
        else setTimeout(tick, intervalMs || 120);
      }
      tick();
    });
  }

  // The bundle exposes window.__cg_map only when MapLibre's onLoad fires.
  // In some style configs onLoad never fires (e.g. when glyph fetches 404).
  // Fallback: walk the React fiber tree from .maplibregl-map to find the
  // ref whose .current.getMap() returns the live Map instance, then cache it.
  function findMap() {
    if (window.__cg_map) return window.__cg_map;
    var div = document.querySelector('.maplibregl-map') || document.querySelector('.mapboxgl-map');
    if (!div) return null;
    var fiberKey = null;
    for (var i = 0; i < Object.keys(div).length; i++) {
      var k = Object.keys(div)[i];
      if (k.indexOf('__reactFiber') === 0) { fiberKey = k; break; }
    }
    if (!fiberKey) return null;
    var fiber = div[fiberKey];
    var depth = 0;
    while (fiber && depth < 80) {
      depth++;
      var hook = fiber.memoizedState;
      var hi = 0;
      while (hook && hi < 40) {
        hi++;
        var v = hook.memoizedState;
        if (v && typeof v === 'object' && 'current' in v && v.current) {
          var c = v.current;
          if (c && typeof c.getMap === 'function') {
            try {
              var m = c.getMap();
              if (m && typeof m.flyTo === 'function') {
                window.__cg_map = m;
                return m;
              }
            } catch (_e) { /* continue */ }
          } else if (c && typeof c.flyTo === 'function' && typeof c.getCenter === 'function') {
            window.__cg_map = c;
            return c;
          }
        }
        hook = hook.next;
      }
      fiber = fiber.return;
    }
    return null;
  }

  async function loadStaticData() {
    try {
      var r0 = await fetch(REGISTRY_PATH, { cache: 'no-store' });
      if (r0.ok) {
        var registry = await r0.json();
        var visibleTypes = (((registry || {}).platform || {}).visible_signal_types) || [];
        signalMetaByType = {};
        for (var i = 0; i < visibleTypes.length; i++) {
          signalMetaByType[visibleTypes[i].signal_type] = visibleTypes[i];
        }
        opportunitySourceMeta = ((((registry || {}).platform || {}).opportunity_sources) || {});
      }
    } catch (e) { /* optional registry */ }
    try {
      var r1 = await fetch(OPPS_PATH);
      if (r1.ok) {
        var arr1 = await r1.json();
        opportunities = (arr1 || []).filter(function (o) { return o && o.lat && o.lng; });
      }
    } catch (e) { /* keep going */ }
    try {
      var r2 = await fetch(SIGNALS_PATH);
      if (r2.ok) {
        var arr2 = await r2.json();
        signals = (arr2 || []).filter(function (s) { return s && s.lat && s.lng; });
      }
    } catch (e) { /* keep going */ }
    try {
      var r3 = await fetch(HIDDEN_SIGNALS_PATH);
      if (r3.ok) {
        var arr3 = await r3.json();
        hiddenSignals = (arr3 || []).filter(function (s) { return s && s.lat && s.lng; });
      }
    } catch (e) { /* optional hidden signals */ }
  }

  function getSignalMeta(signalType) {
    return signalMetaByType[String(signalType || '')] || null;
  }

  function getOpportunitySource(sourceSignal) {
    return opportunitySourceMeta[String(sourceSignal || '')] || null;
  }

  async function loadAviation() {
    try {
      var res = await fetch(ADSB_URL, {
        headers: { apikey: ADSB_KEY, Authorization: 'Bearer ' + ADSB_KEY }
      });
      if (!res.ok) return;
      var data = await res.json();
      aircraftRaw = (data && Array.isArray(data.ac)) ? data.ac : [];
      aircraft = aircraftRaw.filter(function (a) { return a && a.lat != null && a.lon != null; });
    } catch (e) { /* network blip ok */ }
  }

  // 'DL542' / 'DL 542' / 'dl542' -> 'DAL542'
  // 'DAL542'                     -> 'DAL542' (already ICAO)
  // 'B6123'                      -> 'JBU123' (alphanumeric IATA)
  // '542'                        -> '542'    (digit-only, matched as suffix elsewhere)
  //
  // The regexes are split because IATA airline codes can be alpha-only
  // (DL, AA, UA), alpha+digit (B6, F9, G4), or digit+alpha (9E, 5X, 5Y).
  // A single greedy [A-Z0-9]{2,3} regex over-eats into the flight number
  // (e.g. "DL542" -> ["DL5", "42"]), so we try each shape explicitly.
  function normalizeFlight(q) {
    var cleaned = q.replace(/\s+/g, '').toUpperCase();
    // Already-ICAO 3-letter prefix takes priority (DAL542, AAL123, UAL...).
    var icao = cleaned.match(/^([A-Z]{3})(\d{1,5})$/);
    if (icao) return cleaned;
    // Pure-letter 2-letter IATA (DL, AA, UA, WN, ...).
    var alpha = cleaned.match(/^([A-Z]{2})(\d{1,5})$/);
    if (alpha && IATA_TO_ICAO[alpha[1]]) return IATA_TO_ICAO[alpha[1]] + alpha[2];
    // Mixed 2-char IATA: letter+digit or digit+letter (B6, F9, 9E, 5X).
    var mixed = cleaned.match(/^([A-Z][0-9]|[0-9][A-Z])(\d{1,5})$/);
    if (mixed && IATA_TO_ICAO[mixed[1]]) return IATA_TO_ICAO[mixed[1]] + mixed[2];
    return cleaned;
  }

  function digitsOnly(s) {
    return String(s || '').replace(/\D+/g, '');
  }

  function rankAircraft(query) {
    var rows = [];
    var qUp = query.replace(/\s+/g, '').toUpperCase();
    var qNorm = normalizeFlight(query);
    var qDigits = digitsOnly(query);
    for (var i = 0; i < aircraft.length; i++) {
      var a = aircraft[i];
      var flight = (a.flight || '').trim().toUpperCase();
      if (!flight) continue;
      var flightDigits = digitsOnly(flight);
      var score = 0;
      if (flight === qNorm) score = 100;
      else if (flight === qUp) score = 95;
      else if (flight.indexOf(qNorm) === 0) score = 85;
      else if (flight.indexOf(qUp) === 0) score = 80;
      else if (qDigits && flightDigits === qDigits) score = 75;
      else if (qDigits && qDigits.length >= 2 && flightDigits.indexOf(qDigits) !== -1) score = 55;
      else if (flight.indexOf(qUp) !== -1) score = 45;
      // Match registration / hex too
      var reg = (a.r || '').toUpperCase();
      var hex = (a.hex || '').toUpperCase();
      if (reg && reg === qUp) score = Math.max(score, 70);
      if (hex && hex === qUp) score = Math.max(score, 70);

      if (score > 0) {
        var altPart;
        if (a.alt_baro == null) altPart = 'alt n/a';
        else if (typeof a.alt_baro === 'number') altPart = a.alt_baro.toLocaleString() + ' ft';
        else altPart = String(a.alt_baro); // 'ground'
        var spdPart = (typeof a.gs === 'number') ? Math.round(a.gs) + ' kt' : 'spd n/a';
        rows.push({
          kind: 'aircraft',
          score: score,
          label: flight + (reg ? '  (' + reg + ')' : ''),
          sub: (a.t || a.type || 'Aircraft') + ' • ' + altPart + ' • ' + spdPart,
          lat: a.lat,
          lng: a.lon,
          icon: '✈',
          color: '#22d3ee',
          payload: a
        });
      }
    }
    return rows;
  }

  function rankOpportunities(query) {
    var rows = [];
    var lower = query.toLowerCase();
    if (!lower) return rows;
    for (var i = 0; i < opportunities.length; i++) {
      var o = opportunities[i];
      var name = (o.project_name || '').toLowerCase();
      var co = (o.company_name || '').toLowerCase();
      var city = (o.city || '').toLowerCase();
      var state = (o.state || '').toLowerCase();
      var projectType = (o.project_type || '').toLowerCase();
      var sourceMeta = getOpportunitySource(o.source_signal);
      var sourceLabel = sourceMeta && sourceMeta.label ? sourceMeta.label.toLowerCase() : '';
      var sourceDesc = sourceMeta && sourceMeta.description ? sourceMeta.description.toLowerCase() : '';
      var score = 0;
      if (name === lower || co === lower) score = 95;
      else if (name.indexOf(lower) === 0) score = 80;
      else if (co.indexOf(lower) === 0) score = 75;
      else if (name.indexOf(lower) !== -1) score = 60;
      else if (co.indexOf(lower) !== -1) score = 55;
      else if (projectType.indexOf(lower) !== -1) score = 50;
      else if (sourceLabel.indexOf(lower) !== -1) score = 45;
      else if (sourceDesc.indexOf(lower) !== -1) score = 38;
      else if (city.indexOf(lower) === 0) score = 45;
      else if (city.indexOf(lower) !== -1) score = 30;
      else if (state === lower) score = 35;
      if (score > 0) {
        var sourceBits = [];
        if (sourceMeta && sourceMeta.label) sourceBits.push(sourceMeta.label);
        if (o.project_type) sourceBits.push(o.project_type.replace(/_/g, ' '));
        rows.push({
          kind: 'opportunity',
          score: score,
          label: o.project_name || '(unnamed project)',
          sub:
            (o.company_name || '') +
            (o.city ? ' • ' + o.city + ', ' + (o.state || '') : '') +
            (o.signal_score != null ? ' • score ' + o.signal_score : '') +
            (sourceBits.length ? ' • ' + sourceBits.join(' • ') : ''),
          lat: o.lat,
          lng: o.lng,
          icon: '◉',
          color: o.priority_band === 'hot' ? '#ef4444' : '#c9a84c',
          payload: o
        });
      }
    }
    return rows;
  }

  function rankSignals(query) {
    var rows = [];
    var lower = query.toLowerCase();
    if (!lower) return rows;
    for (var i = 0; i < signals.length; i++) {
      var s = signals[i];
      var meta = getSignalMeta(s.signal_type);
      var type = (s.signal_type || '').toLowerCase();
      var display = meta && meta.display_label ? meta.display_label.toLowerCase() : '';
      var family = meta && meta.family ? meta.family.toLowerCase() : '';
      var upstream = meta && meta.upstream_type_candidates ? meta.upstream_type_candidates.join(' ').toLowerCase() : '';
      var examples = meta && meta.source_examples ? meta.source_examples.map(function (item) { return item.source_name; }).join(' ').toLowerCase() : '';
      var cat = (s.signal_category || '').toLowerCase();
      var geo = (s.geography || '').toLowerCase();
      var tags = (s.vertical_tags || []).join(' ').toLowerCase();
      var score = 0;
      if (type === lower) score = 70;
      else if (display === lower) score = 68;
      else if (type.indexOf(lower) !== -1) score = 50;
      else if (display.indexOf(lower) !== -1) score = 48;
      else if (upstream.indexOf(lower) !== -1) score = 44;
      else if (family.indexOf(lower) !== -1) score = 42;
      else if (examples.indexOf(lower) !== -1) score = 36;
      else if (cat.indexOf(lower) !== -1) score = 40;
      else if (tags.indexOf(lower) !== -1) score = 35;
      else if (geo.indexOf(lower) !== -1) score = 30;
      if (score > 0) {
        var sub = [];
        if (s.geography) sub.push(s.geography);
        if (meta && meta.family) sub.push(meta.family);
        if (s.signal_date) sub.push(s.signal_date);
        if (s.confidence != null) sub.push('conf ' + s.confidence);
        if (meta && meta.source_examples && meta.source_examples.length) {
          sub.push('src ' + meta.source_examples.slice(0, 2).map(function (item) {
            return item.source_name;
          }).join(', '));
        }
        rows.push({
          kind: 'signal',
          score: score,
          label: (meta && meta.display_label) || s.signal_type || '(signal)',
          sub: sub.join(' • '),
          lat: s.lat,
          lng: s.lng,
          icon: '◆',
          color: '#22c55e',
          payload: s
        });
      }
    }
    return rows;
  }

  function rankHiddenSignals(query) {
    var rows = [];
    var lower = query.toLowerCase();
    if (!lower) return rows;
    for (var i = 0; i < hiddenSignals.length; i++) {
      var s = hiddenSignals[i];
      var title = (s.project_name || '').toLowerCase();
      var company = (s.company_name || '').toLowerCase();
      var type = (s.signal_type || '').toLowerCase();
      var layer = (s.layer_label || '').toLowerCase();
      var geo = (s.geography || '').toLowerCase();
      var source = (s.source_name || '').toLowerCase();
      var score = 0;
      if (title === lower || company === lower) score = 92;
      else if (title.indexOf(lower) === 0) score = 78;
      else if (company.indexOf(lower) === 0) score = 74;
      else if (title.indexOf(lower) !== -1) score = 60;
      else if (company.indexOf(lower) !== -1) score = 56;
      else if (layer.indexOf(lower) !== -1) score = 50;
      else if (type.indexOf(lower) !== -1) score = 46;
      else if (geo.indexOf(lower) !== -1) score = 38;
      else if (source.indexOf(lower) !== -1) score = 34;
      if (score > 0) {
        rows.push({
          kind: 'hidden_signal',
          score: score,
          label: s.project_name || s.layer_label || '(hidden signal)',
          sub:
            (s.company_name || '') +
            (s.geography ? ' • ' + s.geography : '') +
            (s.layer_label ? ' • ' + s.layer_label : '') +
            (s.signal_date ? ' • ' + String(s.signal_date).slice(0, 10) : ''),
          lat: s.lat,
          lng: s.lng,
          icon: '⬢',
          color: '#a855f7',
          payload: s
        });
      }
    }
    return rows;
  }

  function search(query) {
    var q = (query || '').trim();
    if (!q) return [];
    var all = rankAircraft(q)
      .concat(rankOpportunities(q))
      .concat(rankSignals(q))
      .concat(rankHiddenSignals(q));
    all.sort(function (a, b) { return b.score - a.score; });
    return all.slice(0, MAX_RESULTS);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return c === '&' ? '&amp;'
        : c === '<' ? '&lt;'
        : c === '>' ? '&gt;'
        : c === '"' ? '&quot;'
        : '&#39;';
    });
  }

  function ensureDropdown() {
    if (dropdown) return dropdown;
    dropdown = document.createElement('div');
    dropdown.id = 'cg-search-results';
    dropdown.setAttribute('role', 'listbox');
    var s = dropdown.style;
    s.position = 'fixed';
    s.background = 'var(--bg-secondary, #0f172a)';
    s.border = '1px solid rgba(148,163,184,0.18)';
    s.borderRadius = '6px';
    s.boxShadow = '0 8px 24px rgba(0,0,0,0.45)';
    s.fontFamily = "'DM Mono', monospace";
    s.fontSize = '11px';
    s.color = '#e2e8f0';
    s.zIndex = '95';
    s.maxHeight = '420px';
    s.overflowY = 'auto';
    s.display = 'none';
    document.body.appendChild(dropdown);
    return dropdown;
  }

  function positionDropdown() {
    var input = document.getElementById('dashboard-search');
    var d = ensureDropdown();
    if (!input) return;
    var rect = input.getBoundingClientRect();
    d.style.top = (rect.bottom + 4) + 'px';
    d.style.left = rect.left + 'px';
    d.style.width = rect.width + 'px';
  }

  function renderResults(results) {
    var d = ensureDropdown();
    positionDropdown();
    if (!results.length) {
      d.innerHTML =
        '<div style="padding:12px;color:#64748b">No matches across opportunities, signals, or live aircraft.</div>';
      d.style.display = 'block';
      return;
    }
    d.innerHTML = '';
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var row = document.createElement('button');
      row.type = 'button';
      var rs = row.style;
      rs.display = 'block';
      rs.width = '100%';
      rs.textAlign = 'left';
      rs.padding = '10px 12px';
      rs.background = 'transparent';
      rs.border = 'none';
      rs.borderBottom = '1px solid rgba(148,163,184,0.08)';
      rs.color = '#e2e8f0';
      rs.fontFamily = 'inherit';
      rs.fontSize = '11px';
      rs.cursor = 'pointer';
      row.onmouseover = (function (b) { return function () { b.style.background = 'rgba(201,168,76,0.06)'; }; })(row);
      row.onmouseout = (function (b) { return function () { b.style.background = 'transparent'; }; })(row);
      row.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">' +
          '<span style="color:' + r.color + ';font-size:13px;width:14px;text-align:center">' + r.icon + '</span>' +
          '<span style="color:#e2e8f0;font-weight:500">' + escapeHtml(r.label) + '</span>' +
          '<span style="margin-left:auto;color:#64748b;font-size:9px;letter-spacing:0.5px;text-transform:uppercase">' +
            r.kind +
          '</span>' +
        '</div>' +
        '<div style="color:#64748b;font-size:10px;margin-left:22px">' + escapeHtml(r.sub) + '</div>';
      row.onclick = (function (rr) { return function () { goTo(rr); }; })(r);
      d.appendChild(row);
    }
    d.style.display = 'block';
  }

  function hideDropdown() {
    if (dropdown) dropdown.style.display = 'none';
  }

  var suppressInput = false;
  function setInputValueReact(input, value) {
    suppressInput = true;
    var proto = window.HTMLInputElement && window.HTMLInputElement.prototype;
    var setter = proto && Object.getOwnPropertyDescriptor(proto, 'value');
    if (setter && setter.set) setter.set.call(input, value);
    else input.value = value;
    // Dispatch so React's controlled-input state stays in sync, but our own
    // listener short-circuits via suppressInput so we don't re-search the
    // label string we just wrote.
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(function () { suppressInput = false; }, 50);
  }

  function goTo(r) {
    var map = findMap();
    if (!map) return;
    try {
      map.flyTo({
        center: [r.lng, r.lat],
        zoom: r.kind === 'aircraft' ? 8 : 11,
        speed: 1.4,
        essential: true
      });
    } catch (e) { /* swallow */ }
    addHighlight(r.lng, r.lat, r.color);
    hideDropdown();
    var input = document.getElementById('dashboard-search');
    if (input) setInputValueReact(input, r.label);
  }

  // Highlight via map source/layer rather than a Marker — we don't have
  // direct access to the maplibregl namespace from this overlay, but the
  // Map instance itself supports addSource/addLayer.
  var HIGHLIGHT_SRC = 'cg-search-highlight';
  var HIGHLIGHT_LAYER_OUTER = 'cg-search-highlight-outer';
  var HIGHLIGHT_LAYER_INNER = 'cg-search-highlight-inner';
  var highlightAnimRaf = null;
  var highlightActive = false;

  function clearHighlight(map) {
    highlightActive = false;
    if (highlightAnimRaf) {
      cancelAnimationFrame(highlightAnimRaf);
      highlightAnimRaf = null;
    }
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }
    if (!map) return;
    try { if (map.getLayer(HIGHLIGHT_LAYER_OUTER)) map.removeLayer(HIGHLIGHT_LAYER_OUTER); } catch (e) {}
    try { if (map.getLayer(HIGHLIGHT_LAYER_INNER)) map.removeLayer(HIGHLIGHT_LAYER_INNER); } catch (e) {}
    try { if (map.getSource(HIGHLIGHT_SRC)) map.removeSource(HIGHLIGHT_SRC); } catch (e) {}
  }

  function addHighlight(lng, lat, color) {
    var map = findMap();
    if (!map) return;
    clearHighlight(map);

    try {
      map.addSource(HIGHLIGHT_SRC, {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} }
      });
      map.addLayer({
        id: HIGHLIGHT_LAYER_OUTER,
        type: 'circle',
        source: HIGHLIGHT_SRC,
        paint: {
          'circle-radius': 18,
          'circle-color': color,
          'circle-opacity': 0.25,
          'circle-stroke-width': 2,
          'circle-stroke-color': color,
          'circle-stroke-opacity': 0.7
        }
      });
      map.addLayer({
        id: HIGHLIGHT_LAYER_INNER,
        type: 'circle',
        source: HIGHLIGHT_SRC,
        paint: {
          'circle-radius': 7,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': color
        }
      });
    } catch (e) {
      return;
    }

    highlightActive = true;
    var start = performance.now();
    function frame(t) {
      if (!highlightActive) return;
      var phase = ((t - start) / 1400) % 1;
      var radius = 18 + phase * 24;
      var opacity = 0.45 * (1 - phase);
      try {
        map.setPaintProperty(HIGHLIGHT_LAYER_OUTER, 'circle-radius', radius);
        map.setPaintProperty(HIGHLIGHT_LAYER_OUTER, 'circle-opacity', opacity);
      } catch (e) { highlightActive = false; return; }
      highlightAnimRaf = requestAnimationFrame(frame);
    }
    highlightAnimRaf = requestAnimationFrame(frame);

    highlightTimeout = setTimeout(function () { clearHighlight(map); }, 14000);
  }

  function injectStyles() {
    var existing = document.getElementById('cg-search-overlay-styles');
    if (existing) return;
    var styleEl = document.createElement('style');
    styleEl.id = 'cg-search-overlay-styles';
    styleEl.textContent =
      '@keyframes cgSearchPulse {' +
      '  0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }' +
      '  70% { box-shadow: 0 0 0 22px rgba(255,255,255,0); }' +
      '  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }' +
      '}' +
      '#cg-search-results::-webkit-scrollbar { width: 6px; }' +
      '#cg-search-results::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 3px; }';
    document.head.appendChild(styleEl);
  }

  function onInput(value) {
    if (suppressInput) return;
    lastQuery = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      if (value !== lastQuery) return;
      if (!value.trim()) { hideDropdown(); return; }
      renderResults(search(value));
    }, 120);
  }

  async function init() {
    injectStyles();
    // Kick off data loads in parallel — they don't gate the UI wiring.
    loadStaticData();
    loadAviation();
    setInterval(loadAviation, ADSB_REFRESH_MS);

    await waitFor(function () { return findMap(); });
    var input = await waitFor(function () { return document.getElementById('dashboard-search'); });

    input.addEventListener('input', function (e) { onInput(e.target.value); });
    // No auto-reopen on focus — once the user picks a result and we hide the
    // dropdown, refocusing the input shouldn't surface stale results. The
    // user can edit/retype to bring it back.
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var results = search(input.value);
        if (results.length) goTo(results[0]);
      } else if (e.key === 'Escape') {
        hideDropdown();
        input.blur();
      }
    });

    window.addEventListener('resize', positionDropdown);
    window.addEventListener('scroll', positionDropdown, true);
    document.addEventListener('click', function (e) {
      if (e.target === input) return;
      if (dropdown && dropdown.contains(e.target)) return;
      hideDropdown();
    });

    // Helpful console handle for debugging.
    window.__cg_search = {
      search: search,
      goTo: goTo,
      get aircraft() { return aircraft; },
      get opportunities() { return opportunities; },
      get signals() { return signals; },
      reloadAviation: loadAviation
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
