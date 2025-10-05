-- ===============================================
-- PostgreSQL Initialization Script
-- ===============================================
-- Note: The database and user are already created by the Dockerfile ENV variables,
-- so we just need to set up the schema and permissions.

-- Ensure we're connected to the correct database
\connect divhacks_db;

-- ===============================================
-- TABLES
-- ===============================================

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    street_name TEXT,
    street_number TEXT,
    city TEXT,
    state TEXT,
    zip TEXT
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    type TEXT,
    nickname TEXT,
    balance NUMERIC,
    rewards NUMERIC
);

-- Merchants
CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    name TEXT,
    street_name TEXT,
    street_number TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    creation_date TIMESTAMP,
    payment_date TIMESTAMP,
    payment_amount NUMERIC
);

-- Deposits
CREATE TABLE IF NOT EXISTS deposits (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    type TEXT,
    amount NUMERIC,
    payee_id TEXT,
    description TEXT,
    medium TEXT,
    transaction_date TIMESTAMP,
    status TEXT
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    type TEXT,
    amount NUMERIC,
    payer_id TEXT,
    description TEXT,
    medium TEXT,
    transaction_date TIMESTAMP,
    status TEXT
);

-- Transfers
CREATE TABLE IF NOT EXISTS transfers (
    id TEXT PRIMARY KEY,
    type TEXT,
    amount NUMERIC,
    payer_id TEXT REFERENCES accounts(id),
    payee_id TEXT REFERENCES accounts(id),
    description TEXT,
    medium TEXT,
    transaction_date TIMESTAMP,
    status TEXT
);

-- ===============================================
-- PERMISSIONS
-- ===============================================

-- Grant all privileges on tables to the application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO divhack_user;

-- Grant usage and select on sequences (if any are created in the future)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO divhack_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO divhack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO divhack_user;