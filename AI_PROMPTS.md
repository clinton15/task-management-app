# AI Prompts

This document contains the prompts used during development where AI assistance was permitted by the assessment.

---

## 1. Authentication, User Management, Role Management & RBAC

### Prompt

> Implement authentication, user management, role management, and RBAC middleware for my existing Node.js + Express + TypeScript + Mongoose task management backend.
>
> **Important assessment restrictions:**
>
> AI assistance is permitted **ONLY** for authentication, user management, role management, and RBAC/permission middleware.
>
> Do **not** implement or modify:
>
> - Project/task database design
> - Task CRUD controllers
> - Task assignment logic
> - Task status handling
> - Task reorder logic
> - Drag-and-drop functionality
> - Socket.IO notifications
>
> Preserve my existing Task, Project, and User models and task controllers.
>
> ### Requirements
>
> 1. Add secure password hashing using bcrypt.
> 2. Implement login and logout endpoints and a way to retrieve the currently authenticated user.
> 3. Use JWT authentication with secure cookie handling and appropriate cookie settings.
> 4. Support `ADMIN` and `USER` roles.
> 5. Add authentication middleware and role-based authorization middleware.
> 6. Add user-management endpoints appropriate for an Admin.
> 7. Validate inputs and return appropriate HTTP status codes.
> 8. Use environment variables for secrets. Never hardcode secrets.
> 9. Follow the existing TypeScript/ES module structure and reuse my existing Express app and MongoDB connection.
> 10. Inspect the existing project before changing anything. Avoid overwriting unrelated files or creating duplicate models.
> 11. Tell me which files you created or modified, how to configure environment variables, and how to test each endpoint.
>
> Do not implement any project-management or task-management endpoints in this step.

---

## 2. Project-Level Authorization for Task APIs

### Prompt

> Implement project-level authorization for the existing task APIs. This is an authentication/RBAC/permission-middleware task.
>
> **First inspect the existing code** to confirm the actual `req.user` type, role values, `Project` model, `Task` model, and task route definitions.
>
> ### Requirements
>
> 1. Require authentication for every task endpoint.
> 2. Admin users can access tasks across projects.
> 3. Regular users can access tasks only when their user ID appears in that project's `members` array.
> 4. For routes containing `projectId`, authorize access using that project.
> 5. For routes containing `taskId`, find the task, identify its project, and authorize access to that project. Return an appropriate 404 response if the task does not exist.
> 6. Only admins can delete tasks. Regular users must receive `403 Forbidden` if they attempt to delete a task.
> 7. Return `401` for unauthenticated requests, `403` for insufficient permissions, and appropriate `400`/`404` responses for invalid or missing resources.
> 8. Reuse the existing authentication and authorization middleware wherever possible. Match the project's existing TypeScript and ES module conventions.
> 9. Apply the middleware to all existing task routes, including task creation, listing, updating, deleting, and reordering.
> 10. Do not change task CRUD logic, assignment validation, ordering/reordering logic, database schemas, or task controller implementations. Do not generate new task controllers or replace existing code.
> 11. Do not change the authentication flow or unrelated files.
> 12. Run `npm run build` from the `server` directory and report the result.
>
> Create a separate middleware file if needed. At the end, list the exact files changed and explain which permissions each task route enforces.

---

## 3. React Authentication & Session Handling

### Prompt

> Implement authentication session checking in the React + TypeScript + Vite frontend.
>
> ### Context
>
> - Axios client exists at `client/src/api/api.ts`.
> - It uses `baseURL: "http://localhost:5050/api"` and `withCredentials: true`.
> - Login form exists at `client/src/components/LoginForm.tsx`.
> - Backend endpoints:
>   - `POST /auth/login`
>   - `POST /auth/logout`
>   - `GET /auth/me`
> - Authentication uses an HTTP-only cookie.
> - Do not access the cookie from JavaScript or store JWT tokens in `localStorage`.
>
> ### Requirements
>
> 1. On app startup, call `GET /auth/me` to check the existing session.
> 2. Display a loading state while checking.
> 3. If successful, store the returned user in React state and display the dashboard.
> 4. If the request fails, display the login form.
> 5. When login succeeds, fetch `/auth/me` again to populate the user state.
> 6. Handle logout by calling `POST /auth/logout`, then clear the user state and return to the login screen.
> 7. Use TypeScript types and the existing API client.
> 8. Reuse existing components where appropriate. If the dashboard does not exist yet, use a simple temporary authenticated placeholder rather than implementing task-management functionality.
> 9. Do not add Redux, Zustand, Context API, localStorage authentication, or unnecessary dependencies.
> 10. Do not modify backend files or implement task/project business logic.
> 11. Run the frontend TypeScript/build check and report the files changed and any errors.
>
> This request is limited to authentication/session handling, which is permitted by the assessment.
