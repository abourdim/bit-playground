// ============================================================
// models/arm.js — Robot Arm with 2 servo-driven joints
// ============================================================

(function () {
    'use strict';

    let group, basePivot, shoulderPivot, elbowPivot, gripL, gripR, indicator;
    let smoothServo1 = 90, smoothServo2 = 90;

    const model = {
        name: 'Robot Arm',
        camera: { theta: 0.3, phi: Math.PI / 3.5, radius: 9 },
        groundY: -1.8,

        create(scene, T) {
            group = new T.Group();
            scene.add(group);

            const baseMat = new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 });
            const armMat = new T.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.3 });
            const jointMat = new T.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.6 });
            const gripMat = new T.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.3 });
            const plateMat = new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 });
            const indicMat = new T.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3, emissive: 0x22c55e, emissiveIntensity: 0 });

            // ---- BASE PLATE ----
            const plate = new T.Mesh(new T.CylinderGeometry(1.8, 2.0, 0.2, 24), plateMat);
            plate.position.y = -1.5;
            plate.castShadow = true;
            group.add(plate);

            // Base detail ring
            const ring = new T.Mesh(new T.TorusGeometry(1.5, 0.08, 8, 24), jointMat);
            ring.position.y = -1.39;
            ring.rotation.x = Math.PI / 2;
            group.add(ring);

            // ---- BASE TURRET (rotates with servo1) ----
            basePivot = new T.Group();
            basePivot.position.y = -1.4;
            group.add(basePivot);

            const turret = new T.Mesh(new T.CylinderGeometry(0.7, 0.9, 0.6, 16), baseMat);
            turret.position.y = 0.3;
            turret.castShadow = true;
            basePivot.add(turret);

            // Servo detail on turret
            const servoBox = new T.Mesh(new T.BoxGeometry(0.3, 0.2, 0.5), new T.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 }));
            servoBox.position.set(0.6, 0.3, 0);
            basePivot.add(servoBox);

            // ---- SHOULDER JOINT ----
            const shoulderJoint = new T.Mesh(new T.SphereGeometry(0.3, 12, 8), jointMat);
            shoulderJoint.position.y = 0.7;
            basePivot.add(shoulderJoint);

            shoulderPivot = new T.Group();
            shoulderPivot.position.y = 0.7;
            basePivot.add(shoulderPivot);

            // ---- UPPER ARM ----
            const upperArm = new T.Mesh(new T.BoxGeometry(0.35, 2.2, 0.35), armMat);
            upperArm.position.y = 1.1;
            upperArm.castShadow = true;
            shoulderPivot.add(upperArm);

            // Arm detail ridges
            for (let i = 0; i < 3; i++) {
                const ridge = new T.Mesh(new T.BoxGeometry(0.38, 0.04, 0.38), jointMat);
                ridge.position.y = 0.4 + i * 0.7;
                shoulderPivot.add(ridge);
            }

            // ---- ELBOW JOINT ----
            const elbowJoint = new T.Mesh(new T.SphereGeometry(0.25, 12, 8), jointMat);
            elbowJoint.position.y = 2.2;
            shoulderPivot.add(elbowJoint);

            elbowPivot = new T.Group();
            elbowPivot.position.y = 2.2;
            shoulderPivot.add(elbowPivot);

            // ---- FOREARM ----
            const forearm = new T.Mesh(new T.BoxGeometry(0.28, 1.8, 0.28), armMat);
            forearm.position.y = 0.9;
            forearm.castShadow = true;
            elbowPivot.add(forearm);

            // ---- GRIPPER ----
            const gripBase = new T.Mesh(new T.BoxGeometry(0.5, 0.15, 0.4), baseMat);
            gripBase.position.y = 1.85;
            elbowPivot.add(gripBase);

            gripL = new T.Mesh(new T.BoxGeometry(0.08, 0.5, 0.15), gripMat);
            gripL.position.set(-0.2, 2.1, 0);
            elbowPivot.add(gripL);

            gripR = new T.Mesh(new T.BoxGeometry(0.08, 0.5, 0.15), gripMat);
            gripR.position.set(0.2, 2.1, 0);
            elbowPivot.add(gripR);

            // Gripper tips
            const tipGeo = new T.BoxGeometry(0.12, 0.08, 0.2);
            const tipL = new T.Mesh(tipGeo, gripMat);
            tipL.position.set(-0.2, 2.35, 0);
            elbowPivot.add(tipL);
            const tipR = new T.Mesh(tipGeo, gripMat);
            tipR.position.set(0.2, 2.35, 0);
            elbowPivot.add(tipR);

            // ---- STATUS INDICATOR ----
            indicator = new T.Mesh(new T.SphereGeometry(0.1, 8, 6), indicMat);
            indicator.position.set(0, -1.1, 1.0);
            group.add(indicator);

            // ---- DEGREE LABELS (rings at base) ----
            for (let i = 0; i < 8; i++) {
                const tick = new T.Mesh(new T.BoxGeometry(0.04, 0.03, 0.2), jointMat);
                const angle = (i / 8) * Math.PI * 2;
                tick.position.set(Math.sin(angle) * 1.6, -1.39, Math.cos(angle) * 1.6);
                tick.rotation.y = angle;
                group.add(tick);
            }
        },

        update(D) {
            if (!group) return;

            // Smooth servo values
            smoothServo1 += (D.servo1 - smoothServo1) * 0.06;
            smoothServo2 += (D.servo2 - smoothServo2) * 0.06;

            // Servo1 → base rotation (0-180° maps to -PI/2 to PI/2)
            const baseAngle = (smoothServo1 - 90) / 90 * (Math.PI / 2);
            if (basePivot) basePivot.rotation.y = baseAngle;

            // Servo2 → shoulder tilt (0° = down, 90° = horizontal, 180° = up)
            const shoulderAngle = -(smoothServo2 - 90) / 90 * (Math.PI / 3);
            if (shoulderPivot) shoulderPivot.rotation.z = shoulderAngle;

            // Elbow follows inversely for natural look
            if (elbowPivot) elbowPivot.rotation.z = -shoulderAngle * 0.6;

            // Gripper opens/closes with btnA/btnB
            const gripOpen = D.btnA ? 0.15 : (D.btnB ? -0.05 : 0);
            if (gripL) gripL.position.x = -0.2 - gripOpen;
            if (gripR) gripR.position.x = 0.2 + gripOpen;

            // Status indicator pulses when connected (sync on)
            if (indicator) {
                indicator.material.emissiveIntensity = D.sync ? 0.5 + Math.sin(Date.now() * 0.005) * 0.3 : 0;
            }
        },

        destroy(scene) {
            if (group) {
                scene.remove(group);
                group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material?.dispose) c.material.dispose(); });
                group = null; basePivot = null; shoulderPivot = null; elbowPivot = null;
            }
        }
    };

    window.board3dModels = window.board3dModels || {};
    window.board3dModels.arm = model;
})();
