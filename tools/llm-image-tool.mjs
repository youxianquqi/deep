#!/usr/bin/env node
/**
 * N1N / llm-api.net image generation tool.
 *
 * API reference:
 *   POST https://llm-api.net/v1/images/generations
 *   model: gpt-image-2-all
 *
 * This is a CLI wrapper so an agent can call it through a shell/tool adapter:
 *   node tools/llm-image-tool.mjs --prompt "..." --size 1024x1024 --download
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const VERSION = '1.0.0';
const DEFAULT_MODEL = 'gpt-image-2-all';
const DEFAULT_SIZE = '1024x1024';
const DEFAULT_N = 1;
const DEFAULT_TIMEOUT_SECONDS = 180;
const VALID_SIZES = new Set(['1024x1024', '1536x1024', '1024x1536']);

function printHelp() {
  console.log([
    'N1N image generation tool ' + VERSION,
    '',
    'Usage:',
    '  node tools/llm-image-tool.mjs --prompt "..." [options]',
    '',
    'Required:',
    '  --prompt, -p <text>        Text prompt',
    '  --prompt-file <path>       Read prompt from a UTF-8 file',
    '  (one of --prompt / --prompt-file is required)',
    '',
    'Environment:',
    '  N1N_API_KEY                API key (preferred)',
    '  LLM_API_KEY                Fallback API key',
    '  N1N_API_BASE               Default: https://llm-api.net',
    '',
    'Options:',
    '  --model <name>             Default: gpt-image-2-all',
    '  --size <WxH>               1024x1024 | 1536x1024 | 1024x1536',
    '  --n <1-4>                  Number of images, default 1',
    '  --image <url>              Reference image URL, repeatable, max 5',
    '  --image-file <path>        Local reference image as data URL, repeatable',
    '  --download                 Download returned images',
    '  --out-dir <path>           Download directory, default ./generated',
    '  --timeout <seconds>        Request timeout, default 180',
    '  --max-retries <0-3>        Retries for 429/5xx, default 2',
    '  --dry-run                  Print sanitized request, no network',
    '  --help, -h                 Show this help',
    '',
    'Output:',
    '  JSON on stdout. Errors are JSON on stderr and exit code 1.',
    '',
    'Reference image note:',
    '  The documented API expects image URLs. --image-file converts local files',
    '  to data URLs, but the remote API may reject data URLs; prefer public URLs.',
    ''
  ].join('\n'));
}

function fail(code, message, details) {
  const payload = { ok: false, error: { code: code, message: message } };
  if (details && typeof details === 'object') payload.error.details = details;
  process.stderr.write(JSON.stringify(payload, null, 2) + '\n');
  process.exit(1);
}

function takeValue(argv, index, name) {
  const v = argv[index + 1];
  if (v === undefined || v.startsWith('--')) {
    fail('MISSING_VALUE', 'Missing value for ' + name);
  }
  return v;
}

function parseInteger(value, name, min, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    fail('INVALID_ARGUMENT', name + ' must be an integer in [' + min + ', ' + max + ']');
  }
  return n;
}

function parseArgs(argv) {
  const opts = {
    prompt: '',
    promptFile: '',
    model: DEFAULT_MODEL,
    size: DEFAULT_SIZE,
    n: DEFAULT_N,
    images: [],
    imageFiles: [],
    download: false,
    outDir: 'generated',
    timeout: DEFAULT_TIMEOUT_SECONDS,
    maxRetries: 2,
    dryRun: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--prompt' || arg === '-p') {
      opts.prompt = takeValue(argv, i, '--prompt');
      i++;
    } else if (arg === '--prompt-file') {
      opts.promptFile = takeValue(argv, i, '--prompt-file');
      i++;
    } else if (arg === '--model') {
      opts.model = takeValue(argv, i, '--model');
      i++;
    } else if (arg === '--size') {
      opts.size = takeValue(argv, i, '--size');
      i++;
    } else if (arg === '--n') {
      opts.n = parseInteger(takeValue(argv, i, '--n'), '--n', 1, 4);
      i++;
    } else if (arg === '--image') {
      opts.images.push(takeValue(argv, i, '--image'));
      i++;
    } else if (arg === '--image-file') {
      opts.imageFiles.push(takeValue(argv, i, '--image-file'));
      i++;
    } else if (arg === '--download') {
      opts.download = true;
    } else if (arg === '--out-dir') {
      opts.outDir = takeValue(argv, i, '--out-dir');
      i++;
    } else if (arg === '--timeout') {
      opts.timeout = parseInteger(takeValue(argv, i, '--timeout'), '--timeout', 10, 600);
      i++;
    } else if (arg === '--max-retries') {
      opts.maxRetries = parseInteger(takeValue(argv, i, '--max-retries'), '--max-retries', 0, 3);
      i++;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg.startsWith('--')) {
      fail('UNKNOWN_ARGUMENT', 'Unknown argument: ' + arg);
    } else {
      fail('UNKNOWN_ARGUMENT', 'Unexpected positional argument: ' + arg);
    }
  }

  if (!opts.prompt && !opts.promptFile) {
    fail('MISSING_PROMPT', 'Provide --prompt or --prompt-file');
  }
  if (opts.promptFile) {
    try {
      opts.prompt = fs.readFileSync(path.resolve(opts.promptFile), 'utf8').trim();
    } catch (e) {
      fail('PROMPT_FILE_ERROR', 'Cannot read --prompt-file: ' + e.message);
    }
  }
  if (!opts.prompt.trim()) {
    fail('EMPTY_PROMPT', 'Prompt must not be empty');
  }
  if (!VALID_SIZES.has(opts.size)) {
    fail('INVALID_SIZE', '--size must be one of: ' + Array.from(VALID_SIZES).join(', '));
  }
  if (opts.images.length + opts.imageFiles.length > 5) {
    fail('TOO_MANY_IMAGES', 'At most 5 reference images are allowed');
  }

  return opts;
}

function mimeForFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  fail('UNSUPPORTED_IMAGE', 'Unsupported local image type: ' + ext);
}

function fileToDataUrl(file) {
  const abs = path.resolve(file);
  let data;
  try {
    data = fs.readFileSync(abs);
  } catch (e) {
    fail('IMAGE_FILE_ERROR', 'Cannot read image file: ' + e.message);
  }
  return 'data:' + mimeForFile(abs) + ';base64,' + data.toString('base64');
}

function buildRequest(opts) {
  const images = opts.images.slice();
  for (const file of opts.imageFiles) images.push(fileToDataUrl(file));
  const body = {
    model: opts.model,
    size: opts.size,
    n: opts.n,
    prompt: opts.prompt
  };
  if (images.length > 0) body.image = images;
  return body;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeErrorText(text) {
  if (!text) return '';
  return String(text).slice(0, 2000);
}

async function requestOnce(url, apiKey, body, timeoutSeconds) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}
    return { response, text, json };
  } finally {
    clearTimeout(timer);
  }
}

function extensionFrom(url, contentType) {
  const type = (contentType || '').toLowerCase();
  if (type.includes('image/png')) return '.png';
  if (type.includes('image/jpeg')) return '.jpg';
  if (type.includes('image/webp')) return '.webp';
  if (type.includes('image/gif')) return '.gif';
  try {
    const p = new URL(url).pathname;
    const ext = path.extname(p).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  } catch (e) {}
  return '.png';
}

async function downloadUrl(url, outDir, index, timeoutSeconds) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error('image download HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = extensionFrom(url, res.headers.get('content-type'));
    const file = path.join(outDir, 'image-' + String(index + 1).padStart(2, '0') + ext);
    fs.writeFileSync(file, buf);
    return file;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const body = buildRequest(opts);
  const apiBase = (process.env.N1N_API_BASE || 'https://llm-api.net').replace(/\/+$/, '');
  const url = apiBase + '/v1/images/generations';
  const apiKey = process.env.N1N_API_KEY || process.env.LLM_API_KEY || '';

  if (opts.dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      method: 'POST',
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': apiKey ? 'Bearer ***' : '(missing)'
      },
      body: {
        model: body.model,
        size: body.size,
        n: body.n,
        promptLength: body.prompt.length,
        imageCount: body.image ? body.image.length : 0,
        imagePrefixes: body.image ? body.image.map(v => v.slice(0, 32) + '...') : []
      }
    }, null, 2));
    return;
  }

  if (!apiKey) {
    fail('MISSING_API_KEY', 'Set N1N_API_KEY or LLM_API_KEY. Do not pass the key as a command-line argument.');
  }

  let last = null;
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      last = await requestOnce(url, apiKey, body, opts.timeout);
    } catch (e) {
      if (attempt < opts.maxRetries) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      fail('NETWORK_ERROR', e.name === 'AbortError' ? 'Request timed out' : e.message);
    }

    if (last.response.ok) break;
    const retryable = last.response.status === 429 || last.response.status >= 500;
    if (!retryable || attempt >= opts.maxRetries) break;
    await sleep(700 * (attempt + 1));
  }

  if (!last || !last.response) fail('NO_RESPONSE', 'No response from API');
  if (!last.response.ok) {
    const apiMessage = last.json && last.json.error && last.json.error.message
      ? last.json.error.message
      : sanitizeErrorText(last.text);
    fail('API_ERROR', 'HTTP ' + last.response.status + ': ' + apiMessage, {
      status: last.response.status,
      requestId: last.response.headers.get('x-request-id') || null
    });
  }

  const payload = last.json;
  if (!payload || !Array.isArray(payload.data)) {
    fail('INVALID_RESPONSE', 'API response does not contain a data array', {
      response: sanitizeErrorText(last.text)
    });
  }

  const images = [];
  let outDir = null;
  if (opts.download && payload.data.length > 0) {
    outDir = path.resolve(opts.outDir);
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (let i = 0; i < payload.data.length; i++) {
    const item = payload.data[i] || {};
    const entry = {
      index: i,
      url: item.url || null,
      revised_prompt: item.revised_prompt || ''
    };
    if (item.b64_json) {
      entry.b64_json = true;
      if (outDir) {
        const file = path.join(outDir, 'image-' + String(i + 1).padStart(2, '0') + '.png');
        const b64 = String(item.b64_json).replace(/^data:[^;]+;base64,/, '');
        fs.writeFileSync(file, Buffer.from(b64, 'base64'));
        entry.saved = file;
      }
    } else if (item.url && outDir) {
      try {
        entry.saved = await downloadUrl(item.url, outDir, i, opts.timeout);
      } catch (e) {
        entry.download_error = e.message;
      }
    }
    images.push(entry);
  }

  console.log(JSON.stringify({
    ok: true,
    model: body.model,
    size: body.size,
    n: body.n,
    created: payload.created || null,
    requestId: last.response.headers.get('x-request-id') || null,
    images: images
  }, null, 2));
}

main().catch(e => fail('UNEXPECTED_ERROR', e && e.message ? e.message : String(e)));