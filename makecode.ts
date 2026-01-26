/**
 * - Commands: TEXT, CMD:*, LM:<hex>, SERVO1:/SERVO2:
 */
/**
 * ---------------------------------------------------------
 */
/**
 * micro:bit – Full telemetry for Playground (V2 friendly)
 */
/**
 * - UART over BLE
 */
/**
 * - Sensors: TEMP, LIGHT, SOUND, ACC, BTN, TOUCH
 */
/**
 * ---------------------------------------------------------
 */
// Touch pin events using input.onPinPressed
input.onPinPressed(TouchPin.P0, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P0_PRESSED")
    }
})
input.onPinReleased(TouchPin.P2, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P2_RELEASED")
    }
})
input.onPinReleased(TouchPin.P0, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P0_RELEASED")
    }
})
bluetooth.onBluetoothConnected(function () {
    btConnected = true
    basic.showIcon(IconNames.Yes)
    bluetooth.uartWriteLine("INFO:CONNECTED")
})
bluetooth.onBluetoothDisconnected(function () {
    btConnected = false
    basic.showIcon(IconNames.No)
    bluetooth.uartWriteLine("INFO:DISCONNECTED")
})
input.onButtonPressed(Button.A, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:BUTTON_A_PRESSED")
    }
})
input.onPinPressed(TouchPin.P2, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P2_PRESSED")
    }
})
function handleLedMatrixHex(hex2: string) {
    if (hex2.length != 10) {
        bluetooth.uartWriteLine("LOG:LM_BAD_LENGTH:" + hex2.length)
        return
    }
    for (let row = 0; row <= 4; row++) {
        pair = hex2.substr(row * 2, 2)
        value = hexPairToByte(pair)
        for (let col = 0; col <= 4; col++) {
            const mask = 1 << col
            on = (value & mask) != 0
            if (on) {
                led.plot(col, row)
            } else {
                led.unplot(col, row)
            }
        }
    }
    bluetooth.uartWriteLine("LOG:LM_OK:" + hex2)
}
// ---------- UART RX: commands from browser ----------
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    line = line.trim()
    // Echo back for debugging
    bluetooth.uartWriteLine("ECHO:" + line)
    if (line.substr(0, 5) == "TEXT:") {
        msg = line.substr(5)
        if (msg.length > 0) {
            basic.showString(msg)
        }
        return
    }
    if (line.substr(0, 3) == "LM:") {
        hex2 = line.substr(3)
        handleLedMatrixHex(hex2)
        return
    }
    // ======== TAB change from browser =========
    // Expect messages like: TAB:Controls, TAB:Senses, TAB:Servos, TAB:Others
    if (line.substr(0, 4) == "TAB:") {
        tab = line.substr(4).toLowerCase()
        currentTab = tab  // Store for conditional pin polling
        // Acknowledge back to browser
        bluetooth.uartWriteLine("TAB:ACK:" + tab)
        // Simple visual feedback on micro:bit:
        // show first letter of the tab (C / S / S / O)
        if (tab.length > 0) {
            basic.showString(tab.charAt(0).toUpperCase())
        }
        return
    }
    // ======== SERVOS =========
    // Accept commands: SERVO1:<angle>, SERVO2:<angle>, SERVO1:OFF, SERVO2:OFF
    if (line == "SERVO1:OFF") {
        pins.analogWritePin(AnalogPin.P1, 0)
        servo1Target = 0
        servo1Current = 0
        bluetooth.uartWriteLine("SERVO1:OFF:ACK")
        return
    }
    if (line == "SERVO2:OFF") {
        pins.analogWritePin(AnalogPin.P2, 0)
        servo2Target = 0
        servo2Current = 0
        bluetooth.uartWriteLine("SERVO2:OFF:ACK")
        return
    }
    // Replace existing SERVO1: handling block with this
    if (line.substr(0, 7) == "SERVO1:") {
        raw = line.substr(7)
        b = parseFloat(raw)
        if (!(isNaN(b))) {
            angle = clampAngle(b)
            // immediate write so telemetry reflects change and servo moves right away
            pins.servoWritePin(AnalogPin.P1, angle)
            servo1Current = angle
            // start smooth move toward target (keeps previous behavior)
            requestServoMove(1, angle)
            bluetooth.uartWriteLine("SERVO1:ACK:" + angle)
            bluetooth.uartWriteLine("DBG:SERVO1_RECV:" + raw)
        } else {
            bluetooth.uartWriteLine("SERVO1:NACK")
        }
        return
    }
    // Replace existing SERVO2: handling block with this
    if (line.substr(0, 7) == "SERVO2:") {
        raw2 = line.substr(7)
        c = parseFloat(raw2)
        if (!(isNaN(c))) {
            angle2 = clampAngle(c)
            pins.servoWritePin(AnalogPin.P2, angle2)
            servo2Current = angle2
            requestServoMove(2, angle2)
            bluetooth.uartWriteLine("SERVO2:ACK:" + angle2)
            bluetooth.uartWriteLine("DBG:SERVO2_RECV:" + raw2)
        } else {
            bluetooth.uartWriteLine("SERVO2:NACK")
        }
        return
    }
    if (line == "CMD:HEART") {
        basic.showIcon(IconNames.Heart)
        return
    }
    if (line == "CMD:SMILE") {
        basic.showIcon(IconNames.Happy)
        return
    }
    if (line == "CMD:SAD") {
        basic.showIcon(IconNames.Sad)
        return
    }
    if (line == "CMD:CLEAR") {
        basic.clearScreen()
        return
    }
    if (line == "CMD:FIRE") {
        playExplosion()
        return
    }
    // ======== GAMEPAD D-PAD ========
    if (line == "CMD:UP") {
        basic.showArrow(ArrowNames.North)
        bluetooth.uartWriteLine("CMD:ACK:UP")
        return
    }
    if (line == "CMD:DOWN") {
        basic.showArrow(ArrowNames.South)
        bluetooth.uartWriteLine("CMD:ACK:DOWN")
        return
    }
    if (line == "CMD:LEFT") {
        basic.showArrow(ArrowNames.West)
        bluetooth.uartWriteLine("CMD:ACK:LEFT")
        return
    }
    if (line == "CMD:RIGHT") {
        basic.showArrow(ArrowNames.East)
        bluetooth.uartWriteLine("CMD:ACK:RIGHT")
        return
    }
    // ======== BENCH (echo + diagnostics) ========
    if (line.substr(0, 6) == "BENCH:") {
        const cmd = line.substr(6).trim()
        // Echo back for testing
        bluetooth.uartWriteLine("BENCH:ECHO:" + cmd)
        // Simple built-in commands
        if (cmd == "PING") {
            bluetooth.uartWriteLine("BENCH:PONG")
        } else if (cmd == "STATUS") {
            bluetooth.uartWriteLine("BENCH:TAB:" + currentTab)
            bluetooth.uartWriteLine("BENCH:S1:" + servo1Current)
            bluetooth.uartWriteLine("BENCH:S2:" + servo2Current)
        } else if (cmd == "RESET") {
            control.reset()
        }
        return
    }
    // ======== JSON (echo for debug) ========
    if (line.substr(0, 5) == "JSON:") {
        const payload = line.substr(5)
        bluetooth.uartWriteLine("JSON:ACK:" + payload.length + " chars")
        return
    }
    // ======== OTHERS TAB WIDGETS ========
    if (line.substr(0, 6) == "OTHER:") {
        const rest = line.substr(6)
        // Button press
        if (rest == "BTN:PRESS") {
            basic.showIcon(IconNames.SmallDiamond)
            basic.pause(100)
            basic.clearScreen()
            bluetooth.uartWriteLine("OTHER:ACK:BTN")
            return
        }
        // Switch
        if (rest.substr(0, 7) == "SWITCH:") {
            const state = rest.substr(7)
            if (state == "ON") {
                basic.showIcon(IconNames.Yes)
            } else {
                basic.showIcon(IconNames.No)
            }
            bluetooth.uartWriteLine("OTHER:ACK:SWITCH:" + state)
            return
        }
        // Slider
        if (rest.substr(0, 7) == "SLIDER:") {
            const val = parseInt(rest.substr(7))
            // Show as bar graph on LED
            led.plotBarGraph(val, 100)
            bluetooth.uartWriteLine("OTHER:ACK:SLIDER:" + val)
            return
        }
        // Joystick
        if (rest.substr(0, 4) == "JOY:") {
            const dir = rest.substr(4)
            if (dir == "UP") basic.showArrow(ArrowNames.North)
            else if (dir == "DOWN") basic.showArrow(ArrowNames.South)
            else if (dir == "LEFT") basic.showArrow(ArrowNames.West)
            else if (dir == "RIGHT") basic.showArrow(ArrowNames.East)
            bluetooth.uartWriteLine("OTHER:ACK:JOY:" + dir)
            return
        }
        // Text
        if (rest.substr(0, 5) == "TEXT:") {
            const txt = rest.substr(5)
            basic.showString(txt)
            bluetooth.uartWriteLine("OTHER:ACK:TEXT")
            return
        }
        // LED indicator
        if (rest.substr(0, 4) == "LED:") {
            const state = rest.substr(4)
            if (state == "ON") {
                led.plot(2, 2)
            } else {
                led.unplot(2, 2)
            }
            bluetooth.uartWriteLine("OTHER:ACK:LED:" + state)
            return
        }
        // Keypad
        if (rest.substr(0, 4) == "KEY:") {
            const key = rest.substr(4)
            basic.showString(key)
            bluetooth.uartWriteLine("OTHER:ACK:KEY:" + key)
            return
        }
        // Pin control
        if (rest.substr(0, 4) == "PIN:") {
            const parts2 = rest.substr(4).split(":")
            if (parts2.length == 2) {
                const pinName = parts2[0]  // D0, D1, D2, D8, D12, D16
                const pinVal = parseInt(parts2[1])
                // Map to actual pins
                if (pinName == "D0") pins.digitalWritePin(DigitalPin.P0, pinVal)
                else if (pinName == "D1") pins.digitalWritePin(DigitalPin.P1, pinVal)
                else if (pinName == "D2") pins.digitalWritePin(DigitalPin.P2, pinVal)
                else if (pinName == "D8") pins.digitalWritePin(DigitalPin.P8, pinVal)
                else if (pinName == "D12") pins.digitalWritePin(DigitalPin.P12, pinVal)
                else if (pinName == "D16") pins.digitalWritePin(DigitalPin.P16, pinVal)
                bluetooth.uartWriteLine("OTHER:ACK:PIN:" + pinName + ":" + pinVal)
            }
            return
        }
        // PWM
        if (rest.substr(0, 7) == "PWM:P0:") {
            const pwmVal = parseInt(rest.substr(7))
            pins.analogWritePin(AnalogPin.P0, pwmVal)
            bluetooth.uartWriteLine("OTHER:ACK:PWM:P0:" + pwmVal)
            return
        }
        // Servo from Others tab
        if (rest.substr(0, 6) == "SERVO:") {
            const parts3 = rest.substr(6).split(",")
            if (parts3.length == 2) {
                const sAngle = parseInt(parts3[0])
                // speed is ignored for now, just move servo 1
                pins.servoWritePin(AnalogPin.P1, sAngle)
                servo1Current = sAngle
                bluetooth.uartWriteLine("OTHER:ACK:SERVO:" + sAngle)
            }
            return
        }
        // Strip LED (placeholder - would need neopixel extension)
        if (rest.substr(0, 6) == "STRIP:") {
            bluetooth.uartWriteLine("OTHER:ACK:STRIP")
            return
        }
        // Default ACK
        bluetooth.uartWriteLine("OTHER:ACK:" + rest)
        return
    }
    // ======== BUZZER CONTROL (non-blocking) ========
    if (line.substr(0, 5) == "BUZZ:") {
        const rest = line.substr(5);

        // OFF
        if (rest == "OFF") {
            music.stopAllSounds();
            pins.analogWritePin(AnalogPin.P0, 0);
            bluetooth.uartWriteLine("BUZZ:ACK:OFF");
            return;
        }

        // Frequency + duration
        const parts = rest.split(",");
        if (parts.length == 2) {
            const freq = parseInt(parts[0]);
            const dur = parseInt(parts[1]);

            // Safety: prevent division by zero and invalid values
            if (freq < 20 || freq > 20000 || dur < 1 || dur > 5000) {
                bluetooth.uartWriteLine("BUZZ:NACK:INVALID");
                return;
            }

            // Non-blocking: run in background to avoid BLE timeout
            control.inBackground(function () {
                // V2 built-in speaker (non-blocking with Background)
                music.playTone(freq, dur);
            });

            // External buzzer on P0 (also in background)
            control.inBackground(function () {
                pins.analogSetPeriod(AnalogPin.P0, 1000000 / freq);
                pins.analogWritePin(AnalogPin.P0, 512);
                basic.pause(dur);
                pins.analogWritePin(AnalogPin.P0, 0);
            });

            bluetooth.uartWriteLine("BUZZ:ACK:" + rest);
        }
        return;
    }

})
input.onButtonPressed(Button.AB, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:BUTTON_AB_PRESSED")
    }
})
function clampAngle(a: number) {
    if (a < 0) {
        return 0
    }
    if (a > 180) {
        return 180
    }
    return Math.floor(a)
}
input.onButtonPressed(Button.B, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:BUTTON_B_PRESSED")
    }
})
// ---------- Helpers for LM:hhhhhhhhhh ----------
function hexCharToNibble(ch: string) {
    const up = ch.toUpperCase()
    digits = "0123456789ABCDEF"
    idx = digits.indexOf(up)
    if (idx < 0) {
        return 0
    }
    return idx
}
input.onPinPressed(TouchPin.P1, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P1_PRESSED")
    }
})
function hexPairToByte(s: string) {
    if (s.length < 2) {
        return 0
    }
    hi = hexCharToNibble(s.charAt(0))
    lo = hexCharToNibble(s.charAt(1))
    return hi * 16 + lo
}
input.onPinReleased(TouchPin.P1, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P1_RELEASED")
    }
})
function requestServoMove(servoIndex: number, angle: number) {
    a = clampAngle(angle)
    if (servoIndex == 1) {
        servo1Target = a
        if (!(servo1Moving)) {
            servo1Moving = true
            control.inBackground(function () {
                while (servo1Current !== servo1Target) {
                    if (servo1Target > servo1Current) servo1Current++
                    else if (servo1Target < servo1Current) servo1Current--
                    pins.servoWritePin(AnalogPin.P1, servo1Current)
                    basic.pause(18)
                }
                servo1Moving = false
            })
        }
    } else {
        servo2Target = a
        if (!(servo2Moving)) {
            servo2Moving = true
            control.inBackground(function () {
                while (servo2Current !== servo2Target) {
                    if (servo2Target > servo2Current) servo2Current++
                    else if (servo2Target < servo2Current) servo2Current--
                    pins.servoWritePin(AnalogPin.P2, servo2Current)
                    basic.pause(18)
                }
                servo2Moving = false
            })
        }
    }
}
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:LOGO_PRESSED")
    }
})
input.onLogoEvent(TouchButtonEvent.Released, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:LOGO_RELEASED")
    }
})
let t = 0
let s = 0
let l = 0
let diff_z = 0
let diff_y = 0
let diff_x = 0
let z = 0
let y = 0
let x = 0
let a = 0
let lo = 0
let hi = 0
let idx = 0
let digits = ""
let angle2 = 0
let c = 0
let raw2 = ""
let angle = 0
let b = 0
let raw = ""
let tab = ""
let hex2 = ""
let msg = ""
let line = ""
let on = false
let value = 0
let pair = ""
let btConnected = false
let servo2Current = 0
let servo1Current = 0
let servo2Target = 0
let servo1Target = 0
let servo2Moving = false
let servo1Moving = false
let currentTab = "controls"  // Track active tab for pin management
bluetooth.startUartService()
basic.showString("BT")
basic.pause(200)
basic.clearScreen()
// ---------- Servo state (minimal additions) ----------
servo1Target = 90
servo2Target = 90
servo1Current = 90
servo2Current = 90
// ---------- Telemetry: sensors ----------
let lastTemp = -1
let lastLight = -1
let lastSoundLevel = -1
let lastTouchP0_Sense = -1
let lastTouchP1_Sense = -1
let lastTouchP2_Sense = -1
let lastAccX = -1
let lastAccY = -1
let lastAccZ = -1
let LastServo1Current = -1
let LastServo2Current = -1
// ---------- Buttons & events ----------
let lastBtnA = -1
let lastBtnB = -1
let lastLogo = -1
let lastTouchP0 = -1
let lastTouchP1 = -1
let lastTouchP2 = -1
// report servo positions periodically (minimal telemetry)
loops.everyInterval(500, function () {
    if (!(btConnected)) {
        return
    }
    if (LastServo1Current == servo1Current && LastServo2Current == servo2Current) {
        return
    }
    LastServo1Current = servo1Current
    LastServo2Current = servo2Current
    bluetooth.uartWriteLine("SERVO1_POS:" + servo1Current)
    bluetooth.uartWriteLine("SERVO2_POS:" + servo2Current)
})
// Accelerometer (mg)
loops.everyInterval(300, function () {
    if (!(btConnected)) {
        return
    }
    x = input.acceleration(Dimension.X)
    y = input.acceleration(Dimension.Y)
    z = input.acceleration(Dimension.Z)
    if (lastAccX == x && lastAccY == y && lastAccZ == z) {
        return
    }
    if (lastAccX > x) {
        diff_x = lastAccX - x
    } else {
        diff_x = x - lastAccX
    }
    if (lastAccY > y) {
        diff_y = lastAccY - y
    } else {
        diff_y = y - lastAccY
    }
    if (lastAccZ > z) {
        diff_z = lastAccZ - z
    } else {
        diff_z = z - lastAccZ
    }
    lastAccX = x
    lastAccY = y
    lastAccZ = z
    if (diff_x < 15 && diff_y < 15 && diff_z < 15) {
        return;
    }
    bluetooth.uartWriteLine("ACC:" + x + "," + y + "," + z)
})
// Light level
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    l = input.lightLevel()
    if (lastLight == l) {
        return
    }
    lastLight = l
    bluetooth.uartWriteLine("LIGHT:" + l)
})
// Sound level (V2)
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    // On V2 we have soundLevel(), on V1 this stays 0
    s = input.soundLevel()
    if (lastSoundLevel == s) {
        return
    }
    lastSoundLevel = s
    bluetooth.uartWriteLine("SOUND:" + s)
    // bluetooth.uartWriteLine("BENCH:" + s)
})
// Touch sensor (V2) - P0, P1, P2 (skip P1/P2 on servos tab to avoid pin conflict)
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    const touchP0 = input.pinIsPressed(TouchPin.P0) ? 1 : 0
    // Only poll P1/P2 if NOT on servos tab (prevents pin reconfiguration)
    let touchP1 = 0
    let touchP2 = 0
    if (currentTab != "servos") {
        touchP1 = input.pinIsPressed(TouchPin.P1) ? 1 : 0
        touchP2 = input.pinIsPressed(TouchPin.P2) ? 1 : 0
    }
    if (lastTouchP0_Sense == touchP0 && lastTouchP1_Sense == touchP1 && lastTouchP2_Sense == touchP2) {
        return
    }
    lastTouchP0_Sense = touchP0
    lastTouchP1_Sense = touchP1
    lastTouchP2_Sense = touchP2
    bluetooth.uartWriteLine("TOUCH:" + touchP0 + "," + touchP1 + "," + touchP2)
})
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    const aNow = input.buttonIsPressed(Button.A) ? 1 : 0
    const bNow = input.buttonIsPressed(Button.B) ? 1 : 0
    const logoNow = input.logoIsPressed() ? 1 : 0
    const touchP0Now = input.pinIsPressed(TouchPin.P0) ? 1 : 0
    // Only poll P1/P2 if NOT on servos tab
    let touchP1Now = 0
    let touchP2Now = 0
    if (currentTab != "servos") {
        touchP1Now = input.pinIsPressed(TouchPin.P1) ? 1 : 0
        touchP2Now = input.pinIsPressed(TouchPin.P2) ? 1 : 0
    }
    if (aNow != lastBtnA) {
        bluetooth.uartWriteLine("BTN:A:" + aNow)
        lastBtnA = aNow
    }
    if (bNow != lastBtnB) {
        bluetooth.uartWriteLine("BTN:B:" + bNow)
        lastBtnB = bNow
    }
    if (logoNow != lastLogo) {
        bluetooth.uartWriteLine("BTN:LOGO:" + logoNow)
        lastLogo = logoNow
    }
    if (touchP0Now != lastTouchP0) {
        bluetooth.uartWriteLine("BTN:P0:" + touchP0Now)
        lastTouchP0 = touchP0Now
    }
    // Only report P1/P2 changes if not on servos tab
    if (currentTab != "servos") {
        if (touchP1Now != lastTouchP1) {
            bluetooth.uartWriteLine("BTN:P1:" + touchP1Now)
            lastTouchP1 = touchP1Now
        }
        if (touchP2Now != lastTouchP2) {
            bluetooth.uartWriteLine("BTN:P2:" + touchP2Now)
            lastTouchP2 = touchP2Now
        }
    }
})
// Temperature (°C)
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    t = input.temperature()
    if (lastTemp == t) {
        return
    }
    lastTemp = t
    bluetooth.uartWriteLine("TEMP:" + t)
})
// Compass heading (degrees)
let lastCompass = -1
loops.everyInterval(200, function () {
    if (!(btConnected)) {
        return
    }
    const heading = input.compassHeading()
    if (lastCompass == heading) {
        return
    }
    lastCompass = heading
    bluetooth.uartWriteLine("COMPASS:" + heading)
})

function playExplosion() {
    // Clear screen first
    basic.clearScreen()

    // --- Stage 1: small center spark ---
    led.plot(2, 2)
    basic.pause(100)

    // --- Stage 2: cross burst ---
    basic.clearScreen()
    const cross = [
        [2, 1], [2, 2], [2, 3],
        [1, 2], [3, 2]
    ]
    for (let p of cross) led.plot(p[0], p[1])
    basic.pause(120)

    // --- Stage 3: big flash ---
    basic.clearScreen()
    const flash = [
        [0, 2], [4, 2],  // left/right
        [2, 0], [2, 4],  // top/bottom
        [1, 1], [3, 1], [1, 3], [3, 3], // corners of diamond
        [2, 2]  // center
    ]
    for (let p of flash) led.plot(p[0], p[1])
    basic.pause(150)

    // --- Stage 4: outer ring ---
    basic.clearScreen()
    const ring = [
        [0, 0], [4, 0],
        [0, 4], [4, 4],
        [1, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 3], [4, 3],
        [1, 4], [3, 4]
    ]
    for (let p of ring) led.plot(p[0], p[1])
    basic.pause(140)

    // --- Stage 5: fading spark ---
    basic.clearScreen()
    led.plot(2, 2)
    basic.pause(90)

    // --- End ---
    basic.clearScreen()
}
