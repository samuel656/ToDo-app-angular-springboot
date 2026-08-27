# Phase 1 — ECS / Fargate

---

# 1. Create ECS Cluster

AWS Console:

```text
Amazon ECS
   ↓
Clusters
   ↓
Create cluster
```

Cluster name:

```text
todo-app-cluster
```

We created the cluster successfully.

Result:

```text
todo-app-cluster
Status: Active
```

### Important concept

An ECS cluster is a logical grouping where ECS services/tasks run.

```text
ECS Cluster
└── todo-app-cluster
```

---

# 2. Understand Fargate

We selected:

```text
AWS Fargate
```

Fargate means AWS manages the underlying servers for us.

We don't need to:

```text
Create EC2 instance
Install Docker
Manage OS
Patch servers
Manage container runtime
```

Instead:

```text
ECS
 ↓
Fargate
 ↓
Container
```

---

# 3. Create ECS Task Execution IAM Role

We went to:

```text
IAM
 ↓
Roles
 ↓
Create role
```

The important purpose of the **Task Execution Role** is to allow ECS/Fargate to perform operations required to run the container, such as pulling the private image from ECR and sending logs to CloudWatch.

The role used by the task definition was:

```text
ecsTaskExecutionRole
```

Our task definition showed:

```text
Task execution role:
ecsTaskExecutionRole
```

### Important distinction

There are two different concepts:

```text
Task Role
     ↓
Permissions used BY your application/container

Task Execution Role
     ↓
Permissions used BY ECS/Fargate to start the container
```

For our current deployment, the execution role was the important one.

---

# 4. Create ECS Task Definition

AWS Console:

```text
ECS
 ↓
Task definitions
 ↓
Create new task definition
```

We selected:

```text
AWS Fargate
```

## Task definition

Our task definition family:

```text
todo-backend-task
```

Revision:

```text
1
```

Final ARN was under:

```text
arn:aws:ecs:ap-south-1:221027285753:task-definition/todo-backend-task:1
```

---

# 5. Task Configuration

We used:

```text
Operating system:
Linux/X86_64
```

CPU:

```text
0.25 vCPU
```

Memory:

```text
0.5 GB
```

Network mode:

```text
awsvpc
```

---

# 6. Container Configuration

Container name:

```text
todo-backend
```

Image URI:

```text
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-backend:1.0
```

This is the important connection between **ECR and ECS**:

```text
ECR
└── todo-backend:1.0
          ↓
ECS Task Definition
          ↓
Fargate downloads image
          ↓
Container starts
```

---

# 7. Container Port

Our Spring Boot application runs on:

```text
8082
```

Therefore we configured:

```text
Container port: 8082
Protocol: TCP
App protocol: HTTP
```

So:

```text
Spring Boot
     ↓
8082
     ↓
Docker Container
     ↓
ECS/Fargate
```

---

# 8. CloudWatch Logs

We enabled log collection:

```text
Use log collection: ✓
Destination: Amazon CloudWatch
```

Configuration:

```text
awslogs-group:
/ecs/todo-backend-task

awslogs-region:
ap-south-1

awslogs-stream-prefix:
ecs

awslogs-create-group:
true
```

This allows us to inspect application/container logs from AWS.

---

# 9. Create ECS Service

From the task definition we selected:

```text
Deploy
 ↓
Create service
```

Cluster:

```text
todo-app-cluster
```

Service name:

```text
todo-backend-service
```

---

# 10. Compute Configuration

We used:

```text
Capacity provider strategy
```

Capacity provider:

```text
FARGATE
```

Base:

```text
0
```

Weight:

```text
1
```

Platform version:

```text
LATEST
```

---

# 11. Deployment Configuration

Scheduling strategy:

```text
Replica
```

Desired tasks:

```text
1
```

Meaning ECS should maintain:

```text
1 running task
```

Our final service showed:

```text
Tasks:
1 desired
1 running
0 pending
```

---

# 12. Networking

We selected the default VPC:

```text
vpc-07ebee6b3399df94d
```

Subnets:

```text
ap-south-1a
ap-south-1b
ap-south-1c
```

Security group:

```text
sg-0246f7b5dc289d7c4
```

We used the default security group.

---

# 13. Security Group — Port 8082

Initially the security group had only its default inbound rule.

We added:

```text
Type:
Custom TCP

Protocol:
TCP

Port:
8082
```

This was necessary because our Spring Boot application listens on port `8082`.

After modification, the security group showed:

```text
Inbound rules: 2
```

including the new `8082` rule.

---

# 14. Public IP

For the ECS service networking configuration we enabled:

```text
Public IP:
Turned on
```

This allowed the Fargate task to receive a public IP.

Our running task received:

```text
Public IP:
13.126.21.183
```

---

# 15. ECS Deployment

After creating the service, ECS started the task.

We verified:

```text
Service:
todo-backend-service

Status:
Active

Tasks:
1 Running
```

The deployment eventually showed:

```text
Deployment Complete
1 task started successfully
```

This confirmed that:

```text
ECR → ECS → Fargate → Container
```

was working.

---

# 16. Verify the Container

We opened:

```text
http://13.126.21.183:8082
```

and received:

```text
Welcome to Spring
```

That was our first confirmation that the Spring Boot application was reachable externally.

---

# 17. Test REST API

Initially we tried:

```text
http://13.126.21.183:8082/api/todos
```

and received:

```text
404 Not Found
```

This was **not an AWS problem**.

Our actual controller mappings are:

```text
GET
/users/{username}/list-todos

GET
/users/{username}/list-todos/{id}

POST
/users/{username}/list-todos

PUT
/users/{username}/list-todos/{id}

DELETE
/users/{username}/list-todos/{id}

GET
/test
```

---

# 18. Test POST API

We then tested the actual POST endpoint:

```text
POST
http://13.126.21.183:8082/users/samuel/list-todos
```

with JSON data.

The request successfully created a Todo.

Therefore we confirmed:

```text
External Request
      ↓
Public IP
      ↓
Security Group : 8082
      ↓
ECS Fargate
      ↓
Docker Container
      ↓
Spring Boot Controller
      ↓
TodoRepository
      ↓
Database
```

✅ **End-to-end backend deployment confirmed.**

---

# Current AWS Architecture

This is where we stopped today:

```text
                    AWS
┌──────────────────────────────────────────────┐
│                                              │
│  ECR                                         │
│  ├── Frontend image                          │
│  └── Backend image                           │
│          │                                   │
│          │ todo-backend:1.0                  │
│          ↓                                   │
│  ECS Cluster                                 │
│  └── todo-app-cluster                        │
│          │                                   │
│          ↓                                   │
│  ECS Service                                 │
│  └── todo-backend-service                    │
│          │                                   │
│          ↓                                   │
│  Fargate Task                                │
│  └── todo-backend container                  │
│          │                                   │
│          ↓                                   │
│       Port 8082                              │
│          │                                   │
│          ↓                                   │
│    Public IP: 13.126.21.183                  │
│                                              │
└──────────────────────────────────────────────┘
```

# Phase 0 vs Phase 1

| Phase       | AWS Service         | What we did                                               |
| ----------- | ------------------- | --------------------------------------------------------- |
| **Phase 0** | Amazon ECR          | Stored frontend & backend Docker images                   |
| **Phase 1** | Amazon ECS          | Created ECS cluster                                       |
| **Phase 1** | AWS Fargate         | Ran backend container without managing EC2                |
| **Phase 1** | IAM                 | Created/used ECS task execution role                      |
| **Phase 1** | ECS Task Definition | Defined backend container, CPU, memory, port, image, logs |
| **Phase 1** | ECS Service         | Maintained 1 running backend task                         |
| **Phase 1** | EC2 Security Groups | Allowed TCP `8082`                                        |
| **Phase 1** | CloudWatch          | Configured container logging                              |
| **Phase 1** | Fargate Networking  | VPC, subnets, public IP                                   |
| **Phase 1** | Testing             | Tested Spring Boot + POST Todo API                        |

## Where we are now

**Completed:**

```text
✅ Phase 0 — ECR
   ├── Frontend image
   └── Backend image

✅ Phase 1 — ECS/Fargate Backend
   ├── ECS Cluster
   ├── Fargate
   ├── IAM execution role
   ├── Task Definition
   ├── ECS Service
   ├── Security Group
   ├── CloudWatch logs
   ├── Public IP
   └── REST API test
```

### Next phase

The natural next step will be to move from:

```text
Public IP → ECS Task
```

toward a more realistic architecture such as:

```text
                    Internet
                       ↓
               Application Load
                  Balancer
                       ↓
                ECS Service
                       ↓
                Fargate Tasks
                       ↓
               Spring Boot API
```

