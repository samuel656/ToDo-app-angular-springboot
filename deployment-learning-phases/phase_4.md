# Phase 4 — Application Load Balancer

## Objective

Introduce an Application Load Balancer (ALB) as the stable entry point between the frontend and backend ECS service.

```text
Before: Frontend -> backend ECS task IP
After:  Frontend -> ALB -> target group -> backend ECS task
```

## ALB configuration

```text
Name:            todo-alb
Type:            Application Load Balancer
Scheme:          Internet-facing
IP address type: IPv4
DNS name:        todo-alb-1893921724.ap-south-1.elb.amazonaws.com
```

Using the ALB DNS name gives the frontend a stable destination even if ECS replaces a backend task and its IP address changes.

## Target group

The backend target group is `todo-backend-tg`.

```text
Target type: IP
Protocol:    HTTP
Port:        8082
```

It registered the backend ECS task using its private IP:

```text
172.31.22.36:8082
```

## Listener and routing

The ALB has an HTTP listener on port `80`. It forwards received requests to `todo-backend-tg`, which then routes them to the Spring Boot container on port `8082`.

```text
Client --HTTP :80--> todo-alb --forward--> todo-backend-tg --HTTP :8082--> Spring Boot
```

## Health checks

The target group's health check uses the backend root endpoint:

```text
Protocol:            HTTP
Path:                /
Port:                Traffic port
Healthy threshold:   5
Unhealthy threshold: 2
Timeout:             5 seconds
Interval:            30 seconds
Success code:        200
```

The Spring Boot `/` endpoint returns `welcome to spring`, allowing the ALB to confirm that a backend task is ready to receive traffic.

Initially the target was unhealthy while the ECS task was becoming ready. It later became healthy, and the ECS deployment completed successfully.

## Verification

Direct backend ALB test:

```text
http://todo-alb-1893921724.ap-south-1.elb.amazonaws.com/
```

Response:

```text
welcome to spring
```

End-to-end frontend test:

```text
http://13.201.88.170/todos/samuel
```

The Angular application loaded and displayed the Todo records, proving this complete path:

```text
Angular -> Nginx -> ALB -> target group -> ECS Fargate -> Spring Boot -> H2
```

## Files and API behavior verified

- `TodoController.java` provides the Todo CRUD endpoints under `/users/{username}/list-todos`.
- `TodoService` uses relative `/api/users/...` URLs.
- `nginx.conf` proxies `/api/*` requests to `todo-alb-1893921724.ap-south-1.elb.amazonaws.com`.

## What was learned

- Internet-facing Application Load Balancers
- ALB DNS names and stable backend access
- Listeners and target groups
- IP targets for ECS Fargate tasks
- Health checks and healthy/unhealthy target states
- ALB-to-ECS request routing
