# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

# Install required packages for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2t64 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN useradd -m crawler && chown -R crawler:crawler /app

COPY --from=build --chown=crawler:crawler /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build --chown=crawler:crawler /app/target/quarkus-app/*.jar /app/
COPY --from=build --chown=crawler:crawler /app/target/quarkus-app/app/ /app/app/
COPY --from=build --chown=crawler:crawler /app/target/quarkus-app/quarkus/ /app/quarkus/

USER crawler

EXPOSE 7007

ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

CMD ["java", "-jar", "/app/quarkus-run.jar"]
