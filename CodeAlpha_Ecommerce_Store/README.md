# Aether Arcade ⚡

<p align="center">
  <img src="https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/e2e5542c7_generated_029d7604.png" alt="Aether Arcade Hero" width="100%">
</p>

> **A high-fidelity digital gallery for premium goods, where cinematic immersion meets effortless e-commerce.**

Aether Arcade is a cutting-edge, ultra-premium MERN stack e-commerce platform. Built with the **Solarized Obsidian** aesthetic (deep blacks, electric indigo accents, and frosted glass elements), the application delivers an Apple/Stripe-level luxury user experience.

---

## 🌟 Key Features

### Premium User Experience
- **Cinematic UI/UX:** Built with Tailwind CSS and Framer Motion for liquid-smooth page transitions, monolithic 3D hover cards, and frosted glass navigation.
- **Solarized Obsidian Theme:** A gorgeous dark mode palette featuring `#050505` backgrounds and indigo/amber highlights.
- **Fully Responsive:** Mobile-first architecture ensures the store looks stunning on any device.

### Complete E-Commerce Flow
- **Product Discovery:** Featured collections, detailed product pages, image galleries, and live stock tracking.
- **Shopping Cart:** Real-time cart updates, quantity management, and subtotal calculation.
- **Checkout Wizard:** Multi-step checkout process (Shipping -> Payment -> Review).
- **Order Management:** Secure order placement and user profile order history.

### Admin Capabilities
- **Admin Dashboard:** Secure portal to view all recent orders, user details, payment, and delivery statuses.
- **Role-Based Access Control:** Strict JWT middleware ensuring only admins access dashboard data.

---

## 🚀 Tech Stack

### Frontend (Client)
- **Framework:** React 18 (Vite)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4, Vanilla CSS variables
- **Animations:** Framer Motion, GSAP
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Environment:** dotenv

---

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have Node.js and MongoDB installed on your machine, or a MongoDB Atlas URI.

### 1. Clone the Repository
```bash
git clone https://github.com/SUBRAHMANYA2726/CodeAlpha_Ecommerce_Store-.git
cd CodeAlpha_Ecommerce_Store-
```

### 2. Setup the Backend
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Seed the database with sample premium products and users:
```bash
npm run data:import
```

Start the backend server:
```bash
npm start
# Or for development with nodemon: npm run dev
```

### 3. Setup the Frontend
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Visit `http://localhost:5174` in your browser.

---

## 👤 Default Test Accounts

After running the database seeder (`npm run data:import`), you can use the following test accounts:

**Admin Account:**
- **Email:** admin@example.com
- **Password:** 123456

**Standard User:**
- **Email:** john@example.com
- **Password:** 123456

---

## 🎨 Design System

- **Primary Background:** `#050505` (Obsidian)
- **Card Background:** `#0a0a0a`
- **Accent Color:** `#4f46e5` (Electric Indigo)
- **Highlight Color:** `#f59e0b` (Amber)
- **Typography:** Inter (Google Fonts)

---

Developed as part of the CodeAlpha Fullstack Internship Task.
