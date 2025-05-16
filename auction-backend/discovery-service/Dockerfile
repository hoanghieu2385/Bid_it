# ---------- Stage 1 ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests
    
    # ---------- Stage 2 ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar discovery-service.jar
EXPOSE 8761
ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "discovery-service.jar"]