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
    conn = sqlite3.connect(DB_PATH)
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
        customer_id TEXT,
        type TEXT,
        nickname TEXT,
        balance REAL,
        rewards REAL,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        nickname TEXT,
        creation_date TEXT,
        payment_date TEXT,
        upcoming_payment_date TEXT,
        recurring_date INTEGER,
        payment_amount REAL,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS deposits (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        type TEXT,
        amount REAL,
        payee_id TEXT,
        description TEXT,
        medium TEXT,
        transaction_date TEXT,
        status TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
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
        lat REAL,
        lng REAL
    );
    """)

    cur.execute("""
CREATE TABLE IF NOT EXISTS withdrawals (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        type TEXT,
        amount REAL,
        payer_id TEXT,
        payee_id TEXT,
        description TEXT,
        medium TEXT,
        transaction_date TEXT,
        status TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
    );
    """)

    cur.execute("""
CREATE TABLE IF NOT EXISTS transfers (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        type TEXT,
        amount REAL,
        payer_id TEXT,
        description TEXT,
        medium TEXT,
        transaction_date TEXT,
        status TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
    );
    """)

    conn.commit()
    conn.close()
    print("nessie schema done")

def get_db_connection():
    """Context manager for safely opening and closing a DB connection."""
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


# === 4. CLI Run ===
if __name__ == "__main__":
    init_schema()

    # optional: quick verify
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print("📋 Tables:", [t[0] for t in cur.fetchall()])
    conn.close()