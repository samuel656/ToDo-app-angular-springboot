## 🎯 Our actual goal

                         INTERNET
                            │
                            ▼
                    ┌──────────────┐
                    │     ALB      │
                    │ HTTP/HTTPS   │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
               Angular ECS   Spring Boot ECS
                Fargate          Fargate
                                  │
                                  ▼
                              RDS MySQL
                              (private)
```

And eventually:

```text
GitHub
   │
   ▼
GitHub Actions
   │
   ├── Test
   ├── Build
   ├── Docker Build
   ├── Push → ECR
   └── Deploy → ECS
```

That is the **end goal**.

---

# 🧭 Fresh roadmap

We're going to use these phases.

### Phase 1 — Understand & run application

```text
⬜ Clone repository
⬜ Understand project structure
⬜ Run Spring Boot
⬜ Run Angular
⬜ Verify Angular → Spring Boot
⬜ Verify Todo CRUD
```

### Phase 2 — Docker

```text
⬜ Dockerize Spring Boot
⬜ Dockerize Angular
⬜ Understand images
⬜ Understand containers
⬜ Port mapping
⬜ Container networking
⬜ Docker Compose
⬜ Validate both containers
```

### Phase 3 — AWS foundation + ECR

```text
⬜ AWS account/region
⬜ IAM
⬜ AWS CLI
⬜ ECR repositories
⬜ Build images
⬜ Push images
⬜ Pull image from ECR
⬜ Validate
```

### Phase 4 — ECS + ALB

We'll actually make this:

```text
ECR
 │
 ▼
ECS
 │
 ▼
Fargate
 │
 ├── Angular
 └── Spring Boot
        │
        ▼
       ALB
```

We'll learn:

```text
⬜ VPC
⬜ Subnets
⬜ Security Groups
⬜ ECS Cluster
⬜ Task Definition
⬜ Task
⬜ Service
⬜ Fargate
⬜ Target Group
⬜ ALB
⬜ Listener
⬜ Health check
⬜ Public URL
```

### Phase 5 — Database

```text
⬜ RDS MySQL
⬜ Database subnet/network
⬜ Security groups
⬜ Spring Boot → RDS
⬜ Environment variables
⬜ Secrets
⬜ Remove H2 dependency/configuration
⬜ CRUD validation
```

### Phase 6 — Production + CI/CD

```text
⬜ CloudWatch
⬜ Application logs
⬜ ECS health checks
⬜ Scaling
⬜ GitHub Actions
⬜ Docker build
⬜ ECR push
⬜ ECS deployment
⬜ End-to-end validation
```
---
