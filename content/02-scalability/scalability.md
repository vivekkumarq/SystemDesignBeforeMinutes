A system is scalable if it can handle more work by adding resources, without a redesign and without performance collapsing. There are two ways to add resources, and almost every large system ends up using both.

## Vertical scaling: a bigger machine

Vertical scaling (scaling **up**) means giving one server more CPU, RAM, faster disks or a faster network card.

```mermaid
flowchart LR
  A["Server<br/>4 CPU · 16 GB"] -->|scale up| B["Server<br/>64 CPU · 512 GB"]
```

**Why people like it**
- No code changes. The application does not know it moved.
- No distributed-systems problems: one machine, one copy of the data, transactions just work.
- Often the cheapest first step. Upgrading a database from 8 to 32 cores can buy a year of growth in an afternoon.

**Why it runs out**
- **Hard ceiling.** The biggest machine you can buy or rent is finite.
- **Cost grows faster than capacity.** High-end hardware costs disproportionately more.
- **Single point of failure.** One machine failing means total downtime.
- **Downtime to upgrade**, unless you have a failover setup.

> [!REAL] Swapping a hatchback for a bus
> When your family grows, you can buy a bigger car. That works until you need a bus, and there is no "bigger bus". Stack Overflow famously ran for years on a handful of very powerful servers; vertical scaling goes surprisingly far.

## Horizontal scaling: more machines

Horizontal scaling (scaling **out**) means adding more servers and spreading the work across them.

```mermaid
flowchart LR
  U[Users] --> LB[Load balancer]
  LB --> S1[Server 1]
  LB --> S2[Server 2]
  LB --> S3[Server 3]
  LB -.add more.-> S4[Server N]
```

**Why it wins at scale**
- **Near-unlimited capacity.** Need twice the throughput? Add twice the servers.
- **Fault tolerance.** One server dying removes a fraction of capacity, not all of it.
- **Commodity hardware** and cloud autoscaling, so you pay for what you use.

**What it costs**
- **The application must be designed for it.** Servers must be (mostly) stateless so any one can handle any request.
- **Distributed-systems complexity.** Data split across machines brings replication lag, partial failures, consistency questions and network partitions.
- **More operational work:** load balancers, service discovery, monitoring many nodes.

> [!REAL] A fleet of autos
> Instead of one bus, use 20 autos. If one breaks down, the others keep going, and on festival days you call in more. Google Search runs on many thousands of ordinary machines rather than one giant one.

## Side by side

| | Vertical | Horizontal |
|---|---|---|
| How | Bigger machine | More machines |
| Limit | Hardware ceiling | Practically none |
| Complexity | Low | High |
| Failure impact | Total outage | Partial capacity loss |
| Code changes | None | Statelessness, partitioning |
| Data consistency | Easy | Needs thought |
| Typical use | Databases early on, caches, quick wins | Web/app tiers, large data stores |

## Making a service horizontally scalable

### 1. Make the app tier stateless
Any state that lives in a server's memory (sessions, uploaded files, in-memory caches that must be correct) ties a user to that server. Move it out:
- Sessions → a shared store (Redis) or self-contained tokens (JWT).
- Files → object storage (S3-style).
- Shared caches → a distributed cache.

Once the servers are stateless, the load balancer can send any request anywhere and autoscaling becomes trivial. See [Stateful vs Stateless](#/l/09-tradeoffs/stateful-vs-stateless).

> [!REAL] Hotel room keys
> A hotel doesn't remember which guest is in which room at the door; your key card carries the information. A stateless server reads the session from a token or from Redis, so any server can handle your next click.

### 2. Scale the data tier in stages
The database is almost always the hardest part. A typical progression:

1. **Vertical scaling** of the primary.
2. **Caching** the hottest reads.
3. **Read replicas** to spread read traffic.
4. **Functional partitioning**: separate databases for separate services (users, orders, payments).
5. **Sharding**: split one big table across many databases by a key.

Each step adds complexity, so take the next one only when the numbers say you need it.

> [!REAL] A shop growing into a chain
> First you hire a helper (read replica), then you open a second counter (cache), and only when the shop is bursting do you open branches in other cities (sharding). Each step is more work, so take them in order.

### 3. Move slow work off the request path
Sending emails, resizing images, updating search indexes: put them on a queue and let workers do them. The web tier stays fast, and you can scale workers separately.

> [!REAL] The dry-cleaner's receipt
> The dry-cleaner doesn't make you wait while they clean your shirt; they give you a receipt and you collect it later. When you upload a YouTube video you get "Processing…" immediately while workers transcode it in the background.

## Scalability is more than capacity

A system can have plenty of servers and still not scale because of:
- **A shared bottleneck:** one database, one lock, one counter row everyone updates.
- **Hot keys:** a celebrity account or a viral product sending all traffic to one shard.
- **Coordination overhead:** if every request needs agreement among many nodes, adding nodes makes it slower.
- **Fan-out:** a request that calls 50 services is only as fast as the slowest of them.

> [!INTERVIEW] What a good answer sounds like
> "I'd start by scaling the stateless API tier horizontally behind a load balancer, which is easy. The database is the real constraint. At 5K writes per second a single well-tuned primary with read replicas is fine; I'd only shard when writes or data size outgrow one machine, and I'd shard by user ID because almost every query is per user."

> [!REAL] One billing counter
> A supermarket can have 50 aisles, but if there's only one billing counter, the queue still goes out the door. A single shared database table or a global lock is that billing counter.

## Key takeaways

- Vertical scaling is simple but capped and a single point of failure.
- Horizontal scaling is nearly unlimited but needs stateless services and careful data design.
- Make the app tier stateless first; scale the database in stages.
- Look for shared bottlenecks and hot spots; more machines do not fix those.
