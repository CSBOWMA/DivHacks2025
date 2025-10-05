# Use the official PostgreSQL image as a base
FROM postgres:13-alpine

# Set environment variables for PostgreSQL.
# The entrypoint script will automatically:
# 1. Create the database specified by POSTGRES_DB
# 2. Create the user specified by POSTGRES_USER with POSTGRES_PASSWORD
# 3. Run any scripts in /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=divhacks_db
ENV POSTGRES_USER=divhack_user
ENV POSTGRES_PASSWORD=divhacks2025

# Copy your initialization script into the Docker entrypoint directory.
# This script will run AFTER the database and user are created.
COPY init.sql /docker-entrypoint-initdb.d/

# Optional: Increase shared_buffers for better performance (adjust as needed)
# RUN echo "shared_buffers = 256MB" >> /usr/local/share/postgresql/postgresql.conf.sample

# The base image already exposes port 5432
EXPOSE 5432