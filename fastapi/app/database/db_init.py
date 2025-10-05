import os
import psycopg2
from psycopg2.extras import execute_batch
from contextlib import contextmanager

# PostgreSQL connection configuration (from docker-compose.yaml)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "divhacks_db"),
    "user": os.getenv("DB_USER", "divhack_user"),
    "password": os.getenv("DB_PASSWORD", "divhacks2025")
}

def init_schema():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("""
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
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            customer_id TEXT REFERENCES customers(id),
            type TEXT,
            nickname TEXT,
            balance NUMERIC,
            rewards NUMERIC
        );
    """)

    cur.execute("""
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
    """)

    # Fixed: added payee, status, fixed field order
    cur.execute("""
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
    """)

    # Fixed: added account_id
    cur.execute("""
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
    """)

    # Fixed: added account_id
    cur.execute("""
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
    """)

    # Fixed: added account_id
    cur.execute("""
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
    """)

    conn.commit()
    conn.close()
    print("✅ PostgreSQL schema initialized")

@contextmanager
def get_db_connection():
    """Context manager for safely opening and closing a DB connection."""
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()


def count_customers_with_accounts():
    """Count how many customers have accounts."""
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(DISTINCT customer_id) FROM accounts;")
        result = cur.fetchone()
        return result[0] if result else 0

# === 4. CLI Run ===
if __name__ == "__main__":
    init_schema()

    # optional: quick verify
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
    print("📋 Tables:", [t[0] for t in cur.fetchall()])
    conn.close()

    # Run the customer count query
    customer_count = count_customers_with_accounts()
    print(f"📊 Number of customers with accounts: {customer_count}")