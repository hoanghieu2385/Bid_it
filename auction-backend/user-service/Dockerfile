FROM eclipse-temurin:21-jdk AS build

WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN apt-get update && apt-get install -y maven
# RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8081

# Chạy app sau khi DB sẵn sàng
ENTRYPOINT [ "java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]