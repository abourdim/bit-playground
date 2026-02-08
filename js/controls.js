// ============================================================
// controls.js — LED matrix, buzzer, text, bench, tabs, init
// ============================================================

// LED state (exposed on window for 3D board sync)
window.ledState = Array.from({ length: 5 }, () => Array(5).fill(false));
let ledState = window.ledState;
let isDrawing = false;
let drawMode  = true;

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
            // ARIA: keyboard accessible LED cells (Fix 13)
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-label', `LED row ${r + 1} column ${c + 1}`);
            cell.setAttribute('aria-pressed', 'false');

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

            // Keyboard support (Fix 13)
            cell.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const row = parseInt(cell.dataset.row, 10);
                    const col = parseInt(cell.dataset.col, 10);
                    setLed(row, col, !ledState[row][col]);
                } else if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    const row = parseInt(cell.dataset.row, 10);
                    const col = parseInt(cell.dataset.col, 10);
                    let nr = row, nc = col;
                    if (e.key === 'ArrowUp')    nr = Math.max(0, row - 1);
                    if (e.key === 'ArrowDown')  nr = Math.min(4, row + 1);
                    if (e.key === 'ArrowLeft')  nc = Math.max(0, col - 1);
                    if (e.key === 'ArrowRight') nc = Math.min(4, col + 1);
                    const nextIdx = nr * 5 + nc;
                    const nextCell = ledMatrixEl.children[nextIdx];
                    if (nextCell) nextCell.focus();
                }
            });

            ledMatrixEl.appendChild(cell);
        }
    }
    document.addEventListener('mouseup', () => { isDrawing = false; });
}

function setLed(row, col, on) {
    ledState[row][col] = on;
    window.ledState[row][col] = on;
    const idx  = row * 5 + col;
    const cell = ledMatrixEl?.children[idx];
    if (!cell) return;
    if (on) cell.classList.add('on');
    else    cell.classList.remove('on');
    cell.setAttribute('aria-pressed', String(on));
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
                value |= (1 << col);
            }
        }
        const rowHex = value.toString(16).toUpperCase().padStart(2, "0");
        hex += rowHex;
    }
    return hex;
}

// Simple presets
function applyPreset(name) {
    clearMatrix();
    const pts = [];
    if (name === 'heart') {
        pts.push([1,1],[1,3],[2,0],[2,2],[2,4],[3,1],[3,3],[4,2]);
    } else if (name === 'smile') {
        pts.push([1,0],[1,4],[3,1],[3,3],[4,2]);
    } else if (name === 'tick') {
        pts.push([0,2],[1,2],[1,3],[2,3],[3,3],[3,4],[4,4]);
    }
    pts.forEach(([r,c]) => setLed(r,c,true));
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

// =======================
// BUZZER CONTROL
// =======================

const buzzFreq = document.getElementById('buzzFreq');
const buzzFreqValue = document.getElementById('buzzFreqValue');
const buzzDur = document.getElementById('buzzDur');

if (buzzFreq && buzzFreqValue) {
    buzzFreq.addEventListener('input', () => {
        buzzFreqValue.textContent = buzzFreq.value + " Hz";
    });
}

document.getElementById('buzzPlay')?.addEventListener('click', () => {
    const f = parseInt(buzzFreq?.value || 440);
    const d = parseInt(buzzDur?.value || 200);
    if (f < 20 || f > 20000 || isNaN(f)) {
        addActivity("⚠️ Frequency must be 20–20000 Hz", "info");
        return;
    }
    if (d < 1 || d > 5000 || isNaN(d)) {
        addActivity("⚠️ Duration must be 1–5000 ms", "info");
        return;
    }
    sendLine("BUZZ:" + f + "," + d);
    addActivity("🔊 Playing sound", "sent");
});

document.getElementById('buzzStop')?.addEventListener('click', () => {
    sendLine("BUZZ:OFF");
    addActivity("🔇 Sound stopped", "sent");
});

// Kid-friendly buzzer presets
document.getElementById('buzzLow')?.addEventListener('click', () => {
    sendLine("BUZZ:200,300");
    addActivity("🔈 Low beep!", "sent");
});

document.getElementById('buzzMid')?.addEventListener('click', () => {
    sendLine("BUZZ:440,200");
    addActivity("🔉 Beep!", "sent");
});

document.getElementById('buzzHigh')?.addEventListener('click', () => {
    sendLine("BUZZ:880,150");
    addActivity("🔊 High beep!", "sent");
});

document.getElementById('buzzMelody')?.addEventListener('click', () => {
    sendLine("BUZZ:262,200"); // C
    setTimeout(() => sendLine("BUZZ:330,200"), 250); // E
    setTimeout(() => sendLine("BUZZ:392,200"), 500); // G
    setTimeout(() => sendLine("BUZZ:523,400"), 750); // High C
    addActivity("🎶 Playing melody!", "sent");
});

// --- BENCH TAB HANDLER ---
const benchSendBtn = document.getElementById("benchSendBtn");
const benchInput   = document.getElementById("benchInput");

benchSendBtn?.addEventListener("click", () => {
    const line = benchInput.value.trim();
    if (!line) {
        addLogLine("Bench: no command entered", "info");
        return;
    }
    sendLine('BENCH:' + line);
    addLogLine("Bench sent: " + line, "tx");
});

// ------------ Init (DOMContentLoaded) ------------

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
            sendLine('LM:' + hex);
            if (typeof addActivity === 'function') {
                addActivity('🎨 Sent LED pattern!', 'sent');
            }
        });
    }
    presetButtons.forEach(btn => {
        const preset = btn.dataset.preset;
        if (!preset) return;
        btn.addEventListener('click', () => {
            applyPreset(preset);
            if (typeof addActivity === 'function') {
                const msg = preset === 'heart' ? '❤️' : preset === 'smile' ? '😊' : '✔️';
                addActivity(msg + ' Drawing ' + preset, 'info');
            }
        });
    });

    // CMD buttons (HEART/SMILE/CLEAR etc)
    // Known LED patterns so 3D board mirrors presets instantly
    const cmdLedPatterns = {
        HEART:  [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
        SMILE:  [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
        SAD:    [[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1]],
        CLEAR:  [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
    };

    cmdButtons.forEach(btn => {
        const cmd = btn.dataset.cmd;
        btn.addEventListener('click', () => {
            if (!cmd) return;
            sendLine('CMD:' + cmd);

            // Update ledState so 3D board mirrors the preset
            const pattern = cmdLedPatterns[cmd];
            if (pattern && window.ledState) {
                for (let r = 0; r < 5; r++) {
                    for (let c = 0; c < 5; c++) {
                        const on = !!pattern[r][c];
                        window.ledState[r][c] = on;
                        // Also update the visual grid
                        setLed(r, c, on);
                    }
                }
            }

            const activityMsg = {
                'HEART': '❤️ Showing heart!',
                'SMILE': '😊 Showing smile!',
                'SAD': '😢 Showing sad face!',
                'CLEAR': '✨ Screen cleared!',
                'FIRE': '🔥 Boom!',
                'UP': '⬆️ Up!',
                'DOWN': '⬇️ Down!',
                'LEFT': '⬅️ Left!',
                'RIGHT': '➡️ Right!'
            }[cmd] || ('📤 Sent: ' + cmd);
            if (typeof addActivity === 'function') {
                addActivity(activityMsg, 'sent');
            }
        });
    });

    // Connection buttons
    if (connectBtn)    connectBtn.addEventListener('click', connect);
    if (disconnectBtn) disconnectBtn.addEventListener('click', disconnect);
    if (clearLogBtn)   clearLogBtn.addEventListener('click', clearLog);
    if (exportLogBtn)  exportLogBtn.addEventListener('click', exportLog);

    // Text message
    if (sendTextBtn && textInput) {
        sendTextBtn.addEventListener('click', () => {
            const msg = textInput.value.trim();
            if (!msg) return;
            sendLine('TEXT:' + msg);
            if (typeof addActivity === 'function') {
                addActivity('💬 Showing: "' + msg + '"', 'sent');
            }
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
            beginnerModeBtn.classList.add('active');
            beginnerModeBtn.setAttribute('aria-pressed', 'true');
            expertModeBtn.classList.remove('active');
            expertModeBtn.setAttribute('aria-pressed', 'false');
        });
        expertModeBtn.addEventListener('click', () => {
            appRoot.classList.remove('beginner-mode');
            expertModeBtn.classList.add('active');
            expertModeBtn.setAttribute('aria-pressed', 'true');
            beginnerModeBtn.classList.remove('active');
            beginnerModeBtn.setAttribute('aria-pressed', 'false');
        });
    }

    // Theme picker
    const themeBtns = document.querySelectorAll('.theme-btn');
    function setTheme(name) {
        if (name === 'stealth') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', name);
        }
        themeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === name));
        try { localStorage.setItem('mb_theme', name); } catch {}
    }
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
    // Restore saved theme
    try {
        const saved = localStorage.getItem('mb_theme');
        if (saved) setTheme(saved);
    } catch {}

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
