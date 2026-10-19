
/* =========================================================================
   4. 材质 / 几何工具
   ========================================================================= */

/* 四阶卡通渐变 */
const toonGradient = (function () {
  const data = new Uint8Array(4 * 4);
  const vals = [0.30, 0.612, 0.855, 1.0];
  for (let i = 0; i < 4; i++) {
    data[i * 4 + 0] = Math.round(vals[i] * 255);
    data[i * 4 + 1] = Math.round(vals[i] * 255);
    data[i * 4 + 2] = Math.round(vals[i] * 255);
    data[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
})();

function toon(color, opts) {
  const o = Object.assign({ color: color, gradientMap: toonGradient }, opts || {});
  return new THREE.MeshToonMaterial(o);
}

function hdr(r, g, b) {
  const c = new THREE.Color();
  c.setRGB(r, g, b);
  return c;
}

const MAT = {
  desk: toon(0xffffff, { map: texDeskWood, bumpMap: texDeskWood, bumpScale: 0.012 }),
  deskEdge: toon(0x6a3e24),
  wheelWood: toon(0xf0e8de, { map: texWheelWood, bumpMap: texWheelWood, bumpScale: 0.006 }),
  wheelWoodAlt: toon(0xe0b07a, { map: texWheelWood }),
  wheelDisc: toon(0xffffff, { map: texWheelDisc }),
  darkWood: toon(0xffffff, { map: texDarkWood }),
  darkWoodPlain: toon(0x4c2f1d),
  brass: toon(0xd5a35c, { emissive: new THREE.Color(0x241304), emissiveIntensity: 0.30 }),
  brassDark: toon(0x9b6f36),
  iron: toon(0x453a39),
  ironMetal: new THREE.MeshPhongMaterial({
    color: 0xd0d8e4, map: texIron, bumpMap: texIron, bumpScale: 0.0022,
    specular: 0x9fadc2, shininess: 52
  }),
  ironDark: new THREE.MeshPhongMaterial({
    color: 0x8a929e, map: texIron, bumpMap: texIron, bumpScale: 0.0016,
    specular: 0x6a7488, shininess: 30
  }),
  dialIron: new THREE.MeshPhongMaterial({
    color: 0x747c88, map: texIron, bumpMap: texIron, bumpScale: 0.0014,
    specular: 0x7c879c, shininess: 38
  }),
  steel: new THREE.MeshPhongMaterial({
    color: 0xdce2ec, specular: 0xffffff, shininess: 110
  }),
  brassMetal: new THREE.MeshPhongMaterial({
    color: 0xc99a55, map: texIron, bumpMap: texIron, bumpScale: 0.0012,
    specular: 0xffe4b0, shininess: 92
  }),
  ruby: new THREE.MeshPhongMaterial({
    color: 0x8e1f2e, emissive: 0x2a0008, specular: 0xff9aaa, shininess: 120
  }),
  plaster: toon(0xd8cec4, { map: texPlaster }),
  fabric: toon(0xffffff, { map: texFabric, side: THREE.DoubleSide }),
  curtain: toon(0xe0c8b8, { map: texFabric, side: THREE.DoubleSide }),
  paper: toon(0xffffff, { map: texPaper, side: THREE.DoubleSide }),
  ceramic: toon(0xecd7b5),
  ceramicShade: toon(0xb28d69),
  terracotta: toon(0xb56b49),
  soil: toon(0x3d2a1f),
  leafA: toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide }),
  leafB: toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide }),
  stem: toon(0x4e6b3f),
  cork: toon(0xa97c4e),
  seed: toon(0xc59a5d),
  seedDark: toon(0x6f4a2c),
  butter: toon(0xe0b96f),
  coffee: toon(0x3a2015),
  ink: toon(0x2a1c1d),
  glass: new THREE.MeshBasicMaterial({ color: 0xa9c0cf, transparent: true, opacity: 0.13, depthWrite: false }),
  glassClear: new THREE.MeshPhongMaterial({
    color: 0xcfe8f2, transparent: true, opacity: 0.07, shininess: 160,
    specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false
  }),
  glassFace: new THREE.MeshBasicMaterial({
    color: 0xd8eff8, transparent: true, opacity: 0.10,
    side: THREE.DoubleSide, depthWrite: false
  }),
  glassEdge: new THREE.MeshBasicMaterial({
    color: hdr(0.72, 1.00, 1.16), transparent: true, opacity: 0.30,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }),
  glassEdgeSoft: new THREE.MeshBasicMaterial({
    color: 0xcfe8f2, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }),
  glassWarm: new THREE.MeshBasicMaterial({
    color: hdr(1.55, 1.02, 0.52), transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }),
  glassSheen: new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.07,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }),
  glassRunway: new THREE.MeshBasicMaterial({
    color: 0xdff4ff, transparent: true, opacity: 0.035,
    depthWrite: false, side: THREE.DoubleSide
  }),
  frontGlass: new THREE.MeshPhongMaterial({
    color: 0xe8f7ff, transparent: true, opacity: 0.028, shininess: 180,
    specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false
  }),
  backlight: new THREE.MeshBasicMaterial({
    color: hdr(1.58, 1.22, 0.84), transparent: true, opacity: 0.20,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }),
  champagne: new THREE.MeshPhongMaterial({
    color: 0xd9c39b, specular: 0xfff4dc, shininess: 110
  }),
  champagneDark: new THREE.MeshPhongMaterial({
    color: 0xa88c63, specular: 0xf4dfb8, shininess: 70
  }),
  lightStrip: new THREE.MeshBasicMaterial({
    color: hdr(1.85, 1.40, 0.92), transparent: true, opacity: 0.20,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }),
  candleWax: toon(0xe7cf9f),
  flame: new THREE.MeshBasicMaterial({ color: hdr(2.6, 1.3, 0.38) }),
  bulb: new THREE.MeshBasicMaterial({ color: hdr(2.3, 1.3, 0.55) }),
  shadeInner: new THREE.MeshBasicMaterial({ color: hdr(0.72, 0.36, 0.14), side: THREE.BackSide }),
  sky: new THREE.MeshBasicMaterial({ map: texSky, fog: false }),
  steam: new THREE.SpriteMaterial({
    map: texSmoke, color: 0xffe2c2, transparent: true, opacity: 0.0,
    depthWrite: false, blending: THREE.NormalBlending
  }),
  glowWarm: new THREE.SpriteMaterial({
    map: texGlow, color: 0xffc887, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending
  }),
  shadow: new THREE.MeshBasicMaterial({
    map: texShadow, color: 0x0d080b, transparent: true, opacity: 1,
    depthWrite: false
  })
};

/* ------------------------------ 几何工具 -------------------------------- */
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, Math.min(w, h) / 2 - 0.0001);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* 圆角板：宽 w(x) 深 d(z) 厚 h(y) */
function slabGeo(w, d, h, r, bevel) {
  const shape = roundedRectShape(w, d, r === undefined ? 0.03 : r);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: (bevel || 0) > 0,
    bevelThickness: bevel || 0,
    bevelSize: bevel || 0,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1
  });
  geo.rotateX(-PI / 2);
  geo.translate(0, h, 0);
  geo.computeVertexNormals();
  return geo;
}

function addMesh(parent, geo, mat, x, y, z, cast, receive) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  m.castShadow = cast !== false;
  m.receiveShadow = receive !== false;
  parent.add(m);
  return m;
}

function contactShadow(parent, w, d, opacity, x, z, y, rot) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), MAT.shadow.clone());
  m.material.opacity = opacity;
  m.rotation.x = -PI / 2;
  if (rot) m.rotation.z = rot;
  m.position.set(x, y === undefined ? 0.004 : y, z);
  m.renderOrder = 2;
  m.castShadow = false;
  m.receiveShadow = false;
  parent.add(m);
  return m;
}

function tubeGeo(points, radius, seg, radialSeg) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, seg || 64, radius, radialSeg || 8, false);
}

function latheGeo(profile, seg) {
  return new THREE.LatheGeometry(profile.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 40);
}

function setLayer1(obj) {
  obj.traverse(function (o) { o.layers.set(1); });
}

function softGlow(parent, x, y, z, size, opacity, color, layer) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texGlow,
    color: color === undefined ? 0xffc98a : color,
    transparent: true,
    opacity: opacity === undefined ? 0.5 : opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  }));
  s.position.set(x, y, z);
  s.scale.set(size, size, 1);
  parent.add(s);
  if (layer !== false) s.layers.set(1);
  return s;
}

/* 动画引用表 */
const ANIM = {
  wheelSpin: null,
  wheelSpeed: 0,
  hamster: null,
  steam: [],
  dust: null,
  curtain: [],
  leaves: [],
  bulbs: [],
  rimBulbs: [],
  bokeh: [],
  lamp: null,
  flame: null,
  hamShadow: null,
  clock: 0
};
