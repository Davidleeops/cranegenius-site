// CraneGenius Command Center — Shared Navigation
// Include via <script src="_nav.js" defer></script> on any page
(function() {
  var NAV_LINKS = [
    { href: 'index.html', label: 'Command Center', icon: 'bolt' },
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'signals.html', label: 'Signals' },
    { href: 'pipeline.html', label: 'Pipeline' },
    { href: 'contacts.html', label: 'Contacts' },
    { href: 'financials.html', label: 'Financials' },
    { href: 'projects.html', label: 'Projects' },
  ];

  var DEV_LINKS = [
    { href: 'signals-kanban.html', label: '68 Signals Dev' },
    { href: 'architecture.html', label: 'Architecture' },
    { href: 'system-schematic.html', label: 'System Map' },
    { href: 'execution-plan.html', label: 'Execution Plan' },
    { href: 'prompts.html', label: 'Prompts' },
    { href: 'launch-kanban.html', label: 'Launch Board' },
  ];

  // Detect current page
  var currentPath = window.location.pathname;
  var currentFile = currentPath.split('/').pop() || 'index.html';

  function isActive(href) {
    return currentFile === href || (currentFile === '' && href === 'index.html');
  }

  // Find or create the top-bar nav
  var existing = document.querySelector('.top-meta');
  if (!existing) return; // Only inject into pages with the standard layout

  var mainLinks = NAV_LINKS.map(function(link) {
    if (isActive(link.href)) {
      return '<span style="color:var(--text)">' + link.label + '</span>';
    }
    return '<a href="' + link.href + '" style="color:var(--gold);text-decoration:none">' + link.label + '</a>';
  }).join(' &nbsp;&nbsp; ');

  // Dev dropdown (simple expand)
  var devLinks = DEV_LINKS.map(function(link) {
    if (isActive(link.href)) {
      return '<span style="color:var(--text);display:block;padding:4px 0">' + link.label + '</span>';
    }
    return '<a href="' + link.href + '" style="color:var(--gold);text-decoration:none;display:block;padding:4px 0">' + link.label + '</a>';
  }).join('');

  existing.innerHTML = mainLinks +
    ' &nbsp;&nbsp; <span style="position:relative;cursor:pointer" id="cg-dev-toggle">' +
    '<span style="color:var(--muted);border:1px solid rgba(245,166,35,.2);padding:2px 8px;border-radius:3px;font-size:10px">Dev &#9662;</span>' +
    '<div id="cg-dev-menu" style="display:none;position:absolute;right:0;top:24px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 14px;min-width:160px;z-index:100;white-space:nowrap">' +
    devLinks +
    '</div></span>';

  // Toggle dev menu
  var toggle = document.getElementById('cg-dev-toggle');
  var menu = document.getElementById('cg-dev-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', function() { menu.style.display = 'none'; });
  }
})();
