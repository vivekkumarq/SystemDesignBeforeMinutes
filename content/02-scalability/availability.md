Everything fails eventually: disks, servers, network links, whole data centres, and most often, deployments. **High availability** is about keeping the service usable anyway. **Fault tolerance** is the set of techniques that make that possible.

## Availability in numbers

Availability = uptime ÷ total time. The industry talks in "nines":

| Target | Allowed downtime per year | Per month |
|---|---|---|
| 99.9% | 8.8 hours | 44 minutes |
| 99.95% | 4.4 hours | 22 minutes |
| 99.99% | 53 minutes | 4.4 minutes |
| 99.999% | 5 minutes | 26 seconds |

At four nines and above, a human cannot even notice and respond to a failure in time. Recovery has to be **automatic**.

> [!REAL] What each nine feels like
> 99% means your bank app is down for more than 3½ days a year. 99.99% means under an hour a year. Telling the difference between those is why every extra nine costs real money.

### Availability of combined components

**In series** (a request needs A *and* B), availabilities multiply, so the total gets worse:

```text
API 99.9% × DB 99.9% × Cache 99.9% = 99.7%
```

**In parallel** (A *or* B can serve), the chance of both failing is tiny, so the total gets better:

```text
Two replicas at 99% each: 1 − (0.01 × 0.01) = 99.99%
```

This is the maths behind redundancy: every dependency on the request path lowers your availability; every redundant copy raises it.

> [!REAL] Christmas lights in series
> Old Christmas lights wired in series all go dark if one bulb fails. A request that passes through five services in a row is the same: each one's downtime adds up. Run things in parallel (redundant copies) to stay lit.

## Techniques for fault tolerance

### 1. Redundancy everywhere
No single point of failure. At least two of every critical component, ideally spread across **availability zones** (separate data centres in one region with independent power and networking).

- **Active-active:** all copies serve traffic. Full use of capacity; failover is instant because traffic simply stops going to the failed node.
- **Active-passive:** a standby waits. Simpler for stateful systems such as a database primary, but the standby is idle and failover takes seconds to minutes.

> [!REAL] Two kidneys
> The body survives with one kidney because it was given two. Hospitals have generators *and* UPS; airlines carry two pilots. Critical systems keep a second copy of everything that matters.

### 2. Automatic failover
Detect the failure (health checks, heartbeats) and promote a replacement without a human. The hard parts:
- **False positives:** a slow node is not a dead node. Failing over too eagerly can cause flapping.
- **Split brain:** two nodes both believe they are the primary and both accept writes. Prevented with quorum-based leader election and fencing. See [Leader Election & Raft](#/l/08-distributed/leader-election).

> [!REAL] The vice-captain
> When the captain leaves the field injured, the vice-captain takes over immediately; the match doesn't stop for a board meeting. Database failover promotes a replica without waiting for a human at 3 a.m.

### 3. Replication
Copies of data on several machines so losing one does not lose data or availability. Synchronous replication protects every write but adds latency; asynchronous is faster but can lose the last few writes on failover.

### 4. Isolation and bulkheads
Keep failures contained. Separate thread pools or connection pools per dependency, so a slow payment provider cannot use up every thread and take down the product catalogue too. Separate "cells" of users so one bad shard affects a slice of customers, not all of them.

> [!REAL] Watertight compartments in a ship
> Ships are divided into sealed compartments so one leak doesn't sink the whole ship. The Titanic's compartments weren't sealed at the top, and the water spilled over from one to the next. Separate thread pools per dependency are those sealed walls.

### 5. Timeouts, retries and circuit breakers
- **Timeouts** on every network call. Without them, one slow dependency ties up resources indefinitely.
- **Retries with exponential backoff and jitter**, only for idempotent operations, with a cap. Unbounded retries turn a small outage into a retry storm.
- **Circuit breakers:** after repeated failures, stop calling the dependency for a while and fail fast (or serve a fallback), then probe to see whether it has recovered.

```mermaid
stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failures exceed threshold
  Open --> HalfOpen: after cool-down
  HalfOpen --> Closed: trial calls succeed
  HalfOpen --> Open: trial call fails
```

> [!REAL] The fuse box at home
> When a short circuit happens, the fuse trips and cuts power to that circuit instead of setting the house on fire. A circuit breaker stops calling a failing service for a while, so one sick dependency doesn't take down everything.

### 6. Graceful degradation
When something breaks, drop the nice-to-have and keep the core. If recommendations are down, show popular items. If the "people also bought" service times out, render the product page without it. Users rarely notice a missing widget; they always notice an error page.

> [!REAL] Netflix without recommendations
> If Netflix's personalised recommendation service fails, you still see a generic "Popular on Netflix" row and can still play videos. The non-essential feature degrades; the core keeps working.

### 7. Load shedding and rate limiting
When overloaded, reject some requests quickly (HTTP 429/503) rather than letting every request slow to a crawl. Prioritise: shed analytics before checkout.

> [!REAL] Closing the gates when the stadium is full
> When the stadium is full, the police close the gates. A few people are turned away, but the people inside are safe. Shedding low-priority requests during overload keeps checkout working.

### 8. Multi-region
To survive a whole region failing, run in at least two. Costly and complex (data replication across regions, conflict handling), so reserve it for services that truly need it.

> [!REAL] A second office in another city
> A company with offices in Mumbai and Hyderabad keeps working if a flood shuts the Mumbai office. AWS's us-east-1 region has had several big outages; companies that also ran in another region stayed up.

## Disaster recovery terms

- **RTO (Recovery Time Objective):** how quickly service must be restored.
- **RPO (Recovery Point Objective):** how much data loss is acceptable, measured in time.

| Strategy | RTO | RPO | Cost |
|---|---|---|---|
| Backups only | Hours to days | Hours | Low |
| Pilot light (minimal standby) | Tens of minutes | Minutes | Medium |
| Warm standby (scaled-down copy) | Minutes | Seconds to minutes | Higher |
| Active-active multi-region | Seconds | ~0 | Highest |

> [!REAL] The office fire drill
> RTO is "how fast must we be working again?" (e.g. back within 1 hour). RPO is "how much work can we lose?" (e.g. at most the last 5 minutes). A bank needs an RPO of zero; a blog can live with a day.

## Don't forget the most common cause of outages

Most incidents are caused by **changes**: deployments, config pushes, migrations. Availability practices therefore include:
- Canary and progressive rollouts, with automatic rollback on error spikes.
- Feature flags to turn off a bad feature without redeploying.
- Testing failure on purpose (chaos engineering) so failover paths actually work when needed.

> [!INTERVIEW] A strong answer to "how do you make this highly available?"
> "No single points of failure: at least two instances of each stateless service across three AZs behind a redundant load balancer. The database has a synchronous standby in another AZ with automatic failover via a quorum. Every external call has a timeout, bounded retries and a circuit breaker. If recommendations fail we degrade to popular items. Deploys go out as canaries with automatic rollback."

> [!REAL] The 2024 CrowdStrike update
> In July 2024 one faulty CrowdStrike update crashed about 8.5 million Windows machines, grounding flights and stopping hospitals. No hardware failed; a change did. That's why careful, staged rollouts are an availability practice.

## Key takeaways

- Each nine costs about ten times more; above three nines, recovery must be automatic.
- Components in series lower availability; redundant components in parallel raise it.
- Redundancy, failover, isolation, timeouts, circuit breakers and graceful degradation work together.
- Know RTO and RPO, and remember that deployments cause most outages.
