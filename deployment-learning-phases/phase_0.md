# Phase 0 — Amazon ECR

--- 

## 0.1 Build the Docker image

From the project directory:

```bash
docker build -t todo-backend .
```

This creates a local Docker image:

```text
todo-backend:latest
```

For the frontend, the same process was followed using the frontend project/Dockerfile.

---

## 0.2 Verify Docker images

```bash
docker images
```

You should see your application image listed.

Example:

```text
REPOSITORY       TAG       IMAGE ID
todo-backend     latest    xxxxx
```

---

## 0.3 Create ECR repository

In AWS:

```text
AWS Console
   ↓
Amazon ECR
   ↓
Repositories
   ↓
Create repository
```

The backend repository we used was:

```text
todo-backend
```

The resulting backend ECR image URI was:

```text
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend
```

Region:

```text
ap-south-1
```

---

# 0.4 Authenticate Docker with ECR

The standard command used for ECR authentication is:

```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 221027285753.dkr.ecr.ap-south-1.amazonaws.com
```

Expected result:

```text
Login Succeeded
```

---

# 0.5 Tag the local image

We tag the local Docker image with the ECR repository URI:

```bash
docker tag todo-backend:latest 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:1.0
```

So:

```text
Local image
    ↓
todo-backend:latest

ECR tag
    ↓
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:1.0
```

---

# 0.6 Push image to ECR

```bash
docker push 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:1.0
```

After the push completes, the image becomes available in:

```text
Amazon ECR
   ↓
todo-backend
   ↓
1.0
```

We performed the equivalent ECR workflow for the frontend as well.

---

# Phase 0 Result

At the end of Phase 0:

```text
Frontend Docker Image
        ↓
      ECR

Backend Docker Image
        ↓
      ECR
```

The important point is:

> **ECR stores the Docker images. It does not run the containers.**

---

