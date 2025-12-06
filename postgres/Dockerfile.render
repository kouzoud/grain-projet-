FROM postgis/postgis:16-3.4-alpine

# Copier le script d'initialisation
COPY init.sql /docker-entrypoint-initdb.d/

# Exposer le port PostgreSQL
EXPOSE 5432

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD pg_isready -U postgres || exit 1
