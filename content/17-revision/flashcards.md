Tap a card to flip it. Try to say the answer before you flip. Go through one deck at a time.

## Deck 1: Fundamentals & scaling

```cards
[
  ["Latency vs throughput", "Latency: time for one request. Throughput: requests completed per second. Batching raises throughput but adds latency."],
  ["p99 latency", "The time within which 99% of requests finish. Shows the tail that averages hide."],
  ["Availability: 99.9% / 99.99%", "≈ 8.8 hours / ≈ 53 minutes of downtime per year."],
  ["Series vs parallel availability", "Series: multiply (gets worse). Parallel redundancy: 1 − product of failure probabilities (gets better)."],
  ["Back-of-the-envelope shortcut", "1 day ≈ 10⁵ seconds. Daily count ÷ 10⁵ = per-second rate; ×2–3 for peak."],
  ["Vertical vs horizontal scaling", "Bigger machine (simple, capped, SPOF) vs more machines (needs stateless design)."],
  ["Stateless service", "Keeps no client state between requests, so any instance can serve any request."],
  ["Least connections", "Send the request to the server with the fewest open connections. Good for long or uneven requests."],
  ["Power of two choices", "Pick two random servers, use the less loaded. Nearly optimal, very cheap."],
  ["L4 vs L7 load balancer", "L4: IP/port, any protocol, fastest. L7: parses HTTP, routes by path/header, terminates TLS."],
  ["Forward vs reverse proxy", "Forward acts for clients going out. Reverse acts for servers, receiving client traffic."],
  ["Circuit breaker states", "Closed (normal) → Open (fail fast) → Half-open (trial calls) → Closed or Open."],
  ["RTO vs RPO", "RTO: time to restore service. RPO: how much recent data you can afford to lose."],
  ["Graceful degradation", "Drop non-essential features (recommendations) to keep the core working (checkout)."]
]
```

## Deck 2: Databases

```cards
[
  ["ACID", "Atomic (all or nothing), Consistent (rules hold), Isolated (no interference), Durable (committed = saved)."],
  ["Lost update", "Two transactions read-modify-write the same value; one change is silently overwritten."],
  ["Write skew", "Two transactions read overlapping data and write different rows, together breaking a rule."],
  ["MVCC", "Writers create new row versions; readers see a consistent snapshot. Readers don't block writers."],
  ["Optimistic locking", "Version column; `UPDATE … WHERE version = ?`; 0 rows → conflict, retry."],
  ["B-tree index", "Balanced, sorted, high fan-out tree: O(log n) lookups and efficient range scans."],
  ["Covering index", "Contains every column a query needs, so the table isn't touched."],
  ["Leader-follower replication", "One leader takes writes; followers replicate and serve reads."],
  ["Semi-synchronous replication", "Wait for one follower (ideally another AZ); others async. No loss on single failure."],
  ["Quorum condition", "W + R > N guarantees reads overlap the latest acknowledged write."],
  ["Read-your-own-writes", "A user always sees their own changes, e.g. by reading their data from the leader."],
  ["Shard key qualities", "High cardinality, even load, matches the main query, keeps related data together."],
  ["Consistent hashing", "Keys and nodes on a ring; key → next node clockwise; node changes move ~1/N keys."],
  ["CAP", "During a partition, choose consistency (refuse some requests) or availability (serve possibly stale)."],
  ["PACELC", "If partition: A or C. Else: latency or consistency."],
  ["LSM tree", "Memtable → immutable SSTables → background compaction. Fast writes; Bloom filters help reads."],
  ["Inverted index", "Maps each term to the list of documents containing it. Basis of full-text search."],
  ["Wide-column store fit", "Huge append-heavy writes read by partition key + range (chat, time-series)."]
]
```

## Deck 3: Caching & CDN

```cards
[
  ["Cache-aside", "App checks cache; on miss loads DB and fills cache. On write: update DB, delete key."],
  ["Write-through", "Write cache and DB synchronously. Fresh cache, slower writes."],
  ["Write-behind", "Write cache, flush DB later. Fastest writes; can lose data."],
  ["Stampede", "Hot key expires; many requests rebuild it at once. Fix: single flight, stale-while-revalidate."],
  ["Avalanche", "Many keys expire together or cache dies. Fix: TTL jitter, HA cache, protect DB."],
  ["Penetration", "Requests for non-existent keys bypass the cache. Fix: negative caching, Bloom filter."],
  ["Hot key", "One key overloads one node. Fix: local cache, replicate key under several names."],
  ["LRU vs LFU", "Evict least recently used vs least frequently used. LFU resists scans; needs decay."],
  ["Hit ratio impact", "90% → 99% hit ratio cuts DB read load about 10×."],
  ["Static asset caching", "Content-hashed filenames + `max-age=31536000, immutable`."],
  ["Origin shield", "Mid-tier cache that collapses edge misses into one origin request."],
  ["stale-while-revalidate", "Serve the stale copy now, refresh in the background."]
]
```

## Deck 4: APIs, messaging & Kafka

```cards
[
  ["Idempotency key", "Client-sent unique key; server stores result under a unique constraint and replays it on retries."],
  ["Cursor pagination", "`WHERE key < last_seen ORDER BY key DESC LIMIT n`. Constant cost, stable pages."],
  ["Saga", "Sequence of local transactions with compensating actions; choreography or orchestration."],
  ["Outbox pattern", "Write the event to an outbox table in the same transaction; relay to the broker via poller/CDC."],
  ["CQRS", "Separate write model from denormalised read models updated by events."],
  ["BOLA / IDOR", "API doesn't check that the requested object belongs to the caller. Check ownership every time."],
  ["JWT trade-off", "Stateless and fast to verify; hard to revoke. Short-lived access + revocable refresh tokens."],
  ["REST / GraphQL / gRPC", "Universal + cacheable / client-shaped queries / fast binary RPC with streaming."],
  ["Canary release", "Send a small % of traffic to the new version, compare metrics, expand or roll back."],
  ["Expand and contract", "Add new schema, dual-write, backfill, switch reads, remove old. Zero-downtime migrations."],
  ["At-least-once + idempotent", "The practical recipe for 'exactly once' effects."],
  ["Dead-letter queue", "Where messages go after N failed attempts, for inspection and replay."],
  ["Kafka partition", "Ordered, append-only log; unit of parallelism and ordering."],
  ["Kafka consumer group", "Each partition consumed by exactly one member; groups read independently."],
  ["Kafka durability", "RF 3, `acks=all`, `min.insync.replicas=2`, no unclean leader election."],
  ["Idempotent producer", "Producer ID + sequence numbers let brokers drop retry duplicates."],
  ["Kafka exactly-once", "Transactions atomically write outputs + offsets; consumers use read_committed."],
  ["Cooperative rebalancing", "Only partitions that must move are revoked; others keep consuming."],
  ["Static membership", "`group.instance.id` lets a restarted consumer keep partitions without rebalance."]
]
```

## Deck 5: Distributed patterns & case studies

```cards
[
  ["Raft leader election", "Follower times out (randomised), becomes candidate, wins majority votes for a new term."],
  ["Fencing token", "Increasing number; storage rejects writes carrying an older token from a stale leader."],
  ["Token bucket", "Capacity B allows bursts; refill rate R sets the sustained limit."],
  ["Sliding window counter", "current + previous × overlap fraction. Smooths fixed-window boundary spikes."],
  ["Bloom filter", "Bit array + k hashes. 'Definitely not' or 'probably yes'. ~10 bits/element ≈ 1% false positives."],
  ["Hybrid fan-out", "Push posts to followers' timelines, except celebrities, whose posts are pulled at read time."],
  ["Geospatial index", "Geohash / quadtree / H3 cells. Nearby search = look up a few cells."],
  ["Atomic resource claim", "`compareAndSet(AVAILABLE, ASSIGNED)` or conditional UPDATE. Prevents double assignment."],
  ["Seat hold", "All-or-nothing atomic hold with expiry; booking converts the hold if still valid."],
  ["Payment timeout", "State = UNKNOWN; resolve by status query or webhook; never re-charge blindly."],
  ["Double-entry ledger", "Every transaction's postings sum to zero; append-only; fix with reversals."],
  ["Adaptive bitrate", "Video in short segments at several bitrates; player switches per segment."],
  ["OT vs CRDT", "Transform ops against concurrent ops (central order) vs commutative IDs (any order)."],
  ["Chat delivery guarantees", "Client message IDs, ack after durable write, per-device queues, cursor resync."]
]
```

## Deck 6: Design patterns & LLD

```cards
[
  ["SRP", "A class should have one reason to change."],
  ["OCP", "Open for extension, closed for modification. Add classes, don't edit working code."],
  ["LSP", "Subtypes must be substitutable without breaking callers' expectations."],
  ["ISP", "Many small role interfaces beat one fat interface."],
  ["DIP", "Depend on abstractions; inject concrete implementations."],
  ["Singleton (safe lazy)", "Holder idiom or enum; DCL needs `volatile`."],
  ["Factory method vs abstract factory", "Subclass picks one product vs factory creates a family of matching products."],
  ["Builder", "Step-by-step construction for many optional fields; validate in `build()`; immutable result."],
  ["Adapter", "Wraps an incompatible interface to the one clients expect."],
  ["Decorator", "Same-interface wrappers that add behaviour; stackable (Java I/O)."],
  ["Proxy", "Same interface, controls access: lazy, caching, security, remote (Spring AOP)."],
  ["Facade", "One simple entry point to a complex subsystem."],
  ["Composite", "Tree of parts and wholes sharing one interface."],
  ["Strategy", "Interchangeable algorithms behind an interface, chosen at runtime."],
  ["Observer", "Subject notifies subscribers of changes without knowing them."],
  ["State", "One class per state; the object's behaviour changes as its state changes."],
  ["Template method", "Final skeleton in a base class; subclasses implement steps."],
  ["Money in code", "Integer minor units (paise) or BigDecimal. Never double."]
]
```
