// ============================================================
// models/buggy.js — Robot Buggy with spinning wheels & steering
// ============================================================

(function () {
    'use strict';

    let group, wheels = [], steerGroup, headlightL, headlightR, mbScreen = [];
    let wheelSpeed = 0, steerAngle = 0;

    const model = {
        name: 'Robot Buggy',
        camera: { theta: 0.4, phi: Math.PI / 3.5, radius: 8 },
        groundY: -1.2,

        create(scene, T) {
            group = new T.Group();
            scene.add(group);

            const bodyMat = new T.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5, metalness: 0.2 });
            const darkMat = new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.3 });
            const wheelMat = new T.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.1 });
            const hubMat = new T.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.7 });
            const axleMat = new T.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.5 });
            const ledOnMat = new T.MeshStandardMaterial({ color: 0xff2200, roughness: 0.3, emissive: 0xff2200, emissiveIntensity: 0.8 });
            const ledOffMat = new T.MeshStandardMaterial({ color: 0x330000, roughness: 0.5 });
            const lightMat = new T.MeshStandardMaterial({ color: 0xffff00, roughness: 0.3, metalness: 0.1, emissive: 0xffff00, emissiveIntensity: 0 });

            // ---- CHASSIS ----
            // Main body
            const body = new T.Mesh(new T.BoxGeometry(2.4, 0.3, 3.6), bodyMat);
            body.position.y = 0.5;
            body.castShadow = true;
            group.add(body);

            // Top deck (where micro:bit sits)
            const deck = new T.Mesh(new T.BoxGeometry(2.0, 0.1, 2.0), darkMat);
            deck.position.set(0, 0.7, -0.3);
            group.add(deck);

            // Battery box (underneath)
            const bat = new T.Mesh(new T.BoxGeometry(1.2, 0.3, 2.0), new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.2 }));
            bat.position.set(0, 0.2, 0);
            group.add(bat);

            // Front bumper
            const bumper = new T.Mesh(new T.BoxGeometry(2.6, 0.2, 0.15), new T.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.3 }));
            bumper.position.set(0, 0.4, -1.85);
            group.add(bumper);

            // ---- WHEELS (4) ----
            const wheelGeo = new T.CylinderGeometry(0.45, 0.45, 0.25, 20);
            const hubGeo = new T.CylinderGeometry(0.15, 0.15, 0.26, 12);

            // Spoke geo (cross pattern on wheel)
            const spokeGeo = new T.BoxGeometry(0.06, 0.27, 0.7);

            const positions = [
                { x: -1.35, z: -1.1, front: true },  // front left
                { x: 1.35, z: -1.1, front: true },   // front right
                { x: -1.35, z: 1.1, front: false },  // rear left
                { x: 1.35, z: 1.1, front: false }    // rear right
            ];

            steerGroup = new T.Group();
            steerGroup.position.set(0, 0, 0);
            group.add(steerGroup);

            positions.forEach((p, i) => {
                const wheelGroup = new T.Group();

                const tire = new T.Mesh(wheelGeo, wheelMat);
                tire.rotation.z = Math.PI / 2;
                wheelGroup.add(tire);

                const hub = new T.Mesh(hubGeo, hubMat);
                hub.rotation.z = Math.PI / 2;
                wheelGroup.add(hub);

                // Spokes
                const spoke1 = new T.Mesh(spokeGeo, hubMat);
                spoke1.rotation.z = Math.PI / 2;
                wheelGroup.add(spoke1);
                const spoke2 = new T.Mesh(spokeGeo, hubMat);
                spoke2.rotation.z = Math.PI / 2;
                spoke2.rotation.x = Math.PI / 2;
                wheelGroup.add(spoke2);

                // Axle
                const axle = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.4, 8), axleMat);
                axle.rotation.z = Math.PI / 2;
                axle.position.x = p.x > 0 ? -0.2 : 0.2;
                wheelGroup.add(axle);

                wheelGroup.position.set(p.x, 0.45, p.z);

                if (p.front) {
                    steerGroup.add(wheelGroup);
                } else {
                    group.add(wheelGroup);
                }
                wheels.push(wheelGroup);
            });

            // ---- HEADLIGHTS ----
            headlightL = new T.Mesh(new T.SphereGeometry(0.12, 12, 8), lightMat.clone());
            headlightL.position.set(-0.8, 0.55, -1.85);
            group.add(headlightL);

            headlightR = new T.Mesh(new T.SphereGeometry(0.12, 12, 8), lightMat.clone());
            headlightR.position.set(0.8, 0.55, -1.85);
            group.add(headlightR);

            // ---- MICRO:BIT SCREEN (simplified 5x5 on top deck) ----
            mbScreen = [];
            const sp = 0.2, sx = -sp * 2, sz = -sp * 2 - 0.3;
            for (let r = 0; r < 5; r++) {
                mbScreen[r] = [];
                for (let c = 0; c < 5; c++) {
                    const dot = new T.Mesh(new T.BoxGeometry(0.1, 0.04, 0.1), ledOffMat.clone());
                    dot.position.set(sx + c * sp, 0.78, sz + r * sp);
                    group.add(dot);
                    mbScreen[r][c] = dot;
                }
            }

            // ---- CASTER BALL (front center) ----
            const caster = new T.Mesh(new T.SphereGeometry(0.1, 12, 8), hubMat);
            caster.position.set(0, 0.1, -1.6);
            group.add(caster);

            // ---- REAR BUMPER ----
            const rBumper = new T.Mesh(new T.BoxGeometry(2.6, 0.15, 0.12), new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.2 }));
            rBumper.position.set(0, 0.4, 1.85);
            group.add(rBumper);
        },

        update(D) {
            if (!group) return;

            // Wheel speed from gamepad (UP/DOWN via accel Y or servo1)
            // Use servo1 for speed metaphor (higher angle = faster)
            const targetSpeed = (D.servo1 - 90) / 90 * 0.15;
            wheelSpeed += (targetSpeed - wheelSpeed) * 0.05;

            // Spin all wheels
            wheels.forEach(w => {
                if (w.children[0]) w.children[0].rotation.x += wheelSpeed;
                if (w.children[2]) w.children[2].rotation.x += wheelSpeed;
                if (w.children[3]) w.children[3].rotation.x += wheelSpeed;
            });

            // Steering from accel X
            const targetSteer = Math.max(-0.4, Math.min(0.4, D.accel.x / 1024 * 0.5));
            steerAngle += (targetSteer - steerAngle) * 0.08;
            if (steerGroup) steerGroup.rotation.y = steerAngle;

            // Headlights (on when btnA pressed or light < 50)
            const lightsOn = D.btnA || D.light < 50;
            headlightL.material.emissiveIntensity = lightsOn ? 1.0 : 0;
            headlightR.material.emissiveIntensity = lightsOn ? 1.0 : 0;

            // LED screen mirrors
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const on = D.ledState[r]?.[c];
                    const m = mbScreen[r][c].material;
                    if (on) { m.color.setHex(0xff2200); m.emissive.setHex(0xff2200); m.emissiveIntensity = 0.8; }
                    else { m.color.setHex(0x330000); m.emissive.setHex(0x000000); m.emissiveIntensity = 0; }
                }
            }

            // Slight body tilt with accel
            if (D.sync) {
                group.rotation.x += (D.accel.y / 1024 * 0.05 - group.rotation.x) * 0.05;
                group.rotation.z += (-D.accel.x / 1024 * 0.05 - group.rotation.z) * 0.05;
            }
        },

        destroy(scene) {
            if (group) {
                scene.remove(group);
                group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material?.dispose) c.material.dispose(); });
                group = null; wheels = []; steerGroup = null; mbScreen = [];
            }
        }
    };

    window.board3dModels = window.board3dModels || {};
    window.board3dModels.buggy = model;
})();
