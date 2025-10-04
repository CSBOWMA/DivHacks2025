-- This will run inside the divhacks_db context automatically if we tell Docker
\connect divhacks_db;

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

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    nickname TEXT,
    creation_date TIMESTAMP,
    payment_date TIMESTAMP,
    upcoming_payment_date TIMESTAMP,
    recurring_date INTEGER,
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

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    type TEXT,
    amount NUMERIC,
    payer_id TEXT,
    payee_id TEXT,
    description TEXT,
    medium TEXT,
    transaction_date TIMESTAMP,
    status TEXT
);

-- Transfers
CREATE TABLE IF NOT EXISTS transfers (
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

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO divhack_user;
