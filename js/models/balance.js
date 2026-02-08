// ============================================================
// models/balance.js — Balance Game: ball on tilting platform
// ============================================================

(function () {
    'use strict';

    let group, platform, ball, target, scoreRing, walls = [];
    let ballPos = { x: 0, z: 0 }, ballVel = { x: 0, z: 0 };
    let targetPos = { x: 0, z: 0 }, score = 0, lastTargetTime = 0;
    let trailDots = [], trailIdx = 0;

    const PLAT_SIZE = 3.0;
    const BALL_R = 0.18;
    const WALL_H = 0.15;
    const FRICTION = 0.97;
    const GRAVITY = 0.0008;
    const TARGET_R = 0.3;

    function randomTarget() {
        const margin = PLAT_SIZE / 2 - 0.5;
        return { x: (Math.random() - 0.5) * margin * 2, z: (Math.random() - 0.5) * margin * 2 };
    }

    const model = {
        name: 'Balance Game',
        camera: { theta: 0, phi: Math.PI / 3, radius: 7 },
        groundY: -2,

        create(scene, T) {
            group = new T.Group();
            scene.add(group);

            const platMat = new T.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.4, metalness: 0.2 });
            const wallMat = new T.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.3 });
            const ballMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.4 });
            const targetMat = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3, emissive: 0x22c55e, emissiveIntensity: 0.5, transparent: true, opacity: 0.7 });
            const scoreMat = new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5, emissive: 0xfbbf24, emissiveIntensity: 0 });

            // ---- PLATFORM ----
            platform = new T.Group();
            group.add(platform);

            // Top surface
            const surface = new T.Mesh(new T.BoxGeometry(PLAT_SIZE, 0.12, PLAT_SIZE), platMat);
            surface.castShadow = true;
            surface.receiveShadow = true;
            platform.add(surface);

            // Grid lines on surface
            const gridMat = new T.MeshBasicMaterial({ color: 0x2d4a6f });
            for (let i = -4; i <= 4; i++) {
                const lineH = new T.Mesh(new T.BoxGeometry(PLAT_SIZE - 0.1, 0.005, 0.01), gridMat);
                lineH.position.set(0, 0.065, i * (PLAT_SIZE / 10));
                platform.add(lineH);
                const lineV = new T.Mesh(new T.BoxGeometry(0.01, 0.005, PLAT_SIZE - 0.1), gridMat);
                lineV.position.set(i * (PLAT_SIZE / 10), 0.065, 0);
                platform.add(lineV);
            }

            // Walls
            const hs = PLAT_SIZE / 2;
            const wallDefs = [
                { w: PLAT_SIZE + 0.1, d: 0.08, x: 0, z: -hs },
                { w: PLAT_SIZE + 0.1, d: 0.08, x: 0, z: hs },
                { w: 0.08, d: PLAT_SIZE + 0.1, x: -hs, z: 0 },
                { w: 0.08, d: PLAT_SIZE + 0.1, x: hs, z: 0 }
            ];
            walls = wallDefs.map(def => {
                const wall = new T.Mesh(new T.BoxGeometry(def.w, WALL_H, def.d), wallMat);
                wall.position.set(def.x, WALL_H / 2 + 0.06, def.z);
                platform.add(wall);
                return wall;
            });

            // Corner posts
            [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([cx, cz]) => {
                const post = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, WALL_H + 0.1, 8), scoreMat.clone());
                post.position.set(cx * hs, (WALL_H + 0.1) / 2 + 0.06, cz * hs);
                platform.add(post);
            });

            // ---- BALL ----
            ball = new T.Mesh(new T.SphereGeometry(BALL_R, 16, 12), ballMat);
            ball.position.y = BALL_R + 0.06;
            ball.castShadow = true;
            platform.add(ball);

            // ---- TARGET ----
            target = new T.Mesh(new T.CylinderGeometry(TARGET_R, TARGET_R, 0.02, 16), targetMat);
            target.position.y = 0.07;
            platform.add(target);

            // Score ring (pulses on score)
            scoreRing = new T.Mesh(new T.TorusGeometry(TARGET_R + 0.1, 0.03, 8, 16), scoreMat);
            scoreRing.rotation.x = Math.PI / 2;
            scoreRing.position.y = 0.08;
            platform.add(scoreRing);

            // ---- TRAIL ----
            trailDots = [];
            for (let i = 0; i < 30; i++) {
                const dot = new T.Mesh(
                    new T.SphereGeometry(0.04, 6, 4),
                    new T.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 })
                );
                dot.position.y = 0.07;
                platform.add(dot);
                trailDots.push(dot);
            }
            trailIdx = 0;

            // ---- PIVOT SUPPORT ----
            const pivot = new T.Mesh(new T.SphereGeometry(0.2, 12, 8),
                new T.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 }));
            pivot.position.y = -0.25;
            group.add(pivot);

            // Base stand
            const stand = new T.Mesh(new T.CylinderGeometry(0.6, 0.8, 0.15, 16),
                new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.3 }));
            stand.position.y = -0.45;
            stand.castShadow = true;
            group.add(stand);

            // Reset state
            ballPos = { x: 0, z: 0 }; ballVel = { x: 0, z: 0 };
            score = 0; lastTargetTime = Date.now();
            targetPos = randomTarget();
        },

        update(D) {
            if (!group || !platform) return;

            // Tilt platform with accelerometer
            const tiltX = Math.max(-0.35, Math.min(0.35, D.accel.y / 1024 * 0.4));
            const tiltZ = Math.max(-0.35, Math.min(0.35, D.accel.x / 1024 * 0.4));
            platform.rotation.x += (tiltX - platform.rotation.x) * 0.1;
            platform.rotation.z += (-tiltZ - platform.rotation.z) * 0.1;

            // Physics: ball rolls with gravity on tilted surface
            ballVel.x += Math.sin(platform.rotation.z) * GRAVITY * 60;
            ballVel.z += -Math.sin(platform.rotation.x) * GRAVITY * 60;
            ballVel.x *= FRICTION;
            ballVel.z *= FRICTION;

            ballPos.x += ballVel.x;
            ballPos.z += ballVel.z;

            // Wall bouncing
            const limit = PLAT_SIZE / 2 - BALL_R - 0.08;
            if (ballPos.x > limit) { ballPos.x = limit; ballVel.x *= -0.6; }
            if (ballPos.x < -limit) { ballPos.x = -limit; ballVel.x *= -0.6; }
            if (ballPos.z > limit) { ballPos.z = limit; ballVel.z *= -0.6; }
            if (ballPos.z < -limit) { ballPos.z = -limit; ballVel.z *= -0.6; }

            ball.position.x = ballPos.x;
            ball.position.z = ballPos.z;

            // Ball spin (visual)
            const speed = Math.hypot(ballVel.x, ballVel.z);
            ball.rotation.x += ballVel.z * 3;
            ball.rotation.z -= ballVel.x * 3;

            // Trail
            if (speed > 0.005) {
                const dot = trailDots[trailIdx % trailDots.length];
                dot.position.x = ballPos.x;
                dot.position.z = ballPos.z;
                dot.material.opacity = 0.6;
                trailIdx++;
            }
            trailDots.forEach(d => { d.material.opacity *= 0.96; });

            // Target position & scoring
            target.position.x = targetPos.x;
            target.position.z = targetPos.z;
            scoreRing.position.x = targetPos.x;
            scoreRing.position.z = targetPos.z;

            // Pulse target
            const pulse = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
            target.material.emissiveIntensity = pulse * 0.5;

            // Check if ball reached target
            const dx = ballPos.x - targetPos.x;
            const dz = ballPos.z - targetPos.z;
            const dist = Math.hypot(dx, dz);

            if (dist < TARGET_R + BALL_R) {
                score++;
                scoreRing.material.emissiveIntensity = 1.0;
                targetPos = randomTarget();
                lastTargetTime = Date.now();
            } else {
                scoreRing.material.emissiveIntensity *= 0.95;
            }

            // Auto-move target every 10 seconds
            if (Date.now() - lastTargetTime > 10000) {
                targetPos = randomTarget();
                lastTargetTime = Date.now();
            }
        },

        destroy(scene) {
            if (group) {
                scene.remove(group);
                group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material?.dispose) c.material.dispose(); });
                group = null; platform = null; ball = null; target = null; trailDots = [];
            }
        }
    };

    window.board3dModels = window.board3dModels || {};
    window.board3dModels.balance = model;
})();
