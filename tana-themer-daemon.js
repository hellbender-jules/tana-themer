#!/usr/bin/env node
// tana-themer-daemon.js
// Long-running watcher: detects Tana, ensures it's launched with the
// CDP debug port, injects the theming UI, and survives navigations.
//
// State files in $TT_STATE_DIR (default ~/Library/Application Support/TanaThemer/state):
//   enabled         - LaunchAgent should be loaded (informational)
//   pending_disable - exit + unload LaunchAgent when Tana next quits
//   wait_to_attach  - do NOT relaunch Tana with debug flag while it is currently
//                     running; cleared automatically when Tana quits

'use strict';

const fs        = require('fs');
const os        = require('os');
const http      = require('http');
const path      = require('path');
const { spawn, execSync } = require('child_process');
const WebSocket = require('ws');

const TANA_APP    = '/Applications/Tana.app/Contents/MacOS/Tana';
const DEBUG_PORT  = 9222;
const POLL_MS     = 2000;
const REINJECT_MS = 2000;

const HOME       = os.homedir();
const STATE_DIR  = process.env.TT_STATE_DIR  ||
                   path.join(HOME, 'Library/Application Support/TanaThemer/state');
const PLIST_PATH = process.env.TT_PLIST_PATH ||
                   path.join(HOME, 'Library/LaunchAgents/io.github.hellbendereu.tana-themer.plist');
const DAEMON_DIR = __dirname;

const flags = {
  enabled:        path.join(STATE_DIR, 'enabled'),
  pendingDisable: path.join(STATE_DIR, 'pending_disable'),
  waitToAttach:   path.join(STATE_DIR, 'wait_to_attach'),
};

const { THEMES } = require('./themes.js');
const UI_SCRIPT  = fs.readFileSync(path.join(DAEMON_DIR, 'desktop-ui.js'), 'utf8');
const THEMES_INJECTION = `window.__TT_THEMES__ = ${JSON.stringify(THEMES)};`;

let ws            = null;
let wsUrl         = null;
let connected     = false;
let reinjectTimer = null;

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function fileExists(p) {
  try { fs.accessSync(p); return true; } catch (_) { return false; }
}

function removeFile(p) {
  try { fs.unlinkSync(p); } catch (_) {}
}

function isTanaRunning() {
  try {
    execSync('pgrep -x Tana', { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

function httpGetJSON(url, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end',  () => {
        try { resolve(JSON.parse(data)); } catch (_) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
  });
}

async function findCDPWebSocket() {
  const targets = await httpGetJSON(`http://localhost:${DEBUG_PORT}/json`);
  if (!Array.isArray(targets)) return null;
  const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  return page ? page.webSocketDebuggerUrl : null;
}

function cdpCommand(socket, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    const handler = (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch (_) { return; }
      if (msg.id === id) {
        socket.off('message', handler);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    socket.on('message', handler);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function inject(socket) {
  try {
    await cdpCommand(socket, 'Runtime.evaluate', {
      expression: THEMES_INJECTION,
      returnByValue: false,
    });
    const result = await cdpCommand(socket, 'Runtime.evaluate', {
      expression: UI_SCRIPT,
      returnByValue: true,
    });
    if (result && result.exceptionDetails) {
      const ex = result.exceptionDetails;
      const desc = (ex.exception && ex.exception.description) || ex.text;
      log(`Script exception at line ${ex.lineNumber}: ${desc}`);
      return;
    }
    const marker = result && result.result && result.result.value;
    if (marker === 'tana-themer:ready') {
      log('Injected successfully');
    } else {
      log(`Injection returned unexpected value: ${marker}`);
    }
  } catch (err) {
    log(`Injection error: ${err.message}`);
  }
}

function disconnect() {
  if (reinjectTimer) { clearTimeout(reinjectTimer); reinjectTimer = null; }
  if (ws) {
    try { ws.removeAllListeners(); ws.close(); } catch (_) {}
    ws = null;
  }
  wsUrl     = null;
  connected = false;
}

async function connectAndInject() {
  const url = await findCDPWebSocket();
  if (!url) return false;
  wsUrl = url;

  await new Promise((resolve, reject) => {
    ws = new WebSocket(url);
    ws.once('open', resolve);
    ws.once('error', reject);
  }).catch((err) => {
    log(`WebSocket connect failed: ${err.message}`);
    disconnect();
    return false;
  });
  if (!ws) return false;

  connected = true;
  log(`WebSocket connected at ${url}`);

  await cdpCommand(ws, 'Page.enable');
  await inject(ws);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }
    if (msg.method === 'Page.frameNavigated' &&
        msg.params.frame.parentId === undefined) {
      if (reinjectTimer) clearTimeout(reinjectTimer);
      reinjectTimer = setTimeout(() => { if (ws) inject(ws); }, REINJECT_MS);
    }
  });

  ws.on('error', (err) => {
    log(`WebSocket error: ${err.message}`);
  });

  ws.on('close', () => {
    log('WebSocket closed (Tana quit or disconnected)');
    disconnect();
  });

  return true;
}

function relaunchTanaWithDebug() {
  log('Relaunching Tana with --remote-debugging-port=' + DEBUG_PORT);
  try {
    execSync('pkill -x Tana', { stdio: 'ignore' });
  } catch (_) {
    // not running
  }
  // Tiny pause to let port be released
  const start = Date.now();
  while (Date.now() - start < 500) { /* noop */ }
  const t = spawn(TANA_APP, [`--remote-debugging-port=${DEBUG_PORT}`], {
    detached: true,
    stdio:    'ignore',
  });
  t.unref();
}

function unloadLaunchAgentDetached() {
  // Spawn detached so the unload survives our own exit.
  const child = spawn('launchctl',
    ['bootout', `gui/${process.getuid()}`, PLIST_PATH],
    { detached: true, stdio: 'ignore' });
  child.unref();
}

async function cleanupAndExit() {
  log('Pending disable + Tana quit detected — unloading agent and exiting');
  removeFile(flags.enabled);
  removeFile(flags.pendingDisable);
  removeFile(flags.waitToAttach);
  unloadLaunchAgentDetached();
  // Give the spawned launchctl a moment to start
  setTimeout(() => process.exit(0), 200);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tick() {
  const tanaRunning = isTanaRunning();

  // Honour pending_disable: when Tana quits, shut everything down.
  if (fileExists(flags.pendingDisable) && !tanaRunning) {
    disconnect();
    await cleanupAndExit();
    return;
  }

  if (tanaRunning) {
    if (connected) {
      // ws.on('close') will clear `connected` if Tana actually quits;
      // here we just keep idle.
      return;
    }
    const cdpUrl = await findCDPWebSocket();
    if (cdpUrl) {
      await connectAndInject();
      return;
    }
    // Tana is running but CDP is not exposed.
    if (fileExists(flags.waitToAttach)) {
      // User asked us to wait — do nothing this tick.
      return;
    }
    relaunchTanaWithDebug();
    return;
  }

  // Tana not running.
  if (fileExists(flags.waitToAttach)) {
    log('Tana quit — clearing wait_to_attach (will auto-attach next launch)');
    removeFile(flags.waitToAttach);
  }
  if (ws || connected) disconnect();
}

async function main() {
  log(`Daemon starting (pid ${process.pid})`);
  log(`State dir: ${STATE_DIR}`);
  log(`Plist:     ${PLIST_PATH}`);

  process.on('SIGTERM', () => { disconnect(); process.exit(0); });
  process.on('SIGINT',  () => { disconnect(); process.exit(0); });

  for (;;) {
    try {
      await tick();
    } catch (err) {
      log(`Tick error: ${err.message}`);
    }
    await sleep(POLL_MS);
  }
}

main().catch((err) => {
  log(`Fatal: ${err.message}`);
  process.exit(1);
});
