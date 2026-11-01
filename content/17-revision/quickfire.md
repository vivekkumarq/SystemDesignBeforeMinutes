A hundred short questions with short answers. Say your answer aloud, then open it. Aim for under 20 seconds each.

## Fundamentals & scaling

<details><summary>1. Seconds in a day, for estimates?</summary>

~10⁵ (86,400).

</details>
<details><summary>2. 99.99% availability allows how much downtime per year?</summary>

About 53 minutes.

</details>
<details><summary>3. Why quote p99 instead of the average?</summary>

Averages hide slow outliers; p99 shows the tail that many users hit at scale.

</details>
<details><summary>4. Vertical scaling's two main drawbacks?</summary>

A hardware ceiling and a single point of failure.

</details>
<details><summary>5. What must a service be to scale horizontally easily?</summary>

Stateless.

</details>
<details><summary>6. Round robin vs least connections?</summary>

Round robin for equal, short requests; least connections for long or uneven ones.

</details>
<details><summary>7. L4 vs L7 load balancer in one line?</summary>

L4 routes by IP/port; L7 understands HTTP and can route by path/header and terminate TLS.

</details>
<details><summary>8. What is a reverse proxy?</summary>

A server in front of backends that forwards client requests to them (LB, TLS, caching, security).

</details>
<details><summary>9. What's the circuit breaker's open state for?</summary>

Fail fast without calling a failing dependency, giving it time to recover.

</details>
<details><summary>10. RTO vs RPO?</summary>

RTO: how long to recover. RPO: how much data loss (in time) is acceptable.

</details>

## Databases

<details><summary>11. What does ACID's C mean?</summary>

Transactions keep the database's declared rules (constraints) valid.

</details>
<details><summary>12. Default isolation level in PostgreSQL?</summary>

Read committed.

</details>
<details><summary>13. Name an anomaly read committed still allows.</summary>

Lost update (also non-repeatable reads, write skew).

</details>
<details><summary>14. Two fixes for lost updates?</summary>

Atomic `UPDATE x = x + 1`, `SELECT … FOR UPDATE`, or optimistic version checks.

</details>
<details><summary>15. Leftmost-prefix rule?</summary>

A composite index (a, b) helps queries filtering on a, or a and b, but not b alone.

</details>
<details><summary>16. Cost of adding indexes?</summary>

Slower writes, more storage and memory.

</details>
<details><summary>17. Replication scales what? Sharding scales what?</summary>

Replication: reads and availability. Sharding: writes and storage.

</details>
<details><summary>18. Quorum rule for consistent reads?</summary>

W + R > N.

</details>
<details><summary>19. Fix for "I updated my profile but see the old one"?</summary>

Read-your-own-writes: read the user's own data from the leader (or a caught-up replica).

</details>
<details><summary>20. Bad shard key example?</summary>

Created date / auto-increment ID (all new writes hit one shard).

</details>
<details><summary>21. Why consistent hashing over modulo?</summary>

Adding/removing a node moves ~1/N keys instead of nearly all.

</details>
<details><summary>22. Why virtual nodes?</summary>

Even load distribution and spreading a failed node's keys across all others.

</details>
<details><summary>23. CAP in one sentence?</summary>

During a network partition, choose consistency or availability.

</details>
<details><summary>24. What does PACELC add?</summary>

Without a partition, you trade latency against consistency.

</details>
<details><summary>25. LSM tree's main advantage?</summary>

High write throughput via sequential appends.

</details>
<details><summary>26. What helps LSM reads skip files?</summary>

Bloom filters per SSTable.

</details>
<details><summary>27. Row store vs column store?</summary>

Row for transactions (OLTP); column for analytics (OLAP).

</details>
<details><summary>28. Core structure of a search engine?</summary>

Inverted index: term → documents.

</details>
<details><summary>29. Should Elasticsearch be the source of truth?</summary>

No. Feed it from the primary database via CDC/events.

</details>
<details><summary>30. Wide-column store sweet spot?</summary>

Massive append-heavy writes read by partition key and range (messages, time-series).

</details>

## Caching & CDN

<details><summary>31. Cache-aside write path?</summary>

Update the database, then delete the cache key.

</details>
<details><summary>32. Why delete rather than set on update?</summary>

Avoids racing writers leaving an older value cached.

</details>
<details><summary>33. Write-behind risk?</summary>

Data loss if the cache fails before flushing.

</details>
<details><summary>34. Default eviction policy?</summary>

LRU.

</details>
<details><summary>35. Cache stampede fix?</summary>

Single flight (one rebuild per key) or stale-while-revalidate.

</details>
<details><summary>36. Cache avalanche fix?</summary>

TTL jitter, HA cache, protect the DB.

</details>
<details><summary>37. Cache penetration fix?</summary>

Negative caching and a Bloom filter.

</details>
<details><summary>38. Hot key fix?</summary>

Local in-process cache, key replication across nodes.

</details>
<details><summary>39. How to deploy new JS without stale caches?</summary>

Content-hashed filenames with long immutable TTLs; short TTL on HTML.

</details>
<details><summary>40. What is an origin shield?</summary>

A mid-tier cache that collapses edge misses into one origin request.

</details>
<details><summary>41. Header to serve stale when origin errors?</summary>

`stale-if-error`.

</details>
<details><summary>42. Never cache publicly…?</summary>

Personalised/authenticated responses (`private, no-store`).

</details>

## Networking

<details><summary>43. TCP vs UDP for voice calls?</summary>

UDP. Late packets are useless; retransmission doesn't help.

</details>
<details><summary>44. What does HTTP/2 add?</summary>

Multiplexing many requests over one connection, header compression.

</details>
<details><summary>45. What does HTTP/3 fix?</summary>

TCP head-of-line blocking (runs over QUIC/UDP).

</details>
<details><summary>46. TLS 1.3 handshake cost?</summary>

One round trip (0-RTT on resumption).

</details>
<details><summary>47. Before migrating a DNS record, do what?</summary>

Lower its TTL days in advance.

</details>
<details><summary>48. What does DNSSEC protect against?</summary>

Forged DNS answers (cache poisoning).

</details>
<details><summary>49. What is anycast?</summary>

One IP announced from many locations; routing picks the nearest.

</details>
<details><summary>50. WebSocket vs SSE?</summary>

WebSocket is two-way; SSE is one-way server → client over HTTP.

</details>

## APIs & communication

<details><summary>51. Which HTTP methods are idempotent?</summary>

GET, HEAD, PUT, DELETE (POST and PATCH are not by default).

</details>
<details><summary>52. Offset vs cursor pagination for feeds?</summary>

Cursor: constant cost and stable under inserts.

</details>
<details><summary>53. How to make POST safe to retry?</summary>

Idempotency key stored with the result under a unique constraint.

</details>
<details><summary>54. Prevent lost updates over HTTP?</summary>

ETag + `If-Match`; reject with 412 on mismatch.

</details>
<details><summary>55. Status code for rate limiting?</summary>

429 with `Retry-After`.

</details>
<details><summary>56. JWT's main weakness?</summary>

Hard to revoke before expiry; keep it short-lived with refresh tokens.

</details>
<details><summary>57. Most common API vulnerability?</summary>

Broken object-level authorisation (IDOR): not checking ownership.

</details>
<details><summary>58. REST vs GraphQL vs gRPC, one word each?</summary>

Universal · flexible · fast.

</details>
<details><summary>59. GraphQL N+1 fix?</summary>

Batching with a DataLoader.

</details>
<details><summary>60. What is a saga?</summary>

Local transactions with compensating actions instead of a distributed transaction.

</details>
<details><summary>61. Choreography vs orchestration?</summary>

Events between services vs a central coordinator directing steps.

</details>
<details><summary>62. What problem does the outbox solve?</summary>

The dual write: updating the DB and publishing an event atomically.

</details>
<details><summary>63. CQRS in one line?</summary>

Separate write model from read models updated by events.

</details>
<details><summary>64. Blue-green vs canary?</summary>

Switch all traffic at once (instant rollback) vs gradually shift a percentage.

</details>
<details><summary>65. Zero-downtime schema change technique?</summary>

Expand and contract.

</details>
<details><summary>66. RED metrics?</summary>

Rate, Errors, Duration.

</details>

## Distributed systems & Kafka

<details><summary>67. Nodes needed to tolerate 2 failures with consensus?</summary>

5 (2f + 1).

</details>
<details><summary>68. Why randomised election timeouts in Raft?</summary>

To avoid repeated split votes.

</details>
<details><summary>69. What is a fencing token?</summary>

An increasing number that lets storage reject writes from a stale leader.

</details>
<details><summary>70. Token bucket allows…?</summary>

Bursts up to the bucket size, with a steady refill rate.

</details>
<details><summary>71. Fixed window's flaw?</summary>

Up to 2× the limit around window boundaries.

</details>
<details><summary>72. Distributed rate limiter atomicity tool?</summary>

Redis Lua script (or INCR + EXPIRE).

</details>
<details><summary>73. What's a DLQ for?</summary>

Parking messages that repeatedly fail, for investigation and replay.

</details>
<details><summary>74. Standard delivery guarantee + what consumers must be?</summary>

At-least-once; idempotent.

</details>
<details><summary>75. Kafka ordering guarantee?</summary>

Per partition only.

</details>
<details><summary>76. Same key always goes to…?</summary>

The same partition.

</details>
<details><summary>77. Max active consumers in a group?</summary>

The number of partitions.

</details>
<details><summary>78. Durable Kafka producer settings?</summary>

`acks=all`, idempotence on, `min.insync.replicas=2` on the topic.

</details>
<details><summary>79. Commit offsets before or after processing for at-least-once?</summary>

After.

</details>
<details><summary>80. Kafka exactly-once scope?</summary>

Read-process-write within Kafka (transactions); external effects need idempotency.

</details>
<details><summary>81. Rebalance-friendly settings?</summary>

Cooperative-sticky assignor and static membership (`group.instance.id`).

</details>
<details><summary>82. Kafka vs RabbitMQ in one line?</summary>

Replayable log for streams vs flexible routing for task queues.

</details>

## Trade-offs & case studies

<details><summary>83. Fan-out on write vs read for celebrities?</summary>

Pull (read) for celebrities, push for everyone else: hybrid.

</details>
<details><summary>84. Why not store live driver locations in Postgres?</summary>

Huge write volume of ephemeral data; use an in-memory geo index.

</details>
<details><summary>85. Geospatial index options?</summary>

Geohash, quadtree, H3/S2 cells.

</details>
<details><summary>86. URL shortener code space with 7 base62 chars?</summary>

~3.5 trillion.

</details>
<details><summary>87. 301 vs 302 for a shortener with analytics?</summary>

302 (301 gets cached by browsers).

</details>
<details><summary>88. How to avoid double-booking seats?</summary>

Atomic conditional hold/booking + unique constraint; holds with expiry.

</details>
<details><summary>89. Payment timeout means…?</summary>

Unknown. Query status; never assume failure and recharge.

</details>
<details><summary>90. Double-entry rule?</summary>

Every transaction's postings sum to zero.

</details>
<details><summary>91. Large file upload essentials?</summary>

Pre-signed URLs, multipart/resumable chunks, checksums, async processing.

</details>
<details><summary>92. Video delivery essentials?</summary>

Multi-bitrate segmented renditions (HLS/DASH), adaptive bitrate, CDN.

</details>
<details><summary>93. Chat message ordering approach?</summary>

Per-conversation sequence numbers.

</details>
<details><summary>94. Collaborative editing algorithms?</summary>

Operational transformation or CRDTs.

</details>
<details><summary>95. Trending ≠ popular because…?</summary>

Trending is a spike above baseline, not just high volume.

</details>

## LLD

<details><summary>96. Thread-safe lazy singleton without locks?</summary>

Initialisation-on-demand holder idiom (or an enum).

</details>
<details><summary>97. Pattern for interchangeable pricing rules?</summary>

Strategy.

</details>
<details><summary>98. Pattern for an object whose behaviour depends on its lifecycle stage?</summary>

State.

</details>
<details><summary>99. Why does `@Transactional` not work on self-invocation?</summary>

It's applied by a proxy; internal calls bypass the proxy.

</details>
<details><summary>100. Money type in code?</summary>

Integer minor units (paise) or `BigDecimal`, never `double`.

</details>
