// ============================================================
// board3d.js — Interactive 3D micro:bit V2 with live sensor data
// ============================================================

(function () {
    'use strict';

    const container = document.getElementById('board3dContainer');
    const canvas = document.getElementById('board3dCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // ==================== SCENE SETUP ====================

    const scene = new THREE.Scene();
    scene.background = null; // transparent

    const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ==================== LIGHTS ====================

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffaa44, 0.4, 10);
    rimLight.position.set(0, -2, 3);
    scene.add(rimLight);

    // ==================== MATERIALS ====================

    const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.7,
        metalness: 0.1
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4a017,
        roughness: 0.3,
        metalness: 0.8
    });

    const chipMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.5,
        metalness: 0.3
    });

    const btnBlackMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.6,
        metalness: 0.2
    });

    const ledOffMat = new THREE.MeshStandardMaterial({
        color: 0x330000,
        roughness: 0.5,
        metalness: 0.1
    });

    const ledOnMat = new THREE.MeshStandardMaterial({
        color: 0xff2200,
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0xff2200,
        emissiveIntensity: 0.8
    });

    const usbMat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.4,
        metalness: 0.7
    });

    const silkMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.8,
        metalness: 0
    });

    const touchGlowMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0xffd700,
        emissiveIntensity: 0
    });

    const pinGlowMats = {
        '0': new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6, emissive: 0xffd700, emissiveIntensity: 0 }),
        '1': new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6, emissive: 0xffd700, emissiveIntensity: 0 }),
        '2': new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6, emissive: 0xffd700, emissiveIntensity: 0 })
    };

    const btnPressedMat = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.5,
        metalness: 0.3,
        emissive: 0x22cc55,
        emissiveIntensity: 0.5
    });

    // ==================== BUILD MICRO:BIT ====================

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Board dimensions (approximate real proportions in cm-ish units)
    const BW = 3.2;  // width
    const BH = 2.6;  // height
    const BD = 0.12; // thickness

    // --- PCB Board (rounded rectangle via shape) ---
    const boardShape = new THREE.Shape();
    const br = 0.25; // corner radius
    boardShape.moveTo(-BW / 2 + br, -BH / 2);
    boardShape.lineTo(BW / 2 - br, -BH / 2);
    boardShape.quadraticCurveTo(BW / 2, -BH / 2, BW / 2, -BH / 2 + br);
    boardShape.lineTo(BW / 2, BH / 2 - br);
    boardShape.quadraticCurveTo(BW / 2, BH / 2, BW / 2 - br, BH / 2);
    boardShape.lineTo(-BW / 2 + br, BH / 2);
    boardShape.quadraticCurveTo(-BW / 2, BH / 2, -BW / 2, BH / 2 - br);
    boardShape.lineTo(-BW / 2, -BH / 2 + br);
    boardShape.quadraticCurveTo(-BW / 2, -BH / 2, -BW / 2 + br, -BH / 2);

    const boardGeo = new THREE.ExtrudeGeometry(boardShape, {
        depth: BD,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 3
    });
    boardGeo.center();
    const board = new THREE.Mesh(boardGeo, pcbMat);
    board.rotation.x = -Math.PI / 2;
    board.castShadow = true;
    board.receiveShadow = true;
    boardGroup.add(board);

    // --- Edge connector strip (gold bottom) ---
    const connGeo = new THREE.BoxGeometry(BW * 0.85, 0.04, 0.35);
    const connector = new THREE.Mesh(connGeo, goldMat);
    connector.position.set(0, -BD / 2 - 0.01, BH / 2 - 0.15);
    boardGroup.add(connector);

    // --- Pin holes (0, 1, 2, 3V, GND) ---
    const pinPositions = [
        { x: -1.2, label: '0' },
        { x: -0.5, label: '1' },
        { x: 0.5, label: '2' },
        { x: 1.0, label: '3V' },
        { x: 1.35, label: 'GND' }
    ];

    const pinRings = {};
    pinPositions.forEach(p => {
        // Gold ring
        const ringGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
        const ring = new THREE.Mesh(ringGeo, goldMat);
        ring.position.set(p.x, BD / 2 + 0.02, BH / 2 - 0.15);
        ring.rotation.x = Math.PI / 2;
        boardGroup.add(ring);

        // Hole
        const holeGeo = new THREE.CylinderGeometry(0.08, 0.08, BD + 0.06, 12);
        const hole = new THREE.Mesh(holeGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
        hole.position.set(p.x, 0, BH / 2 - 0.15);
        boardGroup.add(hole);

        pinRings[p.label] = ring;
    });

    // --- 5x5 LED Matrix ---
    const leds = [];
    const ledSpacing = 0.32;
    const ledStartX = -ledSpacing * 2;
    const ledStartZ = -ledSpacing * 2 - 0.15;

    for (let row = 0; row < 5; row++) {
        leds[row] = [];
        for (let col = 0; col < 5; col++) {
            const ledGeo = new THREE.BoxGeometry(0.18, 0.06, 0.18);
            const led = new THREE.Mesh(ledGeo, ledOffMat.clone());
            led.position.set(
                ledStartX + col * ledSpacing,
                BD / 2 + 0.03,
                ledStartZ + row * ledSpacing
            );
            led.castShadow = true;
            boardGroup.add(led);
            leds[row][col] = led;
        }
    }

    // --- LED glow planes (bloom effect) ---
    const ledGlows = [];
    for (let row = 0; row < 5; row++) {
        ledGlows[row] = [];
        for (let col = 0; col < 5; col++) {
            const glowGeo = new THREE.PlaneGeometry(0.25, 0.25);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xff2200,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.copy(leds[row][col].position);
            glow.position.y += 0.04;
            glow.rotation.x = -Math.PI / 2;
            boardGroup.add(glow);
            ledGlows[row][col] = glow;
        }
    }

    // --- Button A (left) ---
    const btnGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16);
    const buttonA = new THREE.Mesh(btnGeo, btnBlackMat.clone());
    buttonA.position.set(-1.35, BD / 2 + 0.04, -0.15);
    boardGroup.add(buttonA);

    // Button A label
    const btnALabelGeo = new THREE.CircleGeometry(0.06, 12);
    const btnALabel = new THREE.Mesh(btnALabelGeo, silkMat);
    btnALabel.position.set(-1.35, BD / 2 + 0.09, -0.15);
    btnALabel.rotation.x = -Math.PI / 2;
    boardGroup.add(btnALabel);

    // --- Button B (right) ---
    const buttonB = new THREE.Mesh(btnGeo, btnBlackMat.clone());
    buttonB.position.set(1.35, BD / 2 + 0.04, -0.15);
    boardGroup.add(buttonB);

    const btnBLabel = new THREE.Mesh(btnALabelGeo, silkMat);
    btnBLabel.position.set(1.35, BD / 2 + 0.09, -0.15);
    btnBLabel.rotation.x = -Math.PI / 2;
    boardGroup.add(btnBLabel);

    // --- Processor chip (center, on PCB surface) ---
    const procGeo = new THREE.BoxGeometry(0.5, 0.06, 0.5);
    const processor = new THREE.Mesh(procGeo, chipMat);
    processor.position.set(0, BD / 2 + 0.03, 0.65);
    boardGroup.add(processor);

    // --- Accelerometer/compass chip (small) ---
    const sensorChipGeo = new THREE.BoxGeometry(0.25, 0.04, 0.25);
    const sensorChip = new THREE.Mesh(sensorChipGeo, chipMat);
    sensorChip.position.set(0.7, BD / 2 + 0.02, 0.65);
    boardGroup.add(sensorChip);

    // --- USB port (top edge) ---
    const usbGeo = new THREE.BoxGeometry(0.5, 0.15, 0.25);
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(0, BD / 2 + 0.06, -BH / 2 + 0.05);
    boardGroup.add(usb);

    // --- Battery connector (top-right, back) ---
    const batGeo = new THREE.BoxGeometry(0.4, 0.2, 0.15);
    const battery = new THREE.Mesh(batGeo, new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, metalness: 0.3 }));
    battery.position.set(0.8, -BD / 2 - 0.08, -BH / 2 + 0.15);
    boardGroup.add(battery);

    // --- Speaker grille (back, V2) ---
    for (let i = 0; i < 5; i++) {
        const slotGeo = new THREE.BoxGeometry(0.35, 0.02, 0.04);
        const slot = new THREE.Mesh(slotGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
        slot.position.set(-0.6, -BD / 2 - 0.01, 0.3 + i * 0.08);
        boardGroup.add(slot);
    }

    // --- Logo touch area (gold circle, front) ---
    const logoGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
    const logo = new THREE.Mesh(logoGeo, touchGlowMat.clone());
    logo.position.set(0, BD / 2 + 0.02, 0.85);
    boardGroup.add(logo);

    // --- Bluetooth antenna area (subtle rectangle) ---
    const antGeo = new THREE.BoxGeometry(0.4, 0.01, 0.3);
    const antenna = new THREE.Mesh(antGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.9 }));
    antenna.position.set(-0.7, BD / 2 + 0.01, -0.7);
    boardGroup.add(antenna);

    // --- Silk screen labels (A, B) as tiny boxes ---
    const labelAGeo = new THREE.BoxGeometry(0.12, 0.01, 0.06);
    const labelA = new THREE.Mesh(labelAGeo, silkMat);
    labelA.position.set(-1.35, BD / 2 + 0.01, -0.4);
    boardGroup.add(labelA);

    const labelB = new THREE.Mesh(labelAGeo, silkMat);
    labelB.position.set(1.35, BD / 2 + 0.01, -0.4);
    boardGroup.add(labelB);

    // --- Ground plane (subtle shadow catcher) ---
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // ==================== ORBIT CONTROLS (manual) ====================

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0, phi: Math.PI / 4, radius: 6 };
    let autoRotate = false;
    let targetTheta = 0;
    let targetPhi = Math.PI / 4;

    function updateCamera() {
        camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        camera.position.y = spherical.radius * Math.cos(spherical.phi);
        camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.lookAt(0, 0, 0);
    }

    canvas.addEventListener('pointerdown', (e) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        spherical.theta -= dx * 0.008;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy * 0.008));
        targetTheta = spherical.theta;
        targetPhi = spherical.phi;
        prevMouse = { x: e.clientX, y: e.clientY };
        updateCamera();
    });

    canvas.addEventListener('pointerup', () => { isDragging = false; });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        spherical.radius = Math.max(2, Math.min(12, spherical.radius + e.deltaY * 0.005));
        updateCamera();
    }, { passive: false });

    // Touch pinch zoom
    let touchDist = 0;
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchDist = Math.sqrt(dx * dx + dy * dy);
        }
    });
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            spherical.radius = Math.max(2, Math.min(12, spherical.radius - (dist - touchDist) * 0.02));
            touchDist = dist;
            updateCamera();
        }
    });

    updateCamera();

    // ==================== LIVE DATA STATE ====================

    let liveSync = true;
    let liveLedState = Array.from({ length: 5 }, () => Array(5).fill(false));
    let ledFromFirmware = false; // true = firmware sends LEDS:, skip polling
    let liveAccel = { x: 0, y: 0, z: 0 };
    let liveTemp = 22;
    let liveBtnA = false;
    let liveBtnB = false;
    let liveTouchP0 = false;
    let liveTouchP1 = false;
    let liveTouchP2 = false;
    let liveLogo = false;
    let liveCompass = 0;

    // ==================== PUBLIC API (called from sensors.js) ====================

    window.board3dUpdate = function (type, data) {
        if (!liveSync) return;

        switch (type) {
            case 'led':
                liveLedState = data; // 5x5 array
                break;
            case 'leds':
                liveLedState = data; // 5x5 array from firmware LEDS: telemetry
                ledFromFirmware = true;
                break;
            case 'accel':
                liveAccel = data; // { x, y, z }
                break;
            case 'temp':
                liveTemp = data;
                break;
            case 'btnA':
                liveBtnA = data;
                break;
            case 'btnB':
                liveBtnB = data;
                break;
            case 'touchP0':
                liveTouchP0 = data;
                break;
            case 'touchP1':
                liveTouchP1 = data;
                break;
            case 'touchP2':
                liveTouchP2 = data;
                break;
            case 'logo':
                liveLogo = data;
                break;
            case 'compass':
                liveCompass = data;
                break;
        }
    };

    // ==================== ANIMATION LOOP ====================

    function animate() {
        requestAnimationFrame(animate);

        // Auto-rotate
        if (autoRotate && !isDragging) {
            spherical.theta += 0.005;
            updateCamera();
        }

        // --- Update LEDs ---
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const on = liveLedState[r][c];
                const led = leds[r][c];
                const glow = ledGlows[r][c];

                if (on) {
                    led.material.color.setHex(ledOnColor);
                    led.material.emissive.setHex(ledOnEmissive);
                    led.material.emissiveIntensity = ledOnIntensity;
                    glow.material.opacity = glowOpacity;
                } else {
                    const offColor = styles[currentStyle]?.ledOff?.color || 0x330000;
                    led.material.color.setHex(offColor);
                    led.material.emissive.setHex(0x000000);
                    led.material.emissiveIntensity = 0;
                    glow.material.opacity = 0;
                }
            }
        }

        // --- Tilt board with accelerometer ---
        if (liveSync) {
            const tiltX = Math.max(-0.5, Math.min(0.5, liveAccel.y / 1024 * 0.5));
            const tiltZ = Math.max(-0.5, Math.min(0.5, liveAccel.x / 1024 * 0.5));
            boardGroup.rotation.x += (tiltX - boardGroup.rotation.x) * 0.08;
            boardGroup.rotation.z += (-tiltZ - boardGroup.rotation.z) * 0.08;
        } else {
            boardGroup.rotation.x *= 0.95;
            boardGroup.rotation.z *= 0.95;
        }

        // --- Button A/B ---
        buttonA.material = liveBtnA ? btnPressedMat : btnBlackMat;
        buttonA.position.y = liveBtnA ? BD / 2 + 0.01 : BD / 2 + 0.04;
        buttonB.material = liveBtnB ? btnPressedMat : btnBlackMat;
        buttonB.position.y = liveBtnB ? BD / 2 + 0.01 : BD / 2 + 0.04;

        // --- Touch pins glow ---
        if (pinRings['0']) {
            pinRings['0'].material = liveTouchP0 ? pinGlowMats['0'] : goldMat;
            if (liveTouchP0) pinGlowMats['0'].emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.01) * 0.3;
        }
        if (pinRings['1']) {
            pinRings['1'].material = liveTouchP1 ? pinGlowMats['1'] : goldMat;
            if (liveTouchP1) pinGlowMats['1'].emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.01) * 0.3;
        }
        if (pinRings['2']) {
            pinRings['2'].material = liveTouchP2 ? pinGlowMats['2'] : goldMat;
            if (liveTouchP2) pinGlowMats['2'].emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.01) * 0.3;
        }

        // --- Logo touch ---
        logo.material.emissiveIntensity = liveLogo ? 0.8 : 0;

        // --- Temperature color tint (PCB) ---
        if (currentStyle !== 'xray' && currentStyle !== 'crystal' && currentStyle !== 'blueprint') {
            const t = Math.max(0, Math.min(50, liveTemp));
            const base = new THREE.Color(basePcbColor);
            const hsl = {};
            base.getHSL(hsl);
            const tempShift = (t / 50) * 0.15; // subtle warm shift
            pcbMat.color.setHSL(hsl.h - tempShift, hsl.s + tempShift * 0.5, hsl.l);
        }

        // --- Info display ---
        const accelInfo = document.getElementById('board3dAccelInfo');
        if (accelInfo) {
            accelInfo.textContent = `Accel: ${liveAccel.x},${liveAccel.y},${liveAccel.z}`;
        }
        const tempInfo = document.getElementById('board3dTempInfo');
        if (tempInfo) {
            tempInfo.textContent = `Temp: ${liveTemp}°C`;
        }

        renderer.render(scene, camera);
    }

    // ==================== RESIZE ====================

    function onResize() {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height || 450;
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // Observe tab visibility to resize on first show
    const tabObserver = new MutationObserver(() => {
        const page = container.closest('.tab-page');
        if (page && page.classList.contains('active')) {
            setTimeout(onResize, 50);
        }
    });
    const tabPage = container.closest('.tab-page');
    if (tabPage) {
        tabObserver.observe(tabPage, { attributes: true, attributeFilter: ['class'] });
    }

    window.addEventListener('resize', onResize);
    setTimeout(onResize, 100);

    // ==================== CONTROL BUTTONS ====================

    document.getElementById('board3dResetView')?.addEventListener('click', () => {
        spherical = { theta: 0, phi: Math.PI / 4, radius: 6 };
        boardGroup.rotation.set(0, 0, 0);
        updateCamera();
    });

    document.getElementById('board3dAutoRotate')?.addEventListener('click', function () {
        autoRotate = !autoRotate;
        this.classList.toggle('active', autoRotate);
        this.textContent = autoRotate ? '🔁 Stop' : '🔁 Auto Rotate';
    });

    document.getElementById('board3dLiveSync')?.addEventListener('click', function () {
        liveSync = !liveSync;
        this.classList.toggle('active', liveSync);
        this.textContent = liveSync ? '📡 Live Sync' : '📡 Sync Off';
    });

    // ==================== 8 VISUAL STYLES ====================

    let currentStyle = 'classic';
    let ledOnColor = 0xff2200;
    let ledOnEmissive = 0xff2200;

    const styles = {

        classic: {
            name: 'Classic',
            pcb: { color: 0x1a1a2e, roughness: 0.7, metalness: 0.1, opacity: 1, transparent: false, wireframe: false },
            gold: { color: 0xd4a017, roughness: 0.3, metalness: 0.8 },
            chip: { color: 0x111111, roughness: 0.5, metalness: 0.3 },
            btn: { color: 0x222222, roughness: 0.6, metalness: 0.2 },
            ledOff: { color: 0x330000 },
            ledOn: { color: 0xff2200, emissive: 0xff2200, intensity: 0.8 },
            usb: { color: 0x888888, roughness: 0.4, metalness: 0.7 },
            silk: { color: 0xeeeeee },
            bg: null, // transparent
            glowOpacity: 0.4
        },

        realistic: {
            name: 'Realistic',
            pcb: { color: 0x1b5e20, roughness: 0.8, metalness: 0.05, opacity: 1, transparent: false, wireframe: false },
            gold: { color: 0xb8860b, roughness: 0.25, metalness: 0.9 },
            chip: { color: 0x0a0a0a, roughness: 0.4, metalness: 0.4 },
            btn: { color: 0x1a1a1a, roughness: 0.5, metalness: 0.3 },
            ledOff: { color: 0x3d0000 },
            ledOn: { color: 0xff3311, emissive: 0xff3311, intensity: 0.7 },
            usb: { color: 0x999999, roughness: 0.3, metalness: 0.8 },
            silk: { color: 0xffffff },
            bg: null,
            glowOpacity: 0.35
        },

        cartoon: {
            name: 'Cartoon',
            pcb: { color: 0x6c5ce7, roughness: 0.9, metalness: 0, opacity: 1, transparent: false, wireframe: false },
            gold: { color: 0xfdcb6e, roughness: 0.5, metalness: 0.3 },
            chip: { color: 0x2d3436, roughness: 0.8, metalness: 0 },
            btn: { color: 0xff6b6b, roughness: 0.8, metalness: 0 },
            ledOff: { color: 0xffcccc },
            ledOn: { color: 0xff4757, emissive: 0xff4757, intensity: 1.0 },
            usb: { color: 0xdfe6e9, roughness: 0.7, metalness: 0.1 },
            silk: { color: 0xffffff },
            bg: 0xf8f9fa,
            glowOpacity: 0.5
        },

        xray: {
            name: 'X-Ray',
            pcb: { color: 0x0a2f5c, roughness: 0.3, metalness: 0.1, opacity: 0.25, transparent: true, wireframe: false },
            gold: { color: 0x00ff88, roughness: 0.2, metalness: 0.5 },
            chip: { color: 0x00ffcc, roughness: 0.3, metalness: 0.2 },
            btn: { color: 0x005577, roughness: 0.4, metalness: 0.1 },
            ledOff: { color: 0x003322 },
            ledOn: { color: 0x00ff44, emissive: 0x00ff44, intensity: 1.2 },
            usb: { color: 0x00aaff, roughness: 0.3, metalness: 0.3 },
            silk: { color: 0x00ffaa },
            bg: 0x020810,
            glowOpacity: 0.6
        },

        blueprint: {
            name: 'Blueprint',
            pcb: { color: 0x1a3a5c, roughness: 0.9, metalness: 0, opacity: 0.8, transparent: true, wireframe: true },
            gold: { color: 0x88bbff, roughness: 0.5, metalness: 0.2 },
            chip: { color: 0x4488cc, roughness: 0.7, metalness: 0.1 },
            btn: { color: 0x3366aa, roughness: 0.7, metalness: 0.1 },
            ledOff: { color: 0x223355 },
            ledOn: { color: 0x55aaff, emissive: 0x55aaff, intensity: 0.9 },
            usb: { color: 0x6699cc, roughness: 0.6, metalness: 0.2 },
            silk: { color: 0xaaddff },
            bg: 0x0d1b2a,
            glowOpacity: 0.45
        },

        neon: {
            name: 'Neon',
            pcb: { color: 0x0a0a0a, roughness: 0.6, metalness: 0.2, opacity: 1, transparent: false, wireframe: false },
            gold: { color: 0xff00ff, roughness: 0.2, metalness: 0.6 },
            chip: { color: 0x1a0033, roughness: 0.4, metalness: 0.3 },
            btn: { color: 0x330066, roughness: 0.5, metalness: 0.2 },
            ledOff: { color: 0x1a0033 },
            ledOn: { color: 0xff00cc, emissive: 0xff00cc, intensity: 1.5 },
            usb: { color: 0x00ffff, roughness: 0.2, metalness: 0.5 },
            silk: { color: 0x00ff88 },
            bg: 0x050008,
            glowOpacity: 0.7
        },

        crystal: {
            name: 'Crystal',
            pcb: { color: 0xaaccee, roughness: 0.05, metalness: 0.1, opacity: 0.3, transparent: true, wireframe: false },
            gold: { color: 0xffd700, roughness: 0.1, metalness: 0.9 },
            chip: { color: 0x445566, roughness: 0.1, metalness: 0.5 },
            btn: { color: 0x88aacc, roughness: 0.1, metalness: 0.3 },
            ledOff: { color: 0x334455 },
            ledOn: { color: 0xffffff, emissive: 0xaaddff, intensity: 1.0 },
            usb: { color: 0xccddee, roughness: 0.05, metalness: 0.6 },
            silk: { color: 0xffffff },
            bg: null,
            glowOpacity: 0.5
        },

        retro: {
            name: 'Retro',
            pcb: { color: 0x8b6914, roughness: 0.9, metalness: 0, opacity: 1, transparent: false, wireframe: false },
            gold: { color: 0xcd853f, roughness: 0.4, metalness: 0.7 },
            chip: { color: 0x3e2723, roughness: 0.7, metalness: 0.1 },
            btn: { color: 0x5d4037, roughness: 0.7, metalness: 0.2 },
            ledOff: { color: 0x4a2000 },
            ledOn: { color: 0xff8800, emissive: 0xff6600, intensity: 0.9 },
            usb: { color: 0xb8860b, roughness: 0.4, metalness: 0.6 },
            silk: { color: 0xfaebd7 },
            bg: 0x1a120a,
            glowOpacity: 0.4
        }
    };

    function applyStyle(name) {
        const s = styles[name];
        if (!s) return;
        currentStyle = name;

        // PCB
        pcbMat.color.setHex(s.pcb.color);
        pcbMat.roughness = s.pcb.roughness;
        pcbMat.metalness = s.pcb.metalness;
        pcbMat.transparent = s.pcb.transparent;
        pcbMat.opacity = s.pcb.opacity;
        pcbMat.wireframe = s.pcb.wireframe;
        pcbMat.needsUpdate = true;

        // Store base PCB color for temp tinting
        basePcbColor = s.pcb.color;

        // Gold
        goldMat.color.setHex(s.gold.color);
        goldMat.roughness = s.gold.roughness;
        goldMat.metalness = s.gold.metalness;

        // Chips
        chipMat.color.setHex(s.chip.color);
        chipMat.roughness = s.chip.roughness;
        chipMat.metalness = s.chip.metalness;

        // Buttons
        btnBlackMat.color.setHex(s.btn.color);
        btnBlackMat.roughness = s.btn.roughness;
        btnBlackMat.metalness = s.btn.metalness;

        // LEDs
        ledOnColor = s.ledOn.color;
        ledOnEmissive = s.ledOn.emissive;
        ledOnIntensity = s.ledOn.intensity;
        glowOpacity = s.glowOpacity;

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                leds[r][c].material.color.setHex(s.ledOff.color);
                ledGlows[r][c].material.color.setHex(s.ledOn.color);
            }
        }

        // USB
        usbMat.color.setHex(s.usb.color);
        usbMat.roughness = s.usb.roughness;
        usbMat.metalness = s.usb.metalness;

        // Silk
        silkMat.color.setHex(s.silk.color);

        // Background
        if (s.bg !== null) {
            scene.background = new THREE.Color(s.bg);
        } else {
            scene.background = null;
        }

        // Touch glow pins adapt to style
        const pinColor = s.gold.color;
        Object.values(pinGlowMats).forEach(m => {
            m.color.setHex(pinColor);
            m.emissive.setHex(pinColor);
        });

        // Save preference
        try { localStorage.setItem('mb_board3d_style', name); } catch {}
    }

    // Extra state for style system
    let basePcbColor = 0x1a1a2e;
    let ledOnIntensity = 0.8;
    let glowOpacity = 0.4;

    // Style selector
    const styleSelect = document.getElementById('board3dStyle');
    if (styleSelect) {
        styleSelect.addEventListener('change', () => {
            applyStyle(styleSelect.value);
        });

        // Restore saved style
        try {
            const saved = localStorage.getItem('mb_board3d_style');
            if (saved && styles[saved]) {
                styleSelect.value = saved;
                applyStyle(saved);
            }
        } catch {}
    }

    // Poll the LED matrix state from controls.js (fallback if firmware doesn't send LEDS:)
    setInterval(() => {
        if (ledFromFirmware) return; // firmware sends real state, skip polling
        if (typeof ledState !== 'undefined') {
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    liveLedState[r][c] = ledState[r]?.[c] || false;
                }
            }
        }
    }, 200);

    // Known icon patterns for CMD: presets
    const iconPatterns = {
        HEART: [
            [0,1,0,1,0],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [0,1,1,1,0],
            [0,0,1,0,0]
        ],
        SMILE: [
            [0,0,0,0,0],
            [0,1,0,1,0],
            [0,0,0,0,0],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ],
        SAD: [
            [0,0,0,0,0],
            [0,1,0,1,0],
            [0,0,0,0,0],
            [0,1,1,1,0],
            [1,0,0,0,1]
        ],
        CLEAR: [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ]
    };

    // Listen for CMD: preset clicks via chip-btn delegation
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cmd]');
        if (!btn) return;
        const cmd = btn.getAttribute('data-cmd');
        if (iconPatterns[cmd]) {
            const pat = iconPatterns[cmd];
            for (let r = 0; r < 5; r++)
                for (let c = 0; c < 5; c++)
                    liveLedState[r][c] = !!pat[r][c];
        }
    });

    // ==================== START ====================

    animate();

})();
