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

def clear_neo4j_database():
    """Delete all nodes and relationships from Neo4j"""
    print("🗑️  Clearing Neo4j database...")
    neo_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with neo_driver.session() as session:
        # Delete all nodes and relationships
        session.run("MATCH (n) DETACH DELETE n")
    neo_driver.close()
    print("✅ Neo4j database cleared")

def create_account_nodes():
    # Connect to Postgres
    pg_conn = psycopg2.connect(**DB_CONFIG)
    pg_cur = pg_conn.cursor()
    pg_cur.execute("""
        SELECT a.id, a.type, a.nickname, a.balance, a.rewards
        FROM accounts a
        WHERE a.customer_id IS NOT NULL;
    """)
    accounts = pg_cur.fetchall()

    print(f"Found {len(accounts)} accounts with customer data")
    
    # Debug: Check if we have nicknames
    nicknames_count = sum(1 for _, _, nickname, _, _ in accounts if nickname)
    print(f"Accounts with nicknames: {nicknames_count}/{len(accounts)}")

    # Connect to Neo4j
    neo_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with neo_driver.session() as session:
        for acc_id, acc_type, nickname, balance, rewards in accounts:
            # Use account ID as fallback if nickname is None
            display_name = nickname if nickname else acc_id
            
            session.run("""
                MERGE (a:Account {id: $id})
                SET a.type = $type,
                    a.nickname = $nickname,
                    a.balance = $balance,
                    a.rewards = $rewards
            """, {
                "id": acc_id,
                "type": acc_type,
                "nickname": display_name,
                "balance": float(balance) if balance is not None else None,
                "rewards": float(rewards) if rewards is not None else None
            })

    pg_conn.close()
    neo_driver.close()
    print(f"✅ Created {len(accounts)} account nodes from accounts table")

def create_transfer_network():
    """Create account nodes from transfer data and create transfer edges"""
    # Connect to Postgres
    pg_conn = psycopg2.connect(**DB_CONFIG)
    pg_cur = pg_conn.cursor()
    
    # Check what data we have
    pg_cur.execute("SELECT COUNT(*) FROM transfers")
    total_transfers = pg_cur.fetchone()[0]
    print(f"📊 Total transfers in database: {total_transfers}")
    
    # Get all unique account IDs from transfers
    pg_cur.execute("""
        SELECT DISTINCT account_id FROM (
            SELECT DISTINCT payer_id as account_id FROM transfers WHERE payer_id IS NOT NULL
            UNION
            SELECT DISTINCT payee_id FROM transfers WHERE payee_id IS NOT NULL
        ) subq
    """)
    transfer_account_ids = [row[0] for row in pg_cur.fetchall()]
    print(f"📊 Found {len(transfer_account_ids)} unique accounts in transfer data")
    
    # Connect to Neo4j
    neo_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    # Create Account nodes for all accounts involved in transfers
    print("Creating account nodes from transfer data...")
    with neo_driver.session() as session:
        for i, acc_id in enumerate(transfer_account_ids):
            session.run("""
                MERGE (a:Account {id: $id})
                ON CREATE SET a.type = 'transfer_account',
                              a.nickname = $id
            """, {"id": acc_id})
            
            if (i + 1) % 1000 == 0:
                print(f"  Progress: {i+1}/{len(transfer_account_ids)} accounts...")
    
    print(f"✅ Created {len(transfer_account_ids)} account nodes")
    
    # Now get all transfers with both payer_id and payee_id
    pg_cur.execute("""
        SELECT id, payer_id, payee_id, amount, transaction_date, 
               status, description, medium, type
        FROM transfers
        WHERE payer_id IS NOT NULL 
          AND payee_id IS NOT NULL
          AND payer_id != payee_id
    """)
    transfers = pg_cur.fetchall()
    
    print(f"📊 Creating {len(transfers)} transfer edges...")
    
    # Create transfer edges
    with neo_driver.session() as session:
        for i, (transfer_id, payer_id, payee_id, amount, transaction_date, status, description, medium, transfer_type) in enumerate(transfers):
      
       
            # Create a display label combining amount and date
            amount_str = f"${amount}" if amount else "$0"
            date_str = str(transaction_date) if transaction_date else "N/A"
            display_label = f"{amount_str} on {date_str}"
            
            session.run("""
                MATCH (from:Account {id: $payer_id})
                MATCH (to:Account {id: $payee_id})
                MERGE (from)-[t:TRANSFERRED_TO {id: $transfer_id}]->(to)
                SET t.amount = $amount,
                    t.transaction_date = $transaction_date,
                    t.status = $status,
                    t.description = $description,
                    t.medium = $medium,
                    t.type = $type,
                    t.label = $label
            """, {
                "transfer_id": transfer_id,
                "payer_id": payer_id,
                "payee_id": payee_id,
                "amount": float(amount) if amount is not None else None,
                "transaction_date": transaction_date,
                "status": status,
                "description": description,
                "medium": medium,
                "type": transfer_type,
                "label": display_label
            })
            
            # Progress indicator
            if (i + 1) % 1000 == 0:
                print(f"  Progress: {i+1}/{len(transfers)} edges...")

    pg_conn.close()
    neo_driver.close()
    print(f"Created {len(transfers)} TRANSFERRED_TO edges between accounts")

if __name__ == "__main__":
    clear_neo4j_database()
    create_account_nodes()
    create_transfer_network()