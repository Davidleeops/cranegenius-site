(function () {
  'use strict';

  if (window.__cgSecureLoaderInit) return;
  window.__cgSecureLoaderInit = true;

  var PASS_KEY = 'cg_command_center_passphrase_v1';
  var BUNDLE_PATH = 'secure/command-center.enc.json';
  var manifestPromise = null;
  var bundlePromise = null;
  var bundleCache = null;

  function b64ToBytes(value) {
    var binary = atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function bytesToText(bytes) {
    return new TextDecoder().decode(bytes);
  }

  function getExistingGate(opts) {
    if (!opts || !opts.gateId) return null;
    var gate = document.getElementById(opts.gateId);
    if (!gate) return null;
    return {
      gate: gate,
      app: opts.appId ? document.getElementById(opts.appId) : null,
      input: opts.inputId ? document.getElementById(opts.inputId) : null,
      button: opts.buttonId ? document.getElementById(opts.buttonId) : null,
      error: opts.errorId ? document.getElementById(opts.errorId) : null,
      injected: false
    };
  }

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'cg-secure-gate';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '99999';
    overlay.style.background = 'rgba(8,12,20,0.96)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '24px';
    overlay.innerHTML =
      '<div style="width:min(420px,100%);background:#0d1628;border:1px solid rgba(245,166,35,0.18);border-radius:10px;padding:28px 24px;color:#e8f0ff;font-family:\'DM Sans\',sans-serif;box-shadow:0 24px 60px rgba(0,0,0,0.45)">' +
        '<div style="font-family:\'DM Mono\',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#F5A623;margin-bottom:10px">Command Center</div>' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:28px;letter-spacing:0.08em;color:#F5A623;margin-bottom:10px">Encrypted Access</div>' +
        '<p style="font-size:13px;line-height:1.55;color:#8899aa;margin-bottom:18px">This command-center data is encrypted at rest. Enter the access password to decrypt it in this browser tab.</p>' +
        '<input id="cg-secure-input" type="password" autocomplete="current-password" placeholder="Access password" style="width:100%;background:#111e35;border:1px solid #1e3a5f;border-radius:6px;padding:12px 14px;color:#e8f0ff;font-family:\'DM Mono\',monospace;font-size:13px;outline:none" />' +
        '<button id="cg-secure-button" type="button" style="margin-top:12px;width:100%;background:#F5A623;border:none;border-radius:6px;padding:12px 14px;color:#080c14;font-family:\'DM Mono\',monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer">Unlock</button>' +
        '<div id="cg-secure-error" style="display:none;margin-top:10px;font-family:\'DM Mono\',monospace;font-size:11px;color:#E24B4A"></div>' +
        '<div style="margin-top:12px;font-family:\'DM Mono\',monospace;font-size:10px;color:#8899aa">Stored only in sessionStorage for this tab session.</div>' +
      '</div>';
    document.body.appendChild(overlay);
    return {
      gate: overlay,
      app: null,
      input: overlay.querySelector('#cg-secure-input'),
      button: overlay.querySelector('#cg-secure-button'),
      error: overlay.querySelector('#cg-secure-error'),
      injected: true
    };
  }

  function showGateError(refs, message) {
    if (!refs.error) return;
    refs.error.textContent = message;
    refs.error.style.display = 'block';
  }

  function clearGateError(refs) {
    if (!refs.error) return;
    refs.error.textContent = '';
    refs.error.style.display = 'none';
  }

  function hideGate(refs) {
    if (refs.app) refs.app.classList.remove('hidden');
    if (!refs.gate) return;
    if (refs.injected) refs.gate.remove();
    else refs.gate.classList.add('hidden');
  }

  async function fetchManifest() {
    if (manifestPromise) return manifestPromise;
    manifestPromise = fetch(BUNDLE_PATH, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Encrypted bundle not found at ' + BUNDLE_PATH);
        }
        return response.json();
      });
    return manifestPromise;
  }

  async function decryptWithPassword(manifest, password) {
    var enc = new TextEncoder();
    var salt = b64ToBytes(manifest.kdf.salt_b64);
    var iv = b64ToBytes(manifest.cipher.iv_b64);
    var ciphertext = b64ToBytes(manifest.ciphertext_b64);
    var baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    var key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: manifest.kdf.iterations,
        hash: manifest.kdf.hash || 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: manifest.cipher.length || 256 },
      false,
      ['decrypt']
    );
    var plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    return JSON.parse(bytesToText(new Uint8Array(plaintext)));
  }

  async function tryStoredPassword(manifest) {
    var stored = sessionStorage.getItem(PASS_KEY);
    if (!stored) return null;
    try {
      return await decryptWithPassword(manifest, stored);
    } catch (_err) {
      sessionStorage.removeItem(PASS_KEY);
      return null;
    }
  }

  function promptForPassword(manifest, opts) {
    return new Promise(function (resolve, reject) {
      var refs = getExistingGate(opts) || buildOverlay();
      function cleanup() {
        refs.button.removeEventListener('click', attempt);
        refs.input.removeEventListener('keydown', onKeydown);
      }
      async function attempt() {
        clearGateError(refs);
        var password = refs.input && refs.input.value ? refs.input.value : '';
        if (!password) {
          showGateError(refs, 'Password required');
          return;
        }
        refs.button.disabled = true;
        refs.button.textContent = 'Decrypting...';
        try {
          var data = await decryptWithPassword(manifest, password);
          sessionStorage.setItem(PASS_KEY, password);
          bundleCache = data;
          hideGate(refs);
          cleanup();
          resolve(data);
        } catch (_err) {
          showGateError(refs, 'Incorrect password');
          if (refs.input) {
            refs.input.value = '';
            refs.input.focus();
          }
        } finally {
          refs.button.disabled = false;
          refs.button.textContent = 'Unlock';
        }
      }
      function onKeydown(event) {
        if (event.key === 'Enter') attempt();
      }
      refs.button.addEventListener('click', attempt);
      refs.input.addEventListener('keydown', onKeydown);
      if (refs.input) refs.input.focus();
    });
  }

  async function ensureUnlocked(opts) {
    if (bundleCache) return bundleCache;
    if (bundlePromise) return bundlePromise;
    bundlePromise = (async function () {
      var manifest = await fetchManifest();
      var stored = await tryStoredPassword(manifest);
      if (stored) {
        bundleCache = stored;
        var existing = getExistingGate(opts);
        if (existing) hideGate(existing);
        return stored;
      }
      return promptForPassword(manifest, opts);
    })();
    try {
      return await bundlePromise;
    } finally {
      if (!bundleCache) bundlePromise = null;
    }
  }

  window.cgSecureData = {
    ensureUnlocked: ensureUnlocked,
    getBundle: async function (opts) {
      return ensureUnlocked(opts);
    },
    getDataset: async function (name, opts) {
      var bundle = await ensureUnlocked(opts);
      if (!bundle || !bundle.datasets || !(name in bundle.datasets)) {
        throw new Error('Encrypted dataset "' + name + '" is missing');
      }
      return bundle.datasets[name];
    },
    clearSession: function () {
      sessionStorage.removeItem(PASS_KEY);
      bundleCache = null;
      bundlePromise = null;
    }
  };
})();
