FROM gradle:jdk21-alpine AS build
WORKDIR /app

# Copy gradle wrapper and settings files first
COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle

# Make gradlew executable
RUN chmod +x ./gradlew

# Copy source code
COPY src ./src

# Build the application
RUN ./gradlew clean bootJar --no-daemon -x test

# Create upload folder for build context if it doesn't exist
RUN mkdir -p upload

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar file
COPY --from=build /app/build/libs/*.jar app.jar

# Create upload directory
RUN mkdir -p /app/upload

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java","-jar","app.jar"]
