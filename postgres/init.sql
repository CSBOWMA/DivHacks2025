-- ===============================================
-- PostgreSQL Initialization Script
-- ===============================================

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

-- Bills (Fixed: added payee, status, fixed NULL syntax, removed trailing comma)
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    creation_date TIMESTAMP,
    payment_amount NUMERIC,
    payment_date TIMESTAMP,
    recurring_date NUMERIC,
    payee TEXT,
    status TEXT
);

-- Deposits (Fixed: added account_id, removed foreign key from payee_id)
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

-- Withdrawals (Fixed: added account_id)
CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    type TEXT,
    amount NUMERIC,
    payer_id TEXT,
    description TEXT,
    medium TEXT,
    transaction_date TIMESTAMP,
    status TEXT
);

-- Transfers (Fixed: added account_id)
CREATE TABLE IF NOT EXISTS transfers (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
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

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO divhack_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO divhack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO divhack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO divhack_user;