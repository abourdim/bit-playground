// ============================================================
// core.js — Event bus, DOM helpers, logging, connection status
// ============================================================

// Simple event bus for connection state
const connectionEvents = new EventTarget();
function emitConnectionChange(connected) {
    connectionEvents.dispatchEvent(new CustomEvent('change', { detail: { connected } }));
}

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
const cmdButtons        = document.querySelectorAll('[data-cmd]');

// Sensor value elements (used by sensors.js)
const tempValueEl   = $('tempValue');
const lightValueEl  = $('lightValue');
const soundValueEl  = $('soundValue');
const motionValueEl = $('motionValue');
const accelXValueEl = $('accelXValue');
const accelYValueEl = $('accelYValue');
const accelZValueEl = $('accelZValue');
// Note: compassHeadingValueEl, btnA/B state, touch state elements
// are declared in sensors.js which owns the UART parsing

// BLE state
let btDevice   = null;
let btServer   = null;
let uartService= null;
let notifyChar = null;
let writeChar  = null;
let isConnected= false;

// ------------ Logging ------------

function addLogLine(text, kind = 'info') {
    if (!logEl) return;
    const d = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'log-' + kind;
    line.textContent = `[${d}] ${text}`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
    // Cap at 500 entries to prevent memory growth in long sessions
    while (logEl.children.length > 500) {
        logEl.removeChild(logEl.firstChild);
    }
}

function clearLog() {
    if (logEl) logEl.innerHTML = '';
}

function exportLog() {
    if (!logEl) return;
    const text = logEl.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'microbit_log.txt';
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

    // Notify all listeners (servos, etc.)
    emitConnectionChange(connected);

    if (!connectionStatusEl) return;
    const dot  = connectionStatusEl.querySelector('.status-dot');
    const text = connectionStatusEl.querySelector('span:last-child');
    if (connected) {
        connectionStatusEl.classList.add('connected');
        connectionStatusEl.classList.remove('disconnected');
        if (text) text.textContent = 'Connected';
    } else {
        connectionStatusEl.classList.remove('connected');
        connectionStatusEl.classList.add('disconnected');
        if (text) text.textContent = 'Disconnected';
    }
}

// Alias for sendLine (used by servo module)
function writeUART(line) {
    sendLine(line);
}

// ------------ Activity Feed (Kid-friendly log) ------------

const activityFeed = document.getElementById('activity');
const clearActivityBtn = document.getElementById('clearActivityBtn');

function addActivity(message, type = 'info') {
    if (!activityFeed) return;
    const item = document.createElement('div');
    item.className = 'activity-item ' + type;
    item.textContent = message;
    activityFeed.appendChild(item);
    activityFeed.scrollTop = activityFeed.scrollHeight;

    // Keep only last 20 items
    while (activityFeed.children.length > 20) {
        activityFeed.removeChild(activityFeed.firstChild);
    }
}

clearActivityBtn?.addEventListener('click', () => {
    if (activityFeed) activityFeed.innerHTML = '';
});
