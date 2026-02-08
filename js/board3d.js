// ============================================================
// board3d.js — 3D Engine: scene, camera, orbit, model switcher
// ============================================================

(function () {
    'use strict';

    const container = document.getElementById('board3dContainer');
    const canvas = document.getElementById('board3dCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // ==================== SCENE ====================

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ==================== LIGHTS ====================

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);
    scene.add(new THREE.PointLight(0xffaa44, 0.4, 10).translateY(-2).translateZ(3));

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 14),
        new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // ==================== ORBIT CONTROLS ====================

    let isDragging = false, prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0, phi: Math.PI / 4, radius: 6 };
    let autoRotate = false;

    function updateCamera() {
        camera.position.set(
            spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
            spherical.radius * Math.cos(spherical.phi),
            spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
        );
        camera.lookAt(0, 0, 0);
    }

    canvas.addEventListener('pointerdown', e => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
        if (!isDragging) return;
        spherical.theta -= (e.clientX - prevMouse.x) * 0.008;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1,
            spherical.phi + (e.clientY - prevMouse.y) * 0.008));
        prevMouse = { x: e.clientX, y: e.clientY };
        updateCamera();
    });
    canvas.addEventListener('pointerup', () => isDragging = false);
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        spherical.radius = Math.max(2, Math.min(15, spherical.radius + e.deltaY * 0.005));
        updateCamera();
    }, { passive: false });

    let touchDist = 0;
    canvas.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchDist = Math.hypot(dx, dy);
        }
    });
    canvas.addEventListener('touchmove', e => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const d = Math.hypot(dx, dy);
            spherical.radius = Math.max(2, Math.min(15, spherical.radius - (d - touchDist) * 0.02));
            touchDist = d;
            updateCamera();
        }
    });
    updateCamera();

    // ==================== LIVE DATA STATE ====================

    const D = {
        sync: true, ledState: Array.from({ length: 5 }, () => Array(5).fill(false)),
        ledFW: false, accel: { x: 0, y: 0, z: 0 }, temp: 22,
        btnA: false, btnB: false, touchP0: false, touchP1: false, touchP2: false,
        logo: false, compass: 0, servo1: 90, servo2: 90, light: 128, sound: 0
    };

    window.board3dUpdate = function (type, val) {
        if (!D.sync) return;
        switch (type) {
            case 'led': D.ledState = val; break;
            case 'leds': D.ledState = val; D.ledFW = true; break;
            case 'accel': D.accel = val; break;
            case 'temp': D.temp = val; break;
            case 'btnA': D.btnA = val; break;
            case 'btnB': D.btnB = val; break;
            case 'touchP0': D.touchP0 = val; break;
            case 'touchP1': D.touchP1 = val; break;
            case 'touchP2': D.touchP2 = val; break;
            case 'logo': D.logo = val; break;
            case 'compass': D.compass = val; break;
            case 'servo1': D.servo1 = val; break;
            case 'servo2': D.servo2 = val; break;
            case 'light': D.light = val; break;
            case 'sound': D.sound = val; break;
        }
    };

    // Poll LED state fallback
    setInterval(() => {
        if (D.ledFW) return;
        if (window.ledState) {
            for (let r = 0; r < 5; r++)
                for (let c = 0; c < 5; c++)
                    D.ledState[r][c] = window.ledState[r]?.[c] || false;
        }
    }, 100);

    // ==================== MODEL REGISTRY ====================

    window.board3dModels = window.board3dModels || {};
    let activeName = '', activeModel = null;

    function switchModel(name) {
        if (name === activeName && activeModel) return;
        if (activeModel?.destroy) activeModel.destroy(scene);

        const M = window.board3dModels[name];
        if (!M) return;

        activeModel = M;
        activeName = name;
        if (M.create) M.create(scene, THREE);

        if (M.camera) {
            spherical = { theta: M.camera.theta || 0, phi: M.camera.phi || Math.PI / 4, radius: M.camera.radius || 6 };
            updateCamera();
        }
        scene.background = M.background ? new THREE.Color(M.background) : null;
        ground.position.y = M.groundY ?? -1.5;
        try { localStorage.setItem('mb_board3d_model', name); } catch {}
    }

    // ==================== RESIZE ====================

    function onResize() {
        const r = container.getBoundingClientRect();
        const w = r.width, h = r.height || 450;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    const tp = container.closest('.tab-page');
    if (tp) new MutationObserver(() => {
        if (tp.classList.contains('active')) setTimeout(onResize, 50);
    }).observe(tp, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', onResize);
    setTimeout(onResize, 100);

    // ==================== ANIMATION ====================

    function animate() {
        requestAnimationFrame(animate);
        if (autoRotate && !isDragging) { spherical.theta += 0.005; updateCamera(); }

        const ai = document.getElementById('board3dAccelInfo');
        if (ai) ai.textContent = 'Accel: ' + D.accel.x + ',' + D.accel.y + ',' + D.accel.z;
        const ti = document.getElementById('board3dTempInfo');
        if (ti) ti.textContent = 'Temp: ' + D.temp + '\u00B0C';

        if (activeModel?.update) activeModel.update(D, scene, THREE);
        renderer.render(scene, camera);
    }

    // ==================== UI ====================

    const sel = document.getElementById('board3dModel');

    document.getElementById('board3dResetView')?.addEventListener('click', () => {
        const c = activeModel?.camera || {};
        spherical = { theta: c.theta || 0, phi: c.phi || Math.PI / 4, radius: c.radius || 6 };
        updateCamera();
    });
    document.getElementById('board3dAutoRotate')?.addEventListener('click', function () {
        autoRotate = !autoRotate;
        this.classList.toggle('active', autoRotate);
        this.textContent = autoRotate ? '🔁 Stop' : '🔁 Auto Rotate';
    });
    document.getElementById('board3dLiveSync')?.addEventListener('click', function () {
        D.sync = !D.sync;
        this.classList.toggle('active', D.sync);
        this.textContent = D.sync ? '📡 Live Sync' : '📡 Sync Off';
    });
    if (sel) sel.addEventListener('change', () => switchModel(sel.value));

    // ==================== INIT ====================

    setTimeout(() => {
        let saved = '';
        try { saved = localStorage.getItem('mb_board3d_model') || ''; } catch {}
        const init = (saved && window.board3dModels[saved]) ? saved : 'microbit';
        if (sel) sel.value = init;
        switchModel(init);
        animate();
    }, 60);

})();
