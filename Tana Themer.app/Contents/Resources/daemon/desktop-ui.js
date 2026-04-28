// desktop-ui.js
// Injected into Tana's Electron renderer via CDP Runtime.evaluate.
// window.__TT_THEMES__ must be set before this script runs.
// Safe to call multiple times — cleans up any previous injection first.

(function () {
  'use strict';

  const THEMES     = window.__TT_THEMES__;
  const STORAGE_KEY = 'tana-themer-active';

  if (!THEMES) {
    console.warn('[tana-themer] __TT_THEMES__ not set — aborting');
    return;
  }

  // ── CSS builder ─────────────────────────────────────────────────────────────
  function buildCSS(theme) {
    if (!theme || !theme.vars || !Object.keys(theme.vars).length) return '';
    const modeSelector = theme.mode === 'light' ? 'html.isLightMode' : 'html.isDarkMode';
    const themeClass   = '.tana-theme-' + theme.id;
    const declarations = Object.entries(theme.vars)
      .map(function (kv) { return '  ' + kv[0] + ': ' + kv[1] + ';'; })
      .join('\n');
    return modeSelector + themeClass + ' {\n' + declarations + '\n}';
  }

  // ── Apply theme ──────────────────────────────────────────────────────────────
  function applyTheme(themeId) {
    var theme = THEMES[themeId];
    var html  = document.documentElement;

    // Strip all previous theme classes
    Object.keys(THEMES).forEach(function (id) {
      html.classList.remove('tana-theme-' + id);
    });

    // Tana default themes — just flip the mode class, no CSS overrides
    if (!theme || !theme.vars || !Object.keys(theme.vars).length) {
      if (themeId === 'tana-dark') {
        html.classList.remove('isLightMode');
        html.classList.add('isDarkMode');
      } else {
        html.classList.remove('isDarkMode');
        html.classList.add('isLightMode');
      }
      var el = document.getElementById('tana-themer-styles');
      if (el) el.textContent = '';
      localStorage.setItem(STORAGE_KEY, themeId);
      return;
    }

    // Switch Tana's base mode to match
    if (theme.mode === 'dark') {
      html.classList.remove('isLightMode');
      html.classList.add('isDarkMode');
    } else {
      html.classList.remove('isDarkMode');
      html.classList.add('isLightMode');
    }

    // Add theme specificity class
    html.classList.add('tana-theme-' + themeId);

    // Inject or update the <style> block
    var styleEl = document.getElementById('tana-themer-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tana-themer-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = buildCSS(theme);
    localStorage.setItem(STORAGE_KEY, themeId);
  }

  // ── Picker UI ────────────────────────────────────────────────────────────────
  function buildPickerHTML(activeId) {
    var items = Object.values(THEMES).map(function (t) {
      var swatches = (t.preview || ['#fff', '#888', '#000'])
        .map(function (c) { return '<span class="tt-swatch" style="background:' + c + '"></span>'; })
        .join('');
      var cls = t.id === activeId ? ' tt-active' : '';
      return '<div class="tt-item' + cls + '" data-theme="' + t.id + '">'
        + '<span class="tt-swatches">' + swatches + '</span>'
        + '<span class="tt-name">' + t.name + '</span>'
        + '<span class="tt-check">\u2713</span>'
        + '</div>';
    }).join('');

    return '<style>'
      + '#tt-root {'
      + '  position:fixed; bottom:1.25rem; right:1.25rem; z-index:99999;'
      + '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:13px;'
      + '}'
      + '#tt-btn {'
      + '  width:2.1rem; height:2.1rem; border-radius:50%;'
      + '  background:var(--colorUIContextMenuBackground,#fff);'
      + '  border:1.5px solid var(--colorUIStroke,#ddd);'
      + '  box-shadow:0 2px 8px rgba(0,0,0,.14);'
      + '  cursor:pointer; display:flex; align-items:center; justify-content:center;'
      + '  font-size:1rem; transition:transform .12s ease,box-shadow .12s ease;'
      + '  user-select:none; line-height:1;'
      + '}'
      + '#tt-btn:hover { transform:scale(1.1); box-shadow:0 4px 14px rgba(0,0,0,.2); }'
      + '#tt-panel {'
      + '  display:none; position:absolute; bottom:2.75rem; right:0;'
      + '  background:var(--colorUIContextMenuBackground,#fff);'
      + '  border:1px solid var(--colorUIStroke,#ddd);'
      + '  border-radius:10px; box-shadow:0 8px 28px rgba(0,0,0,.16);'
      + '  padding:.4rem; min-width:13rem;'
      + '}'
      + '#tt-panel.tt-open { display:block; animation:tt-in .14s ease; }'
      + '@keyframes tt-in { from{opacity:0;transform:translateY(5px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }'
      + '.tt-label {'
      + '  font-size:.62rem; font-weight:600; letter-spacing:.07em; text-transform:uppercase;'
      + '  color:var(--colorUITextMuted,#999); padding:.35rem .6rem .25rem;'
      + '}'
      + '.tt-item {'
      + '  display:flex; align-items:center; gap:.5rem; padding:.38rem .6rem;'
      + '  border-radius:6px; cursor:pointer; color:var(--colorEditorText,#333);'
      + '  transition:background .08s;'
      + '}'
      + '.tt-item:hover { background:var(--colorUIListItemHovered,rgba(0,0,0,.06)); }'
      + '.tt-item.tt-active { background:var(--colorSelected,rgba(0,0,0,.08)); }'
      + '.tt-swatches { display:flex; gap:2px; flex-shrink:0; }'
      + '.tt-swatch { width:9px; height:9px; border-radius:50%; border:1px solid rgba(0,0,0,.12); display:inline-block; }'
      + '.tt-name { flex:1; }'
      + '.tt-check { opacity:0; font-size:.75rem; color:var(--colorFocus,#297dd9); }'
      + '.tt-item.tt-active .tt-check { opacity:1; }'
      + '</style>'
      + '<div id="tt-panel"><div class="tt-label">Theme</div>' + items + '</div>'
      + '<div id="tt-btn" title="Tana Themer">\uD83C\uDFA8</div>';
  }

  function injectUI(activeId) {
    // Remove any existing picker (re-injection after navigation)
    var existing = document.getElementById('tt-root');
    if (existing) existing.remove();

    var root = document.createElement('div');
    root.id  = 'tt-root';
    root.innerHTML = buildPickerHTML(activeId);
    document.body.appendChild(root);

    var btn   = root.querySelector('#tt-btn');
    var panel = root.querySelector('#tt-panel');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('tt-open');
    });

    document.addEventListener('click', function () {
      panel.classList.remove('tt-open');
    });

    root.querySelectorAll('.tt-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var themeId = item.dataset.theme;
        applyTheme(themeId);
        root.querySelectorAll('.tt-item').forEach(function (i) { i.classList.remove('tt-active'); });
        item.classList.add('tt-active');
        panel.classList.remove('tt-open');
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  var saved = localStorage.getItem(STORAGE_KEY) || 'tana-light';
  applyTheme(saved);

  // Wait for Tana's React tree to be in the DOM before appending picker
  function tryInjectUI() {
    if (document.body) {
      injectUI(saved);
    } else {
      setTimeout(tryInjectUI, 200);
    }
  }
  tryInjectUI();

  // Return a marker so the Node process can confirm successful injection
  return 'tana-themer:ready';
})();
