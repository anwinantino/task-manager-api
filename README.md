# Task Manager API

A secure Task Management REST API built with **Node.js, Express, and MongoDB** as part of a Tech Induction @Antino.
The API implements **JWT authentication**, **role-based authorization**, full **Task CRUD**, **Admin user management**, **task statistics**, and **rate limiting**.

---

## 🚀 Features Implemented

### 🔐 Authentication

* User Registration with validation and password hashing (bcrypt)
* User Login with JWT Access Token (15 min) and Refresh Token (7 days)
* Get Current User Profile
* Refresh Token Endpoint
* Protected routes using authentication middleware

### 📋 Task Management

* Create Task (auto-set `createdBy`)
* Get All Tasks

  * User → sees only own tasks
  * Admin → sees all tasks
  * Supports filters: `status`, `priority`, `search`
* Get Single Task (Creator / Assignee / Admin only)
* Update Task

  * Creator/Admin → update all fields
  * Assignee → update **status only**
* Delete Task (Creator or Admin only)
* Task Statistics

  * total, completed, pending
  * grouped by priority
  * user vs admin scope

### 🧑‍💼 Admin Features

* Get All Users (exclude passwords)
* Update User Role (`user` ↔ `admin`)
* Delete User

### 🚦 Middleware & Security

* Authentication Middleware (JWT verify)
* Authorization Middleware (role-based)
* Rate Limiting: **100 requests per 15 minutes per IP**
* CORS configuration
* Input validation
* No passwords in API responses
* Proper HTTP status codes
* Global error handling

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express
* **Database:** MongoDB, Mongoose
* **Authentication:** JSON Web Tokens (JWT)
* **Security:** bcrypt, express-rate-limit, CORS
* **Testing:** Postman

---

## ⚙️ Prerequisites

Make sure you have installed:

* Node.js (v18+ recommended)
* MongoDB (local or Atlas)
* npm

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anwinantino/task-manager-api.git
cd task-manager-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

Create a file named `.env` in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/task_manager
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
MongoDB connected
Server running on port 3000
```

---

## 🧪 API Testing with Postman

Use Postman to test the APIs.

### Authentication Flow

1. **Register**

   * `POST /api/v1/auth/register`

2. **Login**

   * `POST /api/v1/auth/login`
   * Copy `accessToken`

3. For all protected routes:

   * Go to **Authorization** tab
   * Type: `Bearer Token`
   * Paste your `accessToken`

---

## 📌 API Endpoints

### 🔐 Auth Routes

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | /api/v1/auth/register | Register user        |
| POST   | /api/v1/auth/login    | Login user           |
| GET    | /api/v1/auth/me       | Get current user     |
| POST   | /api/v1/auth/refresh  | Refresh access token |

---

### 📋 Task Routes

| Method | Endpoint            | Description                       |
| ------ | ------------------- | --------------------------------- |
| POST   | /api/v1/tasks       | Create task                       |
| GET    | /api/v1/tasks       | Get all tasks (filters supported) |
| GET    | /api/v1/tasks/:id   | Get single task                   |
| PUT    | /api/v1/tasks/:id   | Update task                       |
| DELETE | /api/v1/tasks/:id   | Delete task                       |
| GET    | /api/v1/tasks/stats | Task statistics                   |

---

### 🧑‍💼 Admin Routes (Admin Only)

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| GET    | /api/v1/admin/users          | Get all users    |
| PUT    | /api/v1/admin/users/:id/role | Update user role |
| DELETE | /api/v1/admin/users/:id      | Delete user      |

---

## 📊 Example Task Filters

```http
GET /api/v1/tasks?status=pending
GET /api/v1/tasks?priority=high
GET /api/v1/tasks?search=report
```

---

## 🔐 Authorization Rules Summary

| Operation   | Who Can Perform                                    |
| ----------- | -------------------------------------------------- |
| Create Task | Any authenticated user                             |
| View Task   | Creator / Assignee / Admin                         |
| Update Task | Creator/Admin (all fields), Assignee (status only) |
| Delete Task | Creator / Admin                                    |
| Admin APIs  | Admin only                                         |

---

## 🧾 Project Structure

```
.
├── config/
│   └── db.js
├── controllers/
│   ├── auth.controller.js
│   ├── task.controller.js
│   └── admin.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── role.middleware.js
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── auth.routes.js
│   ├── task.routes.js
│   └── admin.routes.js
├── server.js
├── package.json
└── .env
```

---

## 🧠 Notes

* Access Token expires in **15 minutes**
* Refresh Token expires in **7 days**
* Rate Limiting: **100 requests per 15 minutes per IP**
* Passwords are never returned in any API response

---

## 📄 License

This project is developed as part of an **Internship Tech Induction Assignment** and is for educational purposes.
