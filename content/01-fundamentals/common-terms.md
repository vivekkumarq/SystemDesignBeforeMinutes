System design has its own vocabulary. You will use these words in every interview, so it pays to know them precisely. Each term below has a plain definition, a concrete example and the trap people fall into.

## Performance

### Latency
The time one request takes, from the moment it is sent until the response arrives. Measured in milliseconds.

Always talk about latency as a **percentile**, not an average. The *p50* (median) is what a typical user sees. The *p99* is what the slowest 1 in 100 requests sees. An average of 80 ms can hide a p99 of 2 seconds, and at scale that 1% is thousands of unhappy people every minute.

> [!REAL] Ordering on Swiggy
> You tap "Place order" and the spinner turns for 1.2 seconds before "Order confirmed" appears. That 1.2 s is the latency of one request. If most people see 300 ms but 1 in 100 see 6 s (the p99), those are the people who tap twice and get charged twice.

### Throughput
How much work the system finishes per unit of time: requests per second (RPS), queries per second (QPS), messages per second, megabytes per second.

Latency and throughput are related but different. A highway has a fixed travel time (latency) but adding lanes raises how many cars pass per hour (throughput). See [Latency vs Throughput](#/l/09-tradeoffs/latency-vs-throughput).

> [!REAL] A toll plaza on the highway
> Latency is how long one car waits at the booth. Throughput is how many cars the whole plaza clears per hour. FASTag didn't make the road shorter; it made each booth clear more cars per minute.

### Bandwidth
The maximum rate a network link can carry, e.g. 10 Gbps. Throughput is what you actually push through; bandwidth is the ceiling.

> [!REAL] The water pipe
> Bandwidth is the width of the pipe into your house (your "100 Mbps" plan). Throughput is the water actually flowing when you open the tap. A Netflix 4K stream needs about 15–25 Mbps, so on a 10 Mbps plan it drops to HD no matter how fast Netflix's servers are.

## Scale

### Scalability
The ability to handle more load by adding resources. A system scales well if doubling the machines roughly doubles the capacity.

- **Vertical scaling (scale up):** a bigger machine. Simple, but there is a ceiling and a single point of failure.
- **Horizontal scaling (scale out):** more machines. Almost unlimited, but the software has to be designed for it.

Details in [Scalability: Vertical vs Horizontal](#/l/02-scalability/scalability).

> [!REAL] A restaurant on a Friday night
> Vertical scaling is replacing your one cook with a faster one; there is only so fast a human can chop. Horizontal scaling is hiring five more cooks. That only works if the kitchen is organised so any cook can take any order.

### Elasticity
Scaling *automatically* up and down as load changes, typically in the cloud. Scalability is the ability; elasticity is doing it on its own, both directions, so you stop paying for idle machines at 3 a.m.

> [!REAL] Cab surge on a rainy evening
> When it rains in Bengaluru, ride requests jump 3×. An elastic system adds servers automatically at 6 p.m. and removes them at midnight, the way more drivers come online when surge pricing kicks in.

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

> [!REAL] The ATM outside your house
> If the ATM works 99% of the time, it's "down" for about 3.6 days a year. That's annoying for an ATM and unacceptable for UPI, which is why payment systems aim for 99.95% or better.

### Reliability
The probability the system does the *right* thing over time. A service that always responds but sometimes returns the wrong balance is available but not reliable.

> [!REAL] Available but wrong
> An ATM that always dispenses cash but sometimes debits your account twice is *available* but not *reliable*. Users forgive "try again later" far more easily than a wrong bank balance.

### Fault tolerance
The system keeps working when parts of it fail. Achieved through **redundancy** (more than one copy of everything important) and **failover** (switching to the spare automatically).

> [!REAL] A plane with two engines
> A twin-engine aircraft can lose one engine and still land safely. Your system should treat a dead server the same way: inconvenient, not a disaster.

### Single point of failure (SPOF)
Any component whose failure takes the whole system down. A single database, one load balancer, one region. Finding and removing SPOFs is a standard part of every design.

> [!REAL] One key for the office
> If only one person holds the office key and they're sick, nobody gets in. In 2021, a single bad configuration change at Facebook took down Facebook, WhatsApp and Instagram for about six hours, because the network setup everything depended on had no independent fallback.

### Redundancy
Running extra copies of a component so one can fail without an outage. **Active-active**: all copies serve traffic. **Active-passive**: a standby waits and takes over on failure.

> [!REAL] A spare tyre
> Active-passive is the spare tyre in the boot: idle until a puncture. Active-active is a truck with double rear wheels, where both carry the load all the time and the truck keeps going if one blows out.

## Data

### Consistency
In distributed systems this word usually means: after a write, do all readers see the new value?

- **Strong consistency:** every read returns the latest write. Simple to reason about, slower and less available.
- **Eventual consistency:** replicas converge over time; a read may briefly return old data. Faster, more available.

Do not confuse this with the "C" in ACID, which means the database never violates its rules (constraints, foreign keys).

> [!REAL] The joint bank account
> You and your partner share an account. You withdraw ₹5,000 in Delhi; a second later they check the balance in Mumbai. Strong consistency means they see the reduced balance. Eventual consistency means they might see the old balance for a moment, which is fine for a like count but not for a bank.

### Replication
Keeping copies of the same data on several machines, for availability and read scaling. See [Replication](#/l/03-databases/replication).

> [!REAL] Photocopies of an important document
> You keep your passport copy at home, in your email and with a parent. Lose one and the others survive. Databases do the same with copies of the data on different machines.

### Partitioning / sharding
Splitting data across machines so each holds only part of it, for write scaling and to fit more data than one machine can hold. See [Sharding](#/l/03-databases/sharding).

> [!REAL] Library shelves A–Z
> One shelf can't hold every book, so the library splits them by the author's surname: A–F on shelf 1, G–M on shelf 2, and so on. Each shelf (shard) holds part of the data, and the librarian knows which shelf to walk to.

### Durability
Once the system says a write succeeded, the write survives crashes. Achieved by writing to disk (often a write-ahead log) and replicating before acknowledging.

> [!REAL] Writing it down vs remembering it
> Telling a shopkeeper "I'll pay tomorrow" is memory (lost if he forgets). Writing it in his khata book is durable. A database's write-ahead log is that khata book: the write is on disk before it says "OK".

### Idempotency
An operation is idempotent if doing it twice has the same effect as doing it once. `SET balance = 100` is idempotent. `ADD 10 TO balance` is not. Networks retry, so anything that matters (payments, orders) must be made idempotent, usually with an **idempotency key**.

> [!REAL] The lift button
> Pressing the lift button five times calls the lift once. That's idempotent. A payment "Pay ₹500" button is *not* naturally idempotent, which is why payment APIs send an idempotency key, so a double tap charges you only once.

## Architecture

### Stateless vs stateful
A **stateless** service keeps nothing about the user between requests; any instance can serve any request, so you can add or remove instances freely. A **stateful** service remembers things (a WebSocket connection, a game session), which makes scaling and failover harder.

> [!REAL] Token counter vs personal banker
> At a stateless token counter, any clerk can serve your token number because everything needed is on the form you hand over. A personal banker is stateful: if they're on leave, nobody else knows your case. Stateless servers can be added or removed freely.

### Load balancer
Spreads incoming requests across many servers and stops sending traffic to unhealthy ones.

> [!REAL] The receptionist at a hospital
> Patients don't pick a doctor; the receptionist sends each one to a free doctor and stops sending people to a doctor who has gone home sick (a failed health check).

### Cache
A small, fast store holding copies of frequently read data so you do not recompute or refetch it.

> [!REAL] Keeping water bottles in the fridge
> Instead of walking to the kitchen tap every time, you keep a few bottles in your room. Instagram keeps your feed's first page in an in-memory cache like Redis so it doesn't rebuild it from the database every time you open the app.

### CDN
A network of servers around the world that caches static content (images, video, scripts) close to users.

> [!REAL] Amazon warehouses in every city
> Amazon doesn't ship every order from one warehouse in Seattle; it stocks popular items in a warehouse near you. A CDN like Cloudflare or Akamai does the same for images and videos: a Hotstar match highlight is served from a server in your city, not from Mumbai.

### Message queue
A buffer between services: the producer drops a message in, the consumer processes it later. Decouples services and absorbs traffic spikes.

> [!REAL] The order slip rail in a kitchen
> The waiter clips order slips on a rail and goes back to customers; cooks pick slips at their own pace. On a busy night the rail gets longer, but no order is lost and the waiter never waits for the cook. Zomato uses queues the same way, so a spike in orders doesn't crash restaurant notifications.

### Microservices
Splitting an application into small services that are deployed independently, each owning its own data. The opposite of a **monolith**.

> [!REAL] A food court vs one restaurant
> A monolith is one restaurant with one kitchen: simple, but if the kitchen floods, everything stops. Microservices are a food court: the pizza stall can close for repairs while the dosa counter keeps serving. Netflix and Amazon famously moved to hundreds of services.

### API gateway
The single entry point in front of many services. Handles routing, authentication, rate limiting and request shaping.

> [!REAL] The main gate of a gated society
> Every visitor enters through one gate. The guard checks who you are (authentication), how many visitors you've had today (rate limiting) and which tower you need (routing). Individual flats don't each need their own guard.

## Operations

### SLI, SLO, SLA
- **SLI** (indicator): a measurement, e.g. "p99 latency" or "percentage of successful requests".
- **SLO** (objective): your internal target, e.g. "99.9% of requests succeed each month".
- **SLA** (agreement): a contract with customers, with penalties if missed. SLAs are set looser than SLOs to leave a safety margin.

> [!REAL] The pizza delivery promise
> SLI: measured delivery time. SLO: the internal goal, "95% delivered in 30 minutes". SLA: the promise to the customer with a penalty, "late means free pizza". Internal targets (SLOs) are always stricter than the public promise (SLA), so you have a safety margin.

### Backpressure
A way for a slow component to tell a fast one to slow down, instead of being overwhelmed. Bounded queues and rate limits are forms of backpressure.

> [!REAL] The bouncer at a club
> When the club is full, the bouncer makes people wait outside instead of letting everyone in to crush the dance floor. A bounded queue that says "slow down" (or HTTP 429) is the system's bouncer.

### Observability
Being able to understand what the system is doing from the outside, through **logs**, **metrics** and **traces**.

> [!INTERVIEW] Use the words precisely
> Saying "we need consistency here" is vague. Saying "the balance read after a transfer must be strongly consistent, but the transaction history page can be eventually consistent with a few seconds of lag" shows you know exactly what the word means.

> [!REAL] A car dashboard
> Metrics are the speedometer and fuel gauge. Logs are the trip diary. Traces are the GPS route showing where you lost time. Without a dashboard you only find out about a problem when the car stops.

## Key takeaways

- Quote latency as percentiles, especially p99.
- Availability is measured in nines; each nine costs about ten times more.
- Consistency in distributed systems is about what readers see after a write.
- Idempotency is what makes retries safe.
