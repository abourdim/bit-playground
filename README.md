
# 🚀🎮 MicroBit Controller 🤖✨  
### *Explore • Create • Innovate (and have LOTS of fun)* 😄

Welcome to ** MicroBit Controller**, a super-powered **web playground** to control and explore your **BBC micro:bit** using **Bluetooth Low Energy (BLE)** 🛰️  
This project is designed for **learning, hacking, teaching, and playing** — from total beginners 🐣 to fearless experts 🧙‍♂️.

---

## 🧠 What is this project?

This is a **web-based control panel** that lets you:

- 🔗 Connect to a **micro:bit** via **Bluetooth**
- 🎨 Draw on the **LED matrix**
- 📡 Read **live sensor data**
- 🎛️ Control **servos**
- 🎮 Use a **GamePad**
- 🧪 Send **custom commands**
- 📊 Visualize data with **real-time charts**
- 🤪 Enjoy a **fun, animated, kid-friendly UI**

All of this runs **directly in your browser** 🌍  
👉 No installation, no backend, no stress 😌

---

## 📁 Project Structure (What’s inside the box 📦)

```text
📦 workshop-diy
├── index.html        🧱 Main app layout
├── styles.css        🎨 All the beautiful styles & animations
├── script.js         ⚡ Main JavaScript logic (BLE, UI, charts)
├── makecode.ts       🤖 micro:bit companion program
├── settings.ts       ⚙️ BLE UUIDs & configuration
├── logo.svg          🖼️ Project logo
└── README.md         📘 You are here!
```

---

## 🚀 Getting Started (Step by Step 👣)

### 1️⃣ What you need 🧰

- 🧠 A **BBC micro:bit** (v1 or v2)
- 🔌 USB cable or 🔋 batteries
- 🌐 A **modern browser** (Chrome / Edge recommended)
- 📶 Bluetooth enabled

---

### 2️⃣ Flash the micro:bit 🤖🔥

1. Open **Microsoft MakeCode**
2. Copy the content of 👉 `makecode.ts`
3. Flash it to your micro:bit
4. Unplug & power it (USB or batteries)

✅ Your micro:bit is now advertising a **custom BLE service**

---

### 3️⃣ Open the Web App 🌍

1. Open `index.html` in your browser
2. You’ll see the **Workshop-Diy Playground**
3. Click 👉 **🔗 Connect to micro:bit**
4. Select your device from the Bluetooth list

🎉 **Connected!** (The status chip will glow like magic ✨)

---

## 🧭 Interface Tour (What does each tab do?)

### 🎛️ Controls Tab
- 💬 Send text messages to micro:bit
- 🎨 Draw on the **5×5 LED matrix**
- ❤️ Preset icons (heart, smile, tick)
- 🎵 Play buzzer sounds
- 🧪 Send raw JSON commands (Expert Mode)

---

### 📡 Senses Tab
Live sensor monitoring with charts 📊

- 🌡️ Temperature
- 💡 Light level
- 🔊 Sound level
- 🏃 Motion & acceleration (X, Y, Z)
- 🧭 Compass
- 🔘 Buttons A & B
- ✋ Touch pins (P0, P1, P2)
- ⭐ Logo touch

All values update **in real time** ⚡

---

### 🛠️ Servos Tab
- Control **2 servos** (P1 & P2)
- 🎚️ Slider + number input
- 🧭 Visual servo gauge
- ⛔ Turn servos OFF safely

Perfect for robots 🤖 and mechanisms ⚙️

---

### 🎮 GamePad Tab
- ⬆ ⬇ ⬅ ➡ Direction pad
- 🔥 FIRE button
- Sends simple commands like:
  - `UP`
  - `DOWN`
  - `LEFT`
  - `RIGHT`
  - `FIRE`

Great for games and robots 🚗💨

---

### 🪑 Bench Tab (Experiments Zone 🧪)
- Send **test commands**
- View **raw responses**
- Debug & prototype ideas 💡

This is your **mad scientist lab** 🧑‍🔬

---

### ✨ Others Tab (The Toolbox 🧰)
A collection of extra UI components:

- 🔘 Buttons & switches
- 🎚️ Sliders
- 🕹️ Joystick
- 📝 Text sender
- 💡 LEDs & indicators
- 📈 Live graphs
- 🧾 Debug console
- 📄 Data capture & CSV export

Perfect for **teaching UI concepts** 🎓

---

## 👶 Beginner vs 🧙 Expert Mode

- 👶 **Beginner Mode**
  - Clean UI
  - Safe controls
  - No scary JSON 😄

- 🧙 **Expert Mode**
  - Raw JSON access
  - Advanced experiments
  - Full power unleashed ⚡

Toggle anytime from the top panel 🎛️

---

## 🎨 Design & Fun Factor 🤪

This project includes:

- ✨ Animations
- 🌈 Gradients
- 🎉 Emojis
- 🤪 Funny / kid-friendly styles
- 🧲 Interactive hover effects

Learning should be **FUN** 😄

---

## 🛠️ Technologies Used

- 🧱 HTML5
- 🎨 CSS3 (lots of animations 💃)
- ⚡ JavaScript (Vanilla)
- 📊 Chart.js
- 📡 Web Bluetooth API
- 🤖 micro:bit MakeCode

---

## 🚨 Notes & Tips

- ❗ Bluetooth works best on **Chrome / Edge**
- 📱 Mobile support depends on browser
- 🔒 HTTPS is required for BLE (except localhost)

---

## 💡 Ideas to Extend This Project

- 🎮 Make a real game
- 🤖 Control a robot
- 🌱 Build a sensor station
- 📚 Use it in workshops or classrooms
- 🧠 Add AI logic (why not? 😏)

---

## ❤️ Final Words

This project is built for:
- 👩‍🎓 Students
- 👨‍🏫 Teachers
- 🧑‍💻 Makers
- 🤖 Robot lovers
- 🎉 Curious humans

If you’re smiling while using it…  
👉 **Mission accomplished** 😄✨

Happy hacking! 🚀🤖🎮
