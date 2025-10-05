from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.database.db_init import get_db_connection

router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.get("/circular-transfers/{account_id}")
def detect_circular_transfers(account_id: str, max_depth: int = 5, min_amount: float = 0):
    """
    Detect circular money flows starting from a given account using graph traversal.

    Traverses the transfer graph using recursive CTE to find cycles where money
    returns to the origin account through intermediary accounts.

    Args:
        account_id: The account ID to check for circular flows
        max_depth: Maximum chain length to detect (default 5)
        min_amount: Minimum transaction amount to consider (default 0)

    Returns:
        List of circular transfer chains with amounts and participants
    """

    query = """
    WITH RECURSIVE transfer_chain AS (
        -- Base case: all transfers from the starting account
        SELECT
            t.id,
            t.account_id,
            t.payer_id,
            t.amount,
            t.transaction_date,
            t.description,
            t.status,
            1 as depth,
            ARRAY[t.account_id] as path,
            ARRAY[t.id] as transfer_path,
            t.amount as running_total
        FROM transfers t
        WHERE t.account_id = %s
            AND t.amount >= %s
            AND t.status = 'completed'

        UNION ALL

        -- Recursive case: follow the chain through the graph
        SELECT
            t.id,
            t.account_id,
            t.payer_id,
            t.amount,
            t.transaction_date,
            t.description,
            t.status,
            tc.depth + 1,
            tc.path || t.account_id,
            tc.transfer_path || t.id,
            tc.running_total + t.amount
        FROM transfers t
        INNER JOIN transfer_chain tc ON t.account_id = tc.payer_id
        WHERE
            tc.depth < %s
            AND NOT (t.account_id = ANY(tc.path))  -- Prevent revisiting nodes
            AND t.amount >= %s
            AND t.status = 'completed'
    )
    SELECT
        path || payer_id as full_path,
        transfer_path,
        depth,
        array_agg(amount) as amounts,
        array_agg(transaction_date) as dates,
        array_agg(description) as descriptions,
        MAX(running_total) as total_amount
    FROM transfer_chain
    WHERE payer_id = %s  -- Circular: cycle back to starting account
    GROUP BY path, payer_id, transfer_path, depth
    ORDER BY total_amount DESC, depth
    LIMIT 100;
    """

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(query, (account_id, min_amount, max_depth, min_amount, account_id))
            rows = cur.fetchall()

            if not rows:
                return {
                    "account_id": account_id,
                    "circular_flows_detected": False,
                    "count": 0,
                    "chains": []
                }

            chains = []
            for row in rows:
                full_path, transfer_path, depth, amounts, dates, descriptions, total_amount = row
                chains.append({
                    "chain_length": depth,
                    "account_path": full_path,
                    "transfer_ids": transfer_path,
                    "amounts": [float(amt) if amt else 0.0 for amt in amounts],
                    "total_amount": float(total_amount) if total_amount else 0.0,
                    "dates": [str(d) if d else None for d in dates],
                    "descriptions": descriptions
                })

            return {
                "account_id": account_id,
                "circular_flows_detected": True,
                "count": len(chains),
                "chains": chains,
                "risk_level": "HIGH" if len(chains) > 0 else "LOW"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")