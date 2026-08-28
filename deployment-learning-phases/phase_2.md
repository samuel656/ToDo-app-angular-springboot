# Phase 2 --- Frontend Deployment

**---**

# 1. Create Frontend Docker Image

We prepared the Angular frontend for container deployment.

The frontend Docker image was created using:

``` text
todo-frontend
```

We created multiple image versions during development:

``` text
todo-frontend:1.1
todo-frontend:1.2
todo-frontend:1.3
```

The latest frontend image created was:

``` text
todo-frontend:1.3
```

The image size was approximately:

``` text
48.6 MB
```

**---**

# 2. Nginx Configuration

Because Angular is a frontend application, we used **Nginx** to serve
the generated Angular static files.

Our `nginx.conf` was:

``` nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Angular client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**\### Important concept**

Angular uses client-side routing.

For example:

``` text
/welcome/samuel

/todos/samuel/-1
```

These routes may not physically exist as files on the Nginx server.

Therefore:

``` nginx
try_files $uri $uri/ /index.html;
```

means:

``` text
Request
   ↓
Check requested file
   ↓
Check requested directory
   ↓
If not found
   ↓
Return index.html
   ↓
Angular handles the route
```

This prevents Angular routes from returning `404` when directly accessed
or refreshed.

**---**

# 3. Local Frontend Image Verification

We verified the locally created frontend images using:

``` text
docker images todo-frontend
```

The final image list included:

``` text
todo-frontend:1.1
todo-frontend:1.2
todo-frontend:1.3
```

The latest image was:

``` text
todo-frontend:1.3
```

**---**

# 4. Push Frontend Image to Amazon ECR

The frontend image was pushed to our existing ECR repository:

``` text
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend
```

The image reference used for deployment was:

``` text
221027285753.dkr.ecr.ap-south-1.amazonaws.com/todo-frontend:1.3
```

This creates the connection:

``` text
Angular Application
        ↓
Docker Image
        ↓
Amazon ECR
        ↓
todo-frontend:1.3
```

**---**

# 5. Create Frontend ECS Task Definition

AWS Console:

``` text
ECS

   ↓

Task definitions

   ↓

Create new task definition
```

We created the frontend task definition family:

``` text
todo-frontend-task
```

During the deployment process, the successful revision became:

``` text
todo-frontend-task:3
```

**---**

# 6. Frontend Task Configuration

We used:

``` text
Launch type:

AWS Fargate
```

Operating system:

``` text
Linux/X86_64
```

CPU:

``` text
0.25 vCPU
```

Memory:

``` text
0.5 GB
```

Network mode:

``` text
awsvpc
```

The same Fargate approach allowed us to run the frontend container
without managing EC2 servers.

**---**

# 7. Frontend Container Configuration

The frontend container was configured to use the Nginx server.

The container serves the Angular application through:

``` text
Port 80
```

The flow is:

``` text
Angular Build
     ↓
Static Files
     ↓
Nginx Container
     ↓
Port 80
```

**---**

# 8. Create Frontend ECS Service

We deployed the frontend task definition into:

``` text
todo-app-cluster
```

Service name:

``` text
todo-frontend-service
```

Scheduling strategy:

``` text
Replica
```

Desired tasks:

``` text
1
```

The service eventually showed:

``` text
Tasks:

1 desired
1 running
0 pending
```

Deployment status:

``` text
Success
```

**---**

# 9. Frontend ECS Deployment

The frontend service successfully deployed:

``` text
todo-frontend-service
```

with task definition:

``` text
todo-frontend-task:3
```

The deployment showed:

``` text
Deployment Complete
```

The final service state was:

``` text
Service:

todo-frontend-service

Status:

Active

Tasks:

1 running
0 pending
```

This confirmed:

``` text
ECR
 ↓
ECS Task Definition
 ↓
Fargate
 ↓
Frontend Container
 ↓
Nginx
```

was working.

**---**

# 10. Frontend Public IP

The frontend Fargate task received a public IP.

The latest frontend public IP observed during Phase 2 was:

``` text
13.203.97.113
```

We tested:

``` text
http://13.203.97.113
```

and:

``` text
http://13.203.97.113/welcome/samuel
```

The Angular application loaded successfully.

**---**

# 11. Frontend Application Verification

We verified that the deployed application could display the Angular UI.

The application showed:

``` text
MyTodoApp
```

and:

``` text
welcome samuel!
```

This confirmed:

``` text
Internet
   ↓
Frontend Public IP
   ↓
Fargate Task
   ↓
Nginx
   ↓
Angular Application
```

was working.

**---**

# 12. Backend Connection Issue

After the frontend was deployed, we found an important issue.

The Angular application was making API requests using relative paths
such as:

``` text
/api/hello-world-bean/path/samuel
```

and:

``` text
/api/users/samuel/list-todos
```

When the frontend was opened using:

``` text
http://13.203.97.113
```

the browser interpreted:

``` text
/api/users/samuel/list-todos
```

as:

``` text
http://13.203.97.113/api/users/samuel/list-todos
```

But:

``` text
13.203.97.113
```

is the **frontend** task.

The backend was running separately.

Therefore the request was reaching the wrong container.

**---**

# 13. Backend Public IP

During Phase 2, the backend task had a public IP:

``` text
52.66.223.6
```

The Spring Boot application runs on:

``` text
8082
```

Therefore the direct backend endpoint was:

``` text
http://52.66.223.6:8082
```

The architecture at this point was:

``` text
Browser
   |
   +----------------------------+
   |                            |
   ↓                            ↓
Frontend                     Backend
13.203.97.113                52.66.223.6
Port 80                      Port 8082
   |                            |
   ↓                            ↓
Nginx                        Spring Boot
   |                            |
   ↓                            ↓
Angular                      REST API
```

**---**

# 14. CORS Configuration

Our backend controller originally contained:

``` java
@CrossOrigin(origins = "http://localhost:4200")
```

This was configured for local development.

Local Angular:

``` text
http://localhost:4200
```

But deployed Angular:

``` text
http://13.203.97.113
```

is a different origin.

Therefore the local CORS configuration does not represent the deployed
frontend environment.

A temporary solution would be to change the allowed origin to the
deployed frontend URL.

However, this is not the permanent architecture.

**---**

# 15. Frontend API Error

While testing the deployed frontend, we saw API failures such as:

``` text
Failed to load resource:
the server responded with a status of 404
```

For example:

``` text
/api/users/samuel/list-todos
```

and:

``` text
/api/hello-world-bean/path/samuel
```

The important point is that the frontend itself was working.

The problem was the routing between:

``` text
Frontend
```

and:

``` text
Backend
```

**---**

# 16. Why We Should Not Hard-Code Backend Public IP

Initially we considered directly calling:

``` text
http://52.66.223.6:8082
```

from Angular.

But this is not a permanent solution.

The reason is that Fargate tasks can be replaced.

For example:

``` text
Backend Task
52.66.223.6
```

could later become:

``` text
New Backend Task
<new public IP>
```

Similarly, the frontend public IP can also change.

Therefore:

``` text
Angular
   ↓
Hard-coded Fargate IP
```

is not a reliable production architecture.

**---**

# 17. Important Learning --- Fargate Public IP

A Fargate task is an ephemeral compute resource.

Its public IP should not be treated as the permanent address of our
application.

The current setup:

``` text
Public IP
    ↓
Fargate Task
```

is useful for learning and testing.

But for a more realistic deployment, we need:

``` text
Stable Endpoint
       ↓
Application Load Balancer
       ↓
ECS Services
       ↓
Fargate Tasks
```

**---**

# 18. Permanent Architecture Planned

The next phase will introduce an:

``` text
Application Load Balancer
```

The planned architecture is:

``` text
                         Internet
                            |
                            ↓
                 Application Load Balancer
                            |
             +--------------+--------------+
             |                             |
          /api/*                           /*
             |                             |
             ↓                             ↓
      Backend Target Group         Frontend Target Group
             |                             |
             ↓                             ↓
      ECS Backend Service          ECS Frontend Service
             |                             |
             ↓                             ↓
      Fargate Backend Task         Fargate Frontend Task
             |                             |
          Port 8082                     Port 80
```

**---**

# 19. ALB Routing Plan

The ALB will listen on:

``` text
HTTP :80
```

Backend rule:

``` text
/api/*
```

will be routed to:

``` text
Backend Target Group
```

Backend port:

``` text
8082
```

All other requests will be routed to:

``` text
Frontend Target Group
```

Frontend port:

``` text
80
```

Therefore:

``` text
http://<ALB-DNS>/api/users/samuel/list-todos
```

will go to:

``` text
Backend
```

while:

``` text
http://<ALB-DNS>/welcome/samuel
```

will go to:

``` text
Frontend
```

**---**

# 20. Desired Final Request Flow

After ALB configuration:

``` text
                         Browser
                            |
                            ↓
                    Stable ALB Endpoint
                            |
              +-------------+-------------+
              |                           |
          /api/*                        /*
              |                           |
              ↓                           ↓
        Backend ECS                Frontend ECS
              |                           |
           :8082                         :80
              |                           |
              ↓                           ↓
        Spring Boot                    Nginx
              |                           |
              ↓                           ↓
          Database                    Angular
```

Angular can continue using:

``` text
/api/...
```

without knowing the backend Fargate task's IP.

**---**

# 21. Phase 2 Final Status

  Component                     Status
  ----------------------------- ----------------------------
  Angular application           ✅ Complete
  Nginx configuration           ✅ Complete
  Docker frontend image         ✅ Complete
  Frontend ECR repository       ✅ Complete
  ECS cluster                   ✅ Running
  Frontend task definition      ✅ Revision 3
  Frontend ECS service          ✅ Active
  Frontend Fargate task         ✅ Running
  Frontend public access        ✅ Working
  Backend ECS service           ✅ Running
  Frontend → Backend routing    ⚠️ Needs permanent routing
  Direct Fargate public IP      ⚠️ Temporary
  Application Load Balancer     ⏳ Next phase
  Target groups                 ⏳ Next phase
  Path-based routing            ⏳ Next phase
  Stable application endpoint   ⏳ Next phase

**---**

# 22. Phase 1 vs Phase 2

  -------------------------------------------------------------------------
  Phase       AWS / Technology                    What we did
  ----------- ----------------------------------- -------------------------
  **Phase 0** Amazon ECR                          Stored frontend & backend
                                                  Docker images

  **Phase 1** Amazon ECS                          Created ECS cluster

  **Phase 1** AWS Fargate                         Deployed backend
                                                  container

  **Phase 1** IAM                                 Used ECS task execution
                                                  role

  **Phase 1** ECS Task Definition                 Defined backend
                                                  container, CPU, memory,
                                                  port, image and logs

  **Phase 1** ECS Service                         Maintained backend task

  **Phase 1** Security Group                      Allowed backend TCP
                                                  `8082`

  **Phase 1** CloudWatch                          Configured backend
                                                  container logs

  **Phase 2** Docker                              Containerized Angular
                                                  frontend

  **Phase 2** Nginx                               Served Angular static
                                                  files

  **Phase 2** Amazon ECR                          Stored frontend image

  **Phase 2** ECS Task Definition                 Created
                                                  `todo-frontend-task:3`

  **Phase 2** ECS Service                         Created
                                                  `todo-frontend-service`

  **Phase 2** AWS Fargate                         Ran frontend container

  **Phase 2** Networking                          Assigned frontend public
                                                  IP

  **Phase 2** Testing                             Verified Angular
                                                  application

  **Phase 2** Troubleshooting                     Identified
                                                  frontend/backend routing
                                                  issue

  **Phase 2** Architecture                        Identified need for ALB
  -------------------------------------------------------------------------

**---**

# 23. Where We Are Now

**Completed:**

``` text
✅ Phase 0 — ECR

   ├── Frontend image
   └── Backend image

✅ Phase 1 — ECS/Fargate Backend

   ├── ECS Cluster
   ├── Fargate
   ├── IAM execution role
   ├── Backend Task Definition
   ├── Backend ECS Service
   ├── Security Group
   ├── CloudWatch logs
   ├── Public IP
   └── REST API test

✅ Phase 2 — ECS/Fargate Frontend

   ├── Angular Docker image
   ├── Nginx
   ├── Frontend ECR image
   ├── Frontend Task Definition
   ├── Frontend ECS Service
   ├── Fargate Task
   ├── Public IP
   └── Angular UI verification
```

**\### Next phase**

The natural next step is to move from:

``` text
Public IP → ECS Task
```

to:

``` text
                         Internet
                            |
                            ↓
                  Application Load
                      Balancer
                            |
                  +---------+---------+
                  |                   |
               /api/*                /*
                  |                   |
                  ↓                   ↓
             Backend ECS        Frontend ECS
                  |                   |
               Fargate             Fargate
                  |                   |
             Spring Boot           Nginx
```

This will give us a **stable application endpoint** and remove the dependency on changing Fargate public IPs.
