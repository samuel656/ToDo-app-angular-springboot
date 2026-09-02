# Phase 1 — Understand & run application


## 1. Objective

The goal of **Phase 1** was to establish a known-working baseline for the Todo application before introducing Docker or AWS.

The application consists of:

```text
Angular 20 Frontend
        ↓
Spring Boot REST API
        ↓
H2 In-Memory Database
```

The key principle was:

> **Before deploying anything, prove that the application itself works correctly.**

---

# 2. Application Architecture

The project contains two main applications.

```text
ToDo-app-angular-springboot/
│
├── backend/
│   └── MyTodo/
│       ├── pom.xml
│       └── src/
│
├── frontend/
│   └── todo/
│       ├── package.json
│       ├── angular.json
│       └── src/
│
└── README.md
```

### Backend

The backend is a **Spring Boot 3.5.0** application using:

* Java 17
* Spring Web
* Spring Data JPA
* H2
* Maven

### Frontend

The frontend is an **Angular 20** application using:

* Angular CLI 20
* TypeScript
* npm

---

# 3. Backend Configuration

The backend application runs on:

```text
http://localhost:8082
```

The main REST controller is `TodoController`.

It uses:

```java
@RestController
```

and exposes Todo-related REST APIs.

---

# 4. REST API Endpoints

The backend exposes the following Todo endpoints.

| HTTP Method | Endpoint                            | Purpose                  |
| ----------- | ----------------------------------- | ------------------------ |
| GET         | `/users/{username}/list-todos`      | Retrieve all Todos       |
| GET         | `/users/{username}/list-todos/{id}` | Retrieve a specific Todo |
| POST        | `/users/{username}/list-todos`      | Create a Todo            |
| PUT         | `/users/{username}/list-todos/{id}` | Update a Todo            |
| DELETE      | `/users/{username}/list-todos/{id}` | Delete a Todo            |

There are also test endpoints:

```text
GET /
GET /hello-world-bean
GET /hello-world-bean/path/{name}
GET /test
```

For example:

```text
GET http://localhost:8082/
```

returns:

```text
welcome to spring
```

---

# 5. CORS

The backend currently allows requests from the Angular development server:

```text
http://localhost:4200
```

This is required because the frontend and backend are running on different ports during local development.

The controller contains:

```java
@CrossOrigin(origins = {
    "http://localhost:4200",
    "http://localhost:8081"
})
```

For Phase 1, we did **not** change this configuration.

When we move to Docker/AWS, this will be reconsidered according to the deployment architecture.

---

# 6. Starting the Backend

From:

```text
backend/MyTodo
```

the backend was started using:

```bash
mvn spring-boot:run
```

Successful startup was confirmed by the Spring Boot startup message:

```text
Started MyTodoApplication
```

### Validation

```text
Spring Boot startup → PASS
```

---

# 7. Backend API Validation

The backend was tested independently of Angular.

We validated:

```text
GET /
GET /hello-world-bean
GET /users/samuel/list-todos
```

The API responded successfully.

This established that the following chain works:

```text
HTTP Request
     ↓
Spring Boot
     ↓
TodoController
     ↓
TodoRepository
     ↓
H2 Database
     ↓
HTTP Response
```

### Validation

```text
Backend REST API → PASS
```

---

# 8. Angular Application

The Angular application runs locally on:

```text
http://localhost:4200
```

The Todo page is accessed using:

```text
http://localhost:4200/todos/samuel
```

The Angular application was successfully started and opened in the browser.

### Validation

```text
Angular startup → PASS
```

---

# 9. Angular → Spring Boot Communication

Initially, the Angular application attempted to call:

```text
/api/users/samuel/list-todos
```

but the request returned:

```text
404 Not Found
```

### Root Cause

The Angular application was running with the Angular development server.

The existing `nginx.conf` contained an AWS ALB configuration:

```nginx
location /api/ {
    proxy_pass http://todo-alb-1893921724.ap-south-1.elb.amazonaws.com/;
}
```

That Nginx configuration is **not used by `npm start`**.

Nginx becomes relevant when the Angular application is built and served through Nginx, such as in our Docker deployment.

---

# 10. Angular Development Proxy

To solve the local-development routing problem, we introduced:

```text
frontend/todo/proxy.conf.json
```

Configuration:

```json
{
  "/api": {
    "target": "http://localhost:8082",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

The Angular `start` script was configured to use this proxy:

```text
ng serve --proxy-config proxy.conf.json
```

### What the proxy does

Angular makes:

```text
/api/users/samuel/list-todos
```

The development proxy forwards it to:

```text
http://localhost:8082/users/samuel/list-todos
```

So the local architecture becomes:

```text
Browser
   │
   ▼
Angular :4200
   │
   │ /api
   ▼
Angular Development Proxy
   │
   ▼
Spring Boot :8082
   │
   ▼
H2
```

After this change, the Todo API successfully returned data.

### Validation

```text
Angular → Spring Boot → PASS
```

---

# 11. Todo CRUD Validation

After establishing frontend/backend communication, we tested the complete CRUD workflow through the Angular UI.

## Create

A new Todo was successfully created.

```text
POST → PASS
```

## Read

Todo data was successfully retrieved and displayed.

```text
GET → PASS
```

## Update

An existing Todo was successfully modified.

```text
PUT → PASS
```

## Delete

An existing Todo was successfully removed.

```text
DELETE → PASS
```

---

# 12. Final Phase 1 Validation

| Area                    | Status |
| ----------------------- | ------ |
| Project structure       | ✅ PASS |
| Java                    | ✅ PASS |
| Maven                   | ✅ PASS |
| Spring Boot startup     | ✅ PASS |
| Backend port 8082       | ✅ PASS |
| REST API                | ✅ PASS |
| H2 database interaction | ✅ PASS |
| Angular startup         | ✅ PASS |
| Angular → Backend       | ✅ PASS |
| Create Todo             | ✅ PASS |
| Read Todo               | ✅ PASS |
| Update Todo             | ✅ PASS |
| Delete Todo             | ✅ PASS |

# 🟢 Phase 1 COMPLETE

We now have a **known-good local baseline**.

```text
                 PHASE 1

             Browser
                │
                ▼
       ┌─────────────────┐
       │   Angular 20    │
       │   :4200         │
       └────────┬────────┘
                │
                │ /api
                ▼
       ┌─────────────────┐
       │ Angular Proxy   │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  Spring Boot    │
       │  :8082          │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │      H2         │
       │  In-memory DB   │
       └─────────────────┘
```

## What we learned

**Application layer**

* Angular frontend
* Spring Boot backend
* REST APIs
* HTTP methods
* Controller → Repository flow
* H2 database

**Integration layer**

* CORS
* Angular development proxy
* `/api` routing
* Frontend/backend separation

**Validation mindset**

We didn't move forward simply because the applications started. We separately validated:

```text
Application startup
        ↓
Backend API
        ↓
Frontend startup
        ↓
Frontend → Backend
        ↓
CRUD
        ↓
PHASE 1 PASS
```

This is the baseline we'll use for **Phase 2 — Dockerization**.

