
# Phase 4 — Application Load Balancer

## 4.1 Objective

The objective of Phase 4 was to introduce an **Application Load Balancer** between the frontend and backend.

Instead of:

```text
Frontend → Backend ECS IP
```

we changed the architecture to:

```text
Frontend → ALB → Backend ECS
```

This provides a stable entry point for the backend.

---

# 4.2 Created ALB

We created:

```text
Name: todo-alb
Type: Application Load Balancer
Scheme: Internet-facing
IP address type: IPv4
Region: ap-south-1
```

The ALB became active successfully.

AWS generated the DNS name:

```text
todo-alb-1893921724.ap-south-1.elb.amazonaws.com
```

---

# 4.3 Why ALB?

Without an ALB:

```text
Angular
   ↓
ECS Task IP
   ↓
Spring Boot
```

The ECS task IP can change when a task is replaced.

With ALB:

```text
Angular
   ↓
Stable ALB DNS
   ↓
Target Group
   ↓
ECS Task
```

The ALB automatically knows which backend tasks are available.

---

# 4.4 Target Group

We created the target group:

```text
todo-backend-tg
```

Configuration:

```text
Target type: IP
Protocol: HTTP
Port: 8082
```

The target group registered the ECS backend task.

We observed the target:

```text
172.31.22.36
```

The important point is that the target is the **ECS task's private IP**, not the public IP.

Architecture:

```text
ALB
 │
 ▼
todo-backend-tg
 │
 ▼
172.31.22.36:8082
 │
 ▼
Spring Boot container
```

---

# 4.5 ALB Listener

We configured an HTTP listener:

```text
Protocol: HTTP
Port: 80
```

The listener forwards requests to:

```text
todo-backend-tg
```

Therefore:

```text
Client
  │
  │ HTTP :80
  ▼
todo-alb
  │
  │ Forward
  ▼
todo-backend-tg
  │
  │ HTTP :8082
  ▼
Spring Boot
```

---

# 4.6 Health Check

The target group's health check was configured as:

```text
Protocol: HTTP
Path: /
Port: Traffic port
```

The backend's `/` endpoint returns:

```text
welcome to spring
```

Therefore, ALB can use `/` to determine whether the backend is responding.

Health check configuration we observed:

```text
Protocol: HTTP
Path: /
Port: Traffic port

Healthy threshold: 5
Unhealthy threshold: 2
Timeout: 5 seconds
Interval: 30 seconds
Success codes: 200
```

---

# 4.7 Initial Health Check Problem

Immediately after deployment, the target initially showed:

```text
0 Healthy
1 Unhealthy
```

with:

```text
Health checks failed
```

This was useful for understanding how ALB health checks work.

After the ECS service/task became fully ready, the target changed to:

```text
1 Healthy
0 Unhealthy
```

The ECS deployment also eventually showed:

```text
Deployment status: Success
```

and:

```text
Circuit breaker: Monitoring complete
```

---

# 4.8 Backend ALB Testing

We directly tested the ALB DNS:

```text
http://todo-alb-1893921724.ap-south-1.elb.amazonaws.com/
```

The response was:

```text
welcome to spring
```

This confirmed:

```text
Internet
   ↓
ALB
   ↓
Target Group
   ↓
ECS Backend
   ↓
Spring Boot
```

was working.

---

# 4.9 Angular End-to-End Testing

After configuring Nginx and deploying the new frontend image, we opened:

```text
http://13.201.88.170/todos/samuel
```

The Angular application loaded successfully.

The Todo records were displayed:

```text
1   Learn AWS Deployment
2   Learn Azure
```

This was the most important test because it proved that the complete architecture was working.

---

# 4.10 Final Architecture

Our application now looks like this:

```text
                         INTERNET
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Frontend ECS      │
                 │                     │
                 │ Angular + Nginx     │
                 │       :80          │
                 └──────────┬──────────┘
                            │
                            │ /api/*
                            ▼
                 ┌─────────────────────┐
                 │    todo-alb         │
                 │ Application LB      │
                 │   Internet-facing   │
                 │       :80           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ todo-backend-tg     │
                 │                     │
                 │ HTTP :8082          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Backend ECS       │
                 │                     │
                 │ Spring Boot :8082   │
                 └──────────┬──────────┘
                            │
                            ▼
                         H2 DB
```

---

# 4.11 Files We Changed

An important point from today's work:

### Backend

We modified:

```text
TodoController.java
```

The controller exposes endpoints such as:

```text
GET    /users/{username}/list-todos
GET    /users/{username}/list-todos/{id}
POST   /users/{username}/list-todos
PUT    /users/{username}/list-todos/{id}
DELETE /users/{username}/list-todos/{id}
```

### Frontend

We verified that `TodoService` uses:

```typescript
/api/users/${name}/list-todos
```

instead of:

```text
http://localhost:8082/...
```

### Nginx

We modified:

```text
nginx.conf
```

to proxy:

```text
/api/*
```

to:

```text
todo-alb-1893921724.ap-south-1.elb.amazonaws.com
```

---

# What We Learned in Phase 3 & 4

### Phase 3

You learned:

* VPC
* Availability Zones
* Subnets
* Public networking
* Private ECS task networking
* Frontend/backend communication
* Nginx reverse proxy
* Why frontend should not use `localhost:8082`

### Phase 4

You learned:

* Application Load Balancer
* Internet-facing ALB
* ALB DNS
* Listeners
* Target groups
* IP targets
* Health checks
* Healthy/unhealthy targets
* ALB → ECS routing
* End-to-end testing

---

# Final Status

```text
Phase 0 — Docker & ECR          ✅
Phase 1 — ECS/Fargate           ✅
Phase 2 — Frontend              ✅
Phase 3 — Networking            ✅
Phase 4 — ALB                   ✅

Phase 5 — RDS MySQL             ⏳ NEXT
Phase 6 — Production/CI-CD      ⏳
```

### The key transformation today

We started with:

```text
Angular → Backend
```

and finished with:

```text
Angular
   ↓
Nginx
   ↓
Application Load Balancer
   ↓
Target Group
   ↓
ECS Fargate
   ↓
Spring Boot
   ↓
H2
```

**That is the exact milestone you should record for today.** Phase 5 will replace the final development-only piece, **H2**, with **RDS MySQL + Secrets Manager**.
