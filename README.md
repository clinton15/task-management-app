# Task Management App

A full-stack task management application built with React, TypeScript, Express, MongoDB, JWT authentication, role-based access control, drag-and-drop task ordering, and Socket.IO real-time updates.

## Features

### Authentication & authorization
- JWT authentication using an HTTP-only cookie
- Login, logout, and current-session (`/auth/me`) support
- Secure password hashing with bcrypt
- `ADMIN` and `USER` roles
- Role-based authorization middleware
- Project-level access control for regular users

### User management
- Admin-only user listing
- Create users
- Update users, including role changes
- Delete users
- Protection against deleting/changing the last administrator

### Project management
- Admins can create, update, and delete projects
- Projects contain members
- Admins can access all projects
- Regular users can access only projects they belong to

### Task management
- Create tasks within a project
- View project tasks
- Update task title, description, assignee, and status
- Delete tasks (admin only)
- Task statuses:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
- Drag-and-drop task ordering
- Persistent task ordering in MongoDB

### Real-time updates
Socket.IO is used for task events such as:
- `task:created`
- `task:updated`
- `task:deleted`
- `tasks:reordered`

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Axios
- Socket.IO Client
- dnd-kit
- Tailwind CSS
- shadcn/ui / Base UI components

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO
- Zod

## Project Structure

```text
task-management-app/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── socket.ts
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── socket.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
├── AI_PROMPTS.md
└── README.md
```

## Prerequisites

Install:

- Node.js 20+ recommended
- npm
- MongoDB Atlas or a local MongoDB instance

## Environment Variables

### Backend

Copy:

```bash
cd server
cp .env.example .env
```

Configure:

```env
PORT=5050
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_DAYS=7
AUTH_COOKIE_NAME=accessToken
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are used to seed the first administrator when no admin exists.

Never commit `.env` or real secrets.

### Frontend

Copy:

```bash
cd client
cp .env.example .env
```

For local development:

```env
VITE_API_URL=http://localhost:5050
```

For production, set this to the deployed backend URL, without `/api`.

Example:

```env
VITE_API_URL=https://your-backend.example.com
```

## Local Development

### 1. Start the backend

```bash
cd server
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5050
```

Health check:

```text
GET /api/health
```

### 2. Start the frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server normally runs on:

```text
http://localhost:5173
```

## Production Builds

### Backend

```bash
cd server
npm install
npm run build
npm start
```

### Frontend

```bash
cd client
npm install
npm run build
npm run preview
```

## API Overview

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |

### Users

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users` | Admin |
| GET | `/api/users/:id` | Admin |
| POST | `/api/users` | Admin |
| PATCH | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |

### Projects

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/projects` | Authenticated |
| GET | `/api/projects/:projectId` | Admin / project member |
| POST | `/api/projects` | Admin |
| PUT | `/api/projects/:projectId` | Admin |
| DELETE | `/api/projects/:projectId` | Admin |

### Tasks

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/projects/:projectId/tasks` | Admin / project member |
| GET | `/api/projects/:projectId/tasks` | Admin / project member |
| PUT | `/api/tasks/:taskId` | Admin / project member |
| DELETE | `/api/tasks/:taskId` | Admin only |
| PATCH | `/api/projects/:projectId/tasks/reorder` | Admin / project member |

## Authentication Flow

1. User submits email and password.
2. Backend verifies the password using bcrypt.
3. Backend signs a JWT.
4. JWT is stored in an HTTP-only cookie.
5. Frontend calls `/api/auth/me` to restore the authenticated session.
6. Protected API requests automatically include the cookie through Axios `withCredentials`.
7. Logout clears the authentication cookie.

The JWT is not stored in `localStorage` and is not directly accessible from frontend JavaScript.

## Role & Permission Model

### ADMIN

- Manage users
- Create/update/delete projects
- Access all projects
- Create/update/reorder tasks in any project
- Delete tasks

### USER

- View projects where they are a member
- Access tasks only within projects where they are a member
- Create/update/reorder tasks within accessible projects
- Cannot delete tasks
- Cannot manage users or projects

## Real-Time Updates

The frontend connects to Socket.IO when a project is selected and joins the corresponding project room.

Task changes are broadcast to the project room so other connected clients can update without manually refreshing.

## Drag-and-Drop Ordering

Tasks can be reordered using drag-and-drop.

The frontend sends the complete task ID order to:

```text
PATCH /api/projects/:projectId/tasks/reorder
```

The backend validates that all tasks belonging to the project are included exactly once and persists their `order` values.

## Deployment

A simple deployment setup is:

```text
Frontend: Vercel
Backend:  Render
Database: MongoDB Atlas
```

### Backend deployment

Create a Node/Express web service using the `server` directory.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Set these production environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_DAYS=7
AUTH_COOKIE_NAME=accessToken
CLIENT_ORIGIN=https://your-frontend.vercel.app
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

The platform-provided `PORT` should be used in production when required by the hosting provider.

### Frontend deployment

Create a Vite frontend deployment using the `client` directory.

Build command:

```bash
npm install && npm run build
```

Output directory:

```text
dist
```

Set:

```env
VITE_API_URL=https://your-backend.example.com
```

Do not append `/api` to `VITE_API_URL`; the Axios client adds `/api`.

### CORS and cookies

Because the frontend and backend may be hosted on different domains:

- Backend API CORS must allow the exact frontend origin through `CLIENT_ORIGIN`.
- The current Socket.IO server reads its allowed origin from `CLIENT_URL`, so set that variable to the same frontend origin as well.
- `credentials: true` must remain enabled.
- Frontend Axios must use `withCredentials: true`.
- Production authentication cookies use secure cross-site cookie settings.
- Both frontend and backend should be served over HTTPS.

### MongoDB Atlas

Create a MongoDB Atlas database and use its connection string as:

```env
MONGODB_URI=...
```

Configure the Atlas network access rules so the deployed backend can connect.

## Verification

Before submission, verify:

- Login works
- Session survives a page refresh
- Logout works
- Admin can manage users
- Admin can create/update/delete projects
- Regular users see only their projects
- Project members can create and update tasks
- Non-members cannot access project tasks
- Only admins can delete tasks
- Task status changes persist
- Drag-and-drop ordering persists after refresh
- Two browser sessions receive Socket.IO task updates
- Production frontend can communicate with the production backend
- Authentication works with the production HTTP-only cookie
- No secrets are committed to Git

## AI Assistance

AI assistance was used only in the areas permitted by the assessment. The prompts are documented separately in [`AI_PROMPTS.md`](./AI_PROMPTS.md).

## License

This project was created as part of a technical assessment.
