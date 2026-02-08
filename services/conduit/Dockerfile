# Build stage - GraalVM native image
FROM ghcr.io/graalvm/graalvm-community:21 AS build
RUN microdnf install -y findutils
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -Pnative -DskipTests

# Runtime stage - minimal distroless
FROM quay.io/quarkus/quarkus-micro-image:2.0
WORKDIR /app
COPY --from=build /app/target/*-runner /app/application
EXPOSE 7004
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
