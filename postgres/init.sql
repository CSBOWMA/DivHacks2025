-- Create the main database for your hackathon project
CREATE DATABASE divhacks_db;

-- Create a dedicated user for your application to connect with
-- It's good practice to not use the default 'postgres' user for applications.
-- The password 'supersecretpassword' should match the POSTGRES_PASSWORD in your Dockerfile/docker-compose.yml
CREATE USER divhack_user WITH PASSWORD 'divhacks2025';

-- Grant all privileges on the database to your application user
GRANT ALL PRIVILEGES ON DATABASE divhacks_db TO divhack_user;

-- Connect to the newly created database so subsequent commands operate within it
\c divhacks_db;

-- Create a simple table for demonstration/initial schema
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial data into the users table
INSERT INTO users (name, email) VALUES
('Alice Wonderland', 'alice@example.com'),
('Bob The Builder', 'bob@example.com')
ON CONFLICT (email) DO NOTHING; -- Avoid errors if running init.sql multiple times accidentally
