/* =========================================================================
===============
   7. 动画 / 镜头 / 主循环
   ========================================================================= */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

window.addEventListener('pointermove', function (e) {
  pointer.tx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
  pointer.ty = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
}, { passive: true });
window.addEventListener('pointerleave', function () {
  pointer.tx = 0; pointer.ty = 0;
}, { passive: true });

function updateCamera(t, dt) {
  pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 1.8);
  pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 1.8);

  const driftX = Math.sin(t * 0.055) * 0.036 + Math.sin(t * 0.017 + 1.7) * 0.018;
  const driftY = Math.sin(t * 0.081 + 0.4) * 0.014;
  const driftZ = Math.sin(t * 0.041) * 0.030;

  /* 操作变阻器时锁住鼠标视差，避免调滑块同时带动镜头。 */
  const uiLock = (ANIM.control && (ANIM.control.hover || ANIM.control.dragging)) ? 0 : 1;
  camera.position.x = CAM_BASE.x + driftX + pointer.x * 0.055 * uiLock;
  camera.position.y = CAM_BASE.y + driftY - pointer.y * 0.028 * uiLock;
  camera.position.z = CAM_BASE.z + driftZ;
  camera.lookAt(
    CAM_TARGET.x + pointer.x * 0.018 * uiLock,
    CAM_TARGET.y + Math.sin(t * 0.07) * 0.004 - pointer.y * 0.012 * uiLock,
    CAM_TARGET.z
  );
}

let RECORD_MODE = false;
let RECORD_LAST_T = 0;

function updateWalk(t, dt) {
  const W = ANIM.walk;
  if (!W) return;

  /* 连续累积的动作时间。倍率变化只改变增量，不重新计算总相位，
     所以滑块移动时人物和轮体都不会跳位。 */
  const speed = ANIM.control ? ANIM.control.speed : 1.0;
  if (FIXED_T !== null) {
    W.animTime = t * W.playbackRate * speed;
  } else if (!RECORD_MODE) {
    W.animTime += Math.max(0, dt) * W.playbackRate * speed;
  }

  const mediaTime = W.animTime;
  const radPerSecond = W.distance / (W.cycle * W.radius) * W.speedScale;
  W.mediaTime = mediaTime;
  W.speedMultiplier = speed;

  if (ANIM.character && ANIM.character.setFrame) {
    ANIM.character.setFrame(mediaTime);
  }

  W.angle = W.baseAngle - mediaTime * radPerSecond;

  /* 人物朝右，跑道底部接触点向左运动 → 轮体绕 Z 负向旋转。 */
  ANIM.wheelSpin.rotation.z = W.angle;
}

function updateScene(t, dt) {
  // 滑块、速度倍率、灯光共用一份控制状态。
  if (ANIM.control && ANIM.control.update) ANIM.control.update(t, dt);

  // 人物帧与玻璃滚筒共用连续累积的 mediaTime；不再各自累计时间。
  updateWalk(t, dt);

  // 真实时间：小时高亮 + 分钟光点（固定钟面坐标，不随轮子旋转）
  if (ANIM.clockUpdate) ANIM.clockUpdate(false);

  // 当前小时数字与分钟光点的呼吸
  if (ANIM.clock) {
    const pulse = 0.90 + 0.10 * Math.sin(t * 1.7);
    ANIM.clock.hours.forEach(function (e) {
      if (e.glow.visible) e.glow.material.opacity = 0.28 * pulse;
    });
    if (ANIM.clock.dotGlow) {
      ANIM.clock.dotGlow.material.opacity = 0.60 + 0.06 * Math.sin(t * 2.1);
      ANIM.clock.dotGlow.scale.setScalar(0.070 * (0.96 + 0.04 * pulse));
    }
  }

  // 人物只保留素材本身的步态起伏，不再叠加人为 bob / sway。
  const C = ANIM.character;
  if (C) {
    C.root.position.y = C.baseY;
    C.root.rotation.z = 0;
  }

  // 蒸汽
  ANIM.steam.forEach(function (s) {
    const life = (t * 0.105 + s.phase) % 1.0;
    const rise = life * 0.38;
    const wob = Math.sin(life * 7.0 + t * 1.2 + s.phase * 8.0);
    s.sprite.position.x = s.x0 + wob * 0.022 * (0.4 + life);
    s.sprite.position.y = 0.17 + rise;
    s.sprite.position.z = s.z0 + Math.cos(life * 5.0 + s.phase * 6.0) * 0.018;
    const sc = 0.12 + life * 0.23;
    s.sprite.scale.set(sc, sc * 1.15, 1);
    s.sprite.material.opacity = Math.sin(life * PI) * 0.15;
    s.sprite.material.rotation = Math.sin(t * 0.5 + s.phase * 9.0) * 0.4;
  });

  // 尘埃
  if (ANIM.dust) {
    const arr = ANIM.dust.points.geometry.attributes.position.array;
    for (let i = 0; i < ANIM.dust.data.length; i++) {
      const d = ANIM.dust.data[i];
      d.y += d.sp * dt;
      d.x += Math.sin(t * 0.35 + d.ph) * d.sw * dt;
      d.z += Math.cos(t * 0.28 + d.ph * 1.3) * d.sw * 0.6 * dt;
      if (d.y > 1.75) { d.y = 0.12; }
      if (d.x > 2.2) d.x = -1.8;
      if (d.x < -1.9) d.x = 2.1;
      arr[i * 3] = d.x; arr[i * 3 + 1] = d.y; arr[i * 3 + 2] = d.z;
    }
    ANIM.dust.points.geometry.attributes.position.needsUpdate = true;
  }

  // 窗帘
  ANIM.curtain.forEach(function (c) {
    const pos = c.mesh.geometry.attributes.position;
    const base = c.base;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const ty = (by + c.height / 2) / c.height;
      const fold = Math.sin((bx / c.width) * PI * 6.0 + c.phase) * 0.030;
      const sway = Math.sin(t * 0.85 + c.phase + ty * 1.8) * 0.010 * (0.35 + ty * 0.65);
      pos.setZ(i, bz + fold * 0.15 + sway);
    }
    pos.needsUpdate = true;
    // 只做低频法线更新，保持柔和的卡通光
    if (Math.floor(t * 24) % 3 === 0) c.mesh.geometry.computeVertexNormals();
  });

  // 植物
  ANIM.leaves.forEach(function (l) {
    l.group.rotation.z = l.baseZ + Math.sin(t * 0.8 + l.phase) * l.sway;
    l.group.rotation.x = Math.sin(t * 0.53 + l.phase * 1.4) * l.sway * 0.7;
  });

  // 灯串呼吸
  ANIM.bulbs.forEach(function (b) {
    const f = 0.82 + 0.18 * Math.sin(t * 1.9 + b.phase) + 0.05 * Math.sin(t * 7.3 + b.phase * 3.0);
    b.glow.material.opacity = 0.26 * f;
    b.bulb.material.color.copy(MAT.bulb.color).multiplyScalar(0.88 + 0.12 * f);
    if (b.glow.userData.base) b.glow.scale.setScalar(b.glow.userData.base.x * (0.94 + 0.06 * f));
  });

  // 窗外散景
  ANIM.bokeh.forEach(function (s) {
    const ph = s.userData.phase;
    s.position.x = s.userData.base.x + Math.sin(t * 0.12 + ph) * 0.022;
    s.position.y = s.userData.base.y + Math.sin(t * 0.09 + ph * 1.7) * 0.018;
  });

  // 台灯与烛光
  if (ANIM.lamp) {
    const flick = 0.985 + Math.sin(t * 6.9) * 0.006 + Math.sin(t * 13.7) * 0.004 + Math.sin(t * 1.7) * 0.005;
    ANIM.lamp.spot.intensity = ANIM.lamp.baseIntensity * flick;
    ANIM.lamp.point.intensity = ANIM.lamp.basePoint * flick;
    if (ANIM.bulbGlow) ANIM.bulbGlow.scale.setScalar(ANIM.bulbGlow.userData.base.x * (0.985 + 0.015 * flick));
  }
  if (ANIM.candleLight) {
    ANIM.candleLight.intensity = 0.30 + Math.sin(t * 8.3) * 0.03 + Math.sin(t * 15.1) * 0.02;
  }
  if (ANIM.flame) {
    const fs = 0.92 + Math.sin(t * 9.1) * 0.08;
    ANIM.flame.flame.scale.set(0.62 * fs, 1.9 * fs, 0.62 * fs);
    ANIM.flame.glow.material.opacity = 0.35 + 0.08 * Math.sin(t * 8.3);
  }

  finalMat.uniforms.uTime.value = t;
}

/* ------------------------------- 主循环 --------------------------------- */
let startTime = performance.now();
let lastTime = performance.now();
let running = true;

function frame(now) {
  if (!running || RECORD_MODE) return;
  const rawDt = (now - lastTime) / 1000;
  lastTime = now;
  let dt = Math.min(0.05, Math.max(0.0, rawDt));
  if (FIXED_T !== null) dt = 0.0;
  const t = FIXED_T !== null ? FIXED_T : (now - startTime) / 1000;

  updateScene(t, dt);
  updateCamera(t, dt);
  renderFrame();

  requestAnimationFrame(frame);
}

function boot() {
  if (PARAMS.get('edge') === '0') finalMat.uniforms.uEdge.value = 0.0;
  if (PARAMS.get('bloom') === '0') finalMat.uniforms.uBloom.value = 0.0;
  resizeTargets();
  updateCamera(0, 0.016);
  updateScene(FIXED_T !== null ? FIXED_T : 0.0, 0.016);
  renderFrame();
  window.__WHEEL_READY = true;
  window.__WHEEL = {
    renderer: renderer,
    scene: scene,
    camera: camera,
    anim: ANIM,
    settings: {
      size: function () { return { W: W, H: H, cssW: CSSW, cssH: CSSH, ss: SS }; },
      drawcalls: function () { return renderer.info.render.calls; },
      triangles: function () { return renderer.info.render.triangles; }
    }
  };
  requestAnimationFrame(frame);
}

let resizeTimer = 0;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    resizeTargets();
    updateCamera(performance.now() / 1000, 0.016);
    renderFrame();
  }, 120);
});

document.addEventListener('visibilitychange', function () {
  if (document.hidden) { running = false; }
  else {
    if (!running) {
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(frame);
    }
  }
});

/* --------------------------- 氛围纯音乐 --------------------------- */
const ambience = new Audio('assets/ambience.mp3');
window.__ambience = ambience;
ambience.loop = true;
ambience.preload = 'auto';
ambience.volume = 0.14;

let ambienceStarted = false;
function startAmbience() {
  if (ambienceStarted) return;
  ambienceStarted = true;
  if (ambience.paused) {
    const p = ambience.play();
    if (p && p.catch) p.catch(function () {});
  }
}
window.addEventListener('pointerdown', startAmbience, { passive: true });
window.addEventListener('keydown', startAmbience, { passive: true });
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    ambience.pause();
  } else if (ambienceStarted) {
    const p = ambience.play();
    if (p && p.catch) p.catch(function () {});
  }
});
window.addEventListener('load', startAmbience, { once: true });
setTimeout(startAmbience, 1200);

/* 录制 API：固定 60 秒演示，不回放总时间×当前倍率，避免相位跳变。 */
window.__recordFrame = function (time, controlValue) {
  const t = Math.max(0, time);
  const value = Math.max(0, Math.min(1, controlValue));
  const W = ANIM.walk;
  const C = ANIM.control;
  if (!RECORD_MODE) {
    RECORD_MODE = true;
    RECORD_LAST_T = 0;
    W.animTime = 0;
  }
  C.target = value;
  C.display = value;
  C.speed = 0.8 + 0.4 * value;
  if (t > RECORD_LAST_T) {
    W.animTime += (t - RECORD_LAST_T) * W.playbackRate * C.speed;
  }
  RECORD_LAST_T = t;
  updateScene(t, 0);
  updateCamera(t, 0);
  renderFrame();
  return true;
};

boot();

