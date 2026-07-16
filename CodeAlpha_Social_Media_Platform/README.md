# CodeAlpha Social Media Platform

A modern full-stack social media web application built with React, Vite, Node.js, Express, MongoDB, JWT, and Socket.IO. The platform includes authentication, feed browsing, post creation, real-time messaging, notifications, profile management, and an admin dashboard.

## Features

- User registration and login with JWT authentication
- Protected routes and role-based access for admin users
- Social feed with posts, likes, comments, and hashtags
- Explore page with trending content and discovery
- Real-time messaging and typing indicators via Socket.IO
- Notifications and profile management
- Responsive UI designed for desktop and mobile screens

## Screenshots

![Homepage](https://via.placeholder.com/1200x700?text=Social+Media+Platform+Screenshot)

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- TanStack Query

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- Socket.IO
- Cloudinary

## Folder Structure

```text
backend/
  config/
  middleware/
  models/
  routes/
  seed.js
  server.js

frontend/
  public/
  src/
    assets/
    components/
    context/
    lib/
    pages/
    App.jsx
    main.jsx
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/SUBRAHMANYA2726/CodeAlpha_Social_Media_Platform.git
cd CodeAlpha_Social_Media_Platform
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Copy the example environment file and update values:

```bash
cp .env.example .env
```

### 4. Run the application

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Environment Variables

Create a .env file in the project root with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/socialsphere
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## MongoDB Setup

- Install MongoDB locally or use MongoDB Atlas.
- Set MONGODB_URI to your connection string.
- The application uses Mongoose models for users, posts, comments, messages, and notifications.

## Cloudinary Setup

If you want image uploads to work:

1. Create an account on Cloudinary.
2. Add your cloud name, API key, and API secret to the environment variables.
3. Ensure the upload routes are configured in the backend.

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users
- GET /api/users/profile/:username
- POST /api/users/:id/follow

### Posts
- GET /api/posts
- POST /api/posts
- POST /api/posts/:id/like

### Messaging
- GET /api/messages/inbox
- GET /api/messages/conversation/:id

## Authentication Flow

1. User registers or logs in.
2. The backend validates credentials and issues a JWT.
3. The token is stored in localStorage.
4. Protected routes use the token for authorized requests.

## Database Collections

- users
- posts
- comments
- notifications
- stories
- messages
- communities
- reports

## Responsive Features

- Mobile-friendly navigation
- Adaptive feed and profile layouts
- Responsive cards and panels for different screen sizes

## Future Improvements

- Add real comments and likes persistence for all flows
- Improve media moderation and admin controls
- Add story and reel enhancements
- Introduce dark/light theme customization
- Add deployment automation and CI/CD

## Deployment

This project can be deployed to services such as:

- Vercel for the frontend
- Render or Railway for the backend
- MongoDB Atlas for the database
- Cloudinary for media hosting

## License

This project is licensed under the MIT License.

## Author

Subrahmanya

## GitHub Repository

https://github.com/SUBRAHMANYA2726/CodeAlpha_Social_Media_Platform
