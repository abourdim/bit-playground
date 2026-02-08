// ============================================================
// sensors.js — Charts, UART parsing, button pill visuals
// ============================================================

// Sensor state elements (additional)
const btnAStateEl    = $('btnAState');
const btnADotEl      = $('btnADot');
const btnATextEl     = $('btnAText');
const btnBStateEl    = $('btnBState');
const btnBDotEl      = $('btnBDot');
const btnBTextEl     = $('btnBText');
const touchP0StateEl = $('touchP0State');
const touchP0DotEl   = $('touchP0Dot');
const touchP0TextEl  = $('touchP0Text');
const touchP1StateEl = $('touchP1State');
const touchP1DotEl   = $('touchP1Dot');
const touchP1TextEl  = $('touchP1Text');
const touchP2StateEl = $('touchP2State');
const touchP2DotEl   = $('touchP2Dot');
const touchP2TextEl  = $('touchP2Text');
const logoStateEl    = $('logoState');
const logoDotEl      = $('logoDot');
const logoTextEl     = $('logoText');
const compassHeadingValueEl = $('compassHeadingValue');

// Charts
let tempChart, lightChart, soundChart, motionChart;
let accelXChart, accelYChart, accelZChart;
let btnAChart, btnBChart;
let touchP0Chart, touchP1Chart, touchP2Chart, logoChart;
const MAX_POINTS = 50;

// ------------ Charts ------------

function createChart(canvasId, label) {
    const canvas = $(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    return new Chart(canvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label,
                data: [],
                tension: 0.25,
                fill: false
            }]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { display: false },
                y: {
                    ticks: { font: { size: 9 } }
                }
            }
        }
    });
}

function pushPoint(chart, value) {
    if (!chart) return;
    const d = chart.data;
    d.labels.push('');
    d.datasets[0].data.push(value);
    if (d.labels.length > MAX_POINTS) {
        d.labels.shift();
        d.datasets[0].data.shift();
    }
    chart.update();
}

// ------------ Button pill visuals ------------

function setButtonPill(pill, dot, textNode, pressed) {
    if (!pill || !dot || !textNode) return;
    if (pressed) {
        pill.classList.add('active');
        dot.style.backgroundColor = '#22c55e';
        textNode.textContent = 'Pressed';
    } else {
        pill.classList.remove('active');
        dot.style.backgroundColor = '';
        textNode.textContent = 'Ready';
    }
}

// ------------ UART RX parsing (with error handling) ------------

function handleUartLine(line) {
    try {
        const t = line.trim();
        if (!t) return;

        addLogLine('RX < ' + t, 'rx');

        if (t.startsWith('BENCH:')) {
            const resp = t.slice(6).trim();
            const respWin = document.getElementById("benchResponse");
            if (respWin) {
                const lineEl = document.createElement("div");
                lineEl.textContent = resp;
                respWin.appendChild(lineEl);
                // Cap at 100 entries to prevent unbounded growth
                while (respWin.children.length > 100) {
                    respWin.removeChild(respWin.firstChild);
                }
            }
            addLogLine("Bench response: " + resp, "rx");
            return;
        }

        if (t.startsWith('TEMP:')) {
            const v = parseInt(t.slice(5), 10);
            if (!Number.isNaN(v)) {
                if (tempValueEl) tempValueEl.textContent = v;
                pushPoint(tempChart, v);
                if (typeof graphPushData === 'function') graphPushData('temp', v, 'Temp');
            }
            return;
        }

        if (t.startsWith('LIGHT:')) {
            const v = parseInt(t.slice(6), 10);
            if (!Number.isNaN(v)) {
                if (lightValueEl) lightValueEl.textContent = v;
                pushPoint(lightChart, v);
                if (typeof graphPushData === 'function') graphPushData('light', v, 'Light');
            }
            return;
        }

        if (t.startsWith('SOUND:')) {
            const v = parseInt(t.slice(6), 10);
            if (!Number.isNaN(v)) {
                if (soundValueEl) soundValueEl.textContent = v;
                pushPoint(soundChart, v);
                if (typeof graphPushData === 'function') graphPushData('sound', v, 'Sound');
            }
            return;
        }

        if (t.startsWith('ACC:')) {
            const parts = t.slice(4).split(',');
            if (parts.length === 3) {
                const ax = parseInt(parts[0], 10);
                const ay = parseInt(parts[1], 10);
                const az = parseInt(parts[2], 10);
                if (![ax,ay,az].some(Number.isNaN)) {
                    const mag = Math.round(Math.sqrt(ax*ax + ay*ay + az*az));
                    if (accelXValueEl) accelXValueEl.textContent = ax;
                    if (accelYValueEl) accelYValueEl.textContent = ay;
                    if (accelZValueEl) accelZValueEl.textContent = az;
                    if (motionValueEl) motionValueEl.textContent = mag;

                    pushPoint(accelXChart, ax);
                    pushPoint(accelYChart, ay);
                    pushPoint(accelZChart, az);
                    pushPoint(motionChart, mag);
                    if (typeof graphPushData === 'function') {
                        graphPushData('accelX', ax, 'Accel X');
                        graphPushData('accelY', ay, 'Accel Y');
                        graphPushData('accelZ', az, 'Accel Z');
                    }
                }
            }
            return;
        }

        if (t.startsWith('BTN:A:')) {
            const v = parseInt(t.slice(6), 10);
            if (!Number.isNaN(v)) {
                setButtonPill(btnAStateEl, btnADotEl, btnATextEl, v === 1);
                pushPoint(btnAChart, v);
                if (v === 1 && typeof addActivity === 'function') {
                    addActivity('🔴 Button A pressed!', 'received');
                }
            }
            return;
        }

        if (t.startsWith('BTN:B:')) {
            const v = parseInt(t.slice(6), 10);
            if (!Number.isNaN(v)) {
                setButtonPill(btnBStateEl, btnBDotEl, btnBTextEl, v === 1);
                pushPoint(btnBChart, v);
                if (v === 1 && typeof addActivity === 'function') {
                    addActivity('🔵 Button B pressed!', 'received');
                }
            }
            return;
        }

        if (t.startsWith('BTN:P0:')) {
            const v = parseInt(t.slice(7), 10);
            if (!Number.isNaN(v)) {
                setButtonPill(touchP0StateEl, touchP0DotEl, touchP0TextEl, v === 1);
                pushPoint(touchP0Chart, v);
                if (typeof graphPushData === 'function') graphPushData('touchP0', v, 'Touch P0');
                if (v === 1 && typeof addActivity === 'function') {
                    addActivity('👆 Touch P0!', 'received');
                }
            }
            return;
        }

        if (t.startsWith('BTN:P1:')) {
            const v = parseInt(t.slice(7), 10);
            if (!Number.isNaN(v)) {
                setButtonPill(touchP1StateEl, touchP1DotEl, touchP1TextEl, v === 1);
                pushPoint(touchP1Chart, v);
                if (typeof graphPushData === 'function') graphPushData('touchP1', v, 'Touch P1');
            }
            return;
        }

        if (t.startsWith('BTN:P2:')) {
            const v = parseInt(t.slice(7), 10);
            if (!Number.isNaN(v)) {
                setButtonPill(touchP2StateEl, touchP2DotEl, touchP2TextEl, v === 1);
                pushPoint(touchP2Chart, v);
                if (typeof graphPushData === 'function') graphPushData('touchP2', v, 'Touch P2');
            }
            return;
        }

        if (t.startsWith('BTN:LOGO:')) {
            const v = parseInt(t.slice(9), 10);
            if (!Number.isNaN(v)) {
                setButtonPill(logoStateEl, logoDotEl, logoTextEl, v === 1);
                pushPoint(logoChart, v);
                if (v === 1 && typeof addActivity === 'function') {
                    addActivity('✨ Logo touched!', 'received');
                }
            }
            return;
        }

        if (t.startsWith('COMPASS:')) {
            const v = parseInt(t.slice(8), 10);
            if (!Number.isNaN(v)) {
                if (compassHeadingValueEl) compassHeadingValueEl.textContent = v;
                if (typeof graphPushData === 'function') graphPushData('compass', v, 'Compass');
            }
            return;
        }

        if (t.startsWith('INFO:SERIAL:')) {
            const serial = t.slice('INFO:SERIAL:'.length);
            if (serialNumberEl) serialNumberEl.textContent = serial;
            return;
        }

        // Servo position telemetry
        if (t.startsWith('SERVO1_POS:')) {
            const v = parseInt(t.slice(11), 10);
            if (!Number.isNaN(v) && typeof updateServoGauge === 'function') updateServoGauge('servo1Needle', v, 'servo1GaugeValue');
            return;
        }

        if (t.startsWith('SERVO2_POS:')) {
            const v = parseInt(t.slice(11), 10);
            if (!Number.isNaN(v) && typeof updateServoGauge === 'function') updateServoGauge('servo2Needle', v, 'servo2GaugeValue');
            return;
        }

        // Custom graph data: GRAPH:Label:Value
        if (t.startsWith('GRAPH:')) {
            const parts = t.slice(6).split(':');
            if (parts.length === 2) {
                const label = parts[0].trim();
                const v = parseFloat(parts[1]);
                if (label && !Number.isNaN(v) && typeof graphPushData === 'function') {
                    graphPushData('custom_' + label, v, label);
                }
            }
            return;
        }

        // Touch button events
        if (t.startsWith('EVENT:TOUCH_P0_PRESSED'))  { addLogLine('Touch P0 pressed', 'success'); return; }
        if (t.startsWith('EVENT:TOUCH_P0_RELEASED')) { addLogLine('Touch P0 released', 'info');    return; }
        if (t.startsWith('EVENT:TOUCH_P1_PRESSED'))  { addLogLine('Touch P1 pressed', 'success'); return; }
        if (t.startsWith('EVENT:TOUCH_P1_RELEASED')) { addLogLine('Touch P1 released', 'info');    return; }
        if (t.startsWith('EVENT:TOUCH_P2_PRESSED'))  { addLogLine('Touch P2 pressed', 'success'); return; }
        if (t.startsWith('EVENT:TOUCH_P2_RELEASED')) { addLogLine('Touch P2 released', 'info');    return; }
        if (t.startsWith('EVENT:LOGO_PRESSED'))      { addLogLine('Logo pressed', 'success');      return; }
        if (t.startsWith('EVENT:LOGO_RELEASED'))     { addLogLine('Logo released', 'info');        return; }

        // other lines (INFO, ECHO, LOG, EVENT...) just appear in the log
    } catch (err) {
        console.error('Error parsing UART line:', line, err);
        addLogLine('Parse error: ' + err.message, 'error');
    }
}
