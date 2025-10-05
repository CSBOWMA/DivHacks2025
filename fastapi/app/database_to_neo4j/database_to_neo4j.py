import os
import psycopg2
from neo4j import GraphDatabase

# --- PostgreSQL config ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "divhacks_db"),
    "user": os.getenv("DB_USER", "divhack_user"),
    "password": os.getenv("DB_PASSWORD", "divhacks2025")
}

# --- Neo4j config ---
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "testpassword")

def create_account_nodes():
    # Connect to Postgres
    pg_conn = psycopg2.connect(**DB_CONFIG)
    pg_cur = pg_conn.cursor()
    pg_cur.execute("""
        SELECT a.id, a.type, c.first_name, CONCAT(c.first_name, ' ', c.last_name) as full_name, a.balance, a.rewards
        FROM accounts a
        JOIN customers c ON a.customer_id = c.id;
    """)
    accounts = pg_cur.fetchall()

    print(f"Found {len(accounts)} accounts")

    # Connect to Neo4j
    neo_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with neo_driver.session() as session:
        # Make sure each account becomes a node
        for acc_id, acc_type, first_name, full_name, balance, rewards in accounts:
            session.run("""
                MERGE (a:Account {id: $id})
                SET a.type = $type,
                    a.first_name = $first_name,
                    a.full_name = $full_name,
                    a.balance = $balance,
                    a.rewards = $rewards
            """, {
                "id": acc_id,
                "type": acc_type,
                "first_name": first_name,
                "full_name": full_name,
                "balance": float(balance) if balance is not None else None,
                "rewards": float(rewards) if rewards is not None else None
            })

    pg_conn.close()
    neo_driver.close()
    print("All account nodes created in Neo4j")

if __name__ == "__main__":
    create_account_nodes()
