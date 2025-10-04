# Use the official PostgreSQL image as a base
# postgres:13-alpine is a good choice for smaller image size.
# You could also use postgres:latest or a specific version like postgres:16
FROM postgres:13-alpine

# Set environment variables for PostgreSQL.
# These will be used by the official Postgres entrypoint script
# if no custom user/password is provided via init.sql or docker-compose.
# Even if init.sql creates a user/db, these are good defaults for the base image
# and ensure the entrypoint works smoothly.
ENV POSTGRES_DB=divhacks_db
ENV POSTGRES_USER=divhack_user
ENV POSTGRES_PASSWORD=divhacks2025

# Copy your initialization script into the Docker entrypoint directory.
# Any .sql, .sh, or .sql.gz files in /docker-entrypoint-initdb.d/
# are automatically executed by the official PostgreSQL image on first startup.
# This is crucial for setting up your database, tables, and users.
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# The base image already exposes port 5432 and defines the CMD.
# You don't usually need to explicitly EXPOSE or CMD in your custom Dockerfile
# unless you want to change default behavior or provide extra hints.
# EXPOSE 5432
# CMD ["postgres"]
