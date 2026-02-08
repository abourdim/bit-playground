// ============================================================
// models/microbit.js — micro:bit V2 board (Classic style)
// ============================================================

(function () {
    'use strict';

    let group, leds = [], ledGlows = [], buttonA, buttonB, pinRings = {}, logo, pcbMat;
    let btnBlackMat, btnPressedMat, goldMat, pinGlowMats = {};
    const BD = 0.12; // board depth

    const model = {
        name: 'micro:bit V2',
        camera: { theta: 0, phi: Math.PI / 4, radius: 6 },
        groundY: -1.5,

        create(scene, T) {
            group = new T.Group();
            scene.add(group);

            // Materials
            pcbMat = new T.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.7, metalness: 0.1 });
            goldMat = new T.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.3, metalness: 0.8 });
            const chipMat = new T.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.3 });
            btnBlackMat = new T.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.2 });
            btnPressedMat = new T.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.3, emissive: 0x22cc55, emissiveIntensity: 0.5 });
            const usbMat = new T.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.7 });
            const silkMat = new T.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
            const darkMat = new T.MeshStandardMaterial({ color: 0x0a0a0a });

            // Touch pin glow materials
            for (const k of ['0', '1', '2']) {
                pinGlowMats[k] = new T.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6, emissive: 0xffd700, emissiveIntensity: 0 });
            }

            // PCB board (rounded rect via shape)
            const BW = 3.2, BH = 2.6, br = 0.25;
            const shape = new T.Shape();
            shape.moveTo(-BW / 2 + br, -BH / 2);
            shape.lineTo(BW / 2 - br, -BH / 2);
            shape.quadraticCurveTo(BW / 2, -BH / 2, BW / 2, -BH / 2 + br);
            shape.lineTo(BW / 2, BH / 2 - br);
            shape.quadraticCurveTo(BW / 2, BH / 2, BW / 2 - br, BH / 2);
            shape.lineTo(-BW / 2 + br, BH / 2);
            shape.quadraticCurveTo(-BW / 2, BH / 2, -BW / 2, BH / 2 - br);
            shape.lineTo(-BW / 2, -BH / 2 + br);
            shape.quadraticCurveTo(-BW / 2, -BH / 2, -BW / 2 + br, -BH / 2);

            const boardGeo = new T.ExtrudeGeometry(shape, { depth: BD, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 });
            boardGeo.center();
            const board = new T.Mesh(boardGeo, pcbMat);
            board.rotation.x = -Math.PI / 2;
            board.castShadow = true;
            board.receiveShadow = true;
            group.add(board);

            // Edge connector
            group.add(Object.assign(new T.Mesh(new T.BoxGeometry(BW * 0.85, 0.04, 0.35), goldMat), { position: new T.Vector3(0, -BD / 2 - 0.01, BH / 2 - 0.15) }));

            // Pins
            const pins = [{ x: -1.2, l: '0' }, { x: -0.5, l: '1' }, { x: 0.5, l: '2' }, { x: 1.0, l: '3V' }, { x: 1.35, l: 'GND' }];
            pins.forEach(p => {
                const ring = new T.Mesh(new T.TorusGeometry(0.12, 0.03, 8, 16), goldMat);
                ring.position.set(p.x, BD / 2 + 0.02, BH / 2 - 0.15);
                ring.rotation.x = Math.PI / 2;
                group.add(ring);
                const hole = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, BD + 0.06, 12), darkMat);
                hole.position.set(p.x, 0, BH / 2 - 0.15);
                group.add(hole);
                pinRings[p.l] = ring;
            });

            // 5x5 LED matrix
            leds = []; ledGlows = [];
            const sp = 0.32, sx = -sp * 2, sz = -sp * 2 - 0.15;
            for (let r = 0; r < 5; r++) {
                leds[r] = []; ledGlows[r] = [];
                for (let c = 0; c < 5; c++) {
                    const led = new T.Mesh(new T.BoxGeometry(0.18, 0.06, 0.18),
                        new T.MeshStandardMaterial({ color: 0x330000, roughness: 0.5, metalness: 0.1 }));
                    led.position.set(sx + c * sp, BD / 2 + 0.03, sz + r * sp);
                    led.castShadow = true;
                    group.add(led);
                    leds[r][c] = led;

                    const glow = new T.Mesh(new T.PlaneGeometry(0.25, 0.25),
                        new T.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0, side: T.DoubleSide }));
                    glow.position.copy(led.position);
                    glow.position.y += 0.04;
                    glow.rotation.x = -Math.PI / 2;
                    group.add(glow);
                    ledGlows[r][c] = glow;
                }
            }

            // Buttons
            const bGeo = new T.CylinderGeometry(0.18, 0.18, 0.08, 16);
            buttonA = new T.Mesh(bGeo, btnBlackMat);
            buttonA.position.set(-1.35, BD / 2 + 0.04, -0.15);
            group.add(buttonA);

            buttonB = new T.Mesh(bGeo, btnBlackMat);
            buttonB.position.set(1.35, BD / 2 + 0.04, -0.15);
            group.add(buttonB);

            // Button labels
            const lblGeo = new T.CircleGeometry(0.06, 12);
            [[-1.35, -0.15], [1.35, -0.15]].forEach(([x, z]) => {
                const lbl = new T.Mesh(lblGeo, silkMat);
                lbl.position.set(x, BD / 2 + 0.09, z);
                lbl.rotation.x = -Math.PI / 2;
                group.add(lbl);
            });

            // Processor
            group.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.5, 0.06, 0.5), chipMat), { position: new T.Vector3(0, BD / 2 + 0.03, 0.65) }));
            // Sensor chip
            group.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.25, 0.04, 0.25), chipMat), { position: new T.Vector3(0.7, BD / 2 + 0.02, 0.65) }));
            // USB
            group.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.5, 0.15, 0.25), usbMat), { position: new T.Vector3(0, BD / 2 + 0.06, -BH / 2 + 0.05) }));
            // Battery
            group.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.4, 0.2, 0.15), new T.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, metalness: 0.3 })), { position: new T.Vector3(0.8, -BD / 2 - 0.08, -BH / 2 + 0.15) }));
            // Speaker grille
            for (let i = 0; i < 5; i++) {
                const slot = new T.Mesh(new T.BoxGeometry(0.35, 0.02, 0.04), darkMat);
                slot.position.set(-0.6, -BD / 2 - 0.01, 0.3 + i * 0.08);
                group.add(slot);
            }
            // Logo
            logo = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.02, 16),
                new T.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6, emissive: 0xffd700, emissiveIntensity: 0 }));
            logo.position.set(0, BD / 2 + 0.02, 0.85);
            group.add(logo);
            // Antenna
            group.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.4, 0.01, 0.3), new T.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.9 })), { position: new T.Vector3(-0.7, BD / 2 + 0.01, -0.7) }));
            // Silk labels
            const slGeo = new T.BoxGeometry(0.12, 0.01, 0.06);
            group.add(Object.assign(new T.Mesh(slGeo, silkMat), { position: new T.Vector3(-1.35, BD / 2 + 0.01, -0.4) }));
            group.add(Object.assign(new T.Mesh(slGeo, silkMat), { position: new T.Vector3(1.35, BD / 2 + 0.01, -0.4) }));
        },

        update(D) {
            if (!group) return;

            // LEDs
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const on = D.ledState[r]?.[c];
                    const m = leds[r][c].material;
                    if (on) {
                        m.color.setHex(0xff2200); m.emissive.setHex(0xff2200); m.emissiveIntensity = 0.8;
                        ledGlows[r][c].material.opacity = 0.4;
                    } else {
                        m.color.setHex(0x330000); m.emissive.setHex(0x000000); m.emissiveIntensity = 0;
                        ledGlows[r][c].material.opacity = 0;
                    }
                }
            }

            // Tilt
            if (D.sync) {
                const tx = Math.max(-0.5, Math.min(0.5, D.accel.y / 1024 * 0.5));
                const tz = Math.max(-0.5, Math.min(0.5, D.accel.x / 1024 * 0.5));
                group.rotation.x += (tx - group.rotation.x) * 0.08;
                group.rotation.z += (-tz - group.rotation.z) * 0.08;
            } else {
                group.rotation.x *= 0.95;
                group.rotation.z *= 0.95;
            }

            // Buttons
            buttonA.material = D.btnA ? btnPressedMat : btnBlackMat;
            buttonA.position.y = D.btnA ? BD / 2 + 0.01 : BD / 2 + 0.04;
            buttonB.material = D.btnB ? btnPressedMat : btnBlackMat;
            buttonB.position.y = D.btnB ? BD / 2 + 0.01 : BD / 2 + 0.04;

            // Touch pins
            const t = Date.now();
            const pulse = 0.6 + Math.sin(t * 0.01) * 0.3;
            ['0', '1', '2'].forEach((k, i) => {
                const touched = [D.touchP0, D.touchP1, D.touchP2][i];
                if (pinRings[k]) {
                    pinRings[k].material = touched ? pinGlowMats[k] : goldMat;
                    if (touched) pinGlowMats[k].emissiveIntensity = pulse;
                }
            });

            // Logo
            logo.material.emissiveIntensity = D.logo ? 0.8 : 0;

            // Temp tint
            const temp = Math.max(0, Math.min(50, D.temp));
            const tempShift = (temp / 50) * 0.15;
            pcbMat.color.setHSL(0.68 - tempShift, 0.3 + tempShift * 0.5, 0.12);
        },

        destroy(scene) {
            if (group) {
                scene.remove(group);
                group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose?.(); });
                group = null;
            }
        }
    };

    window.board3dModels = window.board3dModels || {};
    window.board3dModels.microbit = model;
})();
