FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src src
RUN for attempt in 1 2 3; do mvn -B -DskipTests package && exit 0; echo "Maven dependency/build attempt ${attempt} failed; retrying in 5 seconds..."; sleep 5; done; exit 1

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --create-home appuser && mkdir -p /app/uploads/resumes && chown -R appuser:appuser /app/uploads
COPY --from=build /workspace/target/backend_pat-0.0.1-SNAPSHOT.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
