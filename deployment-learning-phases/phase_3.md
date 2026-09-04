# Phase 3  — AWS ECR: Push, Pull & Run Docker Images

## 🎯 Objective

In Phase 3, we move from **local Docker images** to **AWS Elastic Container Registry (ECR)**.

The goal is not only to push images to ECR, but to prove that we can:

1. Build Docker images locally.
2. Store them in AWS ECR.
3. Pull the images back from ECR.
4. Run the pulled images as Docker containers.
5. Connect frontend and backend through a Docker network.
6. Validate the complete Todo application using CRUD operations.

---

# Phase 3 Architecture

At the end of Phase 3, the flow is:

```text
                    AWS
                     │
             ┌───────▼────────┐
             │      ECR       │
             │                │
             │ todo-backend   │
             │ todo-frontend  │
             └───────┬────────┘
                     │
                docker pull
                     │
                     ▼
             Local Docker
                     │
          ┌──────────┴──────────┐
          │ todo-ecr-network    │
          │                     │
          │ ┌─────────────────┐ │
          │ │ Frontend        │ │
          │ │ Angular + Nginx │ │
          │ │ :80             │ │
          │ └────────┬────────┘ │
          │          │ /api     │
          │          ▼          │
          │ ┌─────────────────┐ │
          │ │ Backend         │ │
          │ │ Spring Boot     │ │
          │ │ :8082           │ │
          │ └─────────────────┘ │
          └─────────────────────┘
                     │
                     ▼
                    H2
```

---

# 3.1 Verify AWS CLI

First verify that AWS CLI is installed and authenticated.

```cmd
aws --version
```

Then:

```cmd
aws sts get-caller-identity
```

### Expected

You should get your AWS IAM identity.

### Why?

This confirms that the AWS CLI can communicate with your AWS account.

### Result

**✅ PASS**

We used the IAM user `docker-aws-learning` rather than the root account.

---

# 3.2 Verify AWS Region

Check the configured region:

```cmd
aws configure get region
```

Expected:

```text
ap-south-1
```

Our project is using the **Mumbai AWS region**.

### Result

**✅ PASS**

---

# 3.3 Verify ECR Repositories

List the ECR repositories:

```cmd
aws ecr describe-repositories --region ap-south-1 --query "repositories[].repositoryName" --output table
```

We verified that the following repositories exist:

```text
todo-backend
todo-frontend
```

These repositories store our Docker images.

### Repository URIs

Backend:

```text
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend
```

Frontend:

```text
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend
```

### Result

**✅ PASS**

---

# 3.4 Clean Old ECR Images

Before pushing the new images, we cleaned the old images from ECR.

Initially, the IAM user didn't have permission to delete ECR images.

We received:

```text
AccessDenied
ecr:BatchDeleteImage
```

We then added a narrow IAM permission for:

```text
ecr:BatchDeleteImage
```

on the two Todo ECR repositories.

After that, the repositories were cleaned successfully.

### Verify

```cmd
aws ecr list-images --repository-name todo-backend --region ap-south-1
```

and:

```cmd
aws ecr list-images --repository-name todo-frontend --region ap-south-1
```

The repositories were empty before the new Phase 3 images were pushed.

### Result

**✅ PASS**

---

# 3.5 Authenticate Docker with ECR

Run:

```cmd
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 221027285753.dkr.ecr.ap-south-1.amazonaws.com
```

Expected:

```text
Login Succeeded
```

### What happened?

AWS generated an authentication token and Docker used it to authenticate against our private ECR registry.

Conceptually:

```text
AWS CLI
   │
   │ authentication token
   ▼
Docker
   │
   ▼
AWS ECR
```

### Result

**✅ PASS**

---

# 3.6 Verify Local Backend Image

Before pushing, verify the backend image exists locally:

```cmd
docker images
```

Our backend image was:

```text
todo-backend:phase2
```

The image was already built and tested during Phase 2.

---

# 3.7 Tag Backend Image for ECR

We gave the existing backend image an ECR-compatible name:

```cmd
docker tag todo-backend:phase2 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:phase3
```

### Important concept

`docker tag` **does not rebuild the image**.

It simply gives the same Docker image another reference/name.

So:

```text
todo-backend:phase2
          │
          │ docker tag
          ▼
ECR URI/todo-backend:phase3
```

Both references point to the same local image.

### Verify

```cmd
docker images
```

### Result

**✅ PASS**

---

# 3.8 Push Backend Image to ECR

Run:

```cmd
docker push 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:phase3
```

Docker uploads the image layers to ECR.

Conceptually:

```text
Local Docker Image
       │
       │ docker push
       ▼
AWS ECR
todo-backend:phase3
```

### Result

**✅ PASS**

---

# 3.9 Verify Backend Image in ECR

Run:

```cmd
aws ecr describe-images --repository-name todo-backend --region ap-south-1 --query "imageDetails[].{Tag:imageTags[0],Digest:imageDigest,Size:imageSizeInBytes}" --output table
```

We verified:

```text
Tag: phase3
Digest: sha256:24ad2890...
```

The exact digest we observed was:

```text
sha256:24ad2890fb23dc80a9ebeb3e3c4e3690b4d5403e14f73cbb9e622be2f1f98765
```

### Result

**✅ PASS**

---

# 3.10 Tag Frontend Image for ECR

Our existing local frontend image was tagged for ECR:

```cmd
docker tag todo-frontend:phase2 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend:phase3
```

Again, `docker tag` does not rebuild the image.

It creates another reference to the existing image.

### Result

**✅ PASS**

---

# 3.11 Push Frontend Image to ECR

Run:

```cmd
docker push 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend:phase3
```

The frontend Docker image was uploaded to ECR.

### Result

**✅ PASS**

---

# 3.12 Verify Frontend Image in ECR

Run:

```cmd
aws ecr describe-images --repository-name todo-frontend --region ap-south-1 --query "imageDetails[].{Tag:imageTags[0],Digest:imageDigest,Size:imageSizeInBytes}" --output table
```

We verified:

```text
Tag: phase3
Digest: sha256:0b5f9aa5...
```

The exact digest observed was:

```text
sha256:0b5f9aa5bcddc225f4a0c1c61a23978dc4ee0a5ad1fca3aea996ee50db320bec
```

### Result

**✅ PASS**

---

# 3.13 Pull Backend Image from ECR

To prove that ECR actually contains a usable image, we removed the local ECR reference/image and pulled it again.

Command:

```cmd
docker pull 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:phase3
```

Docker reported the ECR digest and successfully downloaded the image.

### Why is this important?

A successful push only proves:

```text
Local → ECR
```

A successful pull proves:

```text
ECR → Docker
```

### Result

**✅ PASS**

---

# 3.14 Run Backend Pulled from ECR

We started the backend using the ECR image:

```cmd
docker run -d --name todo-backend-ecr-phase3 -p 8082:8082 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:phase3
```

Then verified:

```cmd
docker ps
```

The backend container was running.

We also tested the Spring Boot API.

### Result

**✅ PASS**

This proved that the backend image retrieved directly from ECR is executable.

---

# 3.15 Pull Frontend Image from ECR

We pulled the frontend image:

```cmd
docker pull 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend:phase3
```

Docker confirmed:

```text
Status: Downloaded newer image
```

and the digest matched:

```text
sha256:0b5f9aa5bcddc225f4a0c1c61a23978dc4ee0a5ad1fca3aea996ee50db320bec
```

### Result

**✅ PASS**

---

# 3.16 Understand the Initial Frontend Failure

We initially tried:

```cmd
docker run --name todo-frontend-ecr-phase3 -p 4200:80 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend:phase3
```

Nginx failed with:

```text
host not found in upstream "backend"
```

### Why?

Our Nginx configuration contains:

```nginx
location /api/ {
    proxy_pass http://backend:8082/;
}
```

`backend` is a Docker hostname.

A standalone frontend container doesn't automatically know another container as `backend`.

This was **not an ECR problem**.

It was a Docker networking problem.

---

# 3.17 Create a Shared Docker Network

We removed the failed frontend container:

```cmd
docker rm todo-frontend-ecr-phase3
```

Then created a dedicated Docker network:

```cmd
docker network create todo-ecr-network
```

### Why?

We need both containers on the same network:

```text
todo-ecr-network

Frontend
    │
    │ backend:8082
    ▼
Backend
```

Docker provides DNS resolution between containers on the same user-defined network.

### Result

**✅ PASS**

---

# 3.18 Run Backend on Shared Network

The backend was started with:

```cmd
docker run -d --name todo-backend-ecr-phase3 --network todo-ecr-network -p 8082:8082 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:phase3
```

Verify:

```cmd
docker ps
```

Expected:

```text
todo-backend-ecr-phase3
Up
0.0.0.0:8082->8082/tcp
```

### Result

**✅ PASS**

---

# 3.19 Add Backend Network Alias

Our Nginx configuration expects:

```text
backend
```

So we connected the backend container with the alias:

```cmd
docker network disconnect todo-ecr-network todo-backend-ecr-phase3
```

Then:

```cmd
docker network connect --alias backend todo-ecr-network todo-backend-ecr-phase3
```

Now Docker DNS can resolve:

```text
backend
```

to our backend container.

Conceptually:

```text
backend
   │
   ▼
todo-backend-ecr-phase3
   │
   ▼
Spring Boot :8082
```

### Result

**✅ PASS**

---

# 3.20 Run Frontend ECR Image

We then started the frontend on the same network:

```cmd
docker run -d --name todo-frontend-ecr-phase3 --network todo-ecr-network -p 4200:80 221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend:phase3
```

Verify:

```cmd
docker ps
```

Both containers were running:

```text
todo-backend-ecr-phase3
todo-frontend-ecr-phase3
```

### Result

**✅ PASS**

---

# 3.21 Test Frontend → Backend Communication

Open:

```text
http://localhost:4200/todos/samuel
```

The Angular application loaded successfully.

The screenshot showed:

```text
My ToDo's

Id    Description             Target Date     Is Completed?
1     Learn AWS Deployment    Sep 4, 2026     false
```

This proved:

```text
Browser
   ↓
Nginx
   ↓
backend:8082
   ↓
Spring Boot
   ↓
H2
   ↓
Todo data
   ↓
Angular
```

### Result

**✅ PASS**

---

# 3.22 Understand Nginx `/api` Routing

The frontend sends requests such as:

```text
/api/users/samuel/list-todos
```

Nginx contains:

```nginx
location /api/ {
    proxy_pass http://backend:8082/;
}
```

The trailing `/` in `proxy_pass` causes the `/api/` prefix to be replaced.

Therefore:

```text
/api/users/samuel/list-todos
```

becomes:

```text
/users/samuel/list-todos
```

and is sent to:

```text
http://backend:8082/users/samuel/list-todos
```

This matches our Spring Boot controller.

---

# 3.23 Test CRUD Operations

Finally, we tested the actual application functionality through the ECR-based containers.

## Create

Created a new Todo from the Angular UI.

```text
POST
```

### Result

**✅ PASS**

---

## Read

The Todo appeared in the Todo list.

```text
GET
```

### Result

**✅ PASS**

---

## Update

The Todo was updated through the UI.

```text
PUT
```

### Result

**✅ PASS**

---

## Delete

The Todo was deleted.

The application displayed:

```text
Delete Todo 2 Successful
```

The Todo disappeared from the list.

```text
DELETE
```

### Result

**✅ PASS**

---

# 3.24 Final Phase 3 Validation

The complete flow was successfully tested:

```text
                    AWS
                     │
                     ▼
              ┌─────────────┐
              │     ECR     │
              │             │
              │  Frontend   │
              │  Backend    │
              └──────┬──────┘
                     │
                docker pull
                     │
                     ▼
             Docker Network
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Angular/Nginx          Spring Boot
       Frontend               Backend
          │                     │
          └─────────┬───────────┘
                    ▼
                   H2
```

## Final checklist

| Validation                       |         Status |
| -------------------------------- | -------------: |
| AWS CLI authentication           |              ✅ |
| AWS region verified              |              ✅ |
| ECR repositories verified        |              ✅ |
| Old ECR images cleaned           |              ✅ |
| Docker authenticated with ECR    |              ✅ |
| Backend tagged                   |              ✅ |
| Backend pushed                   |              ✅ |
| Backend verified in ECR          |              ✅ |
| Frontend tagged                  |              ✅ |
| Frontend pushed                  |              ✅ |
| Frontend verified in ECR         |              ✅ |
| Backend pulled from ECR          |              ✅ |
| Backend ECR container started    |              ✅ |
| Frontend pulled from ECR         |              ✅ |
| Shared Docker network created    |              ✅ |
| Backend network alias configured |              ✅ |
| Frontend ECR container started   |              ✅ |
| Angular application loaded       |              ✅ |
| Frontend → Backend communication |              ✅ |
| Create Todo                      |              ✅ |
| Read Todo                        |              ✅ |
| Update Todo                      |              ✅ |
| Delete Todo                      |              ✅ |
| **Phase 3**                      | **✅ COMPLETE** |

---

# 🧠 What You Learned in Phase 3

### 1. ECR is a Docker image registry

Instead of keeping Docker images only on your laptop:

```text
Laptop
 └── Docker Image
```

we can store them centrally:

```text
AWS ECR
 ├── todo-backend
 └── todo-frontend
```

---

### 2. Push vs Pull

**Push:**

```text
Docker → ECR
```

```cmd
docker push <ecr-image>
```

**Pull:**

```text
ECR → Docker
```

```cmd
docker pull <ecr-image>
```

---

### 3. Container networking

`localhost` inside a container refers to **that container itself**.

For communication between containers, we use a Docker network and DNS/service name.

In our project:

```text
frontend
   ↓
backend:8082
```

---

### 4. ECR doesn't run containers

ECR only **stores the images**.

For example:

```text
ECR
 │
 │ stores
 ▼
Docker Image
 │
 │ pulled by
 ▼
EC2 / ECS / Kubernetes / local Docker
 │
 ▼
Container
```

This distinction becomes very important in the next AWS deployment phase.

---

# 🏁 Phase 3 Milestone

**Phase 3 — AWS ECR: COMPLETE ✅**

You have now proven that your application can be packaged into Docker images, stored in AWS ECR, pulled back from AWS, executed as containers, connected over a Docker network, and used successfully for full CRUD operations.

**Phase 1:** Local application ✅
**Phase 2:** Dockerized application ✅
**Phase 3:** AWS ECR ✅
**Phase 4:** AWS EC2 deployment → **next milestone**
