import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

let three = read('src/three.min.js')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '')
  .replace(/<\/script/gi, '<\\/script');

const sheetData = 'data:image/png;base64,' +
  fs.readFileSync(path.join(root, 'assets/walk-sheet.png')).toString('base64');

const parts = [
  '01-core.js',
  '02-textures.js',
  '03-materials.js',
  '04-world.js',
  '05-wheel.js',
  '06-anim.js'
];

let app = parts.map(p => '\n/* ===== ' + p + ' ===== */\n' + read('src/' + p)).join('\n');
app = app.replace('__WALK_SHEET_DATA__', () => sheetData);
app = app.replace(/<\/script/gi, '<\\/script');

let html = read('src/template.html');
html = html.replace('/*__THREE__*/', () => three);
html = html.replace('/*__APP__*/', () => app);

const wallpaperDir = path.join(root, 'wallpaper');
fs.mkdirSync(path.join(wallpaperDir, 'assets'), { recursive: true });
fs.writeFileSync(path.join(wallpaperDir, 'index.html'), html);
fs.copyFileSync(
  path.join(root, 'assets/ambience.mp3'),
  path.join(wallpaperDir, 'assets/ambience.mp3')
);

console.log('built wallpaper/index.html', (html.length / 1024).toFixed(1) + ' KB');
console.log('copied wallpaper/assets/ambience.mp3');
