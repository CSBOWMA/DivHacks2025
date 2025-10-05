from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import sys
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Ensure parent path is accessible (optional depending on project structure)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database.db_init import get_db_connection  # Uses env vars

router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.get("/circular-transfers/{account_id}")
def detect_circular_transfers(account_id: str, max_depth: int = 5, min_amount: float = 0):
    """
    Detect circular money flows starting from a given account using graph traversal.
    """
    query = """
    WITH RECURSIVE transfer_chain AS (
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
            AND NOT (t.account_id = ANY(tc.path))
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
    WHERE payer_id = %s
    GROUP BY path, payer_id, transfer_path, depth
    ORDER BY total_amount DESC, depth
    LIMIT 100;
    """

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
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
                        "amounts": [float(a or 0.0) for a in amounts],
                        "dates": [str(d) if d else None for d in dates],
                        "descriptions": descriptions,
                        "total_amount": float(total_amount or 0.0)
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


@router.get("/scan-all")
def scan_all_accounts(max_depth: int = 5, min_amount: float = 0, limit: int = 100):
    """
    Scan all accounts for circular transfer fraud.
    """
    query = """
    WITH RECURSIVE transfer_chain AS (
        SELECT
            t.id,
            t.account_id,
            t.payer_id,
            t.amount,
            t.transaction_date,
            1 as depth,
            ARRAY[t.account_id] as path,
            ARRAY[t.id] as transfer_path,
            t.amount as running_total,
            t.account_id as origin_account
        FROM transfers t
        WHERE t.amount >= %s
            AND t.status = 'completed'

        UNION ALL

        SELECT
            t.id,
            t.account_id,
            t.payer_id,
            t.amount,
            t.transaction_date,
            tc.depth + 1,
            tc.path || t.account_id,
            tc.transfer_path || t.id,
            tc.running_total + t.amount,
            tc.origin_account
        FROM transfers t
        INNER JOIN transfer_chain tc ON t.account_id = tc.payer_id
        WHERE
            tc.depth < %s
            AND NOT (t.account_id = ANY(tc.path))
            AND t.amount >= %s
            AND t.status = 'completed'
    )
    SELECT
        origin_account,
        COUNT(DISTINCT transfer_path) as circular_count,
        SUM(running_total) as total_circular_amount,
        MAX(depth) as max_chain_length
    FROM transfer_chain
    WHERE payer_id = origin_account
    GROUP BY origin_account
    ORDER BY circular_count DESC, total_circular_amount DESC
    LIMIT %s;
    """

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (min_amount, max_depth, min_amount, limit))
                rows = cur.fetchall()

                fraudulent_accounts = []
                for row in rows:
                    account_id, count, total_amount, chain_length = row
                    fraudulent_accounts.append({
                        "account_id": account_id,
                        "circular_flow_count": count,
                        "total_circular_amount": float(total_amount or 0.0),
                        "max_chain_length": chain_length,
                        "risk_level": "HIGH" if count > 2 else "MEDIUM"
                    })

                return {
                    "scanned": True,
                    "fraudulent_accounts_found": len(fraudulent_accounts),
                    "accounts": fraudulent_accounts
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
