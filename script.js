// micro:bit Playground – Web Bluetooth + UI

const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

// Shorthand
const $ = id => document.getElementById(id);

// Connection / UI elements
const connectionStatusEl = $('connectionStatus');
const connectBtn         = $('connectBtn');
const disconnectBtn      = $('disconnectBtn');
const deviceNameEl       = $('deviceName');
const serviceUuidEl      = $('serviceUuidDisplay');
const rxCharUuidEl       = $('rxCharUuidDisplay');
const txCharUuidEl       = $('txCharUuidDisplay');
const serialNumberEl     = $('serialNumber');

// Log
const logEl        = $('log');
const clearLogBtn  = $('clearLogBtn');
const exportLogBtn = $('exportLogBtn');

// Mode & tabs
const beginnerModeBtn = $('beginnerModeBtn');
const expertModeBtn   = $('expertModeBtn');
const appRoot         = document.querySelector('.app');
const tabButtons      = document.querySelectorAll('.tab-btn');
const tabPages        = document.querySelectorAll('.tab-page');

// Controls
const textInput         = $('textInput');
const sendTextBtn       = $('sendTextBtn');
const customJsonInput   = $('customJsonInput');
const sendCustomJsonBtn = $('sendCustomJsonBtn');

// LED
const ledMatrixEl       = $('ledMatrix');
const sendLedPatternBtn = $('sendLedPatternBtn');
const clearMatrixBtn    = $('clearMatrixBtn');
const presetButtons     = document.querySelectorAll('.chip-btn[data-preset]');
//const cmdButtons        = document.querySelectorAll('.chip-btn[data-cmd]');
const cmdButtons = document.querySelectorAll('[data-cmd]');
// Senses value elements
const tempValueEl   = $('tempValue');
const lightValueEl  = $('lightValue');
const soundValueEl  = $('soundValue');
const motionValueEl = $('motionValue');
const accelXValueEl = $('accelXValue');
const accelYValueEl = $('accelYValue');
const accelZValueEl = $('accelZValue');
const compassHeadingValueEl = $('compassHeadingValue');

// Button state
const btnAStateEl = $('btnAState');
const btnADotEl   = $('btnADot');
const btnATextEl  = $('btnAText');
const btnBStateEl = $('btnBState');
const btnBDotEl   = $('btnBDot');
const btnBTextEl  = $('btnBText');

// Touch button state elements
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

// BLE state
let btDevice = null;
let btServer = null;
let uartService = null;
let notifyChar = null;
let writeChar  = null;
let isConnected = false;

// Charts
let tempChart, lightChart, soundChart, motionChart;
let accelXChart, accelYChart, accelZChart;
let btnAChart, btnBChart;
let touchP0Chart, touchP1Chart, touchP2Chart, logoChart;
const MAX_POINTS = 50;

// LED state
let ledState  = Array.from({ length: 5 }, () => Array(5).fill(false));
let isDrawing = false;
let drawMode  = true;

// ------------ Logging ------------

function addLogLine(text, kind = 'info') {
    if (!logEl) return;
    const div = document.createElement('div');
    div.className = 'log-line ' + kind;
    div.textContent = text;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
    if (logEl) logEl.innerHTML = '';
}

function exportLog() {
    if (!logEl) return;
    const text = Array.from(logEl.querySelectorAll('.log-line'))
        .map(el => el.textContent)
        .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'microbit-log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ------------ Connection status ------------

function setConnectionStatus(connected) {
    isConnected = connected;

    if (connectBtn)    connectBtn.disabled    = connected;
    if (disconnectBtn) disconnectBtn.disabled = !connected;

    if (!connectionStatusEl) return;
    const labelSpan = connectionStatusEl.querySelector('span:nth-child(2)');
    if (connected) {
        connectionStatusEl.classList.add('connected');
        if (labelSpan) labelSpan.textContent = 'Connected';
    } else {
        connectionStatusEl.classList.remove('connected');
        if (labelSpan) labelSpan.textContent = 'Disconnected';
    }
}

// 👇 AJOUTER ÇA
function writeUART(line) {
    sendLine(line);
}

// ------------ Sending over UART ------------

function sendLine(line) {
    if (!writeChar || !isConnected) {
        addLogLine('TX blocked (not connected) > ' + line, 'error');
        return;
    }
    const enc = new TextEncoder();
    const data = enc.encode(line + '\n');
    writeChar.writeValue(data)
        .then(() => addLogLine('TX > ' + line, 'tx'))
        .catch(err => addLogLine('TX error: ' + err, 'error'));
}

// Attach listeners to all tab buttons
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.getAttribute("data-page");

    // Use your existing sendLine function
    // Send a simple string or JSON depending on your micro:bit program
    sendLine(`TAB:${page}`);

    // Or if your micro:bit expects JSON:
    // sendLine(JSON.stringify({ type: "tabChange", page }));
  });
});

// ------------ LED matrix ------------

function buildLedGrid() {
    if (!ledMatrixEl) return;
    ledMatrixEl.innerHTML = '';
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.className = 'led-cell';
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);

            cell.addEventListener('mousedown', e => {
                e.preventDefault();
                isDrawing = true;
                const row = parseInt(cell.dataset.row, 10);
                const col = parseInt(cell.dataset.col, 10);
                drawMode = !ledState[row][col];
                setLed(row, col, drawMode);
            });

            cell.addEventListener('mouseenter', () => {
                if (!isDrawing) return;
                const row = parseInt(cell.dataset.row, 10);
                const col = parseInt(cell.dataset.col, 10);
                setLed(row, col, drawMode);
            });

            ledMatrixEl.appendChild(cell);
        }
    }
    document.addEventListener('mouseup', () => { isDrawing = false; });
}

function setLed(row, col, on) {
    ledState[row][col] = on;
    const idx  = row * 5 + col;
    const cell = ledMatrixEl.children[idx];
    if (!cell) return;
    if (on) cell.classList.add('on');
    else    cell.classList.remove('on');
}

function clearMatrix() {
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            setLed(r, c, false);
        }
    }
}

// Pack each row into one byte -> 2 hex chars per row -> total 10 hex chars
function ledStateToHex() {
    let hex = "";

    for (let row = 0; row < 5; row++) {
        let value = 0;
        for (let col = 0; col < 5; col++) {
            if (ledState[row][col]) {
                value |= (1 << col); // bit 0 = col0 ... bit4 = col4
            }
        }
        const rowHex = value.toString(16).toUpperCase().padStart(2, "0");
        hex += rowHex;
    }

    return hex; // always 10 chars
}

// Simple presets
function applyPreset(name) {
    clearMatrix();
    const pts = [];
    if (name === 'heart') {
        pts.push(
            [1,1],[1,3],
            [2,0],[2,2],[2,4],
            [3,1],[3,3],
            [4,2]
        );
    } else if (name === 'smile') {
        pts.push(
            [1,0],[1,4],
            [3,1],[3,3],
            [4,2]
        );
    } else if (name === 'tick') {
        pts.push(
            [0,2],
            [1,2],[1,3],
            [2,3],
            [3,3],[3,4],
            [4,4]
        );
    }
    pts.forEach(([r,c]) => setLed(r,c,true));
}

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

// ------------ UART RX parsing ------------

function handleUartLine(line) {
    const t = line.trim();
    if (!t) return;

    addLogLine('RX < ' + t, 'rx');

	if (t.startsWith('BENCH:')) {
		// Everything after "BENCH:" is the response
		const resp = t.slice(6).trim();

		// Update the Bench response window
		const respWin = document.getElementById("benchResponse");
		if (respWin) {
			// Append instead of overwrite, so you see history
			const lineEl = document.createElement("div");
			lineEl.textContent = resp;
			respWin.appendChild(lineEl);
		}

		// Also log it in the global Message Log
		addLogLine("Bench response: " + resp, "rx");
		return;
	}

    if (t.startsWith('TEMP:')) {
        const v = parseInt(t.slice(5), 10);
        if (!Number.isNaN(v)) {
            if (tempValueEl) tempValueEl.textContent = v;
            pushPoint(tempChart, v);
        }
        return;
    }

    if (t.startsWith('LIGHT:')) {
        const v = parseInt(t.slice(6), 10);
        if (!Number.isNaN(v)) {
            if (lightValueEl) lightValueEl.textContent = v;
            pushPoint(lightChart, v);
        }
        return;
    }

    if (t.startsWith('SOUND:')) {
        const v = parseInt(t.slice(6), 10);
        if (!Number.isNaN(v)) {
            if (soundValueEl) soundValueEl.textContent = v;
            pushPoint(soundChart, v);
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
            }
        }
        return;
    }

    if (t.startsWith('BTN:A:')) {
        const v = parseInt(t.slice(6), 10);
        if (!Number.isNaN(v)) {
            setButtonPill(btnAStateEl, btnADotEl, btnATextEl, v === 1);
            pushPoint(btnAChart, v);
        }
        return;
    }

    if (t.startsWith('BTN:B:')) {
        const v = parseInt(t.slice(6), 10);
        if (!Number.isNaN(v)) {
            setButtonPill(btnBStateEl, btnBDotEl, btnBTextEl, v === 1);
            pushPoint(btnBChart, v);
        }
        return;
    }

    if (t.startsWith('BTN:P0:')) {
        const v = parseInt(t.slice(7), 10);
        if (!Number.isNaN(v)) {
            setButtonPill(touchP0StateEl, touchP0DotEl, touchP0TextEl, v === 1);
            pushPoint(touchP0Chart, v);
        }
        return;
    }

    if (t.startsWith('BTN:P1:')) {
        const v = parseInt(t.slice(7), 10);
        if (!Number.isNaN(v)) {
            setButtonPill(touchP1StateEl, touchP1DotEl, touchP1TextEl, v === 1);
            pushPoint(touchP1Chart, v);
        }
        return;
    }

    if (t.startsWith('BTN:P2:')) {
        const v = parseInt(t.slice(7), 10);
        if (!Number.isNaN(v)) {
            setButtonPill(touchP2StateEl, touchP2DotEl, touchP2TextEl, v === 1);
            pushPoint(touchP2Chart, v);
        }
        return;
    }

    if (t.startsWith('BTN:LOGO:')) {
        const v = parseInt(t.slice(9), 10);
        if (!Number.isNaN(v)) {
            setButtonPill(logoStateEl, logoDotEl, logoTextEl, v === 1);
            pushPoint(logoChart, v);
        }
        return;
    }

    if (t.startsWith('COMPASS:')) {
        const v = parseInt(t.slice(8), 10);
        if (!Number.isNaN(v) && compassHeadingValueEl) {
            compassHeadingValueEl.textContent = v;
        }
        return;
    }

    if (t.startsWith('INFO:SERIAL:')) {
        const serial = t.slice('INFO:SERIAL:'.length);
        if (serialNumberEl) serialNumberEl.textContent = serial;
        return;
    }

    // Touch button events
    if (t.startsWith('EVENT:TOUCH_P0_PRESSED')) {
        addLogLine('Touch P0 pressed', 'success');
        return;
    }

    if (t.startsWith('EVENT:TOUCH_P0_RELEASED')) {
        addLogLine('Touch P0 released', 'info');
        return;
    }

    if (t.startsWith('EVENT:TOUCH_P1_PRESSED')) {
        addLogLine('Touch P1 pressed', 'success');
        return;
    }

    if (t.startsWith('EVENT:TOUCH_P1_RELEASED')) {
        addLogLine('Touch P1 released', 'info');
        return;
    }

    if (t.startsWith('EVENT:TOUCH_P2_PRESSED')) {
        addLogLine('Touch P2 pressed', 'success');
        return;
    }

    if (t.startsWith('EVENT:TOUCH_P2_RELEASED')) {
        addLogLine('Touch P2 released', 'info');
        return;
    }

    if (t.startsWith('EVENT:LOGO_PRESSED')) {
        addLogLine('Logo pressed', 'success');
        return;
    }

    if (t.startsWith('EVENT:LOGO_RELEASED')) {
        addLogLine('Logo released', 'info');
        return;
    }

    // other lines (INFO, ECHO, LOG, EVENT...) just appear in the log
}

function onUartNotification(event) {
    const dv = event.target.value;
    let text = '';
    for (let i = 0; i < dv.byteLength; i++) {
        text += String.fromCharCode(dv.getUint8(i));
    }
    text.split(/\r?\n/).forEach(line => {
        if (line.trim()) handleUartLine(line);
    });
}

// ------------ Bluetooth connect/disconnect ------------

async function connect() {
    try {
        if (!navigator.bluetooth) {
            addLogLine('Web Bluetooth not available in this browser.', 'error');
            return;
        }

        connectBtn.disabled = true;
        addLogLine('Requesting micro:bit device...', 'info');

        btDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }],
            optionalServices: [UART_SERVICE_UUID]
        });

        btDevice.addEventListener('gattserverdisconnected', () => {
            addLogLine('Device disconnected', 'error');
            setConnectionStatus(false);
        });

        addLogLine('Connecting GATT...', 'info');
        btServer = await btDevice.gatt.connect();

        addLogLine('Getting UART service...', 'info');
        uartService = await btServer.getPrimaryService(UART_SERVICE_UUID);

        addLogLine('Getting characteristics...', 'info');
        const chars = await uartService.getCharacteristics();
        notifyChar = null;
        writeChar  = null;

        // Prefer Nordic UART RX/TX IDs
        let c2 = null, c3 = null;
        for (const ch of chars) {
            const id = ch.uuid.toLowerCase();
            if (id.includes('6e400002')) c2 = ch; // RX (write)
            else if (id.includes('6e400003')) c3 = ch; // TX (notify)
        }

        const isNotifier = ch => ch && (ch.properties.notify || ch.properties.indicate);
        const isWriter   = ch => ch && (ch.properties.write || ch.properties.writeWithoutResponse);

        if (isNotifier(c3)) notifyChar = c3;
        if (isWriter(c2))   writeChar  = c2;

        // Fallback: first notify + first write
        if (!notifyChar || !writeChar) {
            for (const ch of chars) {
                if (!notifyChar && isNotifier(ch)) notifyChar = ch;
                if (!writeChar && isWriter(ch))    writeChar  = ch;
            }
        }

        if (!notifyChar || !writeChar) {
            addLogLine('UART characteristics not found (no notify/write pair)', 'error');
            setConnectionStatus(false);
            connectBtn.disabled = false;
            return;
        }

        await notifyChar.startNotifications();
        notifyChar.addEventListener('characteristicvaluechanged', onUartNotification);

        if (deviceNameEl && btDevice.name) deviceNameEl.textContent = btDevice.name;
        if (serviceUuidEl) serviceUuidEl.textContent = UART_SERVICE_UUID;
        if (rxCharUuidEl)  rxCharUuidEl.textContent  = writeChar.uuid;
        if (txCharUuidEl)  txCharUuidEl.textContent  = notifyChar.uuid;

        setConnectionStatus(true);
        addLogLine('Connected!', 'success');

        // Hello to firmware (it just echoes / logs)
        sendLine('HELLO');
    } catch (err) {
        console.error(err);
        addLogLine('Connection failed: ' + err, 'error');
        setConnectionStatus(false);
        connectBtn.disabled = false;
    }
}

async function disconnect() {
    try {
        if (notifyChar) {
            try { await notifyChar.stopNotifications(); } catch {}
        }
        if (btDevice && btDevice.gatt && btDevice.gatt.connected) {
            btDevice.gatt.disconnect();
        }
    } catch (e) {
        console.error(e);
    } finally {
        addLogLine('Disconnected', 'info');
        setConnectionStatus(false);
        connectBtn.disabled = false;
    }
}

// ------------ Tabs ------------

function setActiveTab(page) {
    tabPages.forEach(p => {
        p.classList.toggle('active', p.dataset.page === page);
    });
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    try { localStorage.setItem('mb_active_tab', page); } catch {}
}

// ------------ Init ------------

window.addEventListener('DOMContentLoaded', () => {
    // Charts
    tempChart   = createChart('tempChart',   'Temperature');
    lightChart  = createChart('lightChart',  'Light');
    soundChart  = createChart('soundChart',  'Sound');
    motionChart = createChart('motionChart', 'Motion');
    accelXChart = createChart('accelXChart', 'Accel X');
    accelYChart = createChart('accelYChart', 'Accel Y');
    accelZChart = createChart('accelZChart', 'Accel Z');
    btnAChart   = createChart('btnAChart',   'Button A');
    btnBChart   = createChart('btnBChart',   'Button B');
    touchP0Chart = createChart('touchP0Chart', 'Touch P0');
    touchP1Chart = createChart('touchP1Chart', 'Touch P1');
    touchP2Chart = createChart('touchP2Chart', 'Touch P2');
    logoChart    = createChart('logoChart',    'Logo Touch');

    // LED matrix
    buildLedGrid();
    if (clearMatrixBtn) clearMatrixBtn.addEventListener('click', clearMatrix);
    if (sendLedPatternBtn) {
        sendLedPatternBtn.addEventListener('click', () => {
            const hex = ledStateToHex();
            sendLine('LM:' + hex);   // matches micro:bit LM handler
        });
    }
    presetButtons.forEach(btn => {
        const preset = btn.dataset.preset;
        if (!preset) return;
        btn.addEventListener('click', () => applyPreset(preset));
    });

    // CMD buttons (HEART/SMILE/CLEAR)
    cmdButtons.forEach(btn => {
        const cmd = btn.dataset.cmd;
        btn.addEventListener('click', () => {
            if (!cmd) return;
            sendLine('CMD:' + cmd);  // CMD:HEART etc
        });
    });
// =======================
// BUZZER CONTROL
// =======================

const buzzFreq = document.getElementById('buzzFreq');
const buzzFreqValue = document.getElementById('buzzFreqValue');
const buzzDur = document.getElementById('buzzDur');

buzzFreq.addEventListener('input', () => {
    buzzFreqValue.textContent = buzzFreq.value + " Hz";
});

document.getElementById('buzzPlay').addEventListener('click', () => {
    const f = parseInt(buzzFreq.value);
    const d = parseInt(buzzDur.value);
    sendLine("BUZZ:" + f + "," + d);
});

document.getElementById('buzzStop').addEventListener('click', () => {
    sendLine("BUZZ:OFF");
});


// --- BENCH TAB HANDLER ---
const benchSendBtn = document.getElementById("benchSendBtn");
const benchInput   = document.getElementById("benchInput");

benchSendBtn.addEventListener("click", () => {
  const line = benchInput.value.trim();
  if (!line) {
    addLogLine("Bench: no command entered", "info");
    return;
  }

  // Send raw line to micro:bit
  sendLine('BENCH:' + line);

  // Log locally
  addLogLine("Bench sent: " + line, "tx");
});







    // Connection buttons
    if (connectBtn)    connectBtn.addEventListener('click', connect);
    if (disconnectBtn) disconnectBtn.addEventListener('click', disconnect);
    if (clearLogBtn)   clearLogBtn.addEventListener('click', clearLog);
    if (exportLogBtn)  exportLogBtn.addEventListener('click', exportLog);

    // Text message – uses TEXT: prefix (matches micro:bit)
    if (sendTextBtn && textInput) {
        sendTextBtn.addEventListener('click', () => {
            const msg = textInput.value.trim();
            if (!msg) return;
            sendLine('TEXT:' + msg);
        });
    }

    // Custom JSON (for experiments)
    if (sendCustomJsonBtn && customJsonInput) {
        sendCustomJsonBtn.addEventListener('click', () => {
            const raw = customJsonInput.value.trim();
            if (!raw) return;
            sendLine('JSON:' + raw);
        });
    }

    // Beginner / expert mode
    if (beginnerModeBtn && expertModeBtn && appRoot) {
        beginnerModeBtn.addEventListener('click', () => {
            appRoot.classList.add('beginner-mode');
        });
        expertModeBtn.addEventListener('click', () => {
            appRoot.classList.remove('beginner-mode');
        });
    }

    // Tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveTab(btn.dataset.page);
        });
    });

    let initialTab = 'controls';
    try {
        const stored = localStorage.getItem('mb_active_tab');
        if (stored) initialTab = stored;
    } catch {}
    setActiveTab(initialTab);

    addLogLine('UI ready. Click "Connect to micro:bit" to begin.', 'info');
});

// --- APPENDED: Servo controls wiring (append only, no other changes) ---
(function(){
  const s1Range = document.getElementById('servo1Angle');
  const s1Num   = document.getElementById('servo1Number');
  const s1Send  = document.getElementById('servo1Send');
  const s1Off   = document.getElementById('servo1Off');

  const s2Range = document.getElementById('servo2Angle');
  const s2Num   = document.getElementById('servo2Number');
  const s2Send  = document.getElementById('servo2Send');
  const s2Off   = document.getElementById('servo2Off');

  function syncRangeNumber(range, num) {
    if (!range || !num) return;
    range.addEventListener('input', () => { num.value = range.value; });
    num.addEventListener('change', () => {
      let v = parseInt(num.value, 10);
      if (Number.isNaN(v)) v = 0;
      if (v < 0) v = 0;
      if (v > 180) v = 180;
      num.value = v;
      range.value = v;
    });
  }

  syncRangeNumber(s1Range, s1Num);
  syncRangeNumber(s2Range, s2Num);

  s1Send && s1Send.addEventListener('click', () => {
    const v = Math.min(180, Math.max(0, parseInt(s1Num.value || 0, 10)));
    if (typeof writeUART === 'function') writeUART('SERVO1:' + v);
  });
  s1Off && s1Off.addEventListener('click', () => {
    if (typeof writeUART === 'function') writeUART('SERVO1:OFF');
  });

  s2Send && s2Send.addEventListener('click', () => {
    const v = Math.min(180, Math.max(0, parseInt(s2Num.value || 0, 10)));
    if (typeof writeUART === 'function') writeUART('SERVO2:' + v);
  });
  s2Off && s2Off.addEventListener('click', () => {
    if (typeof writeUART === 'function') writeUART('SERVO2:OFF');
  });

  // disable servo controls if writeUART or DOM not ready
  function setServoDisabled(disabled) {
    [s1Range, s1Num, s1Send, s1Off, s2Range, s2Num, s2Send, s2Off].forEach(el => {
      if (!el) return;
      el.disabled = !!disabled;
    });
  }

  // initial state: disabled until a connection exists (best-effort)
  setServoDisabled(true);

  // try to enable when setConnectedUI(true) is called elsewhere:
  // we watch for the connection status pill text change as a non-invasive hook
  const connTextNode = document.querySelector('#connectionStatus span:last-child');
  if (connTextNode) {
    const observer = new MutationObserver(() => {
      const txt = connTextNode.textContent || '';
      setServoDisabled(!(txt.toLowerCase().includes('connected')));
    });
    observer.observe(connTextNode, { childList: true, characterData: true, subtree: true });
    // run once to set initial state
    setServoDisabled(!(connTextNode.textContent || '').toLowerCase().includes('connected'));
  }
})();

// --- Servo gauges ---
function updateServoGauge(needleId, value, valueId) {
    const angle = -90 + (value * 180 / 180); // map 0–180 to -90 to +90
    const needle = document.getElementById(needleId);
    needle.setAttribute("transform", `rotate(${angle} 60 60)`);

    document.getElementById(valueId).textContent = value + "°";
}

// Servo 1
servo1Angle.addEventListener("input", () => {
    updateServoGauge("servo1Needle", servo1Angle.value, "servo1GaugeValue");
});
servo1Number.addEventListener("input", () => {
    updateServoGauge("servo1Needle", servo1Number.value, "servo1GaugeValue");
});

// Servo 2
servo2Angle.addEventListener("input", () => {
    updateServoGauge("servo2Needle", servo2Angle.value, "servo2GaugeValue");
});
servo2Number.addEventListener("input", () => {
    updateServoGauge("servo2Needle", servo2Number.value, "servo2GaugeValue");
});

