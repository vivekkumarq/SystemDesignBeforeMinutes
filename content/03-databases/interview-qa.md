Answer aloud first, then open each to compare.

## Interview questions

<details>
<summary>How do you decide between SQL and NoSQL for a new service?</summary>

Look at the data and its access patterns. Relational fits data with relationships, multi-row transactions, integrity constraints and varied queries (orders, payments, bookings). NoSQL fits huge scale with simple, known access patterns (wide-column for append-heavy time-ordered data, key-value for lookups, documents for flexible self-contained records, graphs for relationship traversal). Many systems use both.

</details>

<details>
<summary>What is the difference between replication and sharding?</summary>

Replication copies the **same** data to several machines: availability and read scaling. Sharding splits **different** data across machines: write scaling and capacity. Production systems usually do both: each shard is itself replicated.

</details>

<details>
<summary>How do you pick a shard key? What makes a bad one?</summary>

A good key has high cardinality, spreads writes evenly, and matches the main query so most requests hit one shard and related data stays together (user_id for user content, conversation_id for chat, tenant_id for SaaS). Bad keys create hot spots or scatter queries: dates or auto-increment IDs (all new writes on one shard), low-cardinality fields like country or status.

</details>

<details>
<summary>Explain consistent hashing and why virtual nodes are needed.</summary>

Servers and keys are hashed onto a ring; each key belongs to the next server clockwise, so adding or removing a server moves only ~1/N of keys instead of nearly all of them with modulo hashing. With few servers the arcs are uneven and a failed server's load lands on one neighbour; placing each server at many virtual positions evens out the load and spreads a failure's keys across all servers.

</details>

<details>
<summary>A user updates their profile and the old value shows after refresh. Why, and how do you fix it?</summary>

Replication lag: the read hit an asynchronous replica that had not applied the write yet. Fixes: read-your-own-writes, which means reading that user's own data from the primary (always, or for a few seconds after a write), or only reading from replicas that have reached the write's log position. Sticky replica assignment also gives monotonic reads.

</details>

<details>
<summary>What does the CAP theorem actually say?</summary>

During a network partition, a distributed store must choose between consistency (linearizable reads) and availability (every non-failed node responds). Partitions cannot be avoided, so it is a choice made for the partition case. PACELC adds that, without a partition, you trade latency against consistency.

</details>

<details>
<summary>Explain isolation levels and an anomaly each one allows.</summary>

Read uncommitted allows dirty reads. Read committed prevents them but allows non-repeatable reads and lost updates. Repeatable read keeps a stable view of rows but can still allow phantoms (implementation-dependent) and write skew. Serializable prevents all of these, at a cost in throughput or aborts.

</details>

<details>
<summary>How would you prevent two users from booking the same seat?</summary>

Make the database enforce it: a conditional update (`UPDATE seat SET status='HELD' WHERE id=? AND status='FREE'`) or optimistic versioning, plus a unique constraint on (show, seat) in the bookings table. Short-lived holds with expiry handle abandoned checkouts. A distributed lock alone is not enough; the database constraint is the last line of defence.

</details>

<details>
<summary>B-tree vs LSM tree: which for a write-heavy workload and why?</summary>

LSM. It turns random writes into sequential appends (memtable → SSTable flushes), giving much higher write throughput. Reads may check several SSTables, mitigated with Bloom filters and compaction. B-trees give more predictable reads and suit read-heavy transactional workloads.

</details>

<details>
<summary>Why shouldn't Elasticsearch be your primary database?</summary>

It is near-real-time (refresh interval), lacks multi-document transactions, and is optimised for search rather than frequent updates or strict durability guarantees. Keep the source of truth in a database and feed the index through CDC or events, so it can always be rebuilt.

</details>

<details>
<summary>What is the quorum condition in leaderless replication?</summary>

With N replicas, write to W and read from R. If W + R > N, every read set overlaps every write set, so at least one replica returns the latest acknowledged write. For example, N=3, W=2, R=2.

</details>

<details>
<summary>What does an index cost you?</summary>

Each insert, update or delete must also update every index on the table, so writes slow down; indexes use disk and memory; badly chosen indexes are never used. Index for real query patterns and drop unused ones.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Scaling ladder | Tune → scale up → cache → replicas → split by domain → shard |
| Reads vs writes | Reads scale by copying; writes by splitting |
| ACID | All-or-nothing, rules hold, isolated, durable |
| Default isolation | Read committed (PG/Oracle), repeatable read (MySQL) |
| Lost update fixes | Atomic update, `FOR UPDATE`, version column, constraint |
| Composite index | Equality columns first, then range/sort |
| NoSQL families | KV · document · wide-column · graph |
| Replication | Leader-follower · multi-leader · leaderless (W+R>N) |
| Lag fixes | Read-your-writes, monotonic reads (sticky replica) |
| Shard strategies | Range (hot spots) · hash (no ranges) · directory (flexible) |
| Modulo vs ring | ~all keys move vs ~1/N move |
| CAP | Partition → C or A |
| PACELC | Else → latency or consistency |
| B-tree vs LSM | Read-friendly in place vs write-friendly append + compaction |
| Search | Inverted index, analyzers, BM25, fed by CDC |

## Quiz

```quiz
[
  {"q": "What scales writes beyond one database server?", "options": ["Read replicas", "Caching", "Sharding", "Bigger indexes"], "answer": 2, "why": "Replicas and caches only help reads; splitting ownership of data scales writes."},
  {"q": "Which shard key is most likely to create a hot shard?", "options": ["user_id (hashed)", "conversation_id", "created_date", "tenant_id (hashed)"], "answer": 2, "why": "All of today's writes land on the shard holding today's date."},
  {"q": "With modulo hashing over 100 servers, roughly what fraction of keys move when you add one server?", "options": ["1%", "10%", "50%", "~99%"], "answer": 3, "why": "Changing N remaps almost every key; consistent hashing moves only about 1/N."},
  {"q": "N = 5 replicas. Which W/R guarantees reads see the latest acknowledged write?", "options": ["W=2, R=2", "W=3, R=3", "W=1, R=4", "W=2, R=3"], "answer": 1, "why": "Need W + R > N: 3 + 3 = 6 > 5. (2+3 = 5 is not greater than 5.)"},
  {"q": "Two transactions both read stock = 1 and both decrement it, leaving 0 but selling two units. Which anomaly?", "options": ["Dirty read", "Lost update", "Phantom read", "Write skew"], "answer": 1, "why": "Both read-modify-write the same value and one update is effectively lost."},
  {"q": "Index on (user_id, created_at). Which query cannot use it efficiently?", "options": ["WHERE user_id = 7", "WHERE user_id = 7 AND created_at > X", "WHERE created_at > X", "WHERE user_id = 7 ORDER BY created_at"], "answer": 2, "why": "Leftmost-prefix rule: without user_id the index isn't sorted by created_at globally."},
  {"q": "Cassandra by default is best described in PACELC terms as…", "options": ["PC/EC", "PA/EL", "PC/EL", "PA/EC"], "answer": 1, "why": "It stays available during partitions and favours low latency otherwise."},
  {"q": "Why are LSM trees fast for writes?", "options": ["They keep everything in RAM forever", "They convert random writes into sequential appends", "They skip durability", "They use hash indexes"], "answer": 1, "why": "Memtables flush as sorted files in one sequential write; compaction happens later."}
]
```
