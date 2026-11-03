A cache is a small, fast store that keeps copies of data that is expensive to fetch or compute, so the next request can be served quickly. Caching is the single most effective performance tool in system design, and it appears at every layer between the user's screen and the disk.

## Why caching works

Two facts make caches effective:
1. **Speed gap.** Memory is roughly 1,000× faster than SSD and 100,000× faster than a cross-continent round trip. See [Latency Numbers](#/l/01-fundamentals/latency-numbers).
2. **Skewed access.** A small fraction of data gets most of the traffic. The top 1% of products, posts or profiles often receive the majority of reads. Cache that 1% and most requests never reach the database.

The key metric is the **hit ratio**: the share of requests answered by the cache. At 95%, the backend sees only 1 in 20 requests.

> [!REAL] The pareto rule of your fridge
> You use 20% of the items in your kitchen 80% of the time, so those stay on the counter. On Netflix, a small fraction of titles get most of the views, so caching that small set serves most requests.

## Caching at every layer

```mermaid
flowchart LR
  B["Browser cache"] --> CDN["CDN edge"]
  CDN --> RP["Reverse proxy / gateway cache"]
  RP --> APP["Application<br/>in-process cache"]
  APP --> DC["Distributed cache<br/>(Redis / Memcached)"]
  DC --> DB["Database<br/>buffer pool / query cache"]
  DB --> OS["OS page cache · disk cache"]
```

| Layer | What it caches | Controlled by | Typical latency saved |
|---|---|---|---|
| **Browser / client** | Static files, API responses, images | `Cache-Control`, `ETag` headers; app storage | Whole network round trip |
| **DNS** | Name → IP lookups | TTL on records | A DNS round trip per request |
| **CDN** | Static assets, video, cacheable API responses | Cache headers, CDN rules | Long-distance trips to the origin |
| **Reverse proxy / API gateway** | Full HTTP responses | Proxy config | App and DB work |
| **Application (in-process)** | Config, hot lookups, computed results | App code (e.g. Caffeine, Guava) | A network hop to Redis |
| **Distributed cache** | Query results, sessions, objects, computed views | App code | Database queries |
| **Database** | Data pages, indexes, query plans | DB engine | Disk reads |
| **Hardware / OS** | Disk blocks, CPU caches | OS / hardware | Disk and memory access |

### Client-side caching
The fastest request is one never made. HTTP headers tell browsers and CDNs what to keep:
- `Cache-Control: public, max-age=31536000, immutable` for versioned assets like `app.3f9a.js`.
- `Cache-Control: no-cache` + `ETag` for HTML: the browser revalidates each time, but if nothing changed the server replies `304 Not Modified` with no body.
- `Cache-Control: private` for user-specific data that a shared CDN must not store.

> [!REAL] Your browser remembering the logo
> The second time you open Amazon, the logo and scripts load from your browser's own cache, not the internet. That's why the second visit feels faster.

### In-process vs distributed caches

| | In-process (local memory) | Distributed (Redis, Memcached) |
|---|---|---|
| Speed | Fastest (nanoseconds to microseconds) | ~0.5–1 ms network round trip |
| Shared across servers | No; each instance has its own copy | Yes |
| Consistency | Copies drift; hard to invalidate everywhere | One copy to update |
| Capacity | Limited by each server's heap | Scales out across a cluster |
| Survives app restart | No | Yes |

A common combination is **two-level caching**: a tiny, short-TTL local cache for the hottest keys in front of a shared Redis cluster.

> [!REAL] Your own notebook vs the shared whiteboard
> In-process cache is your personal notebook: instant, but nobody else sees it and it's gone when you leave. A distributed cache like Redis is the office whiteboard: a few steps away, but everyone sees the same thing.

### Redis vs Memcached
- **Memcached:** simple, multi-threaded key-value cache of strings. Great for plain object caching.
- **Redis:** rich data structures (hashes, lists, sets, sorted sets, streams, HyperLogLog), optional persistence, replication, Lua scripting, pub/sub. Used for caches, leaderboards, rate limiters, queues and locks. The default choice today.

> [!REAL] A Swiss knife vs a kitchen knife
> Memcached is a sharp kitchen knife: simple key-value caching, very fast. Redis is a Swiss army knife: lists, sorted sets for leaderboards, counters, pub/sub and persistence.

## What to cache, and what not to

**Good candidates**
- Read often, changed rarely: product details, user profiles, configuration.
- Expensive to compute: rendered pages, aggregated counts, recommendation lists.
- Tolerant of slight staleness.

**Poor candidates**
- Data that changes on almost every read.
- Data that must be exactly current (account balances during a transfer).
- Huge, rarely reused results (low hit ratio, wasted memory).
- Highly personalised results with no reuse across requests (unless cached per user and reused).

> [!REAL] Menu card vs bill
> A restaurant prints the menu once and hands out copies (cacheable: same for everyone, rarely changes). It never photocopies your bill for the next customer (personal, changes every time).

## The costs of caching

Caching is not free:
- **Staleness:** the cache may serve an old value. You must decide how stale is acceptable and how to invalidate. See [Cache Invalidation Strategies](#/l/04-caching/invalidation).
- **Complexity:** another system to run, monitor and keep consistent.
- **Failure modes:** stampedes, cold starts, hot keys. See [Stampedes, Penetration & Hot Keys](#/l/04-caching/challenges).
- **Masked capacity problems:** if the database can only cope because the cache absorbs 95% of reads, a cache outage becomes a database outage. Plan for that.

> [!INTERVIEW] State where and why
> "Product pages are read 1,000× more often than they change, so I'll cache product JSON in Redis with cache-aside and a 10-minute TTL, invalidating on update. Images and the JS bundle go through the CDN with long max-age and versioned filenames. Prices and stock are read from the database at checkout, never from cache."

## Key takeaways

- Caching works because memory is fast and access is skewed.
- Caches exist at every layer: client, CDN, proxy, app, distributed cache, database.
- Choose what to cache by read frequency, cost to produce and tolerance for staleness.
- Every cache brings staleness and new failure modes; design for both.
