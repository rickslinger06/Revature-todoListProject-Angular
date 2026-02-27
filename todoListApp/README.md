
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

# ToDo List Application

This ToDo List application is a secure, role-based task manager.  
Users must create an account and log in before they can use any of the features.

Once signed in, you can:

- Create your own to-do items
- Update and delete existing to-do items
- Create subtasks for a specific to-do item
- Update and delete subtasks
- Mark subtasks as complete

The app enforces business rules around completion, closing, and user roles (user vs admin).

---

## Authentication & Access

- **Account required**: You **must** create an account to use the application.
- **Login required**: All features are only available after logging in.
- **Session-based access**: To-do items and subtasks are tied to the logged-in user.

---

## Core Features

### To-Do Items

As an authenticated user, you can:

- **Create** a new to-do item  
- **View** your existing to-do items  
- **Update** an existing to-do item (e.g., title, description, due date, etc.)  
- **Delete** a to-do item  

#### Completion Rule

- You **cannot mark a to-do item as complete** unless **all of its subtasks are completed**.
- If any subtask is still pending, the parent to-do item will remain **incomplete**.

---

### Subtasks

Each to-do item can have one or more subtasks.

For a specific to-do item, you can:

- **Create** subtasks  
- **Update** subtasks  
- **Delete** subtasks  
- **Mark subtasks as complete**

## Item Status: Complete vs Closed

There are two important states:

1. **Completed**
   - A to-do item can be marked **completed** **only when all subtasks are completed**.
   - Regular users can mark their own to-do items as completed (subject to the subtask rule above).

2. **Closed / Reopened**
   - **Only an admin user** can **close** and **reopen** a to-do item.
   - Closing a to-do item is typically used to archive or lock it after completion.
   - Reopening is used to move a closed item back to an active state (for example, if more work is needed).

---

## User Roles & Permissions

There are two main roles in the system:

### 1. Regular User

A regular user can:

- Register and log in
- Create, view, update, and delete **their own** to-do items
- Create, view, update, and delete **their own** subtasks
- Mark subtasks as complete/incomplete
- Mark a to-do item as complete, **only if all its subtasks are completed**

A regular user **cannot**:

- Close or reopen a to-do item
- View all users
- Change user roles

---

### 2. Admin User

An admin user has additional permissions.

An admin can:

- Do everything a regular user can do
- **Close and reopen to-do items**
- **View all users** in the system
- **Change a user’s role**:
  - From **user → admin**
  - From **admin → user**

This makes the admin responsible for user management and controlling which items are officially closed or reopened.

---

## Demo Admin Credentials

For development/testing purposes, the application includes a default admin account:

- **Username:** `admin_rick`  
- **Password:** `123456`