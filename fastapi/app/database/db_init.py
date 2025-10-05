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
        zip TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        type TEXT,
        nickname TEXT,
        balance DECIMAL(15,2),
        rewards DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_accounts_customer ON accounts(customer_id);
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
        lat DECIMAL(10,8),
        lng DECIMAL(11,8),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        nickname TEXT,
        creation_date TIMESTAMP,
        payment_date TIMESTAMP,
        upcoming_payment_date TIMESTAMP,
        recurring_date INTEGER,
        payment_amount DECIMAL(15,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bills_account ON bills(account_id);
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS deposits (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        type TEXT,
        amount DECIMAL(15,2),
        payee_id TEXT,
        description TEXT,
        medium TEXT,
        transaction_date TIMESTAMP,
        status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_deposits_account ON deposits(account_id);
    CREATE INDEX IF NOT EXISTS idx_deposits_date ON deposits(transaction_date);
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS withdrawals (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        type TEXT,
        amount DECIMAL(15,2),
        payer_id TEXT,
        payee_id TEXT,
        description TEXT,
        medium TEXT,
        transaction_date TIMESTAMP,
        status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_withdrawals_account ON withdrawals(account_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(transaction_date);
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS transfers (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        type TEXT,
        amount DECIMAL(15,2),
        payer_id TEXT,
        description TEXT,
        medium TEXT,
        transaction_date TIMESTAMP,
        status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_transfers_account ON transfers(account_id);
    CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(transaction_date);
    """)

    conn.commit()
    conn.close()
    print("PostgreSQL schema initialized")

@contextmanager
def get_db_connection():
    """Context manager for safely opening and closing a DB connection."""
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()


# === 4. CLI Run ===
if __name__ == "__main__":
    init_schema()

    # optional: quick verify
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
    print("📋 Tables:", [t[0] for t in cur.fetchall()])
    conn.close()