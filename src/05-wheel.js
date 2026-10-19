
/* =========================================================================
   6. 主角：真正的仓鼠跑轮结构（透明滚筒 + 半透毛玻璃后背板）
   -------------------------------------------------------------------------
   参考方向（仅结构，不照搬造型）：
   - 高端透明亚克力跑轮：前侧开放、后侧封闭、可调支架。
   - 双轴承静音跑轮：固定后轴 + 后置轴承座，滚筒绕轴旋转。
   - 常见 26cm 级跑轮：滚筒深度约外径的 25%–27%。
   本实现把滚筒、后板和前缘做成一体旋转组；轴承、支架、时钟、人物固定。
   ========================================================================= */

/* 墙上的柔和投影（保留原房间的入射关系） */
const wallWheelShadow = contactShadow(scene, 1.36, 1.36, 0.16, 0.64, 0.94, 0.003);
wallWheelShadow.rotation.x = 0;
wallWheelShadow.position.set(0.89, 0.74, -1.625);
wallWheelShadow.material.opacity = 0.045;
wallWheelShadow.renderOrder = 1;

/* 主体位置：比旧版略收小，避免变成一块大圆盘；朝向转开，露出滚筒深度 */
const wheelGroup = new THREE.Group();
wheelGroup.position.set(0.55, 0, 0.06);
wheelGroup.rotation.y = -0.50;
scene.add(wheelGroup);

/* ---- 跑轮比例 ---- */
const WHEEL_R = 0.460;          // 外径 0.92
const WHEEL_CY = 0.700;
const DRUM_HALF = 0.120;        // 滚筒深度 0.24，约为外径 26%
const DRUM_DEPTH = DRUM_HALF * 2;
const GLASS_R = 0.460;
const GLASS_T = 0.010;          // 前缘玻璃/金属收边的可见厚度
const FROST_OPACITY = 0.46;     // 背板磨砂半透明度
const RIM_CATCH_OPACITY = 0.34; // 前缘局部冷白高光
const TRACK_R = 0.443;          // 人物脚底所在的内壁半径
const BACK_R = 0.456;
const CLOCK_RING_R = 0.520;
const HOUR_NUM_R = 0.565;
const DOT_R = 0.405;

/* ------------------------------ 木质底座 -------------------------------- */
(function makeStandBase() {
  const base = new THREE.Mesh(slabGeo(1.06, 0.62, 0.055, 0.11, 0.008), MAT.darkWood);
  // slabGeo 的厚度被挤出后还会平移一次，实测顶面在局部 y=0.118；下移后让底面贴桌面、顶面落在 0.071
  base.position.set(0, -0.047, -0.03);
  base.castShadow = true;
  base.receiveShadow = true;
  wheelGroup.add(base);

  // 后置支架：两条落在底座上的弧形立柱，从底座外缘向中心收拢
  [-1, 1].forEach(function (side) {
    const pts = [
      new THREE.Vector3(side * 0.505, 0.074, -0.150),
      new THREE.Vector3(side * 0.515, 0.230, -0.170),
      new THREE.Vector3(side * 0.460, 0.485, -0.185),
      new THREE.Vector3(side * 0.300, 0.700, -0.190)
    ];
    const leg = new THREE.Mesh(tubeGeo(pts, 0.019, 28, 10), MAT.champagne);
    leg.castShadow = true;
    leg.receiveShadow = true;
    wheelGroup.add(leg);

    // 底座脚座与两枚统一规格的沉头螺栓
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.014, 0.080), MAT.champagneDark);
    foot.position.set(side * 0.505, 0.073, -0.150);
    foot.castShadow = true;
    foot.receiveShadow = true;
    wheelGroup.add(foot);

    [-0.026, 0.026].forEach(function (dx) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0072, 0.0072, 0.0045, 12), MAT.brassMetal);
      bolt.position.set(side * 0.505 + dx, 0.0815, -0.150);
      bolt.castShadow = false;
      wheelGroup.add(bolt);
    });

    // 立柱顶端与横梁连接处的小圆帽
    const endCap = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 10), MAT.champagne);
    endCap.position.set(side * 0.300, 0.700, -0.190);
    endCap.castShadow = false;
    wheelGroup.add(endCap);
  });

  // 后横梁：真正承托轴承的横杆，位于后板之后
  const crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.620, 14),
    MAT.champagne
  );
  crossbar.rotation.z = PI / 2;
  crossbar.position.set(0, 0.700, -0.190);
  crossbar.castShadow = true;
  wheelGroup.add(crossbar);

  // 固定轴承座：不随滚筒转
  const bearing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.072, 0.072, 0.060, 24),
    MAT.champagneDark
  );
  bearing.rotation.x = PI / 2;
  bearing.position.set(0, 0.700, -0.205);
  bearing.castShadow = true;
  wheelGroup.add(bearing);

  const bearingFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.008, 20),
    MAT.champagne
  );
  bearingFace.rotation.x = PI / 2;
  bearingFace.position.set(0, 0.700, -0.173);
  bearingFace.castShadow = false;
  wheelGroup.add(bearingFace);

  // 固定后轴：从轴承座伸入后板轮毂
  const axle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0155, 0.0155, 0.230, 14),
    MAT.brassMetal
  );
  axle.rotation.x = PI / 2;
  axle.position.set(0, 0.700, -0.195);
  axle.castShadow = false;
  wheelGroup.add(axle);

  const axleCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.010, 16),
    MAT.champagne
  );
  axleCap.rotation.x = PI / 2;
  axleCap.position.set(0, 0.700, -0.312);
  axleCap.castShadow = false;
  wheelGroup.add(axleCap);

  // 时钟外圈的固定支臂：从后横梁伸向左右两侧，避免数字悬浮
  [-1, 1].forEach(function (side) {
    const armPts = [
      new THREE.Vector3(side * 0.290, 0.700, -0.190),
      new THREE.Vector3(side * 0.410, 0.700, -0.150),
      new THREE.Vector3(side * 0.520, 0.700, -0.100)
    ];
    const arm = new THREE.Mesh(tubeGeo(armPts, 0.0065, 16, 6), MAT.champagne);
    arm.castShadow = false;
    wheelGroup.add(arm);
  });

  // 落在木底座顶面的接触阴影
  contactShadow(wheelGroup, 1.18, 0.76, 0.36, 0, -0.03, 0.0717);
})();

/* ---------------------- 底座微型灯串（固定装饰） ---------------------- */
(function makeBaseStringLights() {
  const BASE_TOP = 0.071;
  const rng = makeRng(5519);

  // 细铜线：沿底座上表面外围绕一圈，左右脚座处向内让线，后段藏在支架之后。
  // 高度只有几毫米起伏：低处贴木面，局部小拱起，避免像悬浮灯带。
  const wirePts = [
    [-0.340, 0.0735, -0.286],
    [-0.480, 0.0735, -0.278],
    [-0.505, 0.0730, -0.210],
    [-0.490, 0.0735, -0.185],
    [-0.438, 0.0730, -0.150],   // 绕开左脚座内侧
    [-0.468, 0.0745, -0.112],
    [-0.494, 0.0735, -0.060],
    [-0.492, 0.0740,  0.010],
    [-0.478, 0.0735,  0.108],
    [-0.445, 0.0745,  0.186],
    [-0.360, 0.0735,  0.226],
    [-0.245, 0.0730,  0.252],
    [-0.120, 0.0745,  0.264],
    [ 0.000, 0.0760,  0.270],   // 前缘中央略微拱起、稍微向前
    [ 0.120, 0.0740,  0.262],
    [ 0.250, 0.0735,  0.244],
    [ 0.370, 0.0745,  0.212],
    [ 0.448, 0.0735,  0.160],
    [ 0.488, 0.0740,  0.080],
    [ 0.500, 0.0735, -0.010],
    [ 0.492, 0.0740, -0.080],
    [ 0.450, 0.0735, -0.120],
    [ 0.428, 0.0740, -0.150],   // 绕开右脚座内侧
    [ 0.460, 0.0745, -0.188],
    [ 0.492, 0.0735, -0.230],
    [ 0.500, 0.0740, -0.270],
    [ 0.400, 0.0735, -0.292],
    [ 0.220, 0.0740, -0.304],
    [ 0.050, 0.0735, -0.308],
    [-0.140, 0.0745, -0.302],
    [-0.290, 0.0735, -0.296]
  ].map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); });

  const wireCurve = new THREE.CatmullRomCurve3(wirePts, true, 'catmullrom', 0.38);
  const wireMat = new THREE.MeshPhongMaterial({
    color: 0xd9a063,
    specular: 0xffd2a0,
    shininess: 88,
    emissive: 0x1a0702,
    emissiveIntensity: 0.18
  });
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(wireCurve, 360, 0.0034, 6, true),
    wireMat
  );
  wire.castShadow = true;
  wire.receiveShadow = true;
  wheelGroup.add(wire);

  // 暖白小灯：外壳是一颗很小的乳白玻璃滴，内部只有一点清晰亮芯；
  // 芯亮、壳透、外围柔光很小，不能变成一圈大灯泡。
  const shellGeo = new THREE.SphereGeometry(0.0120, 10, 8);
  const coreGeo = new THREE.SphereGeometry(0.0055, 8, 6);
  const socketGeo = new THREE.CylinderGeometry(0.0052, 0.0062, 0.0056, 8);
  const shellMat = new THREE.MeshPhongMaterial({
    color: 0xffe0b4,
    emissive: 0x5a2d0c,
    emissiveIntensity: 0.58,
    specular: 0xfff6e2,
    shininess: 130,
    transparent: true,
    opacity: 0.64,
    depthWrite: false
  });
  const coreMat = new THREE.MeshBasicMaterial({
    color: hdr(2.00, 1.55, 0.90),
    toneMapped: false
  });

  // 灯距刻意不完全等距；前排更清楚，后段更小、更暗、被支架遮住。
  const bulbT = [0.035, 0.110, 0.190, 0.268, 0.338, 0.405, 0.468, 0.535, 0.605, 0.676, 0.752, 0.828, 0.902];
  const stringBulbGroups = [];

  // 木面暖色光斑：不是每颗都配实时灯，只用低强度加色平面模拟近表面光。
  const poolTex = canvasTex(128, 128, function (c, w, h) {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.48);
    g.addColorStop(0, 'rgba(255,196,116,0.42)');
    g.addColorStop(0.42, 'rgba(255,146,62,0.16)');
    g.addColorStop(1, 'rgba(255,120,40,0.00)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }, { clamp: true });
  const poolMat = new THREE.MeshBasicMaterial({
    map: poolTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: true,
    fog: false
  });
  const poolGeo = new THREE.PlaneGeometry(0.105, 0.105);

  bulbT.forEach(function (t, i) {
    const p = wireCurve.getPointAt(t);
    const g = new THREE.Group();
    g.position.set(p.x, p.y, p.z);

    const socket = new THREE.Mesh(socketGeo, MAT.champagneDark);
    socket.position.y = 0.0010;
    socket.castShadow = false;
    g.add(socket);

    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.y = 0.0060;
    shell.scale.set(1, 1.28, 1);
    shell.rotation.z = (rng() - 0.5) * 0.44;
    shell.castShadow = false;
    shell.renderOrder = 8;
    g.add(shell);

    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.0057;
    core.castShadow = false;
    g.add(core);

    const front = i >= 3 && i <= 8;
    const glow = softGlow(g, 0, 0.0060, 0, front ? 0.044 : 0.033, front ? 0.26 : 0.17, 0xffc88a);
    glow.renderOrder = 10;
    wheelGroup.add(g);
    stringBulbGroups.push(g);
    g.userData.glow = glow;
    g.userData.glowBaseOpacity = glow.material.opacity;
    g.userData.glowBaseColor = glow.material.color.clone();

    // 只有前排、两侧中可见的灯珠在木面留光斑；后排不铺，避免一圈均匀亮带。
    if (i >= 2 && i <= 11) {
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.rotation.x = -PI / 2;
      pool.position.set(p.x, BASE_TOP + 0.0016, p.z);
      const s = 0.80 + (i % 4) * 0.055;
      pool.scale.set(s, s, 1);
      pool.renderOrder = 3;
      pool.castShadow = false;
      pool.receiveShadow = false;
      wheelGroup.add(pool);
    }
  });

  // 一个很轻的近场暖补光，让灯串与木面发生关系；不是每颗灯一个点光源。
  const stringFill = new THREE.PointLight(0xffb36c, 0.080, 0.58, 2);
  stringFill.position.set(0.02, 0.145, 0.205);
  stringFill.castShadow = false;
  wheelGroup.add(stringFill);

  ANIM.baseString = {
    curve: wireCurve,
    bulbs: stringBulbGroups,
    fill: stringFill,
    shellMat: shellMat,
    coreMat: coreMat,
    poolMat: poolMat,
    shellGeo: shellGeo,
    coreGeo: coreGeo,
    socketGeo: socketGeo
  };
})();

/* --------------------------- 旋转滚筒 ---------------------------- */
const drumSpin = new THREE.Group();
drumSpin.position.set(0, WHEEL_CY, 0);
wheelGroup.add(drumSpin);
ANIM.wheelSpin = drumSpin;

/* 后毛玻璃：半透、低对比，不再做发光圆盘，也不做同心唱片纹 */
const backTex = canvasTex(512, 512, function (g, w, h) {
  g.fillStyle = '#b6a189';
  g.fillRect(0, 0, w, h);

  const rng = makeRng(241019);
  // 很轻的云状漫射，只做材料感，不做环形图案
  for (let i = 0; i < 22; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 40 + rng() * 150;
    const warm = rng() > 0.45;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, warm ? 'rgba(255,244,226,0.060)' : 'rgba(120,100,82,0.035)');
    grad.addColorStop(0.65, warm ? 'rgba(255,244,226,0.022)' : 'rgba(120,100,82,0.014)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // 细磨砂颗粒
  for (let i = 0; i < 2600; i++) {
    const x = rng() * w;
    const y = rng() * h;
    g.fillStyle = rng() > 0.5 ? 'rgba(255,250,240,0.018)' : 'rgba(90,78,66,0.014)';
    g.fillRect(x, y, 1, 1);
  }

  // 上缘少量更亮的漫射，不形成圆环
  const top = g.createLinearGradient(0, 0, 0, h);
  top.addColorStop(0, 'rgba(255,245,225,0.060)');
  top.addColorStop(0.35, 'rgba(255,245,225,0.015)');
  top.addColorStop(1, 'rgba(90,74,60,0.025)');
  g.fillStyle = top;
  g.fillRect(0, 0, w, h);

  // 只在靠近轮缘的窄带内放少量极淡的放射短刻线，中央保持干净
  g.save();
  g.translate(w / 2, h / 2);
  g.strokeStyle = 'rgba(255,247,228,0.050)';
  g.lineWidth = 0.9;
  for (let i = 0; i < 9; i++) {
    const a = -0.15 + i * TAU / 9 + (rng() - 0.5) * 0.10;
    const r0 = w * 0.365;
    const r1 = r0 + w * (0.045 + rng() * 0.030);
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    g.stroke();
  }
  g.restore();
}, { clamp: true });

const backMat = new THREE.MeshBasicMaterial({
  map: backTex,
  color: 0xffffff,
  transparent: true,
  opacity: FROST_OPACITY,
  depthWrite: false,
  side: THREE.DoubleSide,
  toneMapped: true,
  fog: false
});

const backPanel = new THREE.Mesh(new THREE.CircleGeometry(BACK_R, 96), backMat);
backPanel.position.z = -DRUM_HALF + 0.002;
backPanel.renderOrder = 1;
backPanel.castShadow = false;
drumSpin.add(backPanel);

/* 内壁跑道：透明玻璃 + 很细的横向磨砂防滑纹 */
const trackTex = canvasTex(1024, 256, function (g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(178,214,229,0.20)';
  g.fillRect(0, 0, w, h);

  const rng = makeRng(7788);
  // 很弱的纵向水痕，避免内壁像纯色塑料
  for (let i = 0; i < 36; i++) {
    const x = rng() * w;
    const alpha = 0.018 + rng() * 0.022;
    g.strokeStyle = 'rgba(238,250,255,' + alpha.toFixed(3) + ')';
    g.lineWidth = 1 + rng() * 2;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (rng() - 0.5) * 20, h);
    g.stroke();
  }

  // 细横向防滑纹：沿圆周方向，不横穿入口
  g.lineWidth = 1;
  for (let y = 10; y < h; y += 9) {
    g.strokeStyle = (y % 45 === 1) ? 'rgba(255,250,238,0.050)' : 'rgba(250,252,255,0.032)';
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }

  // 少量很淡的磨砂斑
  for (let i = 0; i < 950; i++) {
    const x = rng() * w;
    const y = rng() * h;
    g.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.024)' : 'rgba(70,100,115,0.018)';
    g.fillRect(x, y, 1.2, 1.2);
  }
}, { clamp: true });

const trackMat = new THREE.MeshPhongMaterial({
  map: trackTex,
  color: 0xffffff,
  transparent: true,
  opacity: 0.74,
  shininess: 70,
  specular: 0x9ec6d8,
  side: THREE.DoubleSide,
  depthWrite: false,
  toneMapped: true,
  fog: false
});

const track = new THREE.Mesh(
  new THREE.CylinderGeometry(TRACK_R, TRACK_R, DRUM_DEPTH - 0.012, 96, 1, true),
  trackMat
);
track.rotation.x = PI / 2;
track.position.z = 0;
track.renderOrder = 2;
track.castShadow = false;
drumSpin.add(track);

/* 外壁：很淡的透明玻璃圆筒，提供厚度与弧面反光 */
const drumMat = new THREE.MeshPhongMaterial({
  color: 0xe4f4ff,
  transparent: true,
  opacity: 0.075,
  shininess: 180,
  specular: 0xffffff,
  side: THREE.DoubleSide,
  depthWrite: false,
  toneMapped: true,
  fog: false
});

const drumWall = new THREE.Mesh(
  new THREE.CylinderGeometry(GLASS_R, GLASS_R, DRUM_DEPTH, 96, 1, true),
  drumMat
);
drumWall.rotation.x = PI / 2;
drumWall.position.z = 0;
drumWall.renderOrder = 5;
drumWall.castShadow = false;
drumSpin.add(drumWall);

/* 前后玻璃边缘：clear glass rim，倒角靠圆管截面表现 */
const rimMat = new THREE.MeshPhongMaterial({
  color: 0xf3fbff,
  transparent: true,
  opacity: 0.29,
  shininess: 220,
  specular: 0xffffff,
  side: THREE.DoubleSide,
  depthWrite: false,
  toneMapped: true,
  fog: false
});

const frontRim = new THREE.Mesh(new THREE.TorusGeometry(GLASS_R, GLASS_T * 0.95, 8, 128), rimMat);
frontRim.position.z = DRUM_HALF - 0.004;
frontRim.renderOrder = 6;
frontRim.castShadow = false;
drumSpin.add(frontRim);

// 前缘最外侧的一条极细香槟金属收口，给玻璃边缘清楚但克制的截面
const frontInlay = new THREE.Mesh(
  new THREE.TorusGeometry(GLASS_R + 0.0010, 0.0028, 4, 128),
  MAT.champagne
);
frontInlay.position.z = DRUM_HALF - 0.002;
frontInlay.renderOrder = 7;
frontInlay.castShadow = false;
drumSpin.add(frontInlay);

const backRim = new THREE.Mesh(new THREE.TorusGeometry(GLASS_R, 0.0075, 8, 128), rimMat);
backRim.position.z = -DRUM_HALF + 0.004;
backRim.renderOrder = 6;
backRim.castShadow = false;
drumSpin.add(backRim);

const innerFrontRim = new THREE.Mesh(new THREE.TorusGeometry(TRACK_R, 0.0038, 6, 128), rimMat);
innerFrontRim.position.z = DRUM_HALF - 0.008;
innerFrontRim.renderOrder = 6;
innerFrontRim.castShadow = false;
drumSpin.add(innerFrontRim);

// 左上方的冷白玻璃边缘高光：局部短弧，只沿前缘曲面出现，不做整圈白管
const rimCatchMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color(0xd7f0ff),
  transparent: true,
  opacity: RIM_CATCH_OPACITY,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
  toneMapped: true,
  fog: false
});
const rimCatch = new THREE.Mesh(
  new THREE.TorusGeometry(GLASS_R, 0.0017, 4, 64, TAU * 0.22),
  rimCatchMat
);
ANIM.rimCatchMat = rimCatchMat;
rimCatch.position.z = DRUM_HALF - 0.004;
rimCatch.rotation.z = PI * 0.57;
rimCatch.renderOrder = 7;
rimCatch.castShadow = false;
drumSpin.add(rimCatch);

/* 前缘低矮玻璃挡边：全周很短的玻璃圈，不封住入口，不遮挡人物 */
const frontCollar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.452, 0.452, 0.054, 96, 1, true),
  new THREE.MeshPhongMaterial({
    color: 0xe9f8ff,
    transparent: true,
    opacity: 0.13,
    shininess: 200,
    specular: 0xffffff,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: true,
    fog: false
  })
);
frontCollar.rotation.x = PI / 2;
frontCollar.position.z = 0.097;
frontCollar.renderOrder = 6;
frontCollar.castShadow = false;
drumSpin.add(frontCollar);

/* 后板轮毂：随滚筒转，中心只保留很小的金属盖 */
const hub = new THREE.Mesh(
  new THREE.CylinderGeometry(0.058, 0.062, 0.040, 24),
  MAT.champagneDark
);
hub.rotation.x = PI / 2;
hub.position.z = -DRUM_HALF + 0.012;
hub.castShadow = false;
drumSpin.add(hub);

/* 固定的后轴端头：只穿过轮毂中心，不随滚筒转 */
const axleNose = new THREE.Mesh(
  new THREE.CylinderGeometry(0.0115, 0.0115, 0.100, 14),
  MAT.brassMetal
);
axleNose.rotation.x = PI / 2;
axleNose.position.set(0, WHEEL_CY, -0.132);
axleNose.castShadow = false;
wheelGroup.add(axleNose);

const axleNoseCap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.021, 0.021, 0.006, 16),
  MAT.champagne
);
axleNoseCap.rotation.x = PI / 2;
axleNoseCap.position.set(0, WHEEL_CY, -0.079);
axleNoseCap.castShadow = false;
wheelGroup.add(axleNoseCap);

/* 后板边缘的 4 个结构性小夹片：只解释装配，不做装饰 */
for (let i = 0; i < 4; i++) {
  const a = PI / 4 + i * TAU / 4;
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.010, 0.018), MAT.champagne);
  clip.position.set(Math.cos(a) * 0.440, Math.sin(a) * 0.440, -DRUM_HALF + 0.006);
  clip.rotation.z = a;
  clip.castShadow = false;
  drumSpin.add(clip);
}

/* 前缘的 4 个统一金属扣：夹住玻璃前缘与短挡边，和背板扣同一种语言 */
for (let i = 0; i < 4; i++) {
  const a = PI / 4 + i * TAU / 4;
  const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.011, 0.010), MAT.champagne);
  clamp.position.set(Math.cos(a) * 0.452, Math.sin(a) * 0.452, 0.113);
  clamp.rotation.z = a;
  clamp.castShadow = false;
  drumSpin.add(clamp);
}

/* --------------------------- 固定时钟外圈 ---------------------------- */
const clockGroup = new THREE.Group();
clockGroup.position.set(0, WHEEL_CY, 0);
wheelGroup.add(clockGroup);
ANIM.clockGroup = clockGroup;

const clockRing = new THREE.Mesh(
  new THREE.TorusGeometry(CLOCK_RING_R, 0.0052, 6, 128),
  MAT.brassMetal
);
clockRing.position.z = 0.120;
clockRing.castShadow = false;
clockGroup.add(clockRing);

const CLOCK = { hours: [], hour: -1, minuteDot: null, dotGlow: null, minuteValue: 0 };
ANIM.clock = CLOCK;
const LIT_HOUR = new THREE.Color(0xb8edff);
const DIM_HOUR = new THREE.Color(0xf7dbb0);

(function makeClockFace() {
  function numberTexture(label) {
    return canvasTex(256, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '700 184px Georgia, "Times New Roman", serif';
      g.lineJoin = 'round';
      g.lineWidth = 8;
      g.strokeStyle = 'rgba(4,18,28,0.92)';
      g.strokeText(label, w / 2, h / 2 + 6);
      g.fillStyle = '#ffffff';
      g.fillText(label, w / 2, h / 2 + 6);
    }, { clamp: true });
  }

  const DIM_NUM = new THREE.Color(0xf7dbb0);

  function makeHour(label, angle) {
    const tex = numberTexture(label);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: false,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      color: DIM_NUM.clone(),
      toneMapped: true
    });
    // 数字画布背景是纯黑，按亮度丢弃，不依赖纹理 alpha
    mat.onBeforeCompile = function (shader) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        '#include <map_fragment>\n  if (max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)) < 0.018) discard;'
      );
    };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.094, 0.094), mat);
    mesh.position.set(Math.cos(angle) * HOUR_NUM_R, Math.sin(angle) * HOUR_NUM_R, 0.136);
    mesh.renderOrder = 12;
    mesh.castShadow = false;
    clockGroup.add(mesh);

    const glow = softGlow(clockGroup, mesh.position.x, mesh.position.y, 0.145, 0.120, 0.0, 0x55c8ff);
    glow.visible = false;
    glow.renderOrder = 9;
    return { mesh: mesh, mat: mat, glow: glow, label: label };
  }

  for (let i = 0; i < 12; i++) {
    const a = PI / 2 - (i / 12) * TAU;
    CLOCK.hours.push(makeHour(String(i === 0 ? 12 : i), a));
  }

  // 小时环上的 12 个小刻度，尺寸统一
  const pinGeo = new THREE.BoxGeometry(0.030, 0.0030, 0.004);
  for (let i = 0; i < 12; i++) {
    const a = PI / 2 - (i / 12) * TAU;
    const pin = new THREE.Mesh(pinGeo, MAT.brassDark);
    pin.position.set(Math.cos(a) * (CLOCK_RING_R + 0.014), Math.sin(a) * (CLOCK_RING_R + 0.014), 0.121);
    pin.rotation.z = a;
    pin.castShadow = false;
    clockGroup.add(pin);
  }

  // 唯一分钟光点：固定在钟面组里，读系统时间移动
  const dotGroup = new THREE.Group();
  dotGroup.position.z = 0.160;
  clockGroup.add(dotGroup);

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.0115, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x78dfff, toneMapped: false })
  );
  dot.renderOrder = 8;
  dot.castShadow = false;
  dotGroup.add(dot);

  const dotCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.0052, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xe4fbff, toneMapped: false })
  );
  dotCore.position.z = 0.004;
  dotCore.renderOrder = 8;
  dotGroup.add(dotCore);

  const dotGlow = softGlow(dotGroup, 0, 0, 0.002, 0.082, 0.58, 0x78dfff);
  dotGlow.renderOrder = 9;

  CLOCK.minuteDot = dotGroup;
  CLOCK.dotGlow = dotGlow;
})();

/* ------------------------------ 真实时间 -------------------------------- */
function clockNowParts() {
  let h, m, s = 0, ms = 0;
  const q = PARAMS.get('clock');
  if (q) {
    const mm = /^(\d{1,2}):(\d{2})$/.exec(q);
    if (mm) {
      h = parseInt(mm[1], 10) % 24;
      m = Math.max(0, Math.min(59, parseInt(mm[2], 10)));
    }
  }
  if (h === undefined) {
    const d = new Date();
    h = d.getHours();
    m = d.getMinutes();
    s = d.getSeconds();
    ms = d.getMilliseconds();
  }
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return { h12: h12, m: m, s: s, ms: ms, minuteValue: m + s / 60 + ms / 60000 };
}

function setHourHighlight(h12) {
  const idx = h12 % 12;
  CLOCK.hours.forEach(function (e, i) {
    const on = (i === idx);
    e.mat.color.copy(on ? LIT_HOUR : DIM_HOUR);
    e.mesh.scale.setScalar(on ? 1.12 : 1.0);
    e.glow.visible = on;
    e.glow.material.opacity = on ? 0.34 : 0.0;
  });
}

function updateClock(force) {
  const n = clockNowParts();
  if (force || n.h12 !== CLOCK.hour) {
    CLOCK.hour = n.h12;
    setHourHighlight(n.h12);
  }

  const a = PI / 2 - (n.minuteValue / 60) * TAU;
  CLOCK.minuteDot.position.x = Math.cos(a) * DOT_R;
  CLOCK.minuteDot.position.y = Math.sin(a) * DOT_R;
  CLOCK.minuteValue = n.minuteValue;
}

CLOCK.update = updateClock;
ANIM.clockUpdate = updateClock;
updateClock(true);

/* ------------------------ 人物走路精灵图 / 同步 ------------------------ */
const CHARACTER_IMG_W = 768;
const CHARACTER_IMG_H = 1024;
const CHARACTER_PLANE_H = 0.400;
const CHARACTER_PLANE_W = CHARACTER_PLANE_H * (CHARACTER_IMG_W / CHARACTER_IMG_H);
const CHARACTER_FEET_Y = WHEEL_CY - TRACK_R + 0.007;

/* 11 帧共用同一 768×1024 画布。取所有帧的全局脚底最低点和身体质心作为
   固定对齐基准，绝不逐帧按可见内容裁切或缩放，保留素材本身的步态起伏。 */
const CHARACTER_BOTTOM_PX = 984;
const CHARACTER_ANCHOR_X_PX = 389;
const CHARACTER_VISIBLE_BOTTOM = (CHARACTER_IMG_H - CHARACTER_BOTTOM_PX) / CHARACTER_IMG_H;
const CHARACTER_PLANE_BOTTOM = CHARACTER_FEET_Y - CHARACTER_VISIBLE_BOTTOM * CHARACTER_PLANE_H;
const CHARACTER_PLANE_Y = CHARACTER_PLANE_BOTTOM + CHARACTER_PLANE_H * 0.5;
const CHARACTER_X_OFFSET = (0.5 - CHARACTER_ANCHOR_X_PX / CHARACTER_IMG_W) * CHARACTER_PLANE_W;

/* 无损 PNG 精灵图：清晰度优先于电影感。
   11 帧 / 12 fps，播放倍率 0.5（放慢一倍）。 */
const WALK_FRAME_COUNT = 11;
const WALK_FPS = 12;
const WALK_CYCLE = WALK_FRAME_COUNT / WALK_FPS;
const WALK_DISTANCE = 0.068;
const WALK_RADIUS = TRACK_R;
const WALK_SPEED_SCALE = 1.0;
const WALK_PLAYBACK_RATE = 0.35;
const WALK_BASE_ANGLE = 0.42;

const WALK_SHEET_COLS = 4;
const WALK_SHEET_ROWS = 3;
const WALK_CELL_U = 1 / WALK_SHEET_COLS;
const WALK_CELL_V = 1 / WALK_SHEET_ROWS;
const WALK_SHEET_DATA_URI = '__WALK_SHEET_DATA__';

const characterRoot = new THREE.Group();
characterRoot.position.set(CHARACTER_X_OFFSET, CHARACTER_PLANE_Y, 0.026);
wheelGroup.add(characterRoot);

/* 3072×3072 的 RGBA 精灵图，原图逐像素无损，避免视频压缩把白色描边、
   半透明边缘和毛发细节磨糊。用 UV 子矩形切帧，不做逐帧缩放。 */
const characterTex = new THREE.TextureLoader().load(WALK_SHEET_DATA_URI);
characterTex.encoding = THREE.sRGBEncoding;
characterTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
characterTex.minFilter = THREE.LinearFilter;
characterTex.magFilter = THREE.LinearFilter;
characterTex.generateMipmaps = false;
characterTex.flipY = true;
characterTex.wrapS = THREE.ClampToEdgeWrapping;
characterTex.wrapT = THREE.ClampToEdgeWrapping;
characterTex.repeat.set(WALK_CELL_U, WALK_CELL_V);

const characterMat = new THREE.MeshBasicMaterial({
  map: characterTex,
  transparent: true,
  alphaTest: 0.01,
  depthWrite: false,
  toneMapped: false,
  fog: false,
  side: THREE.DoubleSide
});

const characterMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(CHARACTER_PLANE_W, CHARACTER_PLANE_H),
  characterMat
);
characterMesh.renderOrder = 4;
characterMesh.castShadow = false;
characterMesh.receiveShadow = false;
characterRoot.add(characterMesh);

/* 只保留两团很小的软脚影，不复制整张人物图的矩形阴影。 */
const charShadows = [];
function addFootShadow(x, opacity, w, d) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), MAT.shadow.clone());
  m.material.opacity = opacity;
  m.rotation.x = -PI / 2;
  m.position.set(CHARACTER_X_OFFSET + x, CHARACTER_FEET_Y - 0.002, 0.012);
  m.renderOrder = 3;
  m.castShadow = false;
  m.receiveShadow = false;
  wheelGroup.add(m);
  charShadows.push(m);
  return m;
}
addFootShadow(-0.018, 0.13, 0.078, 0.040);
addFootShadow(0.052, 0.16, 0.082, 0.042);

function setWalkFrame(mediaTime) {
  const phase = ((mediaTime / WALK_CYCLE) % 1 + 1) % 1;
  const frame = Math.floor(phase * WALK_FRAME_COUNT) % WALK_FRAME_COUNT;
  if (frame === ANIM.character.frame) return;
  const col = frame % WALK_SHEET_COLS;
  const row = Math.floor(frame / WALK_SHEET_COLS);
  characterTex.offset.set(col * WALK_CELL_U, 1 - (row + 1) * WALK_CELL_V);
  ANIM.character.frame = frame;
  ANIM.walk.frame = frame;
}

ANIM.character = {
  root: characterRoot,
  mesh: characterMesh,
  mat: characterMat,
  texture: characterTex,
  shadows: charShadows,
  baseY: CHARACTER_PLANE_Y,
  feetY: CHARACTER_FEET_Y,
  planeW: CHARACTER_PLANE_W,
  planeH: CHARACTER_PLANE_H,
  frame: -1,
  setFrame: setWalkFrame
};

ANIM.walk = {
  texture: characterTex,
  cycle: WALK_CYCLE,
  distance: WALK_DISTANCE,
  radius: WALK_RADIUS,
  speedScale: WALK_SPEED_SCALE,
  playbackRate: WALK_PLAYBACK_RATE,
  baseAngle: WALK_BASE_ANGLE,
  angle: WALK_BASE_ANGLE,
  mediaTime: 0,
  animTime: 0,
  speedMultiplier: 1.0,
  frame: 0
};

setWalkFrame(0);

/* ------------------------------ 灯光 ----------------------------------- */
(function makeWheelLights() {
  // 前上方暖光：只负责前缘、玻璃倒角和支架高光
  const rimLight = new THREE.PointLight(0xffb877, 0.20, 1.65, 2);
  rimLight.position.set(0.08, 1.02, 0.42);
  wheelGroup.add(rimLight);
  ANIM.rimLight = rimLight;

  const wheelFill = new THREE.PointLight(0xffc9a2, 0.16, 2.20, 2);
  wheelFill.position.set(0.06, 0.94, 0.88);
  wheelGroup.add(wheelFill);
  ANIM.wheelFill = wheelFill;

  const coolGlass = new THREE.PointLight(0xbcd8ff, 0.095, 1.80, 2);
  coolGlass.position.set(-0.28, 0.92, 0.38);
  wheelGroup.add(coolGlass);
  ANIM.coolGlass = coolGlass;

  // 近距离冷白边缘光：只擦亮玻璃前缘和倒角，不做整面照明
  const coolEdge = new THREE.PointLight(0xcfeaff, 0.18, 0.72, 2);
  coolEdge.position.set(-0.31, 0.84, 0.30);
  wheelGroup.add(coolEdge);
  ANIM.coolEdge = coolEdge;

  // 毛玻璃使用半透材质与低对比纹理近似柔化；当前管线不做屏幕空间模糊


  // 轴承后方非常轻的暖光，只帮助读支架，不照亮后板
  const backLight = new THREE.PointLight(0xffd3a8, 0.10, 1.20, 2);
  backLight.position.set(0, 0.68, -0.230);
  wheelGroup.add(backLight);
  ANIM.backLight = backLight;

  // 底座附近少量暖色溢光
  const baseGlow = softGlow(wheelGroup, 0, 0.082, 0.035, 0.36, 0.055, 0xffb87a);
  baseGlow.renderOrder = 2;
  ANIM.baseGlow = baseGlow;
})();

/* ===================== 桌面滑动变阻器：模型 / 交互 / 灯光 ===================== */

const controllerGroup = new THREE.Group();
controllerGroup.position.set(-0.50, 0.0, 0.16);
controllerGroup.rotation.y = 0.30;
controllerGroup.scale.setScalar(1.0);
scene.add(controllerGroup);

const CONTROL = {
  target: 0.5,
  display: 0.5,
  speed: 1.0,
  bright: 1.0,
  hover: false,
  dragging: false,
  color: new THREE.Color(0xffc88a),
  baseSpeed: WALK_PLAYBACK_RATE,
  railHalf: 0.105
};
ANIM.control = CONTROL;

/* 仅用于调试/截图：?control=0..1 可指定初始滑块位置，不生成任何界面元素。 */
const initialControl = clamp(parseFloat(PARAMS.get('control') || '0.5'), 0, 1);
if (Number.isFinite(initialControl)) {
  CONTROL.target = initialControl;
  CONTROL.display = initialControl;
  CONTROL.speed = 0.8 + 0.4 * initialControl;
}

/* 变阻器主体：奶油白陶瓷圆柱 + 黄铜端板 + 上下黄铜滑轨 + 滚花滑块。 */
const brassWarm = new THREE.MeshPhongMaterial({
  color: 0xc99a52,
  specular: 0xffe4b0,
  shininess: 92,
  emissive: 0x2a1605,
  emissiveIntensity: 0.34
});
const brassDeep = new THREE.MeshPhongMaterial({
  color: 0x9a6f33,
  specular: 0xf0cf94,
  shininess: 64,
  emissive: 0x1a0c02,
  emissiveIntensity: 0.28
});
const rheoBodyMat = new THREE.MeshBasicMaterial({
  color: 0xe9d5b7,
  toneMapped: true
});
const rheoPlateMat = new THREE.MeshBasicMaterial({
  color: 0xf7ecd7,
  toneMapped: true
});
const rheoInkMat = new THREE.MeshBasicMaterial({ color: 0x3b2d25 });
const rheoRedMat = new THREE.MeshBasicMaterial({ color: 0xb23a30 });

const body = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.200, 40), rheoBodyMat);
body.rotation.z = PI / 2;
body.position.set(0, 0.078, 0);
body.castShadow = true;
body.receiveShadow = true;
controllerGroup.add(body);

/* 两端黄铜端板 */
[-1, 1].forEach(function (side) {
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.012, 40), brassWarm);
  cap.rotation.z = PI / 2;
  cap.position.set(side * 0.1035, 0.078, 0);
  cap.castShadow = true;
  cap.receiveShadow = true;
  controllerGroup.add(cap);

  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.132, 0.040), brassDeep);
  plate.position.set(side * 0.116, 0.078, -0.026);
  plate.castShadow = true;
  plate.receiveShadow = true;
  controllerGroup.add(plate);

  /* 端面黄铜圆环：让水平圆柱的圆形截面能被看见。 */
  const endRing = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.0034, 8, 40), brassWarm);
  endRing.rotation.y = PI / 2;
  endRing.position.set(side * 0.1015, 0.078, 0);
  endRing.castShadow = true;
  controllerGroup.add(endRing);

  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.105), brassDeep);
  foot.position.set(side * 0.092, 0.006, 0.004);
  foot.castShadow = true;
  foot.receiveShadow = true;
  controllerGroup.add(foot);

  const post = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.036, 0.042), brassWarm);
  post.position.set(side * 0.108, 0.144, 0);
  post.castShadow = true;
  controllerGroup.add(post);
});

/* 上滑轨与下滑轨 */
const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.280, 16), brassWarm);
topRail.rotation.z = PI / 2;
topRail.position.set(0, 0.162, 0);
topRail.castShadow = true;
controllerGroup.add(topRail);

const bottomRail = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.268, 12), brassDeep);
bottomRail.rotation.z = PI / 2;
bottomRail.position.set(0, 0.029, 0.058);
bottomRail.castShadow = true;
controllerGroup.add(bottomRail);

[-1, 1].forEach(function (side) {
  const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.032, 10), brassDeep);
  hanger.rotation.z = PI / 2;
  hanger.position.set(side * 0.123, 0.045, 0.058);
  hanger.castShadow = true;
  controllerGroup.add(hanger);
});

/* 正面刻度窗：只有刻度线，不加文字、数字、型号或说明牌。 */
const plateFrame = new THREE.Mesh(new THREE.BoxGeometry(0.162, 0.078, 0.003), brassWarm);
plateFrame.position.set(0, 0.078, 0.0592);
plateFrame.castShadow = true;
controllerGroup.add(plateFrame);

const plateShape = roundedRectShape(0.154, 0.070, 0.010);
const facePlate = new THREE.Mesh(
  new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.0025,
    bevelEnabled: true,
    bevelSize: 0.0012,
    bevelThickness: 0.0010,
    bevelSegments: 2,
    steps: 1
  }),
  rheoPlateMat
);
facePlate.position.set(0, 0.078, 0.0600);
facePlate.receiveShadow = true;
controllerGroup.add(facePlate);

for (let i = 0; i < 13; i++) {
  const major = i === 0 || i === 6 || i === 12;
  const tick = new THREE.Mesh(
    new THREE.BoxGeometry(major ? 0.0020 : 0.0013, major ? 0.017 : 0.0105, 0.0010),
    rheoInkMat
  );
  tick.position.set(-0.060 + i * 0.010, 0.096, 0.0655);
  controllerGroup.add(tick);
}

/* 沿固定刻度面两端印刷“牢 / 圣”，位于滑块行程下方，不会被滑块遮挡。 */
function sealTexture(label) {
  return canvasTex(128, 128, function (g, w, h) {
    g.clearRect(0, 0, w, h);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '700 104px "Microsoft YaHei", "SimHei", sans-serif';
    g.fillStyle = '#3b2d25';
    g.fillText(label, w / 2, h / 2 + 4);
  }, { clamp: true });
}
[['牢', -0.058], ['圣', 0.058]].forEach(function (item) {
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.034, 0.034),
    new THREE.MeshBasicMaterial({
      map: sealTexture(item[0]),
      transparent: true,
      alphaTest: 0.12,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      toneMapped: true
    })
  );
  label.position.set(item[1], 0.071, 0.0665);
  label.renderOrder = 13;
  controllerGroup.add(label);
});

/* 滑块：沿上滑轨局部 X 移动。滚花用一圈细环表现，避免额外贴图。 */
const slider = new THREE.Group();
slider.position.set(0, 0.162, 0);
controllerGroup.add(slider);

const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.027, 0.032), brassWarm);
carriage.position.set(0, 0.0, 0.0);
carriage.castShadow = true;
carriage.receiveShadow = true;
slider.add(carriage);

const knobMat = brassWarm.clone();
knobMat.color = new THREE.Color(0xd4a85c);
knobMat.emissive = new THREE.Color(0x1a0c02);
knobMat.emissiveIntensity = 0.15;
const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.032, 24), knobMat);
knob.rotation.x = PI / 2;
knob.position.set(0, 0.001, 0.020);
knob.castShadow = true;
slider.add(knob);

/* 滚花侧面：沿 Z 的一圈细棱，比同心圆环更接近参考图的滚花旋钮。 */
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * TAU;
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.0013, 0.0030, 0.030), brassDeep);
  ridge.position.set(Math.cos(a) * 0.0188, 0.001 + Math.sin(a) * 0.0188, 0.020);
  ridge.rotation.z = a;
  slider.add(ridge);
}

const redPointer = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.027, 4), rheoRedMat);
redPointer.rotation.z = PI;
redPointer.position.set(0, -0.023, 0.033);
redPointer.castShadow = false;
slider.add(redPointer);

/* 不可见命中区域；外观不放大，只扩大鼠标/触摸的命中范围。 */
const hitMat = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.0,
  depthWrite: false,
  depthTest: false,
  color: 0xffffff
});
const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(0.380, 0.240, 0.220), hitMat);
hitMesh.position.set(0, 0.100, 0.0);
hitMesh.renderOrder = -10;
controllerGroup.add(hitMesh);

ANIM.controller = {
  group: controllerGroup,
  slider: slider,
  hit: hitMesh,
  knob: knob
};

contactShadow(scene, 0.400, 0.250, 0.20, -0.50, 0.16, 0.0045);

/* 灯光基准值：保持原有每盏灯的相对差异，只在控制时按比例衰减和染色。 */

/* 固定端接线柱：位于控制器左端、滑轨行程之外，不随滑块移动。 */
const terminal = new THREE.Mesh(new THREE.CylinderGeometry(0.0068, 0.0068, 0.026, 12), brassWarm);
terminal.position.set(0.132, 0.175, 0.030);
terminal.castShadow = true;
controllerGroup.add(terminal);

const terminalSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.0088, 0.0095, 0.017, 10), brassDeep);
terminalSleeve.position.set(0.132, 0.164, 0.030);
terminalSleeve.castShadow = true;
controllerGroup.add(terminalSleeve);

/* 从底座灯串左侧引出的低调尾线，沿桌面绕到控制器左端接线柱。
   走线在滑轨后方和左侧，不横穿滑块操作区，也不穿过底座。 */
const tailPoints = [
  new THREE.Vector3(0.058, 0.0740, -0.055),
  new THREE.Vector3(0.020, 0.0400, -0.070),
  new THREE.Vector3(-0.080, 0.0110, -0.050),
  new THREE.Vector3(-0.210, 0.0100, -0.015),
  new THREE.Vector3(-0.350, 0.0115, 0.035),
  new THREE.Vector3(-0.475, 0.0135, 0.075),
  new THREE.Vector3(-0.460, 0.0170, 0.105),
  new THREE.Vector3(-0.405, 0.0500, 0.125),
  new THREE.Vector3(-0.385, 0.1000, 0.120),
  new THREE.Vector3(-0.368, 0.1500, 0.135),
  new THREE.Vector3(-0.368, 0.1750, 0.190)
];
const tailCurve = new THREE.CatmullRomCurve3(tailPoints, false, 'catmullrom', 0.30);
const tailWire = new THREE.Mesh(
  new THREE.TubeGeometry(tailCurve, 96, 0.0026, 5, false),
  new THREE.MeshPhongMaterial({
    color: 0x5b3a24,
    specular: 0x9c7551,
    shininess: 34,
    emissive: 0x100603,
    emissiveIntensity: 0.18
  })
);
tailWire.castShadow = true;
tailWire.receiveShadow = true;
scene.add(tailWire);

const baseString = ANIM.baseString;

/* 尾线靠近桌面的可见段加入少量小灯，和底座灯串连续衔接。 */
[0.16, 0.36, 0.58].forEach(function (t, i) {
  const p = tailCurve.getPoint(t);
  const g = new THREE.Group();
  g.position.set(p.x, p.y + 0.002, p.z);

  const socket = new THREE.Mesh(baseString.socketGeo, MAT.champagneDark);
  socket.position.y = 0.0010;
  g.add(socket);

  const shell = new THREE.Mesh(baseString.shellGeo, baseString.shellMat);
  shell.position.y = 0.0070;
  shell.scale.set(1, 1.22, 1);
  shell.rotation.z = (i - 1) * 0.30;
  shell.renderOrder = 8;
  g.add(shell);

  const core = new THREE.Mesh(baseString.coreGeo, baseString.coreMat);
  core.position.y = 0.0066;
  core.renderOrder = 8;
  g.add(core);

  const glow = softGlow(scene, p.x, p.y + 0.008, p.z, 0.036, 0.20, 0xffc88a);
  glow.renderOrder = 10;
  g.userData.glow = glow;
  g.userData.glowBaseOpacity = glow.material.opacity;
  g.userData.glowBaseColor = glow.material.color.clone();

  scene.add(g);
  baseString.bulbs.push(g);
});


/* ---------------- 联动装饰光：底座承托 / 窗台 / 置物架 ---------------- */

const glowRadial = canvasTex(256, 256, function (g, w, h) {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, 'rgba(255,255,255,0.85)');
  gr.addColorStop(0.42, 'rgba(255,255,255,0.34)');
  gr.addColorStop(0.78, 'rgba(255,255,255,0.08)');
  gr.addColorStop(1, 'rgba(255,255,255,0.0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}, { clamp: true, linear: true });


const edgeWash = canvasTex(256, 64, function (g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(255,255,255,0.62)');
  gr.addColorStop(0.55, 'rgba(255,255,255,0.18)');
  gr.addColorStop(1, 'rgba(255,255,255,0.0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const side = g.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, 'rgba(255,255,255,0)');
  side.addColorStop(0.18, 'rgba(255,255,255,1)');
  side.addColorStop(0.82, 'rgba(255,255,255,1)');
  side.addColorStop(1, 'rgba(255,255,255,0)');
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = side;
  g.fillRect(0, 0, w, h);
}, { clamp: true, linear: true });

const washVertical = canvasTex(256, 160, function (g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(255,255,255,0.52)');
  gr.addColorStop(0.38, 'rgba(255,255,255,0.20)');
  gr.addColorStop(1, 'rgba(255,255,255,0.0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const side = g.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, 'rgba(255,255,255,0)');
  side.addColorStop(0.18, 'rgba(255,255,255,1)');
  side.addColorStop(0.82, 'rgba(255,255,255,1)');
  side.addColorStop(1, 'rgba(255,255,255,0)');
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = side;
  g.fillRect(0, 0, w, h);
}, { clamp: true, linear: true });

function makeDecorPlane(tex, w, h, x, y, z, rotX, opacity, order) {
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color: 0xffffff,
    transparent: true,
    opacity: opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: true,
    fog: false,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = rotX;
  mesh.renderOrder = order;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add(mesh);
  return mesh;
}

/* 底座下缘：桌面上的承托光斑，主要从底座外缘溢出。 */
const baseUnderGlow = makeDecorPlane(glowRadial, 1.64, 1.00, 0.55, 0.0035, 0.09, -PI / 2, 0.50, 3);


/* 底座前缘外溢光：贴在桌面上，避免底座完全遮住承托光。 */
const baseEdgeGlow = makeDecorPlane(edgeWash, 1.56, 0.26, 0.55, 0.0042, 0.37, -PI / 2, 0.28, 3);

/* 窗台下方：隐藏在窗台下的墙面间接光。 */
const sillWash = makeDecorPlane(washVertical, 1.35, 0.46, -0.77, 0.31, -1.635, 0, 0.44, 3);

/* 置物架下方：更克制的局部洗墙光。 */
const shelfWash = makeDecorPlane(washVertical, 1.05, 0.55, 1.72, 0.97, -1.635, 0, 0.36, 3);

/* 少量实际光源，让桌面、玻璃和墙面真正接色；不为每颗灯珠建灯。 */
const baseUnderLights = [
  new THREE.PointLight(0xffc88a, 2.40, 1.45, 2),
  new THREE.PointLight(0xffc88a, 1.00, 0.98, 2),
  new THREE.PointLight(0xffc88a, 1.00, 0.98, 2)
];
baseUnderLights[0].position.set(0.55, 0.026, 0.255);
baseUnderLights[1].position.set(0.13, 0.022, 0.10);
baseUnderLights[2].position.set(0.97, 0.022, 0.10);
baseUnderLights.forEach(function (l) {
  l.castShadow = false;
  scene.add(l);
});

const sillLight = new THREE.SpotLight(0xffc88a, 1.85, 1.50, 1.08, 0.95, 1.5);
sillLight.position.set(-0.77, 0.445, -1.50);
sillLight.target.position.set(-0.77, 0.23, -1.67);
sillLight.castShadow = false;
scene.add(sillLight);
scene.add(sillLight.target);

const shelfLight = new THREE.SpotLight(0xffc88a, 1.15, 1.20, 1.02, 0.95, 1.5);
shelfLight.position.set(1.72, 1.255, -1.47);
shelfLight.target.position.set(1.72, 0.98, -1.67);
shelfLight.castShadow = false;
scene.add(shelfLight);
scene.add(shelfLight.target);

ANIM.decorLights = {
  planes: [baseUnderGlow, baseEdgeGlow, sillWash, shelfWash],
  points: baseUnderLights,
  spots: [sillLight, shelfLight]
};
ANIM.decorLights.points.forEach(function (l) {
  l.userData.baseColor = l.color.clone();
  l.userData.baseIntensity = l.intensity;
});
ANIM.decorLights.spots.forEach(function (l) {
  l.userData.baseColor = l.color.clone();
  l.userData.baseIntensity = l.intensity;
});
ANIM.decorLights.planes.forEach(function (p) {
  p.userData.baseColor = p.material.color.clone();
  p.userData.baseOpacity = p.material.opacity;
});

const L0 = {
  rimColor: ANIM.rimLight.color.clone(),
  rimIntensity: ANIM.rimLight.intensity,
  fillColor: ANIM.wheelFill.color.clone(),
  fillIntensity: ANIM.wheelFill.intensity,
  backColor: ANIM.backLight.color.clone(),
  backIntensity: ANIM.backLight.intensity,
  coolColor: ANIM.coolGlass.color.clone(),
  coolIntensity: ANIM.coolGlass.intensity,
  edgeColor: ANIM.coolEdge.color.clone(),
  edgeIntensity: ANIM.coolEdge.intensity,
  rimCatchColor: ANIM.rimCatchMat.color.clone(),
  rimCatchOpacity: ANIM.rimCatchMat.opacity,
  baseGlowColor: ANIM.baseGlow.material.color.clone(),
  baseGlowOpacity: ANIM.baseGlow.material.opacity,
  shellColor: baseString.shellMat.color.clone(),
  shellEmissive: baseString.shellMat.emissive.clone(),
  shellOpacity: baseString.shellMat.opacity,
  coreColor: baseString.coreMat.color.clone(),
  poolColor: baseString.poolMat.color.clone(),
  poolOpacity: baseString.poolMat.opacity,
  stringFillColor: baseString.fill.color.clone(),
  stringFillIntensity: baseString.fill.intensity
};

const NEUTRAL = new THREE.Color(0xffc88a);
const COOL = new THREE.Color(0x2fb6ff);
const VIOLET = new THREE.Color(0xc25cff);

function tinted(base, target, amount) {
  return base.clone().lerp(target, amount);
}

/* 统一控制灯光。t=0 冰蓝，t=0.5 暖白，t=1 淡紫；两端亮度为 65%。 */
function applyControlLights(t) {
  const d = Math.abs(t * 2 - 1);
  const target = t < 0.5 ? COOL : VIOLET;
  const tint = d * 0.85;
  const bright = 1.0 - 0.55 * d;
  const pulse = 0.985 + 0.015 * Math.sin(t * 5.0);

  CONTROL.bright = bright;
  CONTROL.color.copy(NEUTRAL).lerp(target, d);

  ANIM.rimLight.color.copy(tinted(L0.rimColor, target, tint));
  ANIM.rimLight.intensity = L0.rimIntensity * bright * pulse;
  ANIM.wheelFill.color.copy(tinted(L0.fillColor, target, tint));
  ANIM.wheelFill.intensity = L0.fillIntensity * bright;
  ANIM.backLight.color.copy(tinted(L0.backColor, target, tint));
  ANIM.backLight.intensity = L0.backIntensity * bright;
  ANIM.coolGlass.color.copy(tinted(L0.coolColor, target, tint));
  ANIM.coolGlass.intensity = L0.coolIntensity * bright;
  ANIM.coolEdge.color.copy(tinted(L0.edgeColor, target, tint));
  ANIM.coolEdge.intensity = L0.edgeIntensity * bright;

  ANIM.rimCatchMat.color.copy(tinted(L0.rimCatchColor, target, tint));
  ANIM.rimCatchMat.opacity = L0.rimCatchOpacity * bright;

  ANIM.baseGlow.material.color.copy(tinted(L0.baseGlowColor, target, tint));
  ANIM.baseGlow.material.opacity = L0.baseGlowOpacity * bright;

  const bs = baseString;
  bs.shellMat.color.copy(tinted(L0.shellColor, target, tint));
  bs.shellMat.emissive.copy(tinted(L0.shellEmissive, target, tint * 0.8));
  bs.shellMat.opacity = L0.shellOpacity * (0.72 + 0.28 * bright);
  bs.coreMat.color.copy(tinted(L0.coreColor, target, tint * 0.90));
  bs.poolMat.color.copy(tinted(L0.poolColor, target, tint * 0.75));
  bs.poolMat.opacity = L0.poolOpacity * bright;
  bs.fill.color.copy(tinted(L0.stringFillColor, target, tint));
  bs.fill.intensity = L0.stringFillIntensity * bright;

  const decor = ANIM.decorLights;
  decor.points.forEach(function (l) {
    l.color.copy(tinted(l.userData.baseColor, target, tint));
    l.intensity = l.userData.baseIntensity * bright;
  });
  decor.spots.forEach(function (l) {
    l.color.copy(tinted(l.userData.baseColor, target, tint));
    l.intensity = l.userData.baseIntensity * bright;
  });
  decor.planes.forEach(function (p) {
    p.material.color.copy(tinted(p.userData.baseColor, target, tint));
    p.material.opacity = p.userData.baseOpacity * (0.35 + 0.65 * bright);
  });

  bs.bulbs.forEach(function (g) {
    const glow = g.userData.glow;
    if (!glow) return;
    glow.material.color.copy(tinted(g.userData.glowBaseColor, target, tint * 0.90));
    glow.material.opacity = g.userData.glowBaseOpacity * bright;
  });
}

/* 鼠标/触摸：把屏幕射线落到不可见命中体，再转换到滑轨局部 X。 */
const controlRay = new THREE.Raycaster();
const controlNdc = new THREE.Vector2();

function controlHit(event) {
  const rect = canvas.getBoundingClientRect();
  controlNdc.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  controlNdc.y = -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
  controlRay.setFromCamera(controlNdc, camera);
  return controlRay.intersectObject(hitMesh, false)[0] || null;
}

function updateControlFromPointer(event) {
  const hit = controlHit(event);
  if (!hit) return false;

  /* 命中体有厚度，直接取命中点会因透视产生偏移。
     再把同一条鼠标射线投到滑块中心的竖直平面上，换算成滑轨局部 X。 */
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(controllerGroup.quaternion);
  const center = controllerGroup.localToWorld(new THREE.Vector3(0, 0.162, 0.020));
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, center);
  const world = new THREE.Vector3();
  let point = hit.point;
  if (controlRay.ray.intersectPlane(plane, world)) point = world;

  const local = controllerGroup.worldToLocal(point.clone());
  CONTROL.target = clamp((local.x + CONTROL.railHalf) / (CONTROL.railHalf * 2), 0, 1);
  return true;
}

function updateControlCursor() {
  canvas.style.cursor = (CONTROL.hover || CONTROL.dragging) ? 'ew-resize' : '';
}

canvas.addEventListener('pointermove', function (event) {
  if (CONTROL.dragging) {
    updateControlFromPointer(event);
    return;
  }
  if (controlHit(event)) {
    CONTROL.hover = true;
    updateControlFromPointer(event);
  } else {
    CONTROL.hover = false;
  }
  updateControlCursor();
}, { passive: true });

canvas.addEventListener('pointerdown', function (event) {
  if (!controlHit(event)) return;
  CONTROL.dragging = true;
  CONTROL.hover = true;
  updateControlFromPointer(event);
  try { canvas.setPointerCapture(event.pointerId); } catch (e) {}
  canvas.style.touchAction = 'none';
  updateControlCursor();
  if (event.pointerType === 'touch') event.preventDefault();
}, { passive: false });

function endControlDrag() {
  if (!CONTROL.dragging) return;
  CONTROL.dragging = false;
  canvas.style.touchAction = '';
  updateControlCursor();
}
window.addEventListener('pointerup', endControlDrag, { passive: true });
window.addEventListener('pointercancel', endControlDrag, { passive: true });

canvas.addEventListener('pointerleave', function () {
  if (CONTROL.dragging) return;
  CONTROL.hover = false;
  updateControlCursor();
}, { passive: true });

/* 平滑过渡与统一更新：滑块、速度倍率、灯光都只读这一份状态。 */
CONTROL.update = function (t, dt) {
  const k = 1 - Math.exp(-12 * Math.max(0.001, dt));
  CONTROL.display += (CONTROL.target - CONTROL.display) * k;
  if (Math.abs(CONTROL.target - CONTROL.display) < 0.0004) CONTROL.display = CONTROL.target;

  CONTROL.speed = 0.8 + 0.4 * CONTROL.display;
  slider.position.x = -CONTROL.railHalf + CONTROL.railHalf * 2 * CONTROL.display;

  knobMat.emissive.setHex(CONTROL.hover || CONTROL.dragging ? 0x2a1604 : 0x000000);
  applyControlLights(CONTROL.display);
};

CONTROL.setT = function (value) {
  CONTROL.target = clamp(value, 0, 1);
};

/* Wallpaper Engine 用户属性：没有鼠标输入时，也可在编辑器里用 Balance 滑块
   控制同一套速度与灯光。属性到达时只改目标值，不重置动画相位。 */
window.__setWallpaperBalance = function (value) {
  const v = parseFloat(value);
  if (Number.isFinite(v)) CONTROL.target = clamp(v, 0, 1);
};
window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {
    if (properties && properties.balance && properties.balance.value !== undefined) {
      window.__setWallpaperBalance(properties.balance.value);
    }
  }
};

CONTROL.railScreen = function (value) {
  const p = new THREE.Vector3(-CONTROL.railHalf + CONTROL.railHalf * 2 * value, 0.162, 0.020);
  controllerGroup.localToWorld(p);
  p.project(camera);
  return { x: (p.x * 0.5 + 0.5) * window.innerWidth, y: (-p.y * 0.5 + 0.5) * window.innerHeight };
};

applyControlLights(CONTROL.display);
console.log('rheostat controller ready');
