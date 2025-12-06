# ==========================================
# STAGE 1 : Build avec Maven
# ==========================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY pom.xml ./
COPY src ./src

# Build du projet (skip tests pour accélérer)
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 2 : Runtime avec JRE
# ==========================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copier le JAR depuis le stage builder
COPY --from=builder /app/target/*.jar app.jar

# Exposer le port Spring Boot
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Variables d'environnement par défaut
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Démarrer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
