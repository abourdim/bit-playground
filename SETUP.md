# micro:bit Playground — Quick Setup

Welcome! Follow these steps once and you'll be playing in under 5 minutes.

---

## What you need

- A **BBC micro:bit V2** (the V2 has the gold microphone — V1 is missing the sound sensor)
- A USB cable (or batteries)
- A computer or phone with **Chrome** or **Edge** browser
- Bluetooth turned on

> ⚠️ Safari, Firefox, and iPhones do **not** support Web Bluetooth. You must use Chrome or Edge.

---

## Step 1 — Flash the firmware (one time only)

1. Open https://makecode.microbit.org in Chrome.
2. Click **New Project**, name it anything.
3. Click the **{} JavaScript** button at the top to switch to code view.
4. **Delete everything** in the editor.
5. Open the file `makecode.ts` from this download (any text editor works) and **copy all of it**.
6. **Paste** into MakeCode.
7. Plug in your micro:bit. Click **Download** in MakeCode — it saves a `.hex` file.
8. Drag the `.hex` file onto the **MICROBIT** drive that appeared on your computer.
9. The yellow light blinks, then the micro:bit shows an **X** icon. That means it's broadcasting Bluetooth and ready.

---

## Step 2 — Open the app

1. Double-click `index.html` from this download. It opens in your browser.
2. Click the **🔗 Connect to micro:bit** button.
3. Pick your micro:bit from the popup list.
4. The status circle turns **green** — you're in! ✅

---

## Step 3 — Try things

- **LED tab** — draw on the 5×5 grid, send to the board.
- **Sensors tab** — see live temperature, light, motion.
- **Servos tab** — plug a servo into pin P1 or P2 and move it with sliders.
- **Graph tab** — record live sensor data, export as JSON.
- **3D tab** — interactive models that mirror the board's motion.

Tap the **?** icon anytime for the in-app guide.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| "Connect" button does nothing | You're on Safari / Firefox / iPhone. Switch to Chrome or Edge on a computer or Android. |
| micro:bit doesn't appear in the popup | Make sure it shows the **X** icon. If not, re-flash `makecode.ts`. |
| Disconnects after a few seconds | Move closer, or replace batteries. The app auto-reconnects 3 times. |
| Sound sensor reads 0 | You probably have a micro:bit V1. Sound needs V2. |

---

## License

This software is licensed for personal and classroom use. Please do **not** redistribute or resell. Full terms in `LICENSE`.

For school-district or commercial licensing, contact the seller through your Etsy order.

Enjoy! 🎮
