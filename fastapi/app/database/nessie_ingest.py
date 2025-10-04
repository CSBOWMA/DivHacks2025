import os
import sqlite3
import requests
from fastapi.app.database.db_init import init_schema, DB_PATH

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
            INSERT OR IGNORE INTO customers
            (id, first_name, last_name, street_name, street_number, city, state, zip)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    for a in data:
        cur.execute("""
            INSERT OR IGNORE INTO accounts
            (id, customer_id, type, nickname, balance, rewards)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            a["_id"],
            a.get("customer_id"),
            a.get("type"),
            a.get("nickname"),
            a.get("balance"),
            a.get("rewards")
        ))
    conn.commit()
    print(f"loaded {len(data)} accounts")


def ingest_merchants(conn):
    print("→ pulling merchants")
    data = fetch("merchants")
    cur = conn.cursor()
    for m in data:
        addr = m.get("address", {})
        geo = m.get("geocode", {})
        cur.execute("""
            INSERT OR IGNORE INTO merchants
            (id, name, street_name, street_number, city, state, zip, lat, lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            m["_id"],
            m.get("name"),
            addr.get("street_name"),
            addr.get("street_number"),
            addr.get("city"),
            addr.get("state"),
            addr.get("zip"),
            geo.get("lat"),
            geo.get("lng")
        ))
    conn.commit()
    print(f"loaded {len(data)} merchants")


def ingest_bills(conn):
    print("→ pulling bills")
    data = fetch("bills")
    cur = conn.cursor()
    for b in data:
        cur.execute("""
            INSERT OR IGNORE INTO bills
            (id, account_id, nickname, creation_date, payment_date,
             upcoming_payment_date, recurring_date, payment_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["_id"],
            b.get("account_id"),
            b.get("nickname"),
            b.get("creation_date"),
            b.get("payment_date"),
            b.get("upcoming_payment_date"),
            b.get("recurring_date"),
            b.get("payment_amount")
        ))
    conn.commit()
    print("bills loaded")


def ingest_deposits(conn):
    print("→ pulling deposits")
    data = fetch("deposits")
    cur = conn.cursor()
    for d in data:
        cur.execute("""
            INSERT OR IGNORE INTO deposits
            (id, account_id, type, amount, payee_id, description,
             medium, transaction_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            d["_id"],
            d.get("account_id"),
            d.get("type"),
            d.get("amount"),
            d.get("payee_id"),
            d.get("description"),
            d.get("medium"),
            d.get("transaction_date"),
            d.get("status")
        ))
    conn.commit()
    print("deposits loaded")


def ingest_withdrawals(conn):
    print("→ pulling withdrawals")
    data = fetch("withdrawals")
    cur = conn.cursor()
    for w in data:
        cur.execute("""
            INSERT OR IGNORE INTO withdrawals
            (id, account_id, type, amount, payer_id, payee_id,
             description, medium, transaction_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w["_id"],
            w.get("account_id"),
            w.get("type"),
            w.get("amount"),
            w.get("payer_id"),
            w.get("payee_id"),
            w.get("description"),
            w.get("medium"),
            w.get("transaction_date"),
            w.get("status")
        ))
    conn.commit()
    print("withdrawals loaded")


def ingest_transfers(conn):
    print("→ pulling transfers")
    data = fetch("transfers")
    cur = conn.cursor()
    for t in data:
        cur.execute("""
            INSERT OR IGNORE INTO transfers
            (id, account_id, type, amount, payer_id,
             description, medium, transaction_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["_id"],
            t.get("account_id"),
            t.get("type"),
            t.get("amount"),
            t.get("payer_id"),
            t.get("description"),
            t.get("medium"),
            t.get("transaction_date"),
            t.get("status")
        ))
    conn.commit()
    print("transfers loaded")


# === MAIN ===
def ingest_all():
    init_schema()
    conn = sqlite3.connect(DB_PATH)
    ingest_customers(conn)
    ingest_accounts(conn)
    ingest_merchants(conn)
    ingest_bills(conn)
    ingest_deposits(conn)
    ingest_withdrawals(conn)
    ingest_transfers(conn)
    conn.close()
    print("All Nessie data pulled and stored.")

if __name__ == "__main__":
    ingest_all()