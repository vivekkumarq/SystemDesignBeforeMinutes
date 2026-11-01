System design has its own vocabulary. You will use these words in every interview, so it pays to know them precisely. Each term below has a plain definition, a concrete example and the trap people fall into.

## Performance

### Latency
The time one request takes, from the moment it is sent until the response arrives. Measured in milliseconds.

Always talk about latency as a **percentile**, not an average. The *p50* (median) is what a typical user sees. The *p99* is what the slowest 1 in 100 requests sees. An average of 80 ms can hide a p99 of 2 seconds, and at scale that 1% is thousands of unhappy people every minute.

### Throughput
How much work the system finishes per unit of time: requests per second (RPS), queries per second (QPS), messages per second, megabytes per second.

Latency and throughput are related but different. A highway has a fixed travel time (latency) but adding lanes raises how many cars pass per hour (throughput). See [Latency vs Throughput](#/l/09-tradeoffs/latency-vs-throughput).

### Bandwidth
The maximum rate a network link can carry, e.g. 10 Gbps. Throughput is what you actually push through; bandwidth is the ceiling.

## Scale

### Scalability
The ability to handle more load by adding resources. A system scales well if doubling the machines roughly doubles the capacity.

- **Vertical scaling (scale up):** a bigger machine. Simple, but there is a ceiling and a single point of failure.
- **Horizontal scaling (scale out):** more machines. Almost unlimited, but the software has to be designed for it.

Details in [Scalability: Vertical vs Horizontal](#/l/02-scalability/scalability).

### Elasticity
Scaling *automatically* up and down as load changes, typically in the cloud. Scalability is the ability; elasticity is doing it on its own, both directions, so you stop paying for idle machines at 3 a.m.

## Reliability

### Availability
The fraction of time the system is usable. Usually expressed as "nines":

| Availability | Downtime per year | Downtime per month |
|---|---|---|
| 99% (two nines) | 3.65 days | 7.3 hours |
| 99.9% (three nines) | 8.8 hours | 43.8 minutes |
| 99.99% (four nines) | 52.6 minutes | 4.4 minutes |
| 99.999% (five nines) | 5.3 minutes | 26 seconds |

Each extra nine is roughly ten times harder and more expensive than the last.

### Reliability
The probability the system does the *right* thing over time. A service that always responds but sometimes returns the wrong balance is available but not reliable.

### Fault tolerance
The system keeps working when parts of it fail. Achieved through **redundancy** (more than one copy of everything important) and **failover** (switching to the spare automatically).

### Single point of failure (SPOF)
Any component whose failure takes the whole system down. A single database, one load balancer, one region. Finding and removing SPOFs is a standard part of every design.

### Redundancy
Running extra copies of a component so one can fail without an outage. **Active-active**: all copies serve traffic. **Active-passive**: a standby waits and takes over on failure.

## Data

### Consistency
In distributed systems this word usually means: after a write, do all readers see the new value?

- **Strong consistency:** every read returns the latest write. Simple to reason about, slower and less available.
- **Eventual consistency:** replicas converge over time; a read may briefly return old data. Faster, more available.

Do not confuse this with the "C" in ACID, which means the database never violates its rules (constraints, foreign keys).

### Replication
Keeping copies of the same data on several machines, for availability and read scaling. See [Replication](#/l/03-databases/replication).

### Partitioning / sharding
Splitting data across machines so each holds only part of it, for write scaling and to fit more data than one machine can hold. See [Sharding](#/l/03-databases/sharding).

### Durability
Once the system says a write succeeded, the write survives crashes. Achieved by writing to disk (often a write-ahead log) and replicating before acknowledging.

### Idempotency
An operation is idempotent if doing it twice has the same effect as doing it once. `SET balance = 100` is idempotent. `ADD 10 TO balance` is not. Networks retry, so anything that matters (payments, orders) must be made idempotent, usually with an **idempotency key**.

## Architecture

### Stateless vs stateful
A **stateless** service keeps nothing about the user between requests; any instance can serve any request, so you can add or remove instances freely. A **stateful** service remembers things (a WebSocket connection, a game session), which makes scaling and failover harder.

### Load balancer
Spreads incoming requests across many servers and stops sending traffic to unhealthy ones.

### Cache
A small, fast store holding copies of frequently read data so you do not recompute or refetch it.

### CDN
A network of servers around the world that caches static content (images, video, scripts) close to users.

### Message queue
A buffer between services: the producer drops a message in, the consumer processes it later. Decouples services and absorbs traffic spikes.

### Microservices
Splitting an application into small services that are deployed independently, each owning its own data. The opposite of a **monolith**.

### API gateway
The single entry point in front of many services. Handles routing, authentication, rate limiting and request shaping.

## Operations

### SLI, SLO, SLA
- **SLI** (indicator): a measurement, e.g. "p99 latency" or "percentage of successful requests".
- **SLO** (objective): your internal target, e.g. "99.9% of requests succeed each month".
- **SLA** (agreement): a contract with customers, with penalties if missed. SLAs are set looser than SLOs to leave a safety margin.

### Backpressure
A way for a slow component to tell a fast one to slow down, instead of being overwhelmed. Bounded queues and rate limits are forms of backpressure.

### Observability
Being able to understand what the system is doing from the outside, through **logs**, **metrics** and **traces**.

> [!INTERVIEW] Use the words precisely
> Saying "we need consistency here" is vague. Saying "the balance read after a transfer must be strongly consistent, but the transaction history page can be eventually consistent with a few seconds of lag" shows you know exactly what the word means.

## Key takeaways

- Quote latency as percentiles, especially p99.
- Availability is measured in nines; each nine costs about ten times more.
- Consistency in distributed systems is about what readers see after a write.
- Idempotency is what makes retries safe.
