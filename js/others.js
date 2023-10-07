// ============================================================
// others.js — Others tab widget handlers
// ============================================================
(function() {
    // --- Button ---
    const otherButton = document.getElementById('otherButton');
    if (otherButton) {
        otherButton.addEventListener('click', () => {
            sendLine('OTHER:BTN:PRESS');
        });
    }

    // --- Switch ---
    const otherSwitch = document.getElementById('otherSwitch');
    const otherSwitchLabel = document.getElementById('otherSwitchLabel');
    if (otherSwitch) {
        otherSwitch.addEventListener('change', () => {
            const state = otherSwitch.checked ? 'ON' : 'OFF';
            if (otherSwitchLabel) otherSwitchLabel.textContent = state;
            sendLine('OTHER:SWITCH:' + state);
        });
    }

    // --- Slider ---
    const otherSlider = document.getElementById('otherSlider');
    const otherSliderValue = document.getElementById('otherSliderValue');
    if (otherSlider) {
        otherSlider.addEventListener('input', () => {
            const v = otherSlider.value;
            if (otherSliderValue) otherSliderValue.textContent = v;
        });
        otherSlider.addEventListener('change', () => {
            sendLine('OTHER:SLIDER:' + otherSlider.value);
        });
    }

    // --- Joystick ---
    document.querySelectorAll('.other-joy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.otherDir;
            if (dir) sendLine('OTHER:JOY:' + dir);
        });
        // Keyboard support (Fix 13)
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // --- Text input ---
    const otherTextInput = document.getElementById('otherTextInput');
    const otherTextSendBtn = document.getElementById('otherTextSendBtn');
    const otherTextLast = document.getElementById('otherTextLast');
    if (otherTextSendBtn && otherTextInput) {
        otherTextSendBtn.addEventListener('click', () => {
            const txt = otherTextInput.value.trim();
            if (!txt) return;
            sendLine('OTHER:TEXT:' + txt);
            if (otherTextLast) otherTextLast.textContent = txt;
            otherTextInput.value = '';
        });
    }

    // --- LED indicator toggle ---
    const otherLed = document.getElementById('otherLed');
    const otherLedState = document.getElementById('otherLedState');
    const otherLedToggle = document.getElementById('otherLedToggle');
    let ledOn = false;
    if (otherLedToggle && otherLed) {
        otherLedToggle.addEventListener('click', () => {
            ledOn = !ledOn;
            otherLed.style.backgroundColor = ledOn ? '#22c55e' : '#333';
            if (otherLedState) otherLedState.textContent = ledOn ? 'On' : 'Off';
            sendLine('OTHER:LED:' + (ledOn ? 'ON' : 'OFF'));
        });
    }

    // --- Level bar ---
    const otherLevel = document.getElementById('otherLevel');
    const otherLevelLabel = document.getElementById('otherLevelLabel');
    function setOtherLevel(val) {
        if (otherLevel) otherLevel.value = val;
        if (otherLevelLabel) otherLevelLabel.textContent = val + '%';
    }

    // --- Sensor simulators (sliders with live display) ---
    const simTemp = document.getElementById('otherSimTemp');
    const simTempValue = document.getElementById('otherSimTempValue');
    if (simTemp) {
        simTemp.addEventListener('input', () => {
            if (simTempValue) simTempValue.textContent = simTemp.value + '°C';
        });
        simTemp.addEventListener('change', () => {
            sendLine('OTHER:SIM_TEMP:' + simTemp.value);
        });
    }

    const simLight = document.getElementById('otherSimLight');
    const simLightValue = document.getElementById('otherSimLightValue');
    if (simLight) {
        simLight.addEventListener('input', () => {
            if (simLightValue) simLightValue.textContent = simLight.value;
        });
        simLight.addEventListener('change', () => {
            sendLine('OTHER:SIM_LIGHT:' + simLight.value);
        });
    }

    const simSound = document.getElementById('otherSimSound');
    const simSoundValue = document.getElementById('otherSimSoundValue');
    if (simSound) {
        simSound.addEventListener('input', () => {
            if (simSoundValue) simSoundValue.textContent = simSound.value;
        });
        simSound.addEventListener('change', () => {
            sendLine('OTHER:SIM_SOUND:' + simSound.value);
        });
    }

    // --- Pin checkboxes ---
    ['D0', 'D1', 'D2', 'D8', 'D12', 'D16'].forEach(pin => {
        const el = document.getElementById('otherPin' + pin);
        if (el) {
            el.addEventListener('change', () => {
                sendLine('OTHER:PIN:' + pin + ':' + (el.checked ? '1' : '0'));
            });
        }
    });

    // --- PWM slider for P0 ---
    const pwm0 = document.getElementById('otherPinPwm0');
    if (pwm0) {
        pwm0.addEventListener('change', () => {
            sendLine('OTHER:PWM:P0:' + pwm0.value);
        });
    }

    // --- Servo (Others tab version) ---
    const otherServoAngle = document.getElementById('otherServoAngle');
    const otherServoAngleValue = document.getElementById('otherServoAngleValue');
    const otherServoSpeed = document.getElementById('otherServoSpeed');
    const otherServoSpeedValue = document.getElementById('otherServoSpeedValue');
    const otherServoRunBtn = document.getElementById('otherServoRunBtn');

    if (otherServoAngle && otherServoAngleValue) {
        otherServoAngle.addEventListener('input', () => {
            otherServoAngleValue.textContent = otherServoAngle.value + '°';
        });
    }
    if (otherServoSpeed && otherServoSpeedValue) {
        otherServoSpeed.addEventListener('input', () => {
            otherServoSpeedValue.textContent = otherServoSpeed.value;
        });
    }
    if (otherServoRunBtn) {
        otherServoRunBtn.addEventListener('click', () => {
            const angle = otherServoAngle ? otherServoAngle.value : 90;
            const speed = otherServoSpeed ? otherServoSpeed.value : 5;
            sendLine('OTHER:SERVO:' + angle + ',' + speed);
        });
    }
    const otherServoOffBtn = document.getElementById('otherServoOffBtn');
    if (otherServoOffBtn) {
        otherServoOffBtn.addEventListener('click', () => {
            sendLine('SERVO1:OFF');
        });
    }

    // --- Keypad ---
    document.querySelectorAll('.other-keypad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            if (key) {
                sendLine('OTHER:KEY:' + key);
                const lastEl = document.getElementById('otherKeypadLast');
                if (lastEl) lastEl.textContent = key;
            }
        });
    });

    // --- LED Matrix (Others tab - 5x5 mini) ---
    const otherMatrixCells = document.querySelectorAll('.other-matrix-cell');
    const otherLedMatrixClear = document.getElementById('otherLedMatrixClear');
    let otherMatrixState = Array(25).fill(false);

    otherMatrixCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const idx = parseInt(cell.dataset.index, 10);
            otherMatrixState[idx] = !otherMatrixState[idx];
            cell.classList.toggle('on', otherMatrixState[idx]);
            let hex = '';
            for (let row = 0; row < 5; row++) {
                let val = 0;
                for (let col = 0; col < 5; col++) {
                    if (otherMatrixState[row * 5 + col]) val |= (1 << col);
                }
                hex += val.toString(16).toUpperCase().padStart(2, '0');
            }
            sendLine('LM:' + hex);
        });
    });

    if (otherLedMatrixClear) {
        otherLedMatrixClear.addEventListener('click', () => {
            otherMatrixState.fill(false);
            otherMatrixCells.forEach(c => c.classList.remove('on'));
            sendLine('LM:0000000000');
        });
    }

    // --- RGB Strip ---
    const stripLeds = document.querySelectorAll('.other-strip-led');
    const stripClearBtn = document.getElementById('otherStripClearBtn');
    let stripColors = Array(8).fill('#000000');

    stripLeds.forEach(led => {
        led.addEventListener('click', () => {
            const idx = parseInt(led.dataset.index, 10);
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];
            const currentIdx = colors.indexOf(stripColors[idx]);
            const nextIdx = (currentIdx + 1) % colors.length;
            stripColors[idx] = colors[nextIdx];
            led.style.backgroundColor = stripColors[idx];
            sendLine('OTHER:STRIP:' + idx + ':' + stripColors[idx].replace('#', ''));
        });
    });

    if (stripClearBtn) {
        stripClearBtn.addEventListener('click', () => {
            stripColors.fill('#000000');
            stripLeds.forEach(l => l.style.backgroundColor = '#000000');
            sendLine('OTHER:STRIP:CLEAR');
        });
    }

    // --- File upload (just logs the filename) ---
    const fileUpload = document.getElementById('otherFileUpload');
    const fileLabel = document.getElementById('otherFileUploadLabel');
    if (fileUpload) {
        fileUpload.addEventListener('change', () => {
            if (fileUpload.files.length > 0) {
                const name = fileUpload.files[0].name;
                if (fileLabel) fileLabel.textContent = 'Loaded: ' + name;
                addLogLine('File selected: ' + name, 'info');
            }
        });
    }
})();
