A transaction groups several operations into one unit: either all of them take effect or none do. ACID is the set of four guarantees a transactional database makes about those units. Knowing what each letter really means, and where it bends, is a frequent interview topic.

## The classic example

Transfer ₹1,000 from Asha to Ravi:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE id = 'asha';
UPDATE accounts SET balance = balance + 1000 WHERE id = 'ravi';
INSERT INTO transfers (from_id, to_id, amount) VALUES ('asha', 'ravi', 1000);
COMMIT;
```

If the server crashes between the two updates, money must not disappear. If two transfers from Asha run at the same time, her balance must not go negative. ACID is how the database makes sure.

## A: Atomicity

All or nothing. If any statement fails, or the process crashes before `COMMIT`, every change in the transaction is rolled back.

*How:* databases write changes to a **write-ahead log (WAL)** before applying them; on recovery they replay committed transactions and undo uncommitted ones.

## C: Consistency

The transaction moves the database from one **valid** state to another. Valid means every declared rule holds: constraints, foreign keys, `CHECK (balance >= 0)`.

Note that this "C" is about *integrity rules*, and the database can only enforce the rules you declare. It is a different idea from consistency in CAP, which is about replicas agreeing.

## I: Isolation

Concurrent transactions do not see each other's half-finished work; the result is as if they ran in some order. In practice, full isolation (serializability) is expensive, so databases offer **weaker levels** that allow certain anomalies.

## D: Durability

Once `COMMIT` returns, the data survives crashes and power loss. The WAL is flushed to disk (`fsync`) before the commit is acknowledged, and in replicated setups, often copied to another machine too.

## Isolation levels and anomalies

### The anomalies

- **Dirty read:** reading another transaction's uncommitted change, which might be rolled back.
- **Non-repeatable read:** reading the same row twice in one transaction and getting different values because someone committed in between.
- **Phantom read:** running the same query twice and getting a different *set* of rows because someone inserted or deleted matching rows.
- **Lost update:** two transactions read a value, both modify it, and the second write silently overwrites the first. (Two people add 1 to a counter of 10; the result is 11, not 12.)
- **Write skew:** two transactions each read overlapping data, make decisions based on it and write to *different* rows, together breaking a rule. Classic example: two on-call doctors each see "two doctors on call", each removes themselves, and nobody is left.

### The levels

| Level | Dirty read | Non-repeatable read | Phantom | Typical default in |
|---|---|---|---|---|
| Read uncommitted | possible | possible | possible | rarely used |
| Read committed | prevented | possible | possible | PostgreSQL, Oracle, SQL Server |
| Repeatable read | prevented | prevented | possible* | MySQL InnoDB |
| Serializable | prevented | prevented | prevented | opt-in |

\*Implementations differ. PostgreSQL's repeatable read uses snapshots and prevents phantoms, but neither it nor MySQL's version prevents every write skew. Only serializable does.

### How databases implement isolation

- **Locking (two-phase locking):** readers and writers take locks; conflicting transactions wait. Correct but can deadlock and limits concurrency.
- **MVCC (multi-version concurrency control):** each write creates a new version of the row; each transaction reads from a consistent snapshot. Readers never block writers and vice versa. Used by PostgreSQL, MySQL InnoDB and Oracle.
- **Serializable snapshot isolation (SSI):** MVCC plus conflict detection; transactions that would cause an anomaly are aborted and must retry.

## Preventing lost updates in practice

1. **Atomic updates:** `UPDATE counters SET n = n + 1 WHERE id = 7` instead of read-modify-write in application code.
2. **Pessimistic locking:** `SELECT ... FOR UPDATE` locks the row until the transaction ends. Good when conflicts are frequent.
3. **Optimistic locking:** add a `version` column; update with `WHERE id = ? AND version = ?`. If zero rows changed, someone else won; reload and retry. Good when conflicts are rare.

```sql
UPDATE seats SET status = 'HELD', held_by = 'u42', version = version + 1
WHERE id = 'A12' AND status = 'FREE' AND version = 7;
-- 1 row updated → you got the seat. 0 rows → someone else did.
```

4. **Constraints:** a `UNIQUE (show_id, seat_id)` on bookings makes double booking impossible regardless of application bugs.

> [!INTERVIEW] Name the level you need
> "For seat booking I'll use a conditional update on the seat row (optimistic concurrency) plus a unique constraint on show and seat, so even concurrent requests cannot double book. Read committed is enough because the conditional update does the check and write atomically."

## Transactions across services

ACID transactions live inside one database. Once data is split across services or shards, you need other tools: **two-phase commit** (atomic but blocking and fragile), or more commonly **sagas** with compensating actions and the **outbox pattern** for reliable events. See [The Saga Pattern](#/l/07-api-design/saga) and [The Transactional Outbox](#/l/07-api-design/outbox).

## Key takeaways

- Atomicity: all or nothing. Consistency: rules always hold. Isolation: concurrent transactions don't interfere. Durability: committed means saved.
- Most databases default to read committed, which still allows lost updates and write skew.
- Fix concurrency with atomic updates, row locks, optimistic versioning and constraints.
- Cross-service consistency needs sagas or 2PC, not local ACID.
