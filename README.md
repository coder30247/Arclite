# ⚔️ Arclite – Multiplayer 2D Shooting Game

# this is still in development

Live Demo 👉 [arclite.vercel.app](https://arclite.vercel.app)

Arclite is a real-time multiplayer 2D shooter game built with **Phaser**, **Socket.IO**, and **React**. Inspired by classics like *Mini Militia* and *Soldat*, this game combines fast-paced combat with smooth animations and real-time sync between players.

---

## 🕹 Features

- 🎮 Real-time multiplayer rooms with player state sync
- 🚀 Jetpack-based movement physics
- 🔫 Bullet shooting, hit detection, and health system
- 💥 Player death and respawn logic
- 🧍 Character control using keyboard + mouse
- 🧠 Smart player-side prediction
- 🛠 Built using modular game systems (Map, Player, Bullet)


---

## 🧱 Tech Stack

| Area       | Stack                             |
|------------|-----------------------------------|
| Frontend   | React                             |
| Game Engine| Phaser 3                          |
| Realtime   | Socket.IO                         |
| State Mgmt | Zustand                           |
| Backend    | Firebase Auth (for now)           |
| Hosting    | Vercel                            |

---

## 🧪 Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/arclite.git
cd arclite

# Install dependencies
npm install

# Start the dev server
npm run dev
