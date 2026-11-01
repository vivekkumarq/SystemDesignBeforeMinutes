Answer aloud first, then open each to compare.

## Interview questions

<details>
<summary>Explain cache-aside. What are its weaknesses?</summary>

The application checks the cache; on a miss it reads the database and populates the cache with a TTL. On writes it updates the database and deletes the key. Weaknesses: the first read of each key is slow; there is a staleness window; races can re-insert old data after a delete; and every service must implement the logic.

</details>

<details>
<summary>Write-through vs write-behind: when would you use each?</summary>

Write-through writes cache and database synchronously: fresh cache, slower writes; use for data read right after it is written. Write-behind acknowledges after writing the cache and flushes later: fastest writes and batching, but data can be lost if the cache fails; use only for loss-tolerant data such as counters and analytics.

</details>

<details>
<summary>Why delete the cache key on update instead of setting the new value?</summary>

With concurrent writers, two "set" operations can arrive in a different order from their database writes, leaving the older value cached indefinitely. Deleting forces the next reader to load the current value from the database. Keep a TTL as a backstop for the remaining read/delete race.

</details>

<details>
<summary>What is a cache stampede and how do you prevent it?</summary>

A hot key expires and many concurrent requests all miss and hit the database to rebuild the same value. Prevent with single-flight (one rebuild per key via a lock or in-process future), stale-while-revalidate, probabilistic early refresh, or pre-warming hot keys.

</details>

<details>
<summary>Cache penetration vs cache avalanche?</summary>

Penetration: requests for keys that don't exist anywhere, so every request reaches the database. Fix with negative caching, Bloom filters and validation. Avalanche: many keys expire together or the cache goes down, so the full load moves to the database. Fix with TTL jitter, an HA cache, warm-up and database protection (rate limits, circuit breakers).

</details>

<details>
<summary>How do you handle a hot key in Redis?</summary>

A small in-process cache in front for that key; split it into several replicated keys on different nodes and read one at random; add read replicas; detect hot keys proactively. For counters, shard the counter and sum on read.

</details>

<details>
<summary>LRU vs LFU?</summary>

LRU evicts the least recently used item: simple, good default, but hurt by one-off scans. LFU evicts the least frequently used: keeps long-term favourites and resists scans, but old popular items can linger without decay and new items struggle to stay. Modern caches use hybrids such as W-TinyLFU.

</details>

<details>
<summary>How would you implement an LRU cache with O(1) operations?</summary>

A hash map from key to node, plus a doubly linked list ordered by recency. Get: look up the node, move it to the head. Put: insert or update at the head; if over capacity, remove the tail node and its map entry. Both are O(1).

</details>

<details>
<summary>What should not be cached?</summary>

Values that must be exactly current (balances during transfers, inventory at checkout), data that changes on nearly every read, rarely re-read data, and sensitive data in shared caches without proper keying and access control.

</details>

<details>
<summary>Your hit ratio dropped from 95% to 70% after a deploy. How do you investigate?</summary>

Compare per-prefix hit ratios to find which data changed; check whether key formats or serialisation changed (old keys no longer match); check TTL and eviction-policy changes; look at eviction rate and memory (a new large value type can push out hot data); check whether a new code path bypasses the cache or deletes keys too broadly.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Layers | Browser → CDN → proxy → app (local) → Redis → DB buffer pool |
| Default pattern | Cache-aside + update DB then delete key + TTL with jitter |
| Write-through | Fresh, slower writes |
| Write-behind | Fast writes, possible loss |
| Write-around | Skip cache on write; load on read |
| Eviction | LRU (default) · LFU · TinyLFU · random · FIFO |
| Invalidation | TTL · delete-on-write · events/CDC · versioned keys |
| Stampede | Single flight, stale-while-revalidate |
| Avalanche | Jitter, HA, protect DB |
| Penetration | Negative cache, Bloom filter |
| Hot key | Local cache, key splitting |
| Metrics | Hit ratio, p99, evictions, memory, per-node ops |

## Quiz

```quiz
[
  {"q": "In cache-aside, who loads data into the cache on a miss?", "options": ["The database", "The cache itself", "The application", "A background job only"], "answer": 2, "why": "The application reads the database and writes the result to the cache."},
  {"q": "Which write strategy risks losing data if the cache node dies?", "options": ["Write-through", "Write-around", "Write-behind", "Cache-aside"], "answer": 2, "why": "Writes are acknowledged before they reach the database."},
  {"q": "Many keys were loaded at startup with the same 1-hour TTL. An hour later the DB is overwhelmed. What is this, and the simplest fix?", "options": ["Penetration, Bloom filter", "Avalanche, TTL jitter", "Hot key, key splitting", "Big key, compression"], "answer": 1, "why": "Synchronized expiry is an avalanche; randomising TTLs spreads the reloads."},
  {"q": "Attackers request random non-existent user IDs. Which helps most?", "options": ["Longer TTLs", "LFU eviction", "Bloom filter + negative caching", "Write-through"], "answer": 2, "why": "Reject or cache misses for keys that don't exist so they never hit the database."},
  {"q": "Hit ratio rises from 90% to 99%. Database read load from cacheable reads…", "options": ["Falls by 9%", "Halves", "Falls about 10×", "Doesn't change"], "answer": 2, "why": "Misses go from 10% to 1% of reads."},
  {"q": "Which is the safer write order with cache-aside?", "options": ["Delete key, then update DB", "Update DB, then delete key", "Update cache, then DB", "Only update cache"], "answer": 1, "why": "Deleting first lets a concurrent reader re-cache the old value before the update lands."}
]
```
