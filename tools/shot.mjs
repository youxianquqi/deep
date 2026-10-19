import { spawn } from 'node:child_process';
import fs from 'node:fs';

const url = process.argv[2];
const out = process.argv[3] || 'D:/bizhi/hamster-wheel/shot.png';
const waitMs = parseInt(process.argv[4] || '5000', 10);
let probeExpr = process.argv[5] || null;
const VW = parseInt(process.env.SHOT_W || '1600', 10);
const VH = parseInt(process.env.SHOT_H || '900', 10);
const port = 9333 + Math.floor(Math.random() * 200);
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile = 'C:/Users/keai/AppData/Local/Temp/dsh-edge-' + port;

const args = [
  '--headless=new', '--remote-debugging-port=' + port,
  '--user-data-dir=' + profile,
  '--window-size=' + VW + ',' + VH,
  '--hide-scrollbars', '--disable-gpu-sandbox',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--no-first-run', '--no-default-browser-check',
  '--disable-features=Translate,MediaRouter',
  'about:blank'
];
const proc = spawn(edge, args, { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl = null;
for (let i = 0; i < 50; i++) {
  try {
    const list = await fetch('http://127.0.0.1:' + port + '/json/list').then(r => r.json());
    const page = list.find(t => t.type === 'page');
    if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
  } catch (e) {}
  await sleep(200);
}
if (!wsUrl) { console.error('NO WS'); proc.kill(); process.exit(1); }

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
const logs = [];
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result);
  } else if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    logs.push('EXCEPTION: ' + (d.exception && d.exception.description || d.text));
  } else if (m.method === 'Runtime.consoleAPICalled') {
    const t = m.params.type;
    if (t === 'error' || t === 'warning') {
      logs.push(t.toUpperCase() + ': ' + m.params.args.map(a => a.value !== undefined ? a.value : (a.description || a.type)).join(' '));
    }
  } else if (m.method === 'Log.entryAdded') {
    if (m.params.entry.level === 'error' || m.params.entry.level === 'warning') {
      logs.push('LOG ' + m.params.entry.level + ': ' + m.params.entry.text);
    }
  }
};
function send(method, params) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
  });
}

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await sleep(waitMs);

let info = null;
try {
  const ev = await send('Runtime.evaluate', {
    expression: [
      '(function(){',
      'const w = window.__WHEEL;',
      'return {',
      '  ready: !!window.__WHEEL_READY,',
      '  err: window.__PAGE_ERROR || null,',
      '  title: document.title,',
      '  opacity: (function(){ const c=document.querySelector("canvas"); return c ? getComputedStyle(c).opacity : null; })(),',
      '  canv: (function(){ const c=document.querySelector("canvas"); return c ? [c.width,c.height,c.clientWidth,c.clientHeight] : null; })(),',
      '  size: w ? w.settings.size() : null,',
      '  calls: w ? w.settings.drawcalls() : null,',
      '  tris: w ? w.settings.triangles() : null,',
      '  webgl: w ? w.renderer.capabilities.isWebGL2 : null',
      '};',
      '})()'
    ].join(String.fromCharCode(10)),
    returnByValue: true
  });
  info = ev.result.value;
} catch (e) { info = { evalError: String(e) }; }

let probe = null;
if (probeExpr && probeExpr.startsWith('@')) probeExpr = fs.readFileSync(probeExpr.slice(1), 'utf8');
if (probeExpr) {
  try {
    const pv = await send('Runtime.evaluate', { expression: probeExpr, returnByValue: true });
    probe = pv.result.value;
    if (pv.exceptionDetails) probe = { probeError: pv.exceptionDetails.text };
  } catch (e) { probe = { probeError: String(e) }; }
}

const cap = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
fs.writeFileSync(out, Buffer.from(cap.data, 'base64'));
console.log(JSON.stringify({ info, logs: logs.slice(0, 30), probe, out }, null, 2));

ws.close();
proc.kill();
try { process.kill(proc.pid); } catch (e) {}
await sleep(300);