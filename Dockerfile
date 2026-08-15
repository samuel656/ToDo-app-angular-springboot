# Build the Spring Boot API.
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY backend/MyTodo/pom.xml ./
RUN mvn -B dependency:go-offline

COPY backend/MyTodo/src ./src
RUN mvn -B clean package -DskipTests

# Run the API with a small Java runtime image.
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
