
/* =========================================================================
   5. 场景：书桌、房间、窗、灯、桌面小物
   ========================================================================= */
texPlaster.repeat.set(0.45, 0.45);

/* ------------------------------- 书桌 ---------------------------------- */
const deskGroup = new THREE.Group();
scene.add(deskGroup);

const deskTop = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.9), MAT.desk);
deskTop.rotation.x = -PI / 2;
deskTop.position.set(0, 0, 0.55);
deskTop.receiveShadow = true;
deskGroup.add(deskTop);

const deskBody = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.2, 5.9), MAT.deskEdge);
deskBody.position.set(0, -0.101, 0.55);
deskBody.receiveShadow = true;
deskGroup.add(deskBody);

// 桌面靠近墙的一条暗部，增加纵深
const deskBackShade = new THREE.Mesh(
  new THREE.PlaneGeometry(6.8, 0.9),
  new THREE.MeshBasicMaterial({ color: 0x1a0f0c, transparent: true, opacity: 0.18, depthWrite: false })
);
deskBackShade.rotation.x = -PI / 2;
deskBackShade.position.set(0, 0.003, -1.28);
deskGroup.add(deskBackShade);

/* ------------------------------- 墙 ------------------------------------ */
const wallShape = new THREE.Shape();
wallShape.moveTo(-3.6, 0);
wallShape.lineTo(3.6, 0);
wallShape.lineTo(3.6, 2.8);
wallShape.lineTo(-3.6, 2.8);
wallShape.closePath();

const winHole = new THREE.Path();
winHole.moveTo(-1.42, 0.50);
winHole.lineTo(-1.42, 1.20);
winHole.absarc(-0.77, 1.20, 0.65, PI, 0, true);
winHole.lineTo(-0.12, 0.50);
winHole.closePath();
wallShape.holes.push(winHole);

const wall = new THREE.Mesh(
  new THREE.ExtrudeGeometry(wallShape, { depth: 0.14, bevelEnabled: false, steps: 1 }),
  MAT.plaster
);
wall.position.z = -1.78;
wall.castShadow = false;
wall.receiveShadow = true;
scene.add(wall);

// 墙脚线
const baseboard = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.10, 0.045), MAT.darkWood);
baseboard.position.set(0, 0.05, -1.62);
baseboard.receiveShadow = true;
baseboard.castShadow = true;
scene.add(baseboard);

/* ---------------------------- 窗外黄昏 --------------------------------- */
const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.65), MAT.sky);
skyPlane.position.set(-0.77, 1.22, -2.52);
skyPlane.layers.set(1);
scene.add(skyPlane);

// 窗外高处的一团暖霞，让拱窗上半部透出落日余温
softGlow(scene, -0.80, 1.56, -2.40, 1.25, 0.16, 0xffc9a0);

// 窗外散景
(function makeOutsideBokeh() {
  const R = makeRng(401);
  for (let i = 0; i < 18; i++) {
    const warm = R() > 0.35;
    const s = softGlow(
      scene,
      -1.36 + R() * 1.18,
      0.56 + R() * 1.20,
      -2.47 + R() * 0.20,
      0.035 + R() * 0.075,
      0.20 + R() * 0.30,
      warm ? 0xffc07a : 0xa9bce8
    );
    s.userData.phase = R() * TAU;
    s.userData.base = s.position.clone();
    ANIM.bokeh.push(s);
  }
})();

/* ---------------------------- 窗框 / 窗台 ------------------------------ */
const winFrame = new THREE.Group();
scene.add(winFrame);

function boxMesh(parent, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// 拱形窗框
const archFrame = new THREE.Mesh(
  new THREE.TorusGeometry(0.65, 0.038, 8, 56, PI),
  MAT.darkWood
);
archFrame.position.set(-0.77, 1.20, -1.615);
archFrame.castShadow = true;
archFrame.receiveShadow = true;
winFrame.add(archFrame);

boxMesh(winFrame, 0.078, 0.72, 0.11, MAT.darkWood, -1.42, 0.86, -1.615);
boxMesh(winFrame, 0.078, 0.72, 0.11, MAT.darkWood, -0.12, 0.86, -1.615);
boxMesh(winFrame, 1.34, 0.030, 0.038, MAT.darkWoodPlain, -0.77, 1.02, -1.60);
boxMesh(winFrame, 0.030, 0.68, 0.038, MAT.darkWoodPlain, -0.77, 0.88, -1.60);

// 窗台
const sill = boxMesh(winFrame, 1.72, 0.06, 0.27, MAT.darkWood, -0.77, 0.485, -1.58);
sill.castShadow = true;
boxMesh(winFrame, 0.10, 0.10, 0.18, MAT.darkWood, -1.50, 0.44, -1.60);
boxMesh(winFrame, 0.10, 0.10, 0.18, MAT.darkWood, -0.04, 0.44, -1.60);

// 黄铜窗插销
const latch = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.055, 8), MAT.brass);
latch.rotation.z = PI / 2;
latch.position.set(-0.55, 0.90, -1.605);
winFrame.add(latch);

/* ---------------------------- 窗帘 ------------------------------------- */
const curtainRod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.35, 10), MAT.brass);
curtainRod.rotation.z = PI / 2;
curtainRod.position.set(-0.78, 2.04, -1.57);
curtainRod.castShadow = true;
scene.add(curtainRod);
[-1.96, 0.40].forEach(function (x) {
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), MAT.brass);
  finial.position.set(x, 2.04, -1.57);
  scene.add(finial);
});

function makeCurtain(x, z, width, height, phase) {
  const geo = new THREE.PlaneGeometry(width, height, 24, 30);
  const pos = geo.attributes.position;
  const base = new Float32Array(pos.array.length);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const ty = (py + height / 2) / height;
    const fold = Math.sin((px / width) * PI * 6.0 + phase) * 0.032 * (0.75 + 0.25 * ty);
    pos.setZ(i, fold);
    base[i * 3 + 0] = px;
    base[i * 3 + 1] = py;
    base[i * 3 + 2] = fold;
  }
  geo.computeVertexNormals();
  const mat = MAT.curtain.clone();
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 1.25, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  ANIM.curtain.push({ mesh: m, base: base, phase: phase, width: width, height: height });
  return m;
}
makeCurtain(-1.63, -1.56, 0.43, 1.53, 0.4);
makeCurtain(0.03, -1.56, 0.43, 1.53, 2.1);

// 窗帘环
for (let i = 0; i < 6; i++) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.005, 6, 14), MAT.brassDark);
  ring.position.set(-1.78 + i * 0.07, 2.02, -1.565);
  ring.rotation.y = PI / 2;
  scene.add(ring);
}

/* ---------------------------- 灯串 ------------------------------------- */
(function makeFairyLights() {
  const pts = [
    new THREE.Vector3(-1.95, 2.03, -1.62),
    new THREE.Vector3(-1.40, 1.90, -1.62),
    new THREE.Vector3(-0.75, 1.78, -1.62),
    new THREE.Vector3(-0.10, 1.86, -1.62),
    new THREE.Vector3(0.55, 1.73, -1.62),
    new THREE.Vector3(1.25, 1.84, -1.62),
    new THREE.Vector3(1.88, 1.72, -1.62),
    new THREE.Vector3(2.35, 1.62, -1.62)
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.0028, 5, false), MAT.ink);
  wire.layers.set(1);
  scene.add(wire);

  const n = 19;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const p = curve.getPoint(t);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 10, 8), MAT.bulb.clone());
    bulb.position.copy(p).add(new THREE.Vector3(0, -0.017, 0));
    bulb.layers.set(1);
    scene.add(bulb);

    const glow = softGlow(scene, bulb.position.x, bulb.position.y - 0.008, bulb.position.z + 0.008,
      0.115 + (i % 3) * 0.012, 0.34, 0xffbf7a);
    glow.userData.base = glow.scale.clone();
    ANIM.bulbs.push({ bulb: bulb, glow: glow, phase: i * 1.73 });
  }
})();

/* ---------------------------- 墙面小搁板 -------------------------------- */
(function makeShelf() {
  const g = new THREE.Group();
  g.position.set(1.72, 1.30, -1.60);
  scene.add(g);
  ANIM.shelf = g;

  const shelf = new THREE.Mesh(slabGeo(0.80, 0.21, 0.035, 0.02, 0.004), MAT.darkWood);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  g.add(shelf);

  // 支架
  [-0.28, 0.28].forEach(function (x) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.13, 0.18), MAT.darkWoodPlain);
    br.position.set(x, -0.075, -0.01);
    br.rotation.x = -0.6;
    br.castShadow = true;
    g.add(br);
  });

  // 小陶瓶
  const vase = new THREE.Mesh(latheGeo([[0, 0], [0.045, 0.004], [0.055, 0.035], [0.038, 0.095], [0.030, 0.125], [0.036, 0.135], [0.032, 0.137]], 32), MAT.ceramic);
  vase.position.set(-0.19, 0.035, 0.0);
  vase.castShadow = true;
  g.add(vase);

  const stemA = new THREE.Mesh(tubeGeo([
    new THREE.Vector3(-0.19, 0.16, 0), new THREE.Vector3(-0.21, 0.28, 0.01),
    new THREE.Vector3(-0.18, 0.40, 0.0)
  ], 0.0024, 18, 4), MAT.stem);
  stemA.castShadow = false;
  g.add(stemA);
  const stemB = stemA.clone();
  stemB.geometry = tubeGeo([
    new THREE.Vector3(-0.19, 0.16, 0), new THREE.Vector3(-0.14, 0.27, -0.01),
    new THREE.Vector3(-0.10, 0.36, 0.01)
  ], 0.0022, 18, 4);
  g.add(stemB);
  [[-0.18, 0.405, 0.0], [-0.10, 0.365, 0.01]].forEach(function (p) {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), toon(0xc9a27a));
    head.scale.set(1, 0.72, 0.9);
    head.position.set(p[0], p[1], p[2]);
    head.castShadow = true;
    g.add(head);
  });

  // 玻璃蜡烛罐
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.052, 0.125, 20, 1, true), MAT.glass);
  jar.position.set(0.22, 0.095, 0.0);
  jar.layers.set(1);
  g.add(jar);
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.07, 18), MAT.candleWax);
  wax.position.set(0.22, 0.070, 0.0);
  wax.castShadow = true;
  g.add(wax);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), MAT.flame);
  flame.scale.set(0.65, 1.9, 0.65);
  flame.position.set(0.22, 0.122, 0.0);
  flame.layers.set(1);
  g.add(flame);
  const fg = softGlow(g, 0.22, 0.13, 0.02, 0.16, 0.45, 0xffb466);
  fg.userData.base = fg.scale.clone();
  ANIM.flame = { flame: flame, glow: fg };

  const candleLight = new THREE.PointLight(0xffa858, 0.34, 1.3, 2);
  candleLight.position.set(1.94, 1.45, -1.38);
  scene.add(candleLight);
  ANIM.candleLight = candleLight;
})();

/* ---------------------------- 台灯 ------------------------------------- */
(function makeLamp() {
  const g = new THREE.Group();
  scene.add(g);

  /* 更稳的圆盘底座：黄铜外壳、深色底缘和一层薄毡垫。 */
  const base = new THREE.Mesh(latheGeo([
    [0, 0.000], [0.108, 0.002], [0.132, 0.009], [0.136, 0.022],
    [0.124, 0.034], [0.083, 0.046], [0.046, 0.058],
    [0.030, 0.070], [0.028, 0.092], [0, 0.092]
  ], 48), MAT.brass);
  base.position.set(-1.68, 0, -0.02);
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const felt = new THREE.Mesh(new THREE.CylinderGeometry(0.134, 0.138, 0.007, 40), MAT.darkWoodPlain);
  felt.position.set(-1.68, 0.0035, -0.02);
  felt.receiveShadow = true;
  g.add(felt);

  /* 细金属灯杆，保留一个自然弯折；顶端用黄铜关节接灯罩。 */
  const stem = new THREE.Mesh(tubeGeo([
    new THREE.Vector3(-1.68, 0.082, -0.02),
    new THREE.Vector3(-1.705, 0.28, -0.015),
    new THREE.Vector3(-1.68, 0.53, -0.005),
    new THREE.Vector3(-1.59, 0.78, 0.005),
    new THREE.Vector3(-1.50, 0.955, 0.012)
  ], 0.015, 64, 10), MAT.brass);
  stem.castShadow = true;
  g.add(stem);

  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.024, 18, 12), MAT.champagneDark);
  joint.position.set(-1.50, 0.955, 0.012);
  joint.castShadow = true;
  g.add(joint);

  const shadeGroup = new THREE.Group();
  shadeGroup.position.set(-1.48, 1.025, 0.015);
  shadeGroup.rotation.z = 0.28;
  g.add(shadeGroup);

  /* 开放式锥形灯罩：外层是暖象牙色，内层单独用暖光背板，底部留开口。 */
  const shadeProfile = [
    [0.058, 0.205], [0.075, 0.196], [0.103, 0.160],
    [0.138, 0.100], [0.171, 0.034], [0.190, 0.000]
  ];
  const shadeGeo = latheGeo(shadeProfile, 64);
  const shadeOuterMat = new THREE.MeshPhongMaterial({
    color: 0xf1ddba,
    specular: 0xfff2d4,
    shininess: 24,
    emissive: 0x2a1708,
    emissiveIntensity: 0.18,
    transparent: false,
    side: THREE.FrontSide
  });
  const shade = new THREE.Mesh(shadeGeo, shadeOuterMat);
  shade.castShadow = true;
  shade.receiveShadow = false;
  shadeGroup.add(shade);

  const shadeInnerMat = new THREE.MeshBasicMaterial({
    color: hdr(1.55, 0.92, 0.48),
    side: THREE.BackSide,
    toneMapped: true
  });
  const shadeInner = new THREE.Mesh(shadeGeo, shadeInnerMat);
  shadeInner.scale.set(0.968, 0.968, 0.968);
  shadeInner.renderOrder = 2;
  shadeGroup.add(shadeInner);

  const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.0034, 8, 48), MAT.champagneDark);
  topRing.rotation.x = PI / 2;
  topRing.position.set(0, 0.204, 0);
  topRing.castShadow = true;
  shadeGroup.add(topRing);

  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.190, 0.0042, 8, 64), MAT.champagneDark);
  brim.rotation.x = PI / 2;
  brim.position.set(0, 0.001, 0);
  brim.castShadow = true;
  shadeGroup.add(brim);

  const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.036, 0.055, 20), MAT.brassDark);
  socket.position.set(0, 0.166, 0);
  socket.castShadow = true;
  socket.visible = false;
  shadeGroup.add(socket);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 18, 14),
    new THREE.MeshBasicMaterial({ color: hdr(2.15, 1.30, 0.62), toneMapped: false })
  );
  bulb.position.set(0, 0.093, 0);
  bulb.layers.set(1);
  shadeGroup.add(bulb);

  const bulbGlow = softGlow(shadeGroup, 0, 0.072, 0.012, 0.30, 0.30, 0xffb46a);
  bulbGlow.userData.base = bulbGlow.scale.clone();
  ANIM.bulbGlow = bulbGlow;

  const underGlow = softGlow(shadeGroup, 0, -0.010, 0.010, 0.23, 0.20, 0xffb46a);
  underGlow.userData.base = underGlow.scale.clone();

  /* 主光仍指向跑轮；另加一个很轻的向下光，给灯下桌面真实的暖色落点。 */
  const spot = new THREE.SpotLight(0xffd6a8, 1.45, 5.6, 0.90, 0.82, 1.35);
  spot.position.set(-1.44, 0.98, 0.48);
  spot.target.position.set(0.36, 0.48, 0.10);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.camera.near = 0.3;
  spot.shadow.camera.far = 6;
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.018;
  scene.add(spot);
  scene.add(spot.target);

  const point = new THREE.PointLight(0xffb267, 0.34, 2.6, 2);
  point.position.set(-1.44, 0.94, 0.02);
  scene.add(point);

  const floorSpot = new THREE.SpotLight(0xffb877, 0.52, 2.3, 0.68, 1.0, 1.5);
  floorSpot.position.set(-1.56, 0.92, 0.015);
  floorSpot.target.position.set(-1.58, 0.0, 0.08);
  floorSpot.castShadow = false;
  scene.add(floorSpot);
  scene.add(floorSpot.target);

  ANIM.lamp = {
    spot: spot,
    point: point,
    floor: floorSpot,
    glow: bulbGlow,
    underGlow: underGlow,
    baseIntensity: 1.45,
    basePoint: 0.34
  };
  softGlow(g, -1.50, 1.00, 0.03, 0.30, 0.08, 0xffb877);
  contactShadow(scene, 0.36, 0.36, 0.28, -1.68, -0.02, 0.0045);
})();

/* ---------------------------- 基础光照 ---------------------------------- */

const hemi = new THREE.HemisphereLight(0x8fa2cc, 0x452c22, 0.34);
scene.add(hemi);

const windowFill = new THREE.DirectionalLight(0x91a7d8, 0.78);
windowFill.position.set(-1.6, 1.8, -1.2);
windowFill.target.position.set(0.3, 0.5, 0.2);
scene.add(windowFill);
scene.add(windowFill.target);

const rim = new THREE.PointLight(0xffb27a, 0.45, 3.4, 2);
rim.position.set(1.55, 1.18, 0.35);
scene.add(rim);

// 从窗口进来的冷色补光，和暖色主光形成冷暖对比
const coolFill = new THREE.DirectionalLight(0x9fb3de, 0.28);
coolFill.position.set(-1.4, 1.5, 1.8);
coolFill.target.position.set(0.2, 0.7, -0.4);
scene.add(coolFill);
scene.add(coolFill.target);

// 冷色轮廓光：从窗边擦过轮子边缘
const coolRim = new THREE.SpotLight(0xa8c2f0, 0.50, 4.5, 0.55, 0.9, 1.4);
coolRim.position.set(-1.35, 1.35, -0.85);
coolRim.target.position.set(0.28, 0.72, 0.05);
scene.add(coolRim);
scene.add(coolRim.target);

// 极轻的室内反射光，避免暗部完全死黑
const roomBounce = new THREE.PointLight(0xb9aec4, 0.14, 5.0, 2);
roomBounce.position.set(0.4, 1.55, 1.5);
scene.add(roomBounce);

// 极轻的墙面洗光，让墙面保留灰泥质感
const wallWash = new THREE.PointLight(0xb6b8d8, 0.30, 4.2, 2);
wallWash.position.set(-0.15, 1.45, 0.75);
scene.add(wallWash);

const ambient = new THREE.AmbientLight(0x4a4658, 0.16);
scene.add(ambient);

/* ---------------------------- 桌面植物 ---------------------------------- */
function makeLeafGeometry(len, wid, seed) {
  const R = makeRng(seed);
  const seg = 14, side = 4;
  const pos = [], col = [], idx = [], uv = [];
  const cCenter = new THREE.Color(0x8fa86a);
  const cEdge = new THREE.Color(0x557043);
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const w = Math.pow(Math.sin(t * PI), 0.72) * wid;
    for (let j = 0; j <= side * 2; j++) {
      const s = (j - side) / side;
      const x = s * w;
      const y = t * len;
      const z = -Math.pow(s, 2) * 0.30 * w + Math.sin(t * PI) * 0.008;
      pos.push(x, y, z);
      uv.push((s + 1) / 2, t);
      const mix = Math.min(1, Math.abs(s) * 1.1 + (R() - 0.5) * 0.08);
      const c = cCenter.clone().lerp(cEdge, mix * 0.9);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < side * 2; j++) {
      const a = i * (side * 2 + 1) + j;
      const b = a + 1;
      const c = a + (side * 2 + 1);
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

(function makePlant() {
  const g = new THREE.Group();
  g.position.set(-1.24, 0, 0.48);
  scene.add(g);
  ANIM.plant = g;

  const pot = new THREE.Mesh(latheGeo([
    [0, 0], [0.070, 0.002], [0.082, 0.02], [0.105, 0.125], [0.116, 0.155],
    [0.126, 0.166], [0.121, 0.176], [0.110, 0.168], [0.098, 0.145], [0, 0.145]
  ], 36), MAT.terracotta);
  pot.castShadow = true;
  pot.receiveShadow = true;
  g.add(pot);

  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.100, 24), MAT.soil);
  soil.rotation.x = -PI / 2;
  soil.position.y = 0.152;
  soil.receiveShadow = true;
  g.add(soil);

  const leafGeoA = makeLeafGeometry(0.20, 0.065, 11);
  const leafGeoB = makeLeafGeometry(0.16, 0.058, 17);
  const R = makeRng(23);
  const stems = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + R() * 0.4;
    const r = 0.03 + R() * 0.055;
    const h = 0.20 + R() * 0.19;
    const p1 = new THREE.Vector3(Math.cos(a) * r * 0.5, 0.15, Math.sin(a) * r * 0.5);
    const p2 = new THREE.Vector3(Math.cos(a) * r, 0.15 + h * 0.55, Math.sin(a) * r);
    const p3 = new THREE.Vector3(Math.cos(a) * r * 1.45, 0.15 + h, Math.sin(a) * r * 1.45);
    const stem = new THREE.Mesh(tubeGeo([p1, p2, p3], 0.0035, 16, 5), MAT.stem);
    stem.castShadow = true;
    g.add(stem);
    stems.push({ a: a, r: r, h: h, p3: p3 });

    const leafGroup = new THREE.Group();
    leafGroup.position.copy(p3);
    leafGroup.rotation.y = -a + PI / 2;
    leafGroup.rotation.z = -0.65 + R() * 0.35;
    leafGroup.rotation.x = (R() - 0.5) * 0.25;
    const leaf = new THREE.Mesh(i % 2 ? leafGeoB : leafGeoA, i % 2 ? MAT.leafB : MAT.leafA);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    leafGroup.add(leaf);
    g.add(leafGroup);
    ANIM.leaves.push({ group: leafGroup, baseZ: leafGroup.rotation.z, phase: R() * TAU, sway: 0.025 + R() * 0.03 });
  }

  // 两片垂下来的叶子
  for (let i = 0; i < 2; i++) {
    const a = -0.5 + i * 0.6;
    const leafGroup = new THREE.Group();
    leafGroup.position.set(Math.cos(a) * 0.17, 0.34, Math.sin(a) * 0.17);
    leafGroup.rotation.y = -a;
    leafGroup.rotation.z = -2.1 - i * 0.25;
    const leaf = new THREE.Mesh(leafGeoB, MAT.leafA);
    leaf.castShadow = true;
    leafGroup.add(leaf);
    g.add(leafGroup);
    ANIM.leaves.push({ group: leafGroup, baseZ: leafGroup.rotation.z, phase: 1.7 + i, sway: 0.02 });
  }

  contactShadow(scene, 0.42, 0.40, 0.42, -1.24, 0.48, 0.0045);
})();

/* ---------------------------- 书堆 ------------------------------------- */
function makeBook(w, d, th, coverColor, pageColor, spineColor) {
  const g = new THREE.Group();
  const coverMat = toon(coverColor);
  const pageMat = toon(pageColor);
  const spineMat = toon(spineColor || coverColor);

  const bottom = new THREE.Mesh(slabGeo(w, d, 0.012, 0.012, 0.003), coverMat);
  bottom.position.y = 0;
  g.add(bottom);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, th, d * 0.94), pageMat);
  pages.position.y = 0.012 + th / 2;
  pages.castShadow = true;
  pages.receiveShadow = true;
  g.add(pages);
  const top = new THREE.Mesh(slabGeo(w, d, 0.012, 0.012, 0.003), coverMat);
  top.position.y = 0.012 + th;
  g.add(top);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.018, th + 0.024, d * 0.98), spineMat);
  spine.position.set(-w / 2 + 0.006, 0.012 + th / 2, 0);
  spine.castShadow = true;
  g.add(spine);

  g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

(function makeBooks() {
  const b1 = makeBook(0.34, 0.26, 0.035, 0x8f5a46, 0xe7d6b8, 0x6d4031);
  b1.position.set(-1.08, 0, -0.46);
  b1.rotation.y = 0.18;
  scene.add(b1);

  const b2 = makeBook(0.30, 0.23, 0.030, 0x46686a, 0xe9d9bd, 0x355255);
  b2.position.set(-1.05, 0.059, -0.45);
  b2.rotation.y = -0.09;
  scene.add(b2);

  const b3 = makeBook(0.24, 0.19, 0.022, 0xc4a26a, 0xefe0c4, 0xa17b43);
  b3.position.set(-1.10, 0.113, -0.47);
  b3.rotation.y = 0.32;
  scene.add(b3);

  // 书签丝带
  const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.13), toon(0xa8453c, { side: THREE.DoubleSide }));
  ribbon.position.set(-0.94, 0.10, -0.33);
  ribbon.rotation.x = -PI / 2;
  ribbon.rotation.z = 0.2;
  ribbon.position.y = 0.087;
  ribbon.castShadow = false;
  scene.add(ribbon);

  contactShadow(scene, 0.62, 0.48, 0.46, -1.07, -0.45, 0.0045);
  ANIM.books = [b1, b2, b3];
})();

/* ---------------------------- 马克杯 ----------------------------------- */
(function makeMug() {
  const g = new THREE.Group();
  g.position.set(1.42, 0, 0.58);
  scene.add(g);
  ANIM.mug = g;

  const cup = new THREE.Mesh(latheGeo([
    [0, 0.008], [0.064, 0.008], [0.082, 0.018], [0.092, 0.055],
    [0.098, 0.115], [0.097, 0.142], [0.091, 0.150], [0.084, 0.146],
    [0.081, 0.115], [0.075, 0.035], [0, 0.026]
  ], 40), MAT.ceramic);
  cup.castShadow = true;
  cup.receiveShadow = true;
  g.add(cup);

  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.079, 36), MAT.coffee);
  coffee.rotation.x = -PI / 2;
  coffee.position.y = 0.132;
  g.add(coffee);
  const coffeeSheen = softGlow(g, -0.02, 0.136, 0.01, 0.18, 0.12, 0xffd7a8);
  coffeeSheen.material.blending = THREE.AdditiveBlending;

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 8, 26, PI * 1.35), MAT.ceramic);
  handle.position.set(0.096, 0.085, 0);
  handle.rotation.z = -0.55;
  handle.castShadow = true;
  g.add(handle);

  const coaster = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.14, 0.012, 32), MAT.cork);
  coaster.position.y = 0.006;
  coaster.receiveShadow = true;
  coaster.castShadow = true;
  g.add(coaster);

  // 热气
  for (let i = 0; i < 8; i++) {
    const mat = MAT.steam.clone();
    mat.opacity = 0.0;
    const sp = new THREE.Sprite(mat);
    sp.position.set(0.01 + (i % 3) * 0.012 - 0.012, 0.17 + i * 0.055, 0.005);
    sp.scale.set(0.16, 0.16, 1);
    sp.layers.set(1);
    g.add(sp);
    ANIM.steam.push({ sprite: sp, phase: i / 8, x0: sp.position.x, z0: sp.position.z });
  }

  contactShadow(scene, 0.40, 0.38, 0.50, 1.42, 0.58, 0.0045);
})();

/* ---------------------------- 小食盆 ----------------------------------- */
(function makeBowl() {
  const g = new THREE.Group();
  g.position.set(1.24, 0, 0.38);
  scene.add(g);
  ANIM.bowl = g;

  const bowl = new THREE.Mesh(latheGeo([
    [0, 0], [0.055, 0.002], [0.078, 0.012], [0.092, 0.038],
    [0.101, 0.055], [0.095, 0.062], [0.084, 0.050], [0.070, 0.030], [0, 0.024]
  ], 32), toon(0xc9b08c));
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  g.add(bowl);

  const R = makeRng(311);
  for (let i = 0; i < 9; i++) {
    const a = R() * TAU, r = R() * 0.05;
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 6), i % 3 ? MAT.seed : MAT.seedDark);
    seed.scale.set(1.0, 0.55, 1.55);
    seed.position.set(Math.cos(a) * r, 0.035 + R() * 0.008, Math.sin(a) * r);
    seed.rotation.y = R() * TAU;
    seed.castShadow = false;
    g.add(seed);
  }

  // 散落瓜子
  for (let i = 0; i < 14; i++) {
    const a = R() * TAU, r = 0.13 + R() * 0.24;
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.009, 7, 5), i % 2 ? MAT.seed : MAT.seedDark);
    seed.scale.set(1.0, 0.45, 1.5);
    seed.position.set(Math.cos(a) * r, 0.005, Math.sin(a) * r - 0.02);
    seed.rotation.y = R() * TAU;
    seed.castShadow = false;
    g.add(seed);
  }

  contactShadow(scene, 0.26, 0.25, 0.42, 1.24, 0.38, 0.0045);
})();

/* ---------------------------- 桌面尘埃 --------------------------------- */
(function makeDust() {
  const N = 300;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const data = [];
  const R = makeRng(503);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (i < N * 0.55) {
      // 台灯光锥附近的尘埃
      x = -1.25 + R() * 2.0;
      y = 0.20 + R() * 1.10;
      z = -0.55 + R() * 1.30;
    } else {
      x = -1.7 + R() * 3.7;
      y = 0.15 + R() * 1.45;
      z = -1.5 + R() * 2.1;
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    data.push({ x: x, y: y, z: z, sp: 0.008 + R() * 0.028, ph: R() * TAU, sw: 0.02 + R() * 0.06 });
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: texGlow, color: 0xffd8ab, size: 0.0075, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    fog: false
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.layers.set(1);
  scene.add(points);
  ANIM.dust = { points: points, data: data };
})();

/* ---------------------------- 桌面暖色光斑 ------------------------------ */
(function makeTableSheen() {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.0),
    new THREE.MeshBasicMaterial({
      map: texGlow, color: 0xffb877, transparent: true, opacity: 0.10,
      depthWrite: false, blending: THREE.AdditiveBlending
    })
  );
  m.rotation.x = -PI / 2;
  m.position.set(-0.55, 0.006, 0.05);
  m.renderOrder = 4;
  scene.add(m);
})();
