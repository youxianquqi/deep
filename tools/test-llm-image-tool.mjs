import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const port = 9877;
let captured = null;
let imageRequested = false;
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/v1/images/generations') {
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => {
      try { captured = JSON.parse(raw); } catch (e) { captured = { parseError: e.message }; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        created: 123,
        data: [
          { revised_prompt: 'mock revised', url: 'http://127.0.0.1:' + port + '/image.webp' }
        ]
      }));
    });
    return;
  }
  if (req.method === 'GET' && req.url === '/image.webp') {
    imageRequested = true;
    res.writeHead(200, { 'Content-Type': 'image/webp' });
    res.end(Buffer.from([0x52, 0x49, 0x46, 0x46]));
    return;
  }
  res.writeHead(404); res.end('not found');
});
await new Promise((resolve, reject) => {
  server.listen(port, '127.0.0.1', err => err ? reject(err) : resolve());
});

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-tool-test-'));
const args = [
  'tools/llm-image-tool.mjs',
  '--prompt', 'mock prompt',
  '--size', '1024x1024',
  '--image', 'https://example.com/ref.png',
  '--download',
  '--out-dir', outDir
];
const child = spawn(process.execPath, args, {
  cwd: process.cwd(),
  env: Object.assign({}, process.env, {
    N1N_API_BASE: 'http://127.0.0.1:' + port,
    N1N_API_KEY: 'mock-key'
  }),
  stdio: ['ignore', 'pipe', 'pipe']
});
let stdout = '', stderr = '';
child.stdout.on('data', c => stdout += c);
child.stderr.on('data', c => stderr += c);
const exitCode = await new Promise(r => child.on('exit', r));
server.close();

const parsed = JSON.parse(stdout);
const file = path.join(outDir, 'image-01.webp');
const result = {
  exitCode,
  capturedModel: captured && captured.model,
  capturedPrompt: captured && captured.prompt,
  capturedImages: captured && captured.image && captured.image.length,
  saved: parsed.images && parsed.images[0] && parsed.images[0].saved,
  fileExists: fs.existsSync(file),
  fileSize: fs.existsSync(file) ? fs.statSync(file).size : 0,
  imageRequested,
  stderr: stderr.trim()
};
console.log(JSON.stringify(result, null, 2));
if (exitCode !== 0 || !captured || captured.model !== 'gpt-image-2-all' ||
    captured.prompt !== 'mock prompt' || captured.image.length !== 1 ||
    !parsed.images[0].saved || !fs.existsSync(file)) {
  process.exit(1);
}
