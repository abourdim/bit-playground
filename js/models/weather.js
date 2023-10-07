// ============================================================
// models/weather.js — Weather Station with live sensor readouts
// ============================================================

(function () {
    'use strict';

    let group, mercuryMesh, sunMesh, cloudGroup, rainDrops = [], windVane;
    let compassNeedle, soundBars = [], lightRays = [];

    const model = {
        name: 'Weather Station',
        camera: { theta: 0.3, phi: Math.PI / 3.5, radius: 9 },
        groundY: -2,

        create(scene, T) {
            group = new T.Group();
            scene.add(group);

            const woodMat = new T.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8, metalness: 0.05 });
            const metalMat = new T.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 });
            const glassMat = new T.MeshStandardMaterial({ color: 0xaaccee, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3 });
            const mercuryMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 });
            const sunMat = new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, emissive: 0xfbbf24, emissiveIntensity: 0.8 });
            const cloudMat = new T.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.9, metalness: 0 });
            const darkCloudMat = new T.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9, metalness: 0 });
            const rainMat = new T.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 });
            const greenMat = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5, metalness: 0.1 });
            const needleMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.5 });

            // ---- BASE & POST ----
            const base = new T.Mesh(new T.CylinderGeometry(1.5, 1.7, 0.2, 24), woodMat);
            base.position.y = -1.8;
            base.castShadow = true;
            group.add(base);

            const post = new T.Mesh(new T.CylinderGeometry(0.15, 0.18, 4.5, 12), woodMat);
            post.position.y = 0.5;
            post.castShadow = true;
            group.add(post);

            // Cross beam
            const beam = new T.Mesh(new T.BoxGeometry(3.5, 0.12, 0.12), woodMat);
            beam.position.y = 2.5;
            group.add(beam);

            // ---- THERMOMETER (left) ----
            const thermoGroup = new T.Group();
            thermoGroup.position.set(-1.2, 0.5, 0);
            group.add(thermoGroup);

            // Glass tube
            const tube = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 2.5, 12), glassMat);
            tube.position.y = 1.25;
            thermoGroup.add(tube);

            // Bulb at bottom
            thermoGroup.add(Object.assign(new T.Mesh(new T.SphereGeometry(0.15, 12, 8), mercuryMat), { position: new T.Vector3(0, 0, 0) }));

            // Mercury column (scales with temp)
            const mercuryGeo = new T.CylinderGeometry(0.05, 0.05, 1.0, 8);
            mercuryMesh = new T.Mesh(mercuryGeo, mercuryMat);
            mercuryMesh.position.y = 0.5;
            thermoGroup.add(mercuryMesh);

            // Tick marks
            for (let i = 0; i <= 5; i++) {
                const tick = new T.Mesh(new T.BoxGeometry(0.15, 0.015, 0.02), metalMat);
                tick.position.set(0.12, 0.1 + i * 0.45, 0);
                thermoGroup.add(tick);
            }

            // ---- SUN / CLOUD (top center) ----
            // Sun
            sunMesh = new T.Mesh(new T.SphereGeometry(0.4, 16, 12), sunMat);
            sunMesh.position.set(0, 3.5, 0);
            group.add(sunMesh);

            // Sun rays
            lightRays = [];
            for (let i = 0; i < 8; i++) {
                const ray = new T.Mesh(
                    new T.BoxGeometry(0.06, 0.3, 0.06),
                    new T.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.5 })
                );
                const angle = (i / 8) * Math.PI * 2;
                ray.position.set(Math.sin(angle) * 0.65, 3.5 + Math.cos(angle) * 0.65, 0);
                ray.rotation.z = angle;
                group.add(ray);
                lightRays.push(ray);
            }

            // Cloud group (appears when dark)
            cloudGroup = new T.Group();
            cloudGroup.position.set(0, 3.5, 0);
            group.add(cloudGroup);

            // Cloud puffs
            const puffs = [
                { x: 0, y: 0, z: 0, r: 0.35 },
                { x: -0.3, y: -0.05, z: 0, r: 0.25 },
                { x: 0.35, y: 0, z: 0, r: 0.3 },
                { x: 0.15, y: 0.15, z: 0, r: 0.2 },
                { x: -0.15, y: 0.1, z: 0.1, r: 0.22 }
            ];
            puffs.forEach(p => {
                const puff = new T.Mesh(new T.SphereGeometry(p.r, 12, 8), cloudMat);
                puff.position.set(p.x, p.y, p.z);
                cloudGroup.add(puff);
            });

            // ---- RAIN DROPS ----
            rainDrops = [];
            for (let i = 0; i < 20; i++) {
                const drop = new T.Mesh(new T.CylinderGeometry(0.01, 0.02, 0.15, 4), rainMat);
                drop.position.set(
                    (Math.random() - 0.5) * 2,
                    3.0 - Math.random() * 3,
                    (Math.random() - 0.5) * 1.5
                );
                drop.visible = false;
                group.add(drop);
                rainDrops.push(drop);
            }

            // ---- WIND VANE (right side, top) ----
            const vaneGroup = new T.Group();
            vaneGroup.position.set(1.2, 2.5, 0);
            group.add(vaneGroup);

            // Pole
            vaneGroup.add(Object.assign(new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.6, 8), metalMat), { position: new T.Vector3(0, 0.3, 0) }));

            // Vane pivot
            windVane = new T.Group();
            windVane.position.y = 0.65;
            vaneGroup.add(windVane);

            // Arrow
            const arrow = new T.Mesh(new T.BoxGeometry(0.8, 0.04, 0.06), needleMat);
            windVane.add(arrow);
            // Arrow head
            const head = new T.Mesh(new T.BoxGeometry(0.04, 0.04, 0.15), needleMat);
            head.position.set(0.42, 0, 0);
            head.rotation.y = Math.PI / 4;
            windVane.add(head);
            // Tail
            const tail = new T.Mesh(new T.BoxGeometry(0.04, 0.04, 0.25), metalMat);
            tail.position.set(-0.42, 0, 0);
            windVane.add(tail);

            // N/S/E/W markers
            const dirMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
            const dirGeo = new T.BoxGeometry(0.08, 0.02, 0.08);
            [{ x: 0, z: -0.5 }, { x: 0, z: 0.5 }, { x: 0.5, z: 0 }, { x: -0.5, z: 0 }].forEach(d => {
                vaneGroup.add(Object.assign(new T.Mesh(dirGeo, dirMat), { position: new T.Vector3(d.x, 0.65, d.z) }));
            });

            // ---- COMPASS DIAL (on base) ----
            const dial = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.04, 24), new T.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.6 }));
            dial.position.set(0, -1.68, 0.8);
            dial.rotation.x = -Math.PI / 6;
            group.add(dial);

            compassNeedle = new T.Mesh(new T.BoxGeometry(0.04, 0.03, 0.45), needleMat);
            compassNeedle.position.set(0, -1.65, 0.8);
            compassNeedle.rotation.x = -Math.PI / 6;
            group.add(compassNeedle);

            // Dial ticks
            for (let i = 0; i < 12; i++) {
                const dtick = new T.Mesh(new T.BoxGeometry(0.02, 0.01, 0.08), metalMat);
                const a = (i / 12) * Math.PI * 2;
                dtick.position.set(Math.sin(a) * 0.4, -1.66, 0.8 + Math.cos(a) * 0.4);
                dtick.rotation.x = -Math.PI / 6;
                dtick.rotation.y = a;
                group.add(dtick);
            }

            // ---- SOUND LEVEL BARS (right, near base) ----
            soundBars = [];
            for (let i = 0; i < 8; i++) {
                const bar = new T.Mesh(
                    new T.BoxGeometry(0.12, 0.04, 0.12),
                    new T.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0 })
                );
                bar.position.set(1.2, -1.5 + i * 0.15, 0.6);
                group.add(bar);
                soundBars.push(bar);
            }

            // ---- GRASS (decorative) ----
            for (let i = 0; i < 12; i++) {
                const blade = new T.Mesh(new T.BoxGeometry(0.04, 0.3 + Math.random() * 0.2, 0.02), greenMat);
                const angle = (i / 12) * Math.PI * 2;
                blade.position.set(Math.sin(angle) * 1.4, -1.55, Math.cos(angle) * 1.4);
                blade.rotation.z = (Math.random() - 0.5) * 0.3;
                group.add(blade);
            }
        },

        update(D) {
            if (!group) return;

            // ---- THERMOMETER ----
            // Map temp 0-50 to mercury height 0-2.3
            const temp = Math.max(0, Math.min(50, D.temp));
            const mercuryH = (temp / 50) * 2.3;
            if (mercuryMesh) {
                mercuryMesh.scale.y = Math.max(0.05, mercuryH);
                mercuryMesh.position.y = mercuryH / 2 + 0.1;
                // Color: blue < 15, green 15-25, red > 25
                if (temp < 15) mercuryMesh.material.color.setHex(0x3b82f6);
                else if (temp < 25) mercuryMesh.material.color.setHex(0x22c55e);
                else mercuryMesh.material.color.setHex(0xef4444);
            }

            // ---- SUN / CLOUD based on light ----
            const light = Math.max(0, Math.min(255, D.light));
            const sunBright = light / 255;

            // Sun: visible and bright when light > 128
            if (sunMesh) {
                sunMesh.material.emissiveIntensity = sunBright;
                sunMesh.scale.setScalar(0.6 + sunBright * 0.5);
            }
            lightRays.forEach(ray => {
                ray.material.emissiveIntensity = sunBright * 0.8;
                ray.visible = light > 80;
            });

            // Cloud: visible when dark
            if (cloudGroup) {
                const cloudOpacity = 1 - sunBright;
                cloudGroup.visible = light < 180;
                cloudGroup.children.forEach(c => {
                    c.material.color.setHex(light < 60 ? 0x4b5563 : 0xd1d5db);
                });
                // Drift clouds slowly
                cloudGroup.position.x = Math.sin(Date.now() * 0.0003) * 0.3;
            }

            // Rain: visible when very dark (light < 60) and sound > 50
            const raining = light < 80 && D.sound > 30;
            rainDrops.forEach(drop => {
                drop.visible = raining;
                if (raining) {
                    drop.position.y -= 0.06;
                    if (drop.position.y < -1.7) {
                        drop.position.y = 3.0;
                        drop.position.x = (Math.random() - 0.5) * 2;
                        drop.position.z = (Math.random() - 0.5) * 1.5;
                    }
                }
            });

            // ---- WIND VANE (compass) ----
            if (windVane) {
                const targetAngle = (D.compass / 360) * Math.PI * 2;
                // Smooth rotation
                let diff = targetAngle - windVane.rotation.y;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                windVane.rotation.y += diff * 0.05;
            }

            // Compass needle
            if (compassNeedle) {
                const needleAngle = (D.compass / 360) * Math.PI * 2;
                compassNeedle.rotation.y += (needleAngle - compassNeedle.rotation.y) * 0.08;
            }

            // ---- SOUND BARS ----
            const soundLevel = Math.max(0, Math.min(255, D.sound));
            const barsLit = Math.round((soundLevel / 255) * soundBars.length);
            soundBars.forEach((bar, i) => {
                const lit = i < barsLit;
                bar.material.emissiveIntensity = lit ? 0.6 : 0;
                if (i < 3) bar.material.color.setHex(lit ? 0x22c55e : 0x1a3a2a);
                else if (i < 6) bar.material.color.setHex(lit ? 0xfbbf24 : 0x3a351a);
                else bar.material.color.setHex(lit ? 0xef4444 : 0x3a1a1a);
            });
        },

        destroy(scene) {
            if (group) {
                scene.remove(group);
                group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material?.dispose) c.material.dispose(); });
                group = null; mercuryMesh = null; sunMesh = null; cloudGroup = null;
                rainDrops = []; windVane = null; compassNeedle = null; soundBars = []; lightRays = [];
            }
        }
    };

    window.board3dModels = window.board3dModels || {};
    window.board3dModels.weather = model;
})();
