(function () {
  'use strict';

  var REGISTRY_PATH = '/platform/cranegenius_signal_registry.json';
  var button;
  var panel;
  var loaded = false;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ch === '&' ? '&amp;'
        : ch === '<' ? '&lt;'
        : ch === '>' ? '&gt;'
        : ch === '"' ? '&quot;'
        : '&#39;';
    });
  }

  function formatDate(value) {
    if (!value) return 'unknown';
    var d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString();
  }

  function ensureChrome() {
    if (button && panel) return;

    button = document.createElement('button');
    button.type = 'button';
    button.id = 'cg-signal-surface-toggle';
    button.textContent = 'Signal Registry';
    button.style.position = 'fixed';
    button.style.left = '136px';
    button.style.bottom = '48px';
    button.style.zIndex = '96';
    button.style.border = '1px solid rgba(201,168,76,0.28)';
    button.style.background = 'rgba(8,14,26,0.94)';
    button.style.color = '#f5d487';
    button.style.padding = '10px 12px';
    button.style.borderRadius = '8px';
    button.style.fontFamily = "'DM Mono', monospace";
    button.style.fontSize = '11px';
    button.style.letterSpacing = '0.08em';
    button.style.textTransform = 'uppercase';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';

    panel = document.createElement('aside');
    panel.id = 'cg-signal-surface-panel';
    panel.hidden = true;
    panel.style.position = 'fixed';
    panel.style.left = '136px';
    panel.style.bottom = '96px';
    panel.style.width = '360px';
    panel.style.maxHeight = '72vh';
    panel.style.overflowY = 'auto';
    panel.style.zIndex = '96';
    panel.style.background = 'rgba(8,14,26,0.97)';
    panel.style.border = '1px solid rgba(148,163,184,0.18)';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 16px 48px rgba(0,0,0,0.42)';
    panel.style.backdropFilter = 'blur(12px)';
    panel.style.padding = '16px';
    panel.style.color = '#e2e8f0';
    panel.style.fontFamily = "'DM Sans', sans-serif";

    button.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
    });

    document.body.appendChild(button);
    document.body.appendChild(panel);
  }

  function chip(label, value, accent) {
    return (
      '<div style="border:1px solid rgba(148,163,184,0.12);border-radius:10px;padding:10px 12px;background:rgba(15,23,42,0.7)">' +
        '<div style="font-size:10px;color:rgba(226,232,240,0.56);text-transform:uppercase;letter-spacing:0.08em">' + escapeHtml(label) + '</div>' +
        '<div style="margin-top:4px;font-size:18px;font-weight:700;color:' + (accent || '#f8fafc') + '">' + escapeHtml(value) + '</div>' +
      '</div>'
    );
  }

  function renderVisibleTypes(types) {
    return types.slice(0, 6).map(function (item) {
      var sources = (item.source_examples || []).map(function (source) {
        return source.source_name;
      }).join(', ');
      return (
        '<div style="padding:10px 0;border-top:1px solid rgba(148,163,184,0.08)">' +
          '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">' +
            '<div>' +
              '<div style="font-size:13px;font-weight:600;color:#f8fafc">' + escapeHtml(item.display_label) + '</div>' +
              '<div style="font-size:11px;color:rgba(226,232,240,0.58);margin-top:2px">' + escapeHtml(item.family) + ' family</div>' +
            '</div>' +
            '<div style="font-size:12px;color:#22d3ee;font-weight:700">' + escapeHtml(item.platform_count) + '</div>' +
          '</div>' +
          '<div style="font-size:11px;color:rgba(226,232,240,0.7);margin-top:6px;line-height:1.45">' + escapeHtml(item.description) + '</div>' +
          '<div style="font-size:11px;color:rgba(245,212,135,0.78);margin-top:6px">Upstream: ' + escapeHtml((item.upstream_type_candidates || []).join(', ') || 'n/a') + '</div>' +
          (sources ? '<div style="font-size:10px;color:rgba(226,232,240,0.48);margin-top:4px">Sources: ' + escapeHtml(sources) + '</div>' : '') +
        '</div>'
      );
    }).join('');
  }

  function renderHiddenTypes(types) {
    return types.slice(0, 8).map(function (item) {
      var examples = (item.source_examples || []).map(function (source) {
        return source.source_name;
      }).join(', ');
      return (
        '<div style="padding:10px 0;border-top:1px solid rgba(148,163,184,0.08)">' +
          '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">' +
            '<div>' +
              '<div style="font-size:13px;font-weight:600;color:#f8fafc">' + escapeHtml(item.display_label) + '</div>' +
              '<div style="font-size:11px;color:rgba(226,232,240,0.58);margin-top:2px">' + escapeHtml(item.family) + ' family</div>' +
            '</div>' +
            '<div style="font-size:12px;color:#f5d487;font-weight:700">' + escapeHtml(item.upstream_count) + '</div>' +
          '</div>' +
          (examples ? '<div style="font-size:10px;color:rgba(226,232,240,0.48);margin-top:6px">Example sources: ' + escapeHtml(examples) + '</div>' : '') +
        '</div>'
      );
    }).join('');
  }

  function renderOpportunitySources(meta) {
    return Object.keys(meta).map(function (key) {
      var item = meta[key];
      return (
        '<div style="padding:10px 0;border-top:1px solid rgba(148,163,184,0.08)">' +
          '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">' +
            '<div style="font-size:13px;font-weight:600;color:#f8fafc">' + escapeHtml(item.label) + '</div>' +
            '<div style="font-size:12px;color:#22d3ee;font-weight:700">' + escapeHtml(item.count) + '</div>' +
          '</div>' +
          '<div style="font-size:11px;color:rgba(226,232,240,0.68);margin-top:6px;line-height:1.45">' + escapeHtml(item.description) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function render(registry) {
    ensureChrome();

    var platform = registry.platform || {};
    var upstream = registry.upstream || {};
    var visible = platform.visible_signal_types || [];
    var hidden = upstream.hidden_upstream_types || [];
    var oppSources = platform.opportunity_sources || {};

    button.textContent = (platform.visible_signal_type_count || 0) + '/' + (upstream.type_count || 0) + ' Signals';
    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">' +
        '<div>' +
          '<div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#f5d487">Signal Registry</div>' +
          '<div style="font-size:18px;font-weight:700;color:#f8fafc;margin-top:4px">Surface the richer upstream taxonomy</div>' +
        '</div>' +
        '<button type="button" id="cg-signal-surface-close" style="background:transparent;border:none;color:#94a3b8;font-size:18px;cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(226,232,240,0.62);margin-top:8px;line-height:1.45">The public map stays normalized, but this panel shows the broader upstream signal system and source provenance now available in the repo.</div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px">' +
        chip('Visible types', platform.visible_signal_type_count || 0, '#22d3ee') +
        chip('Upstream types', upstream.type_count || 0, '#f5d487') +
        chip('Map signals', platform.signal_total || 0, '#f8fafc') +
        chip('Missing geos', platform.missing_geography_count || 0, '#fb7185') +
      '</div>' +
      '<div style="margin-top:16px;font-size:10px;color:rgba(226,232,240,0.44);text-transform:uppercase;letter-spacing:0.08em">Freshness</div>' +
      '<div style="font-size:11px;color:rgba(226,232,240,0.68);margin-top:6px">Registry built ' + escapeHtml(formatDate(registry.generated_at)) + '<br/>Upstream snapshot ' + escapeHtml(formatDate(registry.upstream_generated_at)) + '</div>' +
      '<div style="margin-top:18px;font-size:10px;color:rgba(226,232,240,0.44);text-transform:uppercase;letter-spacing:0.08em">Visible normalized map types</div>' +
      renderVisibleTypes(visible) +
      '<div style="margin-top:10px;font-size:10px;color:rgba(226,232,240,0.44);text-transform:uppercase;letter-spacing:0.08em">Upstream classes not yet first-class in the map</div>' +
      renderHiddenTypes(hidden) +
      '<div style="margin-top:10px;font-size:10px;color:rgba(226,232,240,0.44);text-transform:uppercase;letter-spacing:0.08em">Opportunity source provenance</div>' +
      renderOpportunitySources(oppSources);

    panel.querySelector('#cg-signal-surface-close').addEventListener('click', function () {
      panel.hidden = true;
    });
  }

  function init() {
    if (loaded) return;
    loaded = true;
    fetch(REGISTRY_PATH, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load signal registry');
        return res.json();
      })
      .then(render)
      .catch(function (err) {
        ensureChrome();
        button.textContent = 'Signal Registry';
        panel.innerHTML =
          '<div style="font-size:14px;font-weight:700;color:#f8fafc">Signal Registry unavailable</div>' +
          '<div style="font-size:12px;color:rgba(226,232,240,0.62);margin-top:8px;line-height:1.45">' + escapeHtml(err && err.message ? err.message : 'Unknown error') + '</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
