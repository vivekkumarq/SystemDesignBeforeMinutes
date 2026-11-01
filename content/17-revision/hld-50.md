Fifty high-level design concepts, each in one or two lines, grouped so you can revise a block at a time. If a line doesn't feel obvious, follow its link back to the full lesson.

## Fundamentals (1–8)

1. **Latency vs throughput.** Time per request vs requests per second; batching raises one and hurts the other.
2. **Percentiles.** Quote p50/p95/p99; averages hide the tail, and fan-out amplifies it.
3. **Availability nines.** 99.9% ≈ 8.8 h/year down; 99.99% ≈ 53 min; each nine ≈ 10× harder.
4. **Series vs parallel availability.** Dependencies in series multiply down; redundant copies in parallel multiply up.
5. **Back-of-the-envelope.** 1 day ≈ 10⁵ s; derive peak QPS, R:W ratio, storage/year, bandwidth. See [Estimation](#/l/01-fundamentals/back-of-the-envelope).
6. **Latency numbers.** RAM ~100 ns, SSD ~100 µs, same-DC RTT ~0.5 ms, cross-continent ~200 ms.
7. **Functional vs non-functional.** Features vs qualities; NFRs drive architecture.
8. **Interview flow.** Requirements → estimates → API → data → HLD → deep dives → wrap-up.

## Scaling and traffic (9–16)

9. **Vertical vs horizontal scaling.** Bigger box (simple, capped) vs more boxes (needs statelessness).
10. **Stateless services.** Push sessions/files/caches out so any instance serves any request.
11. **Load balancing algorithms.** Round robin, weighted, least connections, least response time, power of two choices.
12. **L4 vs L7.** Fast and protocol-agnostic vs HTTP-aware routing and TLS termination.
13. **Reverse proxy / API gateway.** Front door for routing, auth, rate limits, TLS. See [LB vs API Gateway](#/l/09-tradeoffs/lb-vs-api-gateway).
14. **CDN.** Edge caches near users; hashed asset names + long TTLs; origin shield. See [CDN Fundamentals](#/l/05-cdn/fundamentals).
15. **DNS routing.** GeoDNS/latency/weighted/health-checked answers; TTL limits failover speed.
16. **Anycast.** Same IP from many locations; nearest one wins; natural DDoS absorption.

## Data (17–30)

17. **SQL vs NoSQL.** Relationships + transactions vs scale-out + known access patterns.
18. **ACID.** Atomic, consistent (rules), isolated, durable.
19. **Isolation anomalies.** Dirty read, non-repeatable read, phantom, lost update, write skew.
20. **Indexes.** B-tree for ranges/sorts; composite indexes follow the leftmost prefix; every index slows writes.
21. **Replication.** Leader-follower (default), multi-leader (multi-region writes, conflicts), leaderless (quorums).
22. **Quorums.** W + R > N ⇒ reads overlap the latest acknowledged write.
23. **Replication lag fixes.** Read-your-writes, monotonic reads, consistent prefix.
24. **Sharding.** Split rows by a key that spreads load and matches the main query. See [Sharding](#/l/03-databases/sharding).
25. **Consistent hashing.** Ring + virtual nodes: adding a node moves ~1/N keys.
26. **Hot partitions.** Celebrity keys; split with suffixes, cache, isolate.
27. **CAP.** During a partition: consistency or availability.
28. **PACELC.** Else: latency or consistency.
29. **B-tree vs LSM.** Read-friendly in-place pages vs write-friendly append + compaction (+ Bloom filters).
30. **Inverted index.** Term → documents; the core of full-text search; feed it via CDC.

## Caching (31–36)

31. **Cache-aside.** App loads on miss; update DB then delete the key; TTL as safety net.
32. **Write-through / write-behind / write-around.** Fresh but slower / fastest but lossy / skip cache on write.
33. **Eviction.** LRU default; LFU/TinyLFU for stable popularity; TTL for staleness.
34. **Invalidation.** TTL, delete-on-write, event-driven, versioned keys.
35. **Stampede / avalanche / penetration.** Single flight + SWR / TTL jitter + HA / negative cache + Bloom filter.
36. **Hot keys.** Local cache, key replication, read replicas.

## Communication and async (37–44)

37. **Sync vs async.** User waits → sync; side effects and spikes → async.
38. **Message queues.** Work queues, pub/sub, DLQs, at-least-once + idempotent consumers.
39. **Kafka.** Partitioned log; order per partition; consumer groups; replay; `acks=all` + `min.insync.replicas`.
40. **Idempotency keys.** Make retries safe; store key + response under a unique constraint.
41. **Saga.** Local transactions + compensations; choreography or orchestration. See [Saga](#/l/07-api-design/saga).
42. **Outbox.** Write the event in the same DB transaction; relay via poller/CDC.
43. **CQRS.** Separate write model from denormalised read models updated by events.
44. **Real-time delivery.** Polling, long polling, SSE, WebSocket, webhooks.

## Reliability and operations (45–50)

45. **Timeouts, retries, backoff with jitter.** Retry only idempotent work; cap retries.
46. **Circuit breaker and bulkheads.** Fail fast on a sick dependency; isolate resource pools.
47. **Rate limiting.** Token bucket (bursts), sliding window (fairness); Redis + Lua for distributed limits.
48. **Leader election / consensus.** Majority quorums (2f+1), Raft terms, fencing tokens.
49. **Observability.** RED/USE metrics, structured logs, distributed traces; SLOs with burn-rate alerts.
50. **Safe deployments.** Canary, blue-green, feature flags, expand-and-contract migrations.

> [!TIP] How to use this list
> Cover the right-hand side of each line and explain the concept out loud in 30 seconds. Mark any you hesitate on and revisit that lesson tonight.
