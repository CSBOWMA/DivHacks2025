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

            # Get total count
            count_query = "SELECT COUNT(*) FROM accounts WHERE 1=1"
            count_params = []

            if customer_id:
                count_query += " AND customer_id = %s"
                count_params.append(customer_id)

            if account_type:
                count_query += " AND type = %s"
                count_params.append(account_type)

            if min_balance is not None:
                count_query += " AND balance >= %s"
                count_params.append(min_balance)

            if max_balance is not None:
                count_query += " AND balance <= %s"
                count_params.append(max_balance)

            cur.execute(count_query, count_params)
            total_count = cur.fetchone()[0]

            # Get paginated results
            cur.execute(query, params)
            rows = cur.fetchall()

            accounts = []
            total_balance = 0
            account_types_count = {}

            for row in rows:
                balance = float(row[4]) if row[4] else 0.0
                account_type = row[2]

                accounts.append({
                    "id": row[0],
                    "customer_id": row[1],
                    "type": account_type,
                    "name": row[3] or f"{account_type} Account",
                    "nickname": row[3],
                    "balance": balance,
                    "currency": "USD",
                    "status": "active",
                    "created_at": None,
                    "rewards": float(row[5]) if row[5] else 0.0
                })

                total_balance += balance
                account_types_count[account_type] = account_types_count.get(account_type, 0) + 1

            # Calculate pagination info
            current_page = (offset // limit) + 1 if limit > 0 else 1
            total_pages = (total_count + limit - 1) // limit if limit > 0 else 1
            has_next = offset + limit < total_count
            has_previous = offset > 0
            next_offset = offset + limit if has_next else None
            previous_offset = max(0, offset - limit) if has_previous else None

            return {
                "accounts": accounts,
                "pagination": {
                    "total_accounts": total_count,
                    "returned_accounts": len(accounts),
                    "limit": limit,
                    "offset": offset,
                    "current_page": current_page,
                    "total_pages": total_pages,
                    "has_next": has_next,
                    "has_previous": has_previous,
                    "next_offset": next_offset,
                    "previous_offset": previous_offset
                },
                "summary": {
                    "total_balance": total_balance,
                    "average_balance": total_balance / len(accounts) if accounts else 0,
                    "account_types": account_types_count
                },
                "filters": {
                    "customer_id": customer_id,
                    "account_type": account_type,
                    "min_balance": min_balance,
                    "max_balance": max_balance
                }
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
                "name": row[3] or f"{row[2]} Account",
                "balance": float(row[4]) if row[4] else 0.0,
                "rewards": float(row[5]) if row[5] else 0.0,
                "currency": "USD",
                "status": "active"
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
    transaction_type: Optional[str] = Query(None, description="deposit, withdrawal, transfer_in, or transfer_out"),
    status: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """
    Get all transactions for an account with filtering.

    Query parameters:
    - transactions_after: Date filter in YYYYMMDD format
    - transactions_before: Date filter in YYYYMMDD format
    - min_amount: Minimum transaction amount
    - max_amount: Maximum transaction amount
    - transaction_type: Type of transaction (deposit, withdrawal, transfer_in, transfer_out)
    - status: Transaction status (completed, pending, cancelled, executed)
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

    # Build queries for each transaction type
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
                payer_id as payee_id,
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

    # Transfers OUT (where this account is the payer)
    if not transaction_type or transaction_type == "transfer_out":
        query = """
            SELECT
                'transfer_out' as type,
                id,
                payer_id as account_id,
                amount,
                transaction_date,
                description,
                status,
                payee_id,
                medium
            FROM transfers
            WHERE payer_id = %s
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

    # Transfers IN (where this account is the payee)
    if not transaction_type or transaction_type == "transfer_in":
        query = """
            SELECT
                'transfer_in' as type,
                id,
                payee_id as account_id,
                amount,
                transaction_date,
                description,
                status,
                payer_id as payee_id,
                medium
            FROM transfers
            WHERE payee_id = %s
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

    # Build count queries
    count_queries = []
    count_params_list = []

    # Count deposits
    if not transaction_type or transaction_type == "deposit":
        count_query = "SELECT COUNT(*) FROM deposits WHERE account_id = %s"
        count_params = [account_id]

        if date_after:
            count_query += " AND transaction_date >= %s"
            count_params.append(date_after)

        if date_before:
            count_query += " AND transaction_date <= %s"
            count_params.append(date_before)

        if min_amount is not None:
            count_query += " AND amount >= %s"
            count_params.append(min_amount)

        if max_amount is not None:
            count_query += " AND amount <= %s"
            count_params.append(max_amount)

        if status:
            count_query += " AND status = %s"
            count_params.append(status)

        count_queries.append(count_query)
        count_params_list.append(count_params)

    # Count withdrawals
    if not transaction_type or transaction_type == "withdrawal":
        count_query = "SELECT COUNT(*) FROM withdrawals WHERE account_id = %s"
        count_params = [account_id]

        if date_after:
            count_query += " AND transaction_date >= %s"
            count_params.append(date_after)

        if date_before:
            count_query += " AND transaction_date <= %s"
            count_params.append(date_before)

        if min_amount is not None:
            count_query += " AND amount >= %s"
            count_params.append(min_amount)

        if max_amount is not None:
            count_query += " AND amount <= %s"
            count_params.append(max_amount)

        if status:
            count_query += " AND status = %s"
            count_params.append(status)

        count_queries.append(count_query)
        count_params_list.append(count_params)

    # Count transfers out
    if not transaction_type or transaction_type == "transfer_out":
        count_query = "SELECT COUNT(*) FROM transfers WHERE payer_id = %s"
        count_params = [account_id]

        if date_after:
            count_query += " AND transaction_date >= %s"
            count_params.append(date_after)

        if date_before:
            count_query += " AND transaction_date <= %s"
            count_params.append(date_before)

        if min_amount is not None:
            count_query += " AND amount >= %s"
            count_params.append(min_amount)

        if max_amount is not None:
            count_query += " AND amount <= %s"
            count_params.append(max_amount)

        if status:
            count_query += " AND status = %s"
            count_params.append(status)

        count_queries.append(count_query)
        count_params_list.append(count_params)

    # Count transfers in
    if not transaction_type or transaction_type == "transfer_in":
        count_query = "SELECT COUNT(*) FROM transfers WHERE payee_id = %s"
        count_params = [account_id]

        if date_after:
            count_query += " AND transaction_date >= %s"
            count_params.append(date_after)

        if date_before:
            count_query += " AND transaction_date <= %s"
            count_params.append(date_before)

        if min_amount is not None:
            count_query += " AND amount >= %s"
            count_params.append(min_amount)

        if max_amount is not None:
            count_query += " AND amount <= %s"
            count_params.append(max_amount)

        if status:
            count_query += " AND status = %s"
            count_params.append(status)

        count_queries.append(count_query)
        count_params_list.append(count_params)

    # Combine all queries with UNION ALL
    if not queries:
        raise HTTPException(status_code=400, detail="No valid transaction type specified")

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

            # Get total count
            total_count = 0
            for count_query, count_params in zip(count_queries, count_params_list):
                cur.execute(count_query, count_params)
                total_count += cur.fetchone()[0]

            # Get paginated results
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
                "returned": len(transactions),
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "transactions": transactions
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{account_id}/recent-activity")
def get_recent_activity(
    account_id: str,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back")
):
    """
    Get recent transaction activity for an account.

    Returns all deposits, withdrawals, and transfers from the last N days,
    sorted by most recent first.

    Query parameters:
    - days: Number of days to look back (default 30, max 365)
    """

    query = """
    (
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
            AND transaction_date >= NOW() - INTERVAL '%s days'
            AND status IN ('completed', 'executed')
    )
    UNION ALL
    (
        SELECT
            'withdrawal' as type,
            id,
            account_id,
            amount,
            transaction_date,
            description,
            status,
            payer_id as payee_id,
            medium
        FROM withdrawals
        WHERE account_id = %s
            AND transaction_date >= NOW() - INTERVAL '%s days'
            AND status IN ('completed', 'executed')
    )
    UNION ALL
    (
        SELECT
            'transfer_out' as type,
            id,
            payer_id as account_id,
            amount,
            transaction_date,
            description,
            status,
            payee_id,
            medium
        FROM transfers
        WHERE payer_id = %s
            AND transaction_date >= NOW() - INTERVAL '%s days'
            AND status IN ('completed', 'executed')
    )
    UNION ALL
    (
        SELECT
            'transfer_in' as type,
            id,
            payee_id as account_id,
            amount,
            transaction_date,
            description,
            status,
            payer_id as payee_id,
            medium
        FROM transfers
        WHERE payee_id = %s
            AND transaction_date >= NOW() - INTERVAL '%s days'
            AND status IN ('completed', 'executed')
    )
    ORDER BY transaction_date DESC
    """

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(query, (account_id, days, account_id, days, account_id, days, account_id, days))
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
                "days": days,
                "activity_count": len(transactions),
                "transactions": transactions
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{account_id}/transaction-summary")
def get_transaction_summary(account_id: str):
    """
    Get all transactions and calculate summary statistics for an account.

    Returns transactions grouped by type with calculated balance,
    actual balance, and any discrepancies.
    """

    query = """
    (
        SELECT
            'deposit' as type,
            id,
            account_id,
            amount,
            transaction_date as date,
            description,
            status
        FROM deposits
        WHERE account_id = %s
            AND status IN ('completed', 'executed')
    )
    UNION ALL
    (
        SELECT
            'withdrawal' as type,
            id,
            account_id,
            amount,
            transaction_date as date,
            description,
            status
        FROM withdrawals
        WHERE account_id = %s
            AND status IN ('completed', 'executed')
    )
    UNION ALL
    (
        SELECT
            'transfer_out' as type,
            id,
            payer_id as account_id,
            amount,
            transaction_date as date,
            description,
            status
        FROM transfers
        WHERE payer_id = %s
            AND status IN ('completed', 'executed')
    )
    UNION ALL
    (
        SELECT
            'transfer_in' as type,
            id,
            payee_id as account_id,
            amount,
            transaction_date as date,
            description,
            status
        FROM transfers
        WHERE payee_id = %s
            AND status IN ('completed', 'executed')
    )
    ORDER BY date DESC
    """

    # Query to get actual account balance
    balance_query = "SELECT balance FROM accounts WHERE id = %s"

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()

            # Get actual account balance
            cur.execute(balance_query, (account_id,))
            balance_row = cur.fetchone()

            if not balance_row:
                raise HTTPException(status_code=404, detail="Account not found")

            actual_balance = float(balance_row[0]) if balance_row[0] else 0.0

            # Get all transactions
            cur.execute(query, (account_id, account_id, account_id, account_id))
            rows = cur.fetchall()

            transactions = []
            total_deposits = 0.0
            total_withdrawals = 0.0
            total_transfers_in = 0.0
            total_transfers_out = 0.0

            for row in rows:
                transaction_type = row[0]
                amount = float(row[3]) if row[3] else 0.0

                transaction = {
                    "id": row[1],
                    "account_id": row[2],
                    "type": transaction_type,
                    "amount": amount,
                    "date": str(row[4]) if row[4] else None,
                    "description": row[5] or "",
                    "status": row[6]
                }
                transactions.append(transaction)

                # Calculate totals by type
                if transaction_type == "deposit":
                    total_deposits += amount
                elif transaction_type == "withdrawal":
                    total_withdrawals += amount
                elif transaction_type == "transfer_in":
                    total_transfers_in += amount
                elif transaction_type == "transfer_out":
                    total_transfers_out += amount

            # Calculate the balance based on transactions
            calculated_balance = (total_deposits + total_transfers_in) - (total_withdrawals + total_transfers_out)

            # Calculate discrepancy
            discrepancy = actual_balance - calculated_balance
            has_discrepancy = abs(discrepancy) > 0.01  # Allow for floating point precision

            summary = {
                "total_deposits": total_deposits,
                "total_withdrawals": total_withdrawals,
                "total_transfers_in": total_transfers_in,
                "total_transfers_out": total_transfers_out,
                "calculated_balance": calculated_balance,
                "actual_balance": actual_balance,
                "discrepancy": discrepancy,
                "has_discrepancy": has_discrepancy
            }

            return {
                "transactions": transactions,
                "summary": summary
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")