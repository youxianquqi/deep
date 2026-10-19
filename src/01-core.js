/* =========================================================================
   暖光玻璃钟轮 · Golden Hour Glass Wheel
   A cinematic toon-shaded desktop wallpaper, built with Three.js r149.
   No external assets: every texture is painted procedurally on Canvas 2D.
   ========================================================================= */
'use strict';

/* ----------------------------- 0. 基础环境 ------------------------------ */
THREE.ColorManagement.legacyMode = false;

const canvas = document.getElementById('scene');
const PARAMS = new URLSearchParams(location.search);
const LOWQ = PARAMS.get('q') === 'low';
const FIXED_T = PARAMS.has('t') ? parseFloat(PARAMS.get('t')) : null;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: true
});
renderer.outputEncoding = THREE.LinearEncoding;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x0b080d, 1);
renderer.setPixelRatio(1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b080d);
scene.fog = new THREE.FogExp2(0x2a1c22, 0.028);

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 60);
const CAM_BASE = new THREE.Vector3(0.16, 1.02, 3.32);
const CAM_TARGET = new THREE.Vector3(0.13, 0.68, 0.0);
camera.position.copy(CAM_BASE);
camera.lookAt(CAM_TARGET);
camera.layers.enable(1);

if (PARAMS.get('view') === 'wheel') {
  CAM_BASE.set(0.30, 0.76, 1.62);
  CAM_TARGET.set(0.30, 0.50, 0.06);
  camera.fov = 32;
  camera.position.copy(CAM_BASE);
  camera.lookAt(CAM_TARGET);
  camera.updateProjectionMatrix();
}
if (PARAMS.get('view') === 'clock') {
  CAM_BASE.set(0.58, 0.78, 0.96);
  CAM_TARGET.set(0.30, 0.66, 0.06);
  camera.fov = 30;
  camera.position.copy(CAM_BASE);
  camera.lookAt(CAM_TARGET);
  camera.updateProjectionMatrix();
}

/* ----------------------------- 1. 尺寸与后期 ----------------------------- */
let CSSW = 0, CSSH = 0, W = 0, H = 0, SS = 1;

function calcSize() {
  CSSW = Math.max(320, window.innerWidth);
  CSSH = Math.max(240, window.innerHeight);
  SS = LOWQ ? 0.55 : Math.min(1.5, Math.max(1.0, 3000 / CSSW));
  W = Math.round(CSSW * SS);
  H = Math.round(CSSH * SS);
}

const rtBeauty = new THREE.WebGLRenderTarget(2, 2, {
  type: THREE.HalfFloatType,
  format: THREE.RGBAFormat,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  depthBuffer: true
});
rtBeauty.texture.encoding = THREE.LinearEncoding;
rtBeauty.depthTexture = new THREE.DepthTexture(2, 2);
rtBeauty.depthTexture.type = THREE.UnsignedIntType;

const rtNormal = new THREE.WebGLRenderTarget(2, 2, {
  type: THREE.UnsignedByteType,
  format: THREE.RGBAFormat,
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  depthBuffer: true
});
rtNormal.texture.encoding = THREE.LinearEncoding;

const rtBloomA = new THREE.WebGLRenderTarget(2, 2, {
  type: THREE.HalfFloatType, format: THREE.RGBAFormat,
  minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false
});
const rtBloomB = rtBloomA.clone();
const rtBright = rtBloomA.clone();

const quadScene = new THREE.Scene();
const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial());
quad.frustumCulled = false;
quadScene.add(quad);

function blit(material, target) {
  quad.material = material;
  renderer.setRenderTarget(target);
  renderer.render(quadScene, quadCamera);
}

const brightMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: rtBeauty.texture },
    uThreshold: { value: 0.58 },
    uKnee: { value: 0.22 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uThreshold;
    uniform float uKnee;
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float br = max(c.r, max(c.g, c.b));
      float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
      soft = soft * soft / (4.0 * uKnee + 0.0001);
      float contrib = max(soft, br - uThreshold) / max(br, 0.0001);
      gl_FragColor = vec4(c * contrib, 1.0);
    }
  `,
  depthTest: false, depthWrite: false
});

const blurMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null },
    uDir: { value: new THREE.Vector2(1, 0) },
    uTexel: { value: new THREE.Vector2(1 / 512, 1 / 512) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec2 uDir;
    uniform vec2 uTexel;
    void main(){
      vec2 d = uDir * uTexel;
      vec3 c = texture2D(tDiffuse, vUv).rgb * 0.227027;
      c += texture2D(tDiffuse, vUv + d * 1.384615).rgb * 0.316216;
      c += texture2D(tDiffuse, vUv - d * 1.384615).rgb * 0.316216;
      c += texture2D(tDiffuse, vUv + d * 3.230769).rgb * 0.070270;
      c += texture2D(tDiffuse, vUv - d * 3.230769).rgb * 0.070270;
      gl_FragColor = vec4(c, 1.0);
    }
  `,
  depthTest: false, depthWrite: false
});

const finalMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: rtBeauty.texture },
    tNormal: { value: rtNormal.texture },
    tDepth: { value: rtBeauty.depthTexture },
    tBloom: { value: rtBloomA.texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uNear: { value: camera.near },
    uFar: { value: camera.far },
    uFocus: { value: 3.3 },
    uTime: { value: 0 },
    uBloom: { value: 0.34 },
    uExposure: { value: 1.00 },
    uVignette: { value: 0.50 },
    uGrain: { value: 0.005 },
    uEdge: { value: 0.82 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform sampler2D tBloom;
    uniform vec2 uResolution;
    uniform float uNear;
    uniform float uFar;
    uniform float uFocus;
    uniform float uTime;
    uniform float uBloom;
    uniform float uExposure;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uEdge;

    float linearDepth(float d){
      float z = d * 2.0 - 1.0;
      return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
    }
    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    vec3 blur9(vec2 uv, float r){
      vec2 e = r / uResolution;
      vec3 c = texture2D(tDiffuse, uv).rgb * 0.22;
      c += (texture2D(tDiffuse, uv + vec2(e.x, 0.0)).rgb + texture2D(tDiffuse, uv - vec2(e.x, 0.0)).rgb) * 0.12;
      c += (texture2D(tDiffuse, uv + vec2(0.0, e.y)).rgb + texture2D(tDiffuse, uv - vec2(0.0, e.y)).rgb) * 0.12;
      c += (texture2D(tDiffuse, uv + vec2(e.x, e.y) * 0.7071).rgb + texture2D(tDiffuse, uv - vec2(e.x, e.y) * 0.7071).rgb) * 0.075;
      c += (texture2D(tDiffuse, uv + vec2(e.x, -e.y) * 0.7071).rgb + texture2D(tDiffuse, uv - vec2(e.x, -e.y) * 0.7071).rgb) * 0.075;
      return c;
    }
    void edgeTap(vec2 uv, vec2 off, float d0, vec3 n0, float aC, inout float ne, inout float de){
      vec4 ns = texture2D(tNormal, uv + off);
      if (aC > 0.5 && ns.a > 0.5) {
        vec3 n1 = normalize(ns.xyz * 2.0 - 1.0);
        ne = max(ne, 1.0 - dot(n0, n1));
      }
      float d1 = linearDepth(texture2D(tDepth, uv + off).x);
      de = max(de, abs(d0 - d1) / max(d0, 0.001));
    }
    vec3 aces(vec3 x){
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }
    void main(){
      vec2 uv = vUv;
      float dC = linearDepth(texture2D(tDepth, uv).x);
      float coc = smoothstep(0.24, 0.92, abs(dC - uFocus) / uFocus);
      vec3 col = blur9(uv, coc * 3.6);

      vec4 nC = texture2D(tNormal, uv);
      float aC = nC.a;
      vec3 n0 = normalize(nC.xyz * 2.0 - 1.0);
      float d0 = dC;
      float ne = 0.0, de = 0.0;
      vec2 px = 1.0 / uResolution;
      edgeTap(uv, vec2(px.x, 0.0), d0, n0, aC, ne, de);
      edgeTap(uv, vec2(-px.x, 0.0), d0, n0, aC, ne, de);
      edgeTap(uv, vec2(0.0, px.y), d0, n0, aC, ne, de);
      edgeTap(uv, vec2(0.0, -px.y), d0, n0, aC, ne, de);
      edgeTap(uv, vec2(px.x, px.y) * 0.7071, d0, n0, aC, ne, de);
      edgeTap(uv, vec2(px.x, -px.y) * 0.7071, d0, n0, aC, ne, de);
      edgeTap(uv, vec2(-px.x, px.y) * 0.7071, d0, n0, aC, ne, de);
      edgeTap(uv, vec2(-px.x, -px.y) * 0.7071, d0, n0, aC, ne, de);

      float normalEdge = smoothstep(0.13, 0.46, ne);
      float depthEdge = smoothstep(0.045, 0.13, de);
      float edge = max(normalEdge, depthEdge * 0.85) * uEdge;

      vec3 ink = vec3(0.08, 0.042, 0.052);
      col = mix(col, ink, clamp(edge, 0.0, 1.0) * 0.86);

      vec3 bl = texture2D(tBloom, uv).rgb;
      col += bl * uBloom * vec3(1.0, 0.86, 0.70);

      col *= uExposure;
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      vec3 shadowTint = vec3(0.86, 0.95, 1.10);
      vec3 highTint = vec3(1.04, 1.0, 0.94);
      col *= mix(shadowTint, highTint, smoothstep(0.015, 0.55, lum));
      col = mix(vec3(lum), col, 0.97);
      col = (col - 0.17) * 1.06 + 0.17;

      vec2 q = uv - 0.5;
      float vig = clamp(length(q * vec2(1.12, 1.0)) * 1.42, 0.0, 1.0);
      col *= 1.0 - uVignette * pow(vig, 2.1);

      float gr = hash(uv * uResolution + floor(uTime * 11.0) * 17.13) - 0.5;
      col += gr * uGrain;

      col = aces(col);
      col = pow(max(col, 0.0), vec3(1.0 / 2.2));
      col = col * 0.985 + 0.012;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  depthTest: false, depthWrite: false
});

const normalMat = new THREE.MeshNormalMaterial();

/* ----------------------------- 2. 工具函数 ------------------------------ */
const PI = Math.PI;
const TAU = PI * 2;

function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
function smooth(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

/* 可复现随机 */
function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTex(w, h, draw, opt) {
  opt = opt || {};
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.encoding = opt.linear ? THREE.LinearEncoding : THREE.sRGBEncoding;
  t.wrapS = t.wrapT = opt.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  if (opt.repeat) t.repeat.set(opt.repeat[0], opt.repeat[1]);
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  t.needsUpdate = true;
  return t;
}

function resizeTargets() {
  calcSize();
  renderer.setSize(W, H, false);
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  camera.aspect = CSSW / CSSH;
  camera.updateProjectionMatrix();

  rtBeauty.setSize(W, H);
  rtBeauty.depthTexture.image.width = W;
  rtBeauty.depthTexture.image.height = H;
  rtBeauty.depthTexture.needsUpdate = true;
  rtNormal.setSize(W, H);

  const bw = Math.max(2, Math.floor(W / 4));
  const bh = Math.max(2, Math.floor(H / 4));
  rtBright.setSize(bw, bh);
  rtBloomA.setSize(bw, bh);
  rtBloomB.setSize(bw, bh);
  blurMat.uniforms.uTexel.value.set(1 / bw, 1 / bh);

  finalMat.uniforms.uResolution.value.set(W, H);
  const _view = PARAMS.get('view');
  finalMat.uniforms.uFocus.value = _view === 'wheel' ? 1.62 : (_view === 'clock' ? 0.92 : 3.28);
}

function renderNormalPass() {
  const bg = scene.background;
  const fog = scene.fog;
  const mask = camera.layers.mask;
  const oldClear = renderer.getClearColor(new THREE.Color());
  const oldAlpha = renderer.getClearAlpha();

  scene.background = null;
  scene.fog = null;
  camera.layers.set(0);
  scene.overrideMaterial = normalMat;
  // 半透明贴片（接触阴影、桌面反光等）不写法线，否则会被描边成一整块
  const hidden = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.visible) return;
    const m = o.material;
    if (m && (m.transparent || m.depthWrite === false)) {
      o.visible = false;
      hidden.push(o);
    }
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(rtNormal);
  renderer.clear();
  renderer.render(scene, camera);
  hidden.forEach(function (o) { o.visible = true; });
  scene.overrideMaterial = null;
  camera.layers.mask = mask;
  scene.background = bg;
  scene.fog = fog;
  renderer.setClearColor(oldClear, oldAlpha);
}

function renderBloom() {
  blit(brightMat, rtBright);
  blurMat.uniforms.tDiffuse.value = rtBright.texture;
  blurMat.uniforms.uDir.value.set(1, 0);
  blit(blurMat, rtBloomA);
  blurMat.uniforms.tDiffuse.value = rtBloomA.texture;
  blurMat.uniforms.uDir.value.set(0, 1);
  blit(blurMat, rtBloomB);
  blurMat.uniforms.tDiffuse.value = rtBloomB.texture;
  blurMat.uniforms.uDir.value.set(1, 0);
  blit(blurMat, rtBloomA);
  blurMat.uniforms.tDiffuse.value = rtBloomA.texture;
  blurMat.uniforms.uDir.value.set(0, 1);
  blit(blurMat, rtBloomB);
}

function renderFrame() {
  renderer.setRenderTarget(rtBeauty);
  renderer.setClearColor(0x0b080d, 1);
  renderer.clear();
  renderer.render(scene, camera);

  renderNormalPass();
  renderBloom();

  renderer.setRenderTarget(null);
  renderer.setClearColor(0x0b080d, 1);
  quad.material = finalMat;
  renderer.render(quadScene, quadCamera);
}
