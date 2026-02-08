// ============================================================
// ble.js — Bluetooth connection, UART send/receive, reconnect
// ============================================================

// ------------ Sending over UART (with chunking) ------------

const BLE_MTU_PAYLOAD = 20; // typical BLE ATT payload limit

function sendLine(line) {
    if (!writeChar || !isConnected) {
        addLogLine('TX blocked (not connected) > ' + line, 'error');
        return;
    }
    const enc = new TextEncoder();
    const data = enc.encode(line + '\n');

    if (data.byteLength <= BLE_MTU_PAYLOAD) {
        // Fits in one write
        writeChar.writeValue(data)
            .then(() => addLogLine('TX > ' + line, 'tx'))
            .catch(err => addLogLine('TX error: ' + err, 'error'));
    } else {
        // Chunk into BLE_MTU_PAYLOAD-sized pieces
        let offset = 0;
        const chunks = [];
        while (offset < data.byteLength) {
            const end = Math.min(offset + BLE_MTU_PAYLOAD, data.byteLength);
            chunks.push(data.slice(offset, end));
            offset = end;
        }
        // Send chunks sequentially
        let chain = Promise.resolve();
        chunks.forEach((chunk, i) => {
            chain = chain.then(() => writeChar.writeValue(chunk));
        });
        chain
            .then(() => addLogLine('TX > ' + line + ' (' + chunks.length + ' chunks)', 'tx'))
            .catch(err => addLogLine('TX error: ' + err, 'error'));
    }
}

// Attach listeners to all tab buttons — only notify micro:bit for tabs that affect firmware behavior
let lastSentTab = 'controls';
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.getAttribute("data-page");
    // Only send TAB change when entering or leaving "servos" tab
    // (micro:bit uses this to avoid pin conflicts with touch polling)
    if (page === 'servos' || lastSentTab === 'servos') {
      sendLine(`TAB:${page}`);
    }
    lastSentTab = page;
  });
});

// ------------ UART RX notification ------------

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

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;
let userDisconnected = false; // flag to distinguish manual vs unexpected disconnect

async function attemptReconnect() {
    if (userDisconnected || !btDevice || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            addLogLine('Reconnection failed after ' + MAX_RECONNECT_ATTEMPTS + ' attempts. Click Connect to try again.', 'error');
            if (typeof addActivity === 'function') {
                addActivity('⚠️ Could not reconnect. Try again!', 'info');
            }
        }
        reconnectAttempts = 0;
        return;
    }

    reconnectAttempts++;
    addLogLine('Attempting reconnect (' + reconnectAttempts + '/' + MAX_RECONNECT_ATTEMPTS + ')...', 'info');
    if (typeof addActivity === 'function') {
        addActivity('🔄 Reconnecting... (' + reconnectAttempts + '/' + MAX_RECONNECT_ATTEMPTS + ')', 'info');
    }

    await new Promise(r => setTimeout(r, RECONNECT_DELAY_MS));

    try {
        btServer = await btDevice.gatt.connect();
        uartService = await btServer.getPrimaryService(UART_SERVICE_UUID);
        const chars = await uartService.getCharacteristics();

        let c2 = null, c3 = null;
        for (const ch of chars) {
            const id = ch.uuid.toLowerCase();
            if (id.includes('6e400002')) c2 = ch;
            else if (id.includes('6e400003')) c3 = ch;
        }

        const isNotifier = ch => ch && (ch.properties.notify || ch.properties.indicate);
        const isWriter   = ch => ch && (ch.properties.write || ch.properties.writeWithoutResponse);

        notifyChar = isNotifier(c3) ? c3 : null;
        writeChar  = isWriter(c2) ? c2 : null;

        if (!notifyChar || !writeChar) {
            for (const ch of chars) {
                if (!notifyChar && isNotifier(ch)) notifyChar = ch;
                if (!writeChar && isWriter(ch))    writeChar  = ch;
            }
        }

        if (!notifyChar || !writeChar) {
            addLogLine('Reconnect: characteristics not found', 'error');
            attemptReconnect();
            return;
        }

        await notifyChar.startNotifications();
        notifyChar.addEventListener('characteristicvaluechanged', onUartNotification);

        setConnectionStatus(true);
        reconnectAttempts = 0;
        addLogLine('Reconnected!', 'success');
        sendLine('HELLO');
    } catch (err) {
        addLogLine('Reconnect failed: ' + err, 'error');
        attemptReconnect();
    }
}

async function connect() {
    try {
        userDisconnected = false;
        reconnectAttempts = 0;
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
            addLogLine('Device disconnected unexpectedly', 'error');
            setConnectionStatus(false);
            attemptReconnect();
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

        // Hello to firmware
        sendLine('HELLO');
    } catch (err) {
        console.error(err);
        addLogLine('Connection failed: ' + err, 'error');
        setConnectionStatus(false);
        connectBtn.disabled = false;
    }
}

async function disconnect() {
    userDisconnected = true; // prevent auto-reconnect
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
