from fastapi import APIRouter, Query
from neo4j import GraphDatabase
import os

router = APIRouter(prefix="/graph", tags=["graph"])

# Neo4j config
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "testpassword")

neo_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


@router.get("/graph")
def get_graph():
    """
    Fetch nodes and relationships from Neo4j.
    Optional limit to reduce payload size.
    """

    with neo_driver.session() as session:
        # Fetch nodes
        node_result = session.run(
            """
            MATCH (n:Account)
            RETURN n.id AS id, n.type AS type, n.nickname AS nickname,
                   n.balance AS balance, n.rewards AS rewards
            """
        )

        nodes = [record.data() for record in node_result]

        # Fetch edges
        edge_result = session.run(
            """
            MATCH (from:Account)-[t:TRANSFERRED_TO]->(to:Account)
            RETURN from.id AS source, to.id AS target,
                   t.amount AS amount, t.transaction_date AS transaction_date,
                   t.status AS status, t.label AS label
        
            """
        )

        edges = [record.data() for record in edge_result]

    return {"nodes": nodes, "edges": edges}
