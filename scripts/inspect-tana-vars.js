#!/usr/bin/env node
// inspect-tana-vars.js — diagnostic utility.
// Connects to a running Tana session via CDP (port 9222), enumerates
// every CSS custom property Tana defines on the document, and
// identifies which variable controls the background of "widget"-style
// containers (Late / Today / Triage / Inbox cards on the home view).
//
// Requires Tana Themer's daemon to be running so the CDP port is open.
// Usage: node scripts/inspect-tana-vars.js

'use strict';

const http      = require('http');
const path      = require('path');
const WebSocket = require(path.join(__dirname, '..', 'node_modules', 'ws'));

const DEBUG_PORT = 9222;

function httpGetJSON(url) {
  return new Promise((res, rej) => {
    http.get(url, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end',  () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
      r.on('error', rej);
    });
  });
}

async function findPage() {
  const targets = await httpGetJSON(`http://localhost:${DEBUG_PORT}/json`);
  const page = targets.find(t => t.type === 'page' && t.url && t.url.includes('tana'));
  if (!page) throw new Error('No Tana page reachable via CDP');
  return page;
}

function cdpEval(ws, expression) {
  return new Promise((res, rej) => {
    const id = Math.floor(Math.random() * 1e9);
    const handler = raw => {
      const msg = JSON.parse(raw);
      if (msg.id === id) {
        ws.off('message', handler);
        if (msg.error) return rej(new Error(msg.error.message));
        const r = msg.result;
        if (r.exceptionDetails) return rej(new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
        res(r.result.value);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate',
      params: { expression, returnByValue: true } }));
  });
}

async function main() {
  const page = await findPage();
  console.log('Connected to:', page.title);
  console.log('');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.once('open', res); ws.once('error', rej); });

  // ── 1. Enumerate all CSS custom properties defined in Tana's
  //       stylesheets and their currently-resolved values on :root.
  const allVars = await cdpEval(ws, `
    (() => {
      const found = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i];
                if (prop.startsWith('--')) found.add(prop);
              }
            }
          }
        } catch (_) { /* cross-origin sheet — skip */ }
      }
      const root = getComputedStyle(document.documentElement);
      return [...found].sort().map(name => ({
        name,
        value: root.getPropertyValue(name).trim(),
      }));
    })()
  `);

  console.log('==== Total CSS vars defined by Tana:', allVars.length, '====');
  console.log('');
  console.log('--- All background-/panel-/widget-/surface-related vars ---');
  const bgish = allVars.filter(v =>
    /background|panel|widget|card|overlay|surface|menu|popover|float|sheet|container|drawer|sidebar|search|saved|tana/i.test(v.name)
  );
  for (const v of bgish) {
    console.log('  ' + v.name.padEnd(50) + ' = ' + v.value);
  }
  console.log('');

  // ── 2. Walk the DOM looking for elements with a near-white computed
  //       background-color and a class name we recognize. Report the
  //       distinct class+bg combinations.
  const widgetBgs = await cdpEval(ws, `
    (() => {
      const root = getComputedStyle(document.documentElement);
      const all = document.querySelectorAll('*');
      const buckets = new Map();
      for (const el of all) {
        if (!el.className || typeof el.className !== 'string') continue;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        // Look for "white-ish" / "near-white" backgrounds — anything
        // brighter than the Claude main bg (#faf9f5 ≈ rgb(250,249,245))
        const m = bg.match(/^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$/);
        if (!m) continue;
        const [_, r, g, b] = m;
        const max = Math.max(+r, +g, +b);
        const min = Math.min(+r, +g, +b);
        if (max < 250 || (max - min) > 6) continue;  // not near-white
        const rect = el.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 50) continue;  // not a panel
        const key = el.className.split(/\\s+/).slice(0, 3).join(' ');
        if (!buckets.has(key)) buckets.set(key, { bg, count: 0, sample: el.outerHTML.slice(0, 200) });
        buckets.get(key).count++;
      }
      return [...buckets.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 15)
        .map(([cls, info]) => ({ classes: cls, bg: info.bg, count: info.count, sample: info.sample }));
    })()
  `);

  console.log('==== White-ish panel-sized elements (top 15 by occurrence) ====');
  console.log('');
  for (const w of widgetBgs) {
    console.log('  classes: ' + w.classes);
    console.log('  bg:      ' + w.bg + ' (count=' + w.count + ')');
    console.log('  sample:  ' + w.sample.replace(/\\s+/g, ' '));
    console.log('');
  }

  // ── 3. For each top class, try to identify which CSS variable
  //       resolves to its backgroundColor.
  console.log('==== Likely variable for each ====');
  for (const w of widgetBgs.slice(0, 6)) {
    const match = allVars.find(v => {
      // Normalize for comparison
      const norm = s => s.replace(/\\s/g, '').toLowerCase();
      return norm(v.value) === norm(w.bg);
    });
    console.log('  ' + w.classes.padEnd(50) + ' → ' + (match ? match.name : '(no exact match)') + (match ? '' : '   bg=' + w.bg));
  }

  ws.close();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
