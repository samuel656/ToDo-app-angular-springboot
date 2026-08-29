# Phase 3 — Networking

## 3.1 Objective

The objective of Phase 3 was to understand how the frontend and backend containers communicate inside AWS.

Our final networking flow is:

```text
                         INTERNET
                            │
                            ▼
                 Frontend ECS Service
                    Angular + Nginx
                       Port 80
                            │
                            │ /api/*
                            ▼
                  Backend Application
                  Load Balancer (ALB)
                       Port 80
                            │
                            ▼
                  Backend Target Group
                       Port 8082
                            │
                            ▼
                    Backend ECS Task
                    Spring Boot :8082
```

---

# 3.2 VPC

We deployed the application inside an AWS VPC.

The VPC visible in our configuration was:

```text
VPC: vpc-07ebee6b3399df94d
```

The ALB was configured inside this VPC.

The important concept is:

> A VPC provides the isolated networking environment in AWS where our ECS tasks, load balancer, and other resources communicate.

---

# 3.3 Subnets

The ALB was configured across **3 Availability Zones/subnets**.

From the ALB configuration:

```text
ap-south-1a
ap-south-1b
ap-south-1c
```

This gives the load balancer availability across multiple Availability Zones.

Conceptually:

```text
                 VPC
                  │
       ┌──────────┼──────────┐
       │          │          │
      AZ-a       AZ-b       AZ-c
       │          │          │
    Subnet     Subnet     Subnet
       │          │          │
       └──────────┼──────────┘
                  │
                 ALB
```

---

# 3.4 Public vs Private Networking

We used an **internet-facing Application Load Balancer**.

Therefore, the ALB can receive requests from the Internet.

The architecture is:

```text
Internet
   │
   ▼
Internet-facing ALB
   │
   ▼
Backend ECS Task
```

For our learning deployment, the frontend ECS task was also reachable publicly through its public IP.

The frontend was accessed using:

```text
http://13.201.88.170
```

This successfully loaded the Angular application.

---

# 3.5 Frontend → Backend Communication

Initially, the frontend should not directly depend on:

```text
localhost:8082
```

because `localhost` from the browser means the user's own computer.

Instead, the Angular application uses relative API URLs:

```typescript
/api/users/${name}/list-todos
```

For example:

```text
/api/users/samuel/list-todos
```

There is **no `localhost:8082` in the Angular service**.

This is important because Nginx handles the API routing.

---

# 3.6 Nginx as Reverse Proxy

We modified the frontend `nginx.conf`.

The important configuration is:

```nginx
location /api/ {
    proxy_pass http://todo-alb-1893921724.ap-south-1.elb.amazonaws.com/;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The important part is:

```nginx
location /api/
```

and:

```nginx
proxy_pass http://todo-alb-1893921724.ap-south-1.elb.amazonaws.com/;
```

### Example

Angular sends:

```text
/api/users/samuel/list-todos
```

Nginx forwards it to the backend ALB as:

```text
/users/samuel/list-todos
```

because of the trailing `/` in:

```nginx
proxy_pass http://todo-alb-1893921724.ap-south-1.elb.amazonaws.com/;
```

So:

```text
Browser
   │
   │ /api/users/samuel/list-todos
   ▼
Nginx
   │
   │ /users/samuel/list-todos
   ▼
Backend ALB
   │
   ▼
Spring Boot
```

---

# Phase 3 Result

We successfully established:

```text
Angular
   ↓
Nginx
   ↓
Backend ALB
   ↓
Spring Boot
```

The frontend did **not** need to know the backend ECS task IP.

This is an important advantage of using a load balancer.

---
