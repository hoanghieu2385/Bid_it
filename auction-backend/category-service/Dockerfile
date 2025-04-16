# Sử dụng image Java 17 làm base image
FROM openjdk:17-jdk-slim

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file pom.xml và mã nguồn vào container
COPY pom.xml .
COPY src ./src

# Cài đặt Maven và build ứng dụng
RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

# Copy file JAR đã build vào container
COPY target/category-service-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8083 (port mà category-service chạy)
EXPOSE 8083

# Lệnh để chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]