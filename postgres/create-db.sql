-- === 01-create-db.sql ===
-- Create database if it doesn't exist
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'divhacks_db') THEN
        CREATE DATABASE divhacks_db;
    END IF;
END
$$;

-- Create user if it doesn't exist
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'divhack_user') THEN
        CREATE USER divhack_user WITH PASSWORD 'divhacks2025';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE divhacks_db TO divhack_user;
