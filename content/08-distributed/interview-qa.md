Answer aloud first, then open each to compare.

## Interview questions

<details>
<summary>Why do consensus clusters use an odd number of nodes?</summary>

Decisions need a majority. 2f + 1 nodes tolerate f failures: 3 tolerate 1, 5 tolerate 2. An even count adds cost without adding tolerance (4 still tolerates only 1) and makes even splits during partitions more likely.

</details>

<details>
<summary>How does Raft elect a leader?</summary>

Followers expect heartbeats from the leader. If one doesn't hear any within its randomised election timeout, it increments the term, becomes a candidate, votes for itself and requests votes. Nodes grant one vote per term to a candidate whose log is at least as up to date. A majority makes it leader. Randomised timeouts make split votes rare; if one happens, a new term starts.

</details>

<details>
<summary>What is a fencing token and why is it needed?</summary>

A monotonically increasing number issued with each new leadership or lock lease. A paused former leader may wake up still believing it holds the lock; storage rejects its writes because they carry an older token than the current leader's. It prevents split-brain damage that timeouts alone can't.

</details>

<details>
<summary>Compare the token bucket and the sliding window counter.</summary>

Token bucket: tokens refill at a steady rate up to a capacity, which allows controlled bursts with a steady average. Two values per client. Sliding window counter: weights the previous window's count by overlap with a rolling window, which smooths the fixed-window boundary problem with two counters. Approximate but cheap. Token bucket is the usual API default; sliding counter is good for "N per minute" fairness.

</details>

<details>
<summary>How do you implement a rate limiter across many API servers?</summary>

Keep counters in a shared store like Redis, sharded by client key, updated atomically with INCR+EXPIRE or a Lua script. Return 429 with Retry-After. Choose fail-open or fail-closed if the store is down. For extreme throughput, use local approximate limits that sync periodically.

</details>

<details>
<summary>What is a dead-letter queue?</summary>

A queue where messages go after they fail processing a set number of times. It stops poison messages from blocking or looping forever, preserves them for investigation, and lets you replay them after a fix. It should be monitored and alerted on.

</details>

<details>
<summary>How does Kafka guarantee ordering?</summary>

Only within a partition. Records with the same key go to the same partition, so per-key order is preserved; there's no global order across partitions. Idempotent producers keep order even with retries and multiple in-flight requests.

</details>

<details>
<summary>How many partitions should a topic have?</summary>

At least the peak throughput divided by what one consumer can handle, and enough for the largest consumer group you plan, with headroom (adding partitions later remaps keys). Too many partitions add metadata overhead, longer failovers and more open files, so don't go wildly over.

</details>

<details>
<summary>Does Kafka provide exactly-once delivery?</summary>

Within Kafka, yes: idempotent producers plus transactions atomically write outputs and consumer offsets, and readers use read_committed. For external side effects, no; you get at-least-once and make processing idempotent (store event IDs or offsets in the same database transaction).

</details>

<details>
<summary>What happens if a consumer takes longer than max.poll.interval.ms?</summary>

It is considered stuck and removed from the group; its partitions are reassigned, and uncommitted records are reprocessed by another consumer. If it keeps happening, the group falls into a rebalance loop. Fix by processing fewer records per poll, adding timeouts, or processing asynchronously.

</details>

<details>
<summary>How do you reduce the impact of rebalances?</summary>

Cooperative-sticky assignment (only moved partitions pause), static membership (`group.instance.id`) so restarts don't rebalance, fast poll loops, sensible session timeouts, committing offsets on revoke, and idempotent handlers.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Quorum | 2f + 1 nodes tolerate f failures |
| Raft | Heartbeats, random timeouts, 1 vote/term, majority commit |
| Fencing | Increasing token; storage rejects stale |
| Rate limiting | Token bucket (bursts) · leaky (smooth) · fixed (cheap) · sliding log (exact) · sliding counter (balanced) |
| Distributed RL | Redis + Lua, shard by key, fail-open decision |
| Queue patterns | Work queue · pub/sub · request-reply · delayed · priority |
| Delivery | At-least-once + idempotent consumer |
| Failure handling | Backoff retries, DLQ, replay |
| Kafka basics | Topic → partitions → offsets; key → partition |
| Kafka durability | RF 3, `acks=all`, `min.insync.replicas=2`, no unclean election |
| Kafka producer | Idempotence on; batch + linger + zstd/lz4 |
| Kafka consumer | Manual commit after processing; poll within interval |
| Rebalancing | Cooperative-sticky + static membership |

## Quiz

```quiz
[
  {"q": "A 5-node Raft cluster can tolerate how many failed nodes?", "options": ["1", "2", "3", "4"], "answer": 1, "why": "A majority (3) must remain; 5 = 2f + 1 → f = 2."},
  {"q": "Which rate-limiting algorithm lets a client burst up to a capacity and then enforces a steady average?", "options": ["Fixed window", "Token bucket", "Leaky bucket", "Sliding log"], "answer": 1, "why": "Accumulated tokens allow bursts; refill rate sets the average."},
  {"q": "A message fails every time it's processed. Where should it end up?", "options": ["Retried forever", "Deleted silently", "Dead-letter queue", "Back at the head of the queue"], "answer": 2, "why": "Park it for investigation and replay instead of blocking or looping."},
  {"q": "Topic has 8 partitions; a consumer group has 12 consumers. How many are idle?", "options": ["0", "4", "8", "12"], "answer": 1, "why": "Each partition goes to one consumer in the group; 4 have nothing to do."},
  {"q": "Which producer setting prevents duplicates caused by retries?", "options": ["acks=0", "linger.ms", "enable.idempotence=true", "compression.type"], "answer": 2, "why": "Sequence numbers let the broker drop duplicate batches."},
  {"q": "Committing offsets before processing gives…", "options": ["At-most-once", "At-least-once", "Exactly-once", "Nothing"], "answer": 0, "why": "A crash during processing skips those records."},
  {"q": "Which setting lets a restarted consumer reclaim its partitions without a rebalance?", "options": ["auto.offset.reset", "group.instance.id (static membership)", "fetch.min.bytes", "acks"], "answer": 1, "why": "Static members that return within the session timeout keep their assignment."}
]
```
