# Build stage - GraalVM native image
FROM ghcr.io/graalvm/graalvm-community:21 AS build
RUN microdnf install -y findutils
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -Pnative -DskipTests

# Runtime stage - UBI minimal for Playwright deps
FROM registry.access.redhat.com/ubi8/ubi-minimal:8.9

RUN microdnf install -y \
    nss \
    libdrm \
    libXcomposite \
    libXdamage \
    libXrandr \
    mesa-libgbm \
    alsa-lib \
    atk \
    at-spi2-atk \
    cups-libs \
    libXkbcommon \
    && microdnf clean all

WORKDIR /app
COPY --from=build /app/target/*-runner /app/application

EXPOSE 7007
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
