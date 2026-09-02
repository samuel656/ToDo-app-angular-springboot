# Phase 2 — Dockerization & Container Networking

## 1. Objective

The goal of **Phase 2** was to take the application validated in Phase 1 and run the **Angular frontend and Spring Boot backend as Docker containers**.

The final architecture is:

```text
Browser
   │
   │ localhost:4200
   ▼
┌─────────────────────────────┐
│ Frontend Container          │
│ Angular Production Build    │
│ Nginx :80                   │
└──────────────┬──────────────┘
               │
               │ backend:8082
               ▼
┌─────────────────────────────┐
│ Backend Container            │
│ Spring Boot :8082            │
└──────────────┬──────────────┘
               │
               ▼
          H2 Database
```

The important objective was not simply to create images, but to **prove that the complete application works inside Docker**.

---

# 2. Docker Environment Cleanup

We started Phase 2 by checking existing Docker resources.

### Containers

```bash
docker ps -a
```

Result:

```text
No containers
```

There were no existing containers running from the previous setup.

### Existing images

Several old Todo application images existed from previous experiments, including backend and frontend images with different tags.

These were removed so Phase 2 could start from a clean local Docker image state.

### Important

We did **not** delete the AWS ECR repositories.

The cleanup was limited to the **local Docker environment**.

---

# 3. Backend Dockerfile

The existing backend Dockerfile uses a **multi-stage Docker build**:

```dockerfile
# Build the Spring Boot API.
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY pom.xml ./
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# Run the API with a small Java runtime image.
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

## Stage 1 — Build

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
```

This stage provides:

* Maven
* Java 17
* Build environment

The project dependencies are downloaded using:

```dockerfile
RUN mvn -B dependency:go-offline
```

Then the source is copied and packaged:

```dockerfile
COPY src ./src
RUN mvn -B clean package -DskipTests
```

This produces the Spring Boot JAR.

---

## Stage 2 — Runtime

The final image uses:

```dockerfile
FROM eclipse-temurin:17-jre
```

We only need the Java Runtime Environment to execute the already-built JAR.

The JAR is copied from the build stage:

```dockerfile
COPY --from=build /workspace/target/*.jar app.jar
```

The application exposes:

```dockerfile
EXPOSE 8082
```

and starts with:

```dockerfile
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Why multi-stage builds?

The final image does not need:

* Maven
* source compilation tools
* build dependencies

It only needs Java runtime + application JAR.

This keeps the runtime image smaller and separates **build** from **execution**.

---

# 4. Backend Image

The backend image was built using:

```bash
docker build -t todo-backend:phase2 .
```

The resulting image:

```text
todo-backend:phase2
```

Size:

```text
~348 MB
```

### Validation

```text
Spring Boot source
        ↓
Dockerfile
        ↓
Maven build
        ↓
JAR
        ↓
Java runtime image
        ↓
todo-backend:phase2
```

**Backend image build: ✅ PASS**

---

# 5. Backend Container

The backend image was run using:

```bash
docker run --name todo-backend-phase2 -p 8082:8082 todo-backend:phase2
```

The port mapping is:

```text
Host                 Container
───────────────────────────────
8082        ───────→  8082
```

Therefore:

```text
http://localhost:8082
```

reaches the Spring Boot application inside the container.

---

# 6. Backend Container Validation

The backend was tested through Docker using the REST APIs.

Example:

```bash
curl http://localhost:8082/
```

The application responded successfully.

The Todo endpoint was also tested:

```bash
curl http://localhost:8082/users/samuel/list-todos
```

The backend container therefore successfully handled REST requests.

### Validation

```text
Backend image       ✅
Backend container   ✅
Spring Boot         ✅
REST API            ✅
H2                  ✅
```

---

# 7. Frontend Dockerfile

The frontend Dockerfile also uses a **multi-stage build**:

```dockerfile
# Build the Angular application.
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve the production build and proxy API calls to the Spring Boot service.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/todo/browser /usr/share/nginx/html

EXPOSE 80
```

---

# 8. Angular Build Stage

The first stage uses:

```dockerfile
FROM node:20-alpine AS build
```

Node.js is required to build the Angular application.

Dependencies are installed using:

```dockerfile
RUN npm ci
```

The application is then built using:

```dockerfile
RUN npm run build
```

This creates the Angular production files.

---

# 9. Nginx Runtime Stage

The second stage uses:

```dockerfile
FROM nginx:1.27-alpine
```

The Angular production build is copied into:

```text
/usr/share/nginx/html
```

using:

```dockerfile
COPY --from=build /app/dist/todo/browser /usr/share/nginx/html
```

Nginx listens on:

```text
80
```

The host later maps:

```text
4200 → 80
```

---

# 10. Nginx Configuration

The original Nginx configuration contained an old AWS ALB address.

That was removed because we intentionally restarted the infrastructure from scratch.

The Docker version uses:

```nginx
location /api/ {
    proxy_pass http://backend:8082/;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The important configuration is:

```text
backend:8082
```

`backend` is the Docker Compose service name.

---

# 11. Why `backend:8082` Instead of `localhost:8082`?

This was one of the most important Docker networking concepts learned in Phase 2.

Inside a container:

```text
localhost
```

means:

> **The current container itself.**

Therefore, from the frontend container:

```text
localhost:8082
```

does not mean the Spring Boot container.

Docker Compose creates a shared network and provides DNS resolution for service names.

Therefore:

```text
backend
```

resolves to the backend container.

The communication becomes:

```text
Frontend container
       │
       │ http://backend:8082
       ▼
Backend container
```

---

# 12. Docker Networking Experiment

Before using Compose, the frontend was temporarily started independently.

Nginx produced:

```text
host not found in upstream "backend"
```

This was expected because the independently started frontend container did not have access to a Docker network where `backend` could be resolved.

This demonstrated the difference between:

```text
docker run
```

and:

```text
docker compose
```

---

# 13. Docker Compose

The final Compose configuration is:

```yaml
services:
  backend:
    build:
      context: ./backend/MyTodo
      dockerfile: Dockerfile
    ports:
      - "8082:8082"

  frontend:
    build:
      context: ./frontend/todo
      dockerfile: Dockerfile
    depends_on:
      - backend
    ports:
      - "4200:80"
```

---

# 14. Compose Architecture

Compose creates a network for the services.

The services are:

```text
backend
frontend
```

The frontend can therefore resolve:

```text
backend
```

through Docker's internal DNS.

The architecture becomes:

```text
                  Docker Compose Network

┌────────────────────────┐
│ frontend               │
│                        │
│ Angular + Nginx        │
│ Nginx :80              │
└───────────┬────────────┘
            │
            │ backend:8082
            ▼
┌────────────────────────┐
│ backend                │
│                        │
│ Spring Boot :8082      │
└───────────┬────────────┘
            │
            ▼
           H2
```

---

# 15. Frontend Image

The frontend image was built using:

```bash
docker build -t todo-frontend:phase2 .
```

Result:

```text
todo-frontend:phase2
```

Size:

```text
~48.6 MB
```

### Validation

```text
Angular source
      ↓
Node 20
      ↓
npm ci
      ↓
Angular production build
      ↓
Nginx
      ↓
todo-frontend:phase2
```

**Frontend image build: ✅ PASS**

---

# 16. Frontend Container

The frontend container exposes Nginx on port `80`.

Docker Compose maps:

```text
4200 → 80
```

Therefore the application is accessed from the browser through:

```text
http://localhost:4200
```

The Todo page is:

```text
http://localhost:4200/todos/samuel
```

---

# 17. Complete Request Flow

When the user loads the Todo application:

```text
Browser
   │
   │ http://localhost:4200
   ▼
Frontend Container
   │
   │ Nginx
   ▼
Angular Application
```

When Angular requests Todo data:

```text
Browser
   │
   │ /api/users/samuel/list-todos
   ▼
Frontend / Nginx
   │
   │ backend:8082
   ▼
Backend Container
   │
   ▼
TodoController
   │
   ▼
TodoRepository
   │
   ▼
H2
```

The response travels back through the same path to Angular.

---

# 18. Docker CRUD Validation

The final test was performed through the **Dockerized application**, not the local development servers.

All CRUD operations were successfully validated:

| Operation   | HTTP Method | Result |
| ----------- | ----------- | ------ |
| Create Todo | POST        | ✅ PASS |
| Read Todo   | GET         | ✅ PASS |
| Update Todo | PUT         | ✅ PASS |
| Delete Todo | DELETE      | ✅ PASS |

This confirms that the complete Dockerized application is functional.

---

# 19. Final Phase 2 Validation

| Component           | Result |
| ------------------- | ------ |
| Docker cleanup      | ✅ PASS |
| Backend Dockerfile  | ✅ PASS |
| Frontend Dockerfile | ✅ PASS |
| Nginx configuration | ✅ PASS |
| Backend image       | ✅ PASS |
| Backend container   | ✅ PASS |
| Backend API         | ✅ PASS |
| Frontend image      | ✅ PASS |
| Frontend container  | ✅ PASS |
| Docker networking   | ✅ PASS |
| Docker Compose      | ✅ PASS |
| Frontend → Backend  | ✅ PASS |
| Create Todo         | ✅ PASS |
| Read Todo           | ✅ PASS |
| Update Todo         | ✅ PASS |
| Delete Todo         | ✅ PASS |

# 🟢 PHASE 2 COMPLETE

We have now established a **second known-good baseline**:

```text
PHASE 1
Local Application
        │
        │ validated
        ▼
PHASE 2
Dockerized Application
        │
        │ validated
        ▼
PHASE 3
AWS ECR
        │
        ▼
PHASE 4
ECS + ALB
        │
        ▼
PHASE 5
RDS MySQL
        │
        ▼
PHASE 6
Production + CI/CD
```

### Key Docker concepts learned

1. **Multi-stage Docker builds**
2. Docker build context
3. Docker images vs containers
4. Host-to-container port mapping
5. Nginx as the frontend runtime
6. Nginx reverse proxy
7. Container-to-container communication
8. Docker DNS/service names
9. Docker Compose networking
10. Validating an entire application inside containers

**Phase 2: 🟢 COMPLETE**

The next milestone is **Phase 3 — AWS Foundation + ECR**, where we'll take these validated Docker images and learn how to push and retrieve them from AWS ECR before introducing ECS.
