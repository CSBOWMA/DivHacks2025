from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.database.db_init import get_db_connection

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("")
def get_accounts(
    customer_id: Optional[str] = None,
    account_type: Optional[str] = None,
    min_balance: Optional[float] = None,
    max_balance: Optional[float] = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """
    Get accounts with optional filtering.

    Query parameters:
    - customer_id: Filter by customer ID
    - account_type: Filter by account type (Savings, Credit Card, Checking)
    - min_balance: Minimum balance
    - max_balance: Maximum balance
    - limit: Number of results to return (max 1000)
    - offset: Number of results to skip
    """

    query = "SELECT id, customer_id, type, nickname, balance, rewards FROM accounts WHERE 1=1"
    params = []

    if customer_id:
        query += " AND customer_id = %s"
        params.append(customer_id)

    if account_type:
        query += " AND type = %s"
        params.append(account_type)

    if min_balance is not None:
        query += " AND balance >= %s"
        params.append(min_balance)

    if max_balance is not None:
        query += " AND balance <= %s"
        params.append(max_balance)

    query += " ORDER BY balance DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(query, params)
            rows = cur.fetchall()

            accounts = []
            for row in rows:
                accounts.append({
                    "id": row[0],
                    "customer_id": row[1],
                    "type": row[2],
                    "nickname": row[3],
                    "balance": float(row[4]) if row[4] else 0.0,
                    "rewards": float(row[5]) if row[5] else 0.0
                })

            return {
                "count": len(accounts),
                "limit": limit,
                "offset": offset,
                "accounts": accounts
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{account_id}")
def get_account(account_id: str):
    """Get a specific account by ID."""

    query = "SELECT id, customer_id, type, nickname, balance, rewards FROM accounts WHERE id = %s"

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(query, (account_id,))
            row = cur.fetchone()

            if not row:
                raise HTTPException(status_code=404, detail="Account not found")

            return {
                "id": row[0],
                "customer_id": row[1],
                "type": row[2],
                "nickname": row[3],
                "balance": float(row[4]) if row[4] else 0.0,
                "rewards": float(row[5]) if row[5] else 0.0
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{account_id}/transactions")
def get_account_transactions(
    account_id: str,
    transactions_after: Optional[str] = Query(None, description="Date in YYYYMMDD format"),
    transactions_before: Optional[str] = Query(None, description="Date in YYYYMMDD format"),
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    transaction_type: Optional[str] = Query(None, description="deposit, withdrawal, or transfer"),
    status: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """
    Get all transactions for an account with filtering.

    Example: /accounts/123/transactions?transactions_after=20230101&min_amount=10&offset=0

    Query parameters:
    - transactions_after: Date filter in YYYYMMDD format
    - transactions_before: Date filter in YYYYMMDD format
    - min_amount: Minimum transaction amount
    - max_amount: Maximum transaction amount
    - transaction_type: Type of transaction (deposit, withdrawal, transfer)
    - status: Transaction status (completed, pending, cancelled)
    - limit: Number of results (max 1000)
    - offset: Pagination offset
    """

    # Parse date parameters if provided
    date_after = None
    date_before = None

    if transactions_after:
        try:
            date_after = datetime.strptime(transactions_after, "%Y%m%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid transactions_after format. Use YYYYMMDD")

    if transactions_before:
        try:
            date_before = datetime.strptime(transactions_before, "%Y%m%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid transactions_before format. Use YYYYMMDD")

    # Build unified query across all transaction types
    queries = []
    params_list = []

    # Deposits
    if not transaction_type or transaction_type == "deposit":
        query = """
            SELECT
                'deposit' as type,
                id,
                account_id,
                amount,
                transaction_date,
                description,
                status,
                payee_id,
                medium
            FROM deposits
            WHERE account_id = %s
        """
        params = [account_id]

        if date_after:
            query += " AND transaction_date >= %s"
            params.append(date_after)

        if date_before:
            query += " AND transaction_date <= %s"
            params.append(date_before)

        if min_amount is not None:
            query += " AND amount >= %s"
            params.append(min_amount)

        if max_amount is not None:
            query += " AND amount <= %s"
            params.append(max_amount)

        if status:
            query += " AND status = %s"
            params.append(status)

        queries.append(query)
        params_list.append(params)

    # Withdrawals
    if not transaction_type or transaction_type == "withdrawal":
        query = """
            SELECT
                'withdrawal' as type,
                id,
                account_id,
                amount,
                transaction_date,
                description,
                status,
                payee_id,
                medium
            FROM withdrawals
            WHERE account_id = %s
        """
        params = [account_id]

        if date_after:
            query += " AND transaction_date >= %s"
            params.append(date_after)

        if date_before:
            query += " AND transaction_date <= %s"
            params.append(date_before)

        if min_amount is not None:
            query += " AND amount >= %s"
            params.append(min_amount)

        if max_amount is not None:
            query += " AND amount <= %s"
            params.append(max_amount)

        if status:
            query += " AND status = %s"
            params.append(status)

        queries.append(query)
        params_list.append(params)

    # Transfers
    if not transaction_type or transaction_type == "transfer":
        query = """
            SELECT
                'transfer' as type,
                id,
                account_id,
                amount,
                transaction_date,
                description,
                status,
                payer_id as payee_id,
                medium
            FROM transfers
            WHERE account_id = %s
        """
        params = [account_id]

        if date_after:
            query += " AND transaction_date >= %s"
            params.append(date_after)

        if date_before:
            query += " AND transaction_date <= %s"
            params.append(date_before)

        if min_amount is not None:
            query += " AND amount >= %s"
            params.append(min_amount)

        if max_amount is not None:
            query += " AND amount <= %s"
            params.append(max_amount)

        if status:
            query += " AND status = %s"
            params.append(status)

        queries.append(query)
        params_list.append(params)

    # Combine all queries with UNION ALL
    combined_query = " UNION ALL ".join(queries)
    combined_query += " ORDER BY transaction_date DESC LIMIT %s OFFSET %s"

    # Flatten params
    all_params = []
    for params in params_list:
        all_params.extend(params)
    all_params.extend([limit, offset])

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(combined_query, all_params)
            rows = cur.fetchall()

            transactions = []
            for row in rows:
                transactions.append({
                    "type": row[0],
                    "id": row[1],
                    "account_id": row[2],
                    "amount": float(row[3]) if row[3] else 0.0,
                    "transaction_date": str(row[4]) if row[4] else None,
                    "description": row[5],
                    "status": row[6],
                    "payee_id": row[7],
                    "medium": row[8]
                })

            return {
                "account_id": account_id,
                "count": len(transactions),
                "limit": limit,
                "offset": offset,
                "transactions": transactions
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")