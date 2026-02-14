# 📱 Modern Pokedex Prototype

A high-fidelity, interactive Pokedex prototype built with **Angular 19** and **NestJS**. This project mimics the classic physical Pokedex experience with a modern UI/UX twist, featuring a sliding hinge mechanism, holographic displays, and a secure trainer login system.

## 📸 Screenshots

<div align="center">
  <img src="https://i.imgur.com/PjRyaCb.png" alt="Pokedex Closed" width="45%"/>
</div>

<div align="center">
  <img src="https://i.imgur.com/4nBmbU6.png" alt="Pokedex Open" width="45%"/>
</div>
---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20 or higher)
- **pnpm** (preferred) or npm
- **Docker & Docker Compose** (for MongoDB)

### 1. Database Setup
The API requires a MongoDB instance. You can start the included environment using Docker:
```bash
docker-compose up -d
```

### 2. API Setup (NestJS)
Navigate to the `api` directory and start the backend:
```bash
cd api
npm install
# Configure your .env based on .env.example if needed
npm run start:dev
```

### 3. App Setup (Angular)
Navigate to the `app` directory and start the frontend:
```bash
cd app
npm install
npm run start
```
The application will be available at `http://localhost:4200`.

---

## ✨ Features

- **Interactive Shell:** Pull the cover to the right to open the Pokedex.
- **Secure Authentication:** Custom holographic keypad login for trainers.
- **Infinite Discovery:** Scrollable grid list with a "Load More" functionality.
- **Detailed View:** Real-time data fetching for height, weight, types, and abilities.
- **Responsive Design:** Touch-friendly controls and smooth animations.

## 🛠️ Tech Stack

- **Frontend:** Angular 19, Tailwind CSS, Lucide Icons.
- **Backend:** NestJS, Mongoose.
- **Database:** MongoDB.
- **Styling:** Custom SCSS for glassmorphism and scanline effects.

---

## 📜 License
This project is for educational purposes. Pokemon data and images are provided by [PokeAPI](https://pokeapi.co/).
