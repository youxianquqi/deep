
/* =========================================================================
   3. 程序化贴图（全部 Canvas 2D 绘制，无外部资源）
   ========================================================================= */

/* ---- 桌面木纹：横向生长纹 + 板缝 + 木节 ---- */
const texDeskWood = canvasTex(1024, 1024, (g, w, h) => {
  const R = makeRng(7);
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#8a6240');
  bg.addColorStop(0.35, '#966b46');
  bg.addColorStop(0.7, '#825838');
  bg.addColorStop(1, '#744c30');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);

  // 大块色差
  for (let i = 0; i < 26; i++) {
    const y = R() * h, hh = 20 + R() * 150;
    const gr = g.createLinearGradient(0, y, 0, y + hh);
    gr.addColorStop(0, 'rgba(255,205,150,0)');
    gr.addColorStop(0.5, 'rgba(255,205,150,' + (0.012 + R() * 0.03) + ')');
    gr.addColorStop(1, 'rgba(40,15,5,0)');
    g.fillStyle = gr; g.fillRect(0, y, w, hh);
  }

  // 横向木纹
  for (let i = 0; i < 760; i++) {
    const y0 = R() * h;
    const amp = 1 + R() * 7;
    const freq = 0.004 + R() * 0.012;
    const ph = R() * TAU;
    const alpha = 0.03 + R() * 0.10;
    const dark = R() > 0.28;
    g.strokeStyle = dark
      ? 'rgba(44,20,9,' + alpha + ')'
      : 'rgba(255,214,160,' + (alpha * 0.55) + ')';
    g.lineWidth = 0.5 + R() * 1.8;
    g.beginPath();
    for (let x = -20; x <= w + 20; x += 14) {
      const y = y0 + Math.sin(x * freq + ph) * amp + Math.sin(x * 0.031 + ph * 2.1) * (amp * 0.4);
      if (x === -20) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }

  // 木节
  for (let k = 0; k < 4; k++) {
    const cx = 100 + R() * (w - 200), cy = 90 + R() * (h - 180);
    const rx = 9 + R() * 15, ry = 4 + R() * 8;
    for (let r = 0; r < 7; r++) {
      g.strokeStyle = 'rgba(38,17,8,' + (0.20 - r * 0.022) + ')';
      g.lineWidth = 1.2;
      g.beginPath();
      g.ellipse(cx, cy, rx + r * 6.5, ry + r * 3.2, R() * 0.08, 0, TAU);
      g.stroke();
    }
    g.fillStyle = 'rgba(38,16,7,0.20)';
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fill();
  }

  // 板缝（三条长缝）
  [0.34, 0.665].forEach(function (fy) {
    const y = fy * h;
    g.strokeStyle = 'rgba(28,12,5,0.55)'; g.lineWidth = 2.6;
    g.beginPath();
    for (let x = 0; x <= w; x += 16) {
      const yy = y + Math.sin(x * 0.008) * 2.2;
      if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke();
    g.strokeStyle = 'rgba(255,206,158,0.12)'; g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= w; x += 16) {
      const yy = y + 3.0 + Math.sin(x * 0.008) * 2.2;
      if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke();
  });

  // 细碎划痕和棕眼
  for (let i = 0; i < 1500; i++) {
    const x = R() * w, y = R() * h;
    g.fillStyle = 'rgba(30,12,5,' + (0.04 + R() * 0.10) + ')';
    g.fillRect(x, y, 1 + R() * 3, 0.7);
  }
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = 'rgba(255,220,175,' + (0.03 + R() * 0.05) + ')';
    g.lineWidth = 0.7;
    const x = R() * w, y = R() * h, l = 20 + R() * 90;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (R() - 0.5) * 3); g.stroke();
  }
}, { repeat: [2.1, 1.75] });

/* ---- 轮子用的浅色木纹 ---- */
const texWheelWood = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(31);
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#c9925c');
  bg.addColorStop(0.45, '#d6a26a');
  bg.addColorStop(1, '#b97f4c');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 420; i++) {
    const y = R() * h;
    g.strokeStyle = R() > 0.3 ? 'rgba(82,45,22,' + (0.03 + R() * 0.09) + ')' : 'rgba(255,230,190,' + (0.02 + R() * 0.05) + ')';
    g.lineWidth = 0.4 + R() * 1.1;
    const amp = 1 + R() * 4, f = 0.006 + R() * 0.015, p = R() * TAU;
    g.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const yy = y + Math.sin(x * f + p) * amp;
      if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke();
  }
  for (let i = 0; i < 2; i++) {
    const cx = 80 + R() * 350, cy = 70 + R() * 370;
    for (let r = 0; r < 5; r++) {
      g.strokeStyle = 'rgba(90,48,22,' + (0.16 - r * 0.025) + ')';
      g.beginPath(); g.ellipse(cx, cy, 7 + r * 5, 3 + r * 2.4, 0, 0, TAU); g.stroke();
    }
  }
}, {});

/* ---- 深色木（支架 / 画框 / 窗框） ---- */
const texDarkWood = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(53);
  g.fillStyle = '#5c3a25'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 360; i++) {
    const y = R() * h;
    g.strokeStyle = R() > 0.3 ? 'rgba(24,11,5,' + (0.05 + R() * 0.12) + ')' : 'rgba(220,170,120,' + (0.02 + R() * 0.05) + ')';
    g.lineWidth = 0.5 + R() * 1.2;
    const amp = 1 + R() * 5, f = 0.007 + R() * 0.02, p = R() * TAU;
    g.beginPath();
    for (let x = 0; x <= w; x += 12) {
      const yy = y + Math.sin(x * f + p) * amp;
      if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke();
  }
}, {});

/* ---- 轮盘背面：年轮 ---- */
const texWheelDisc = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(91);
  g.fillStyle = '#7d5a42'; g.fillRect(0, 0, w, h);
  const cx = w * 0.5, cy = h * 0.5;
  for (let r = 8; r < 380; r += 5 + R() * 5) {
    g.strokeStyle = 'rgba(48,27,15,' + (0.06 + R() * 0.12) + ')';
    g.lineWidth = 0.8 + R() * 1.6;
    g.beginPath();
    g.arc(cx + (R() - 0.5) * 3, cy + (R() - 0.5) * 3, r, 0, TAU);
    g.stroke();
  }
  for (let i = 0; i < 220; i++) {
    const a = R() * TAU, r = R() * 380;
    g.strokeStyle = 'rgba(45,26,14,' + (0.03 + R() * 0.07) + ')';
    g.lineWidth = 0.6;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.lineTo(cx + Math.cos(a + 0.01) * (r + 30), cy + Math.sin(a + 0.01) * (r + 30));
    g.stroke();
  }
}, {});

/* ---- 墙面灰泥 ---- */
/* ---- 铁 / 钢：冷灰底、拉丝、划痕与油污 ---- */
const texIron = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(313);
  g.fillStyle = '#464c55'; g.fillRect(0, 0, w, h);

  // 大块冷灰明暗
  for (let i = 0; i < 18; i++) {
    const x = R() * w, y = R() * h, r = 60 + R() * 190;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, R() > 0.5 ? 'rgba(150,162,178,0.055)' : 'rgba(16,20,26,0.10)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // 拉丝
  for (let i = 0; i < 1100; i++) {
    const y = R() * h, x = R() * w, len = 5 + R() * 55;
    g.strokeStyle = R() > 0.45
      ? 'rgba(195,205,220,' + (0.015 + R() * 0.045) + ')'
      : 'rgba(10,14,20,' + (0.02 + R() * 0.05) + ')';
    g.lineWidth = 0.5 + R() * 0.7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + (R() - 0.5) * 1.2); g.stroke();
  }

  // 细划痕
  for (let i = 0; i < 26; i++) {
    const x = R() * w, y = R() * h, a = -0.9 + R() * 1.8, len = 10 + R() * 70;
    g.strokeStyle = 'rgba(185,198,214,' + (0.05 + R() * 0.10) + ')';
    g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }

  // 油污 / 氧化斑
  for (let i = 0; i < 14; i++) {
    const x = R() * w, y = R() * h, r = 8 + R() * 36;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(12,10,10,0.10)');
    gr.addColorStop(1, 'rgba(12,10,10,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}, { repeat: [1.6, 1.6] });

const texPlaster = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(17);
  g.fillStyle = '#b29c88'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 22; i++) {
    const x = R() * w, y = R() * h, r = 40 + R() * 180;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,235,210,' + (0.02 + R() * 0.05) + ')');
    gr.addColorStop(1, 'rgba(255,235,210,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 13000; i++) {
    const x = R() * w, y = R() * h;
    g.fillStyle = R() > 0.5 ? 'rgba(60,40,30,' + (0.02 + R() * 0.07) + ')' : 'rgba(255,245,225,' + (0.02 + R() * 0.06) + ')';
    g.fillRect(x, y, 1.1, 1.1);
  }
  for (let i = 0; i < 20; i++) {
    const x = R() * w, y = R() * h;
    g.strokeStyle = 'rgba(70,48,35,' + (0.03 + R() * 0.04) + ')';
    g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 5; k++) g.lineTo(x + (R() - 0.5) * 40, y + (R() - 0.5) * 40);
    g.stroke();
  }
}, { repeat: [2, 2] });

/* ---- 织物（窗帘、灯罩） ---- */
const texFabric = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(29);
  g.fillStyle = '#b5826a'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) {
    g.fillStyle = 'rgba(255,225,200,' + (0.012 + (y % 9 === 0 ? 0.02 : 0)) + ')';
    g.fillRect(0, y, w, 1);
  }
  for (let x = 0; x < w; x += 3) {
    g.fillStyle = 'rgba(55,25,15,' + (0.025 + (x % 7 === 0 ? 0.02 : 0)) + ')';
    g.fillRect(x, 0, 1, h);
  }
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = 'rgba(255,225,200,' + (0.02 + R() * 0.05) + ')';
    g.fillRect(R() * w, R() * h, 1 + R() * 2, 1);
  }
}, { repeat: [2, 3] });

/* ---- 纸张 ---- */
const texPaper = canvasTex(512, 512, (g, w, h) => {
  const R = makeRng(71);
  g.fillStyle = '#e8d6b8'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = 'rgba(130,100,65,' + (0.02 + R() * 0.05) + ')';
    g.fillRect(R() * w, R() * h, 1 + R() * 2, 1);
  }
  for (let i = 0; i < 120; i++) {
    g.strokeStyle = 'rgba(255,250,235,' + (0.04 + R() * 0.06) + ')';
    g.lineWidth = 0.6;
    const x = R() * w, y = R() * h;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + 25 + R() * 50, y + (R() - 0.5) * 4); g.stroke();
  }
}, {});

/* ---- 窗外黄昏 ---- */
const texSky = canvasTex(1024, 1024, (g, w, h) => {
  const R = makeRng(101);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0.00, '#202741');
  sky.addColorStop(0.22, '#353a5e');
  sky.addColorStop(0.40, '#5f4e70');
  sky.addColorStop(0.53, '#956273');
  sky.addColorStop(0.62, '#cf8873');
  sky.addColorStop(0.69, '#f0aa7f');
  sky.addColorStop(0.735, '#ffd0a0');
  sky.addColorStop(0.765, '#e59b76');
  sky.addColorStop(0.83, '#8b5963');
  sky.addColorStop(1.00, '#30222f');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);

  // 落日光晕
  const sx = w * 0.64, sy = h * 0.735;
  let sun = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.30);
  sun.addColorStop(0, 'rgba(255,246,214,0.95)');
  sun.addColorStop(0.10, 'rgba(255,226,170,0.72)');
  sun.addColorStop(0.34, 'rgba(255,184,126,0.22)');
  sun.addColorStop(1, 'rgba(255,160,110,0)');
  g.fillStyle = sun; g.fillRect(0, 0, w, h);

  // 云层
  g.save();
  g.filter = 'blur(16px)';
  for (let i = 0; i < 18; i++) {
    const y = h * (0.18 + R() * 0.43);
    const x = R() * w;
    const rw = 60 + R() * 260, rh = 6 + R() * 22;
    const warm = R() > 0.45;
    g.fillStyle = warm
      ? 'rgba(255,196,156,' + (0.05 + R() * 0.10) + ')'
      : 'rgba(120,110,160,' + (0.05 + R() * 0.10) + ')';
    g.beginPath(); g.ellipse(x, y, rw, rh, -0.03, 0, TAU); g.fill();
  }
  g.restore();

  // 月亮
  g.save();
  g.filter = 'blur(4px)';
  g.fillStyle = 'rgba(255,240,216,0.55)';
  g.beginPath(); g.arc(w * 0.235, h * 0.185, 17, 0, TAU); g.fill();
  g.restore();
  g.fillStyle = 'rgba(255,248,232,0.82)';
  g.beginPath(); g.arc(w * 0.235, h * 0.185, 13, 0, TAU); g.fill();
  g.fillStyle = 'rgba(80,66,92,0.9)';
  g.beginPath(); g.arc(w * 0.235 + 7, h * 0.185 - 4, 12.5, 0, TAU); g.fill();

  // 远山
  g.fillStyle = 'rgba(74,54,72,0.78)';
  g.beginPath();
  g.moveTo(0, h * 0.79);
  for (let x = 0; x <= w; x += 30) {
    const y = h * 0.79 - Math.sin(x * 0.007 + 1.2) * 14 - Math.sin(x * 0.021) * 5;
    g.lineTo(x, y);
  }
  g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();

  // 城市剪影
  g.fillStyle = 'rgba(43,32,44,0.92)';
  let bx = 0;
  while (bx < w) {
    const bw = 10 + R() * 38;
    const bh = 12 + R() * 62;
    const by = h * 0.805 - bh;
    g.fillRect(bx, by, bw, bh + h * 0.1);
    if (R() > 0.55) {
      g.fillStyle = 'rgba(255,205,146,0.75)';
      const nx = bx + 3 + R() * Math.max(1, bw - 7);
      g.fillRect(nx, by + 5 + R() * 10, 2, 2);
      g.fillStyle = 'rgba(43,32,44,0.92)';
    }
    bx += bw + 2 + R() * 10;
  }

  // 远处暖光散景
  g.save();
  g.filter = 'blur(9px)';
  for (let i = 0; i < 26; i++) {
    const x = R() * w, y = h * (0.72 + R() * 0.13), r = 2 + R() * 6;
    g.fillStyle = R() > 0.3 ? 'rgba(255,206,150,0.42)' : 'rgba(190,214,255,0.30)';
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();

  g.fillStyle = 'rgba(30,20,32,0.20)';
  g.fillRect(0, 0, w, h);
}, { clamp: true });

/* ---- 柔光 / 烟雾 / 阴影 ---- */
const texGlow = canvasTex(256, 256, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, 'rgba(255,246,228,1)');
  gr.addColorStop(0.18, 'rgba(255,226,180,0.65)');
  gr.addColorStop(0.5, 'rgba(255,190,130,0.16)');
  gr.addColorStop(1, 'rgba(255,170,110,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { clamp: true });

const texSmoke = canvasTex(256, 256, (g, w, h) => {
  const R = makeRng(211);
  g.clearRect(0, 0, w, h);
  const blobs = 32;
  for (let i = 0; i < blobs; i++) {
    const a = R() * TAU, d = Math.pow(R(), 0.6) * 70;
    const x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d * 1.15;
    const r = 14 + R() * 44;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,244,232,' + (0.05 + R() * 0.08) + ')');
    gr.addColorStop(1, 'rgba(255,244,232,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 边缘收束
  g.globalCompositeOperation = 'destination-in';
  const mask = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.47);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(0.62, 'rgba(0,0,0,0.85)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = mask; g.fillRect(0, 0, w, h);
}, { clamp: true });

const texShadow = canvasTex(256, 256, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, 'rgba(14,8,12,0.62)');
  gr.addColorStop(0.45, 'rgba(14,8,12,0.34)');
  gr.addColorStop(0.78, 'rgba(14,8,12,0.10)');
  gr.addColorStop(1, 'rgba(14,8,12,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { clamp: true, linear: true });

/* ---- 毛发表面（轻微凹凸） ---- */
const texFur = canvasTex(256, 256, (g, w, h) => {
  const R = makeRng(307);
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const x = R() * w, y = R() * h, l = 2 + R() * 7, a = -1.2 + R() * 0.5;
    g.strokeStyle = R() > 0.5 ? 'rgba(190,190,190,0.25)' : 'rgba(90,90,90,0.25)';
    g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
}, { linear: true, repeat: [3, 2] });
