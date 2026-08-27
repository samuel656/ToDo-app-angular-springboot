# AWS Dockerized Microservice Deployment Roadmap

## Phase 0 — Docker & Amazon ECR

- Understand Dockerization of the existing Spring Boot backend
- Understand Dockerization of the existing Angular frontend
- Create Dockerfiles for backend and frontend
- Build backend Docker image
- Build frontend Docker image
- Run and test both containers locally
- Create Amazon ECR repository for backend
- Create Amazon ECR repository for frontend
- Configure AWS CLI
- Create IAM user for AWS CLI/ECR
- Configure AWS CLI credentials
- Authenticate Docker with Amazon ECR
- Tag backend Docker image with ECR repository URI
- Push backend image to ECR
- Tag frontend Docker image with ECR repository URI
- Push frontend image to ECR
- Verify both images in ECR

---

## Phase 1 — ECS/Fargate

- Create ECS cluster
- Understand Fargate
- Create ECS task execution IAM role
- Create backend task definition
- Create backend service
- Run Spring Boot container in AWS
- Test it

---

## Phase 2 — Frontend

- Create frontend task definition
- Create frontend service
- Run Angular/Nginx container in AWS
- Test both containers

---

## Phase 3 — Networking

- Understand VPC
- Understand subnets
- Security groups
- Public vs private networking
- Connect frontend → backend

---

## Phase 4 — ALB

- Create Application Load Balancer
- Target groups
- Listeners
- Health checks
- Public URL

---

## Phase 5 — Database

- Replace H2 with RDS MySQL
- Configure Spring Boot
- Secrets/environment variables
- Private database networking

---

## Phase 6 — Production

- CloudWatch logs
- ECS health checks
- Scaling
- GitHub Actions
- Automatic Docker → ECR → ECS deployment

---

