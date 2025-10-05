import os
import requests
import psycopg2
from app.database.db_init import init_schema, get_db_connection, DB_CONFIG

# === CONFIG ===
API_KEY = "cb0c3712fd83d081cfbf31de4c25fb33"
BASE = "http://api.nessieisreal.com/enterprise"

def fetch(endpoint):
    url = f"{BASE}/{endpoint}?key={API_KEY}"
    r = requests.get(url)
    r.raise_for_status()
    data = r.json()
    if isinstance(data, dict) and "results" in data:
        data = data["results"]
    return data

def safe_coord(val):
    try:
        v = float(val)
        # Clamp to valid Earth coordinate range
        if abs(v) > 180:
            return None
        return v
    except (TypeError, ValueError):
        return None

# === INGEST FUNCTIONS ===

def ingest_customers(conn):
    print("→ pulling customers")
    data = fetch("customers")
    if isinstance(data, dict) and "results" in data:
        data = data["results"]
    cur = conn.cursor()
    for c in data:
        addr = c.get("address", {})
        cur.execute("""
            INSERT INTO customers
            (id, first_name, last_name, street_name, street_number, city, state, zip)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            c["_id"],
            c.get("first_name"),
            c.get("last_name"),
            addr.get("street_name"),
            addr.get("street_number"),
            addr.get("city"),
            addr.get("state"),
            addr.get("zip")
        ))
    conn.commit()
    print(f"loaded {len(data)} customers")


def ingest_accounts(conn):
    print("→ pulling accounts")
    data = fetch("accounts")
    cur = conn.cursor()
    loaded = 0
    skipped = 0
    for a in data:
        try:
            cur.execute("""
                INSERT INTO accounts
                (id, customer_id, type, nickname, balance, rewards)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                a["_id"],
                a.get("customer_id"),
                a.get("type"),
                a.get("nickname"),
                a.get("balance"),
                a.get("rewards")
            ))
            loaded += 1
        except (psycopg2.Error, ValueError):
            skipped += 1
            conn.rollback()
    conn.commit()
    print(f"loaded {loaded} accounts (skipped {skipped})")


def ingest_merchants(conn):
    print("→ pulling merchants")
    data = fetch("merchants")
    cur = conn.cursor()
    inserted, skipped = 0, 0

    for m in data:
        addr = m.get("address", {})
        geo = m.get("geocode", {})
        lat = safe_coord(geo.get("lat"))
        lng = safe_coord(geo.get("lng"))

        try:
            cur.execute("""
                INSERT INTO merchants
                (id, name, street_name, street_number, city, state, zip, lat, lng)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                m["_id"],
                m.get("name"),
                addr.get("street_name"),
                addr.get("street_number"),
                addr.get("city"),
                addr.get("state"),
                addr.get("zip"),
                lat,
                lng
            ))
            inserted += 1
        except Exception as e:
            conn.rollback()
            skipped += 1

    conn.commit()
    print(f"loaded {inserted} merchants (skipped {skipped})")


def ingest_bills(conn):
    print("→ pulling bills")
    data = fetch("bills")
    cur = conn.cursor()
    inserted, skipped = 0, 0

    for b in data:
        # check if account exists
        cur.execute("SELECT 1 FROM accounts WHERE id = %s", (b.get("account_id"),))
        if not cur.fetchone():
            skipped += 1
            continue
        try:
            cur.execute("""
                INSERT INTO bills
                (id, account_id, creation_date, payment_date, payment_amount)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                b.get("_id"),
                b.get("account_id"),
                b.get("creation_date"),
                b.get("payment_date"),
                b.get("payment_amount")
            ))
            inserted += 1
        except Exception as e:
            conn.rollback()
            skipped += 1

    conn.commit()
    print(f"loaded {inserted} bills (skipped {skipped})")


def ingest_deposits(conn):
    print("→ pulling deposits")
    data = fetch("deposits")
    cur = conn.cursor()
    loaded = 0
    skipped = 0

    for d in data:
        try:
            cur.execute("""
                INSERT INTO deposits
                (id, account_id, type, amount, payee_id, description,
                 medium, transaction_date, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                d["_id"],
                d.get("account_id"),   # ← new field to match DB
                d.get("type"),         # ← renamed from deposit_type
                d.get("amount"),
                d.get("payee_id"),
                d.get("description"),
                d.get("medium"),
                d.get("transaction_date"),
                d.get("status"),
            ))
            loaded += 1
        except (psycopg2.Error, ValueError) as e:
            skipped += 1
            conn.rollback()

    conn.commit()
    print(f"✅ loaded {loaded} deposits (skipped {skipped})")



def ingest_withdrawals(conn):
    print("→ pulling withdrawals")
    data = fetch("withdrawals")
    cur = conn.cursor()
    loaded = 0
    skipped = 0
    for w in data:
        try:
            cur.execute("""
                INSERT INTO withdrawals
                (id, type, amount, payer_id,
                 description, medium, transaction_date, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                w["_id"],
                w.get("type"),
                w.get("amount"),
                w.get("payer_id"),
                w.get("description"),
                w.get("medium"),
                w.get("transaction_date"),
                w.get("status")
            ))
            loaded += 1
        except (psycopg2.Error, ValueError):
            skipped += 1
            conn.rollback()
    conn.commit()
    print(f"loaded {loaded} withdrawals (skipped {skipped})")


def ingest_transfers(conn):
    print("→ pulling transfers")
    data = fetch("transfers")
    cur = conn.cursor()
    loaded = 0
    skipped = 0

    for t in data:
        raw_date = t.get("transaction_date")

        # Fix malformed timestamps like "2025-010-4"
        if isinstance(raw_date, str):
            raw_date = raw_date.replace("-010-", "-10-")
            parts = raw_date.split("-")
            if len(parts) == 3 and len(parts[2]) == 1:
                raw_date = f"{parts[0]}-{parts[1]}-0{parts[2]}"

        try:
            cur.execute("""
                INSERT INTO transfers
                (id, type, amount, payer_id, payee_id,
                description, medium, transaction_date, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                t["_id"],
                t.get("type"),
                t.get("amount"),
                t.get("payer_id"),
                t.get("payee_id"),
                t.get("description"),
                t.get("medium"),
                t.get("transaction_date"),
                t.get("status"),
            ))
            loaded += 1
        except (psycopg2.Error, ValueError) as e:
            skipped += 1
            conn.rollback()

    conn.commit()
    print(f"✅ loaded {loaded} transfers (skipped {skipped})")



# === MAIN ===
def ingest_all():
    print("Starting Nessie data ingestion to PostgreSQL...")
    init_schema()

    with get_db_connection() as conn:
        ingest_customers(conn)
        ingest_accounts(conn)
        ingest_merchants(conn)
        ingest_bills(conn)
        ingest_deposits(conn)
        print("✅ Finished deposits, moving to withdrawals")
        ingest_withdrawals(conn)
        print("✅ Finished withdrawals, moving to transfers")
        ingest_transfers(conn)

    print("All Nessie data pulled and stored in PostgreSQL")

if __name__ == "__main__":
    ingest_all()