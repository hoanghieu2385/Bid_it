FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Tăng tốc độ build bằng cách cache dependency trước
COPY pom.xml .
# RUN mvn dependency:go-offline


COPY src ./src

# Build 
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

# copy file JAR 
COPY --from=build /app/target/*.jar app.jar

# Mở port mặc định của Spring Boot
EXPOSE 8082

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]