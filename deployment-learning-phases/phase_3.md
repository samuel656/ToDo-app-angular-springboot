# Phase 3 — Networking

## Objective

Understand how the frontend and backend containers communicate inside AWS without exposing an ECS task address to the Angular application.

## Networking flow

```text
Internet
  |
  v
Frontend ECS service (Angular + Nginx, :80)
  |
  | /api/*
  v
Backend Application Load Balancer (:80)
  |
  v
Backend target group (:8082)
  |
  v
Backend ECS task (Spring Boot, :8082)
```

## VPC and subnets

The application resources were deployed in VPC `vpc-07ebee6b3399df94d`. The Application Load Balancer (ALB) spans subnets in three Availability Zones:

- `ap-south-1a`
- `ap-south-1b`
- `ap-south-1c`

The VPC provides the isolated AWS network in which ECS tasks, the ALB, and other resources communicate. Using multiple Availability Zones makes the ALB available across separate AWS infrastructure locations.

## Public and private networking

The backend ALB is internet-facing, so it can receive requests from the Internet. For this learning deployment, the frontend ECS task was also accessible through its public IP:

```text
http://13.201.88.170
```

The backend target is reached through its ECS task private IP, rather than its public address.

## Frontend-to-backend communication

The Angular application uses relative API paths, for example:

```typescript
/api/users/${name}/list-todos
```

It does not use `localhost:8082`. In a browser, `localhost` means the user's own machine, not the Spring Boot container running in ECS.

Nginx in the frontend container acts as a reverse proxy:

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

The trailing slash on `proxy_pass` removes the `/api/` prefix while forwarding. For example:

```text
Browser:  /api/users/samuel/list-todos
Nginx:    /users/samuel/list-todos
Backend:  receives the request through the ALB
```

## Result

The frontend now communicates with the backend through Nginx and the ALB. It does not need to know the address of any individual backend ECS task, so replacing a task does not require an Angular code change.

## What was learned

- VPCs, subnets, and Availability Zones
- Public versus private networking
- ECS task private addressing
- Why browser code must not use `localhost:8082`
- Nginx reverse-proxy routing
- Frontend-to-backend API communication using relative URLs
