**The short version:** latency is how long one request takes; throughput is how many requests you finish per second. Techniques that raise throughput (batching, queueing, high utilisation) often raise latency, and the reverse.

## An analogy

A bus and a sports car travel the same road. The car gets one person there fastest (low latency). The bus moves fifty people per trip (high throughput) but you wait for it to fill and it stops often. Neither is "better"; it depends on what you're optimising.

> [!REAL] A bus vs a bike
> A bike gets one person across town in 15 minutes (low latency). A bus takes 40 minutes but moves 60 people at once (high throughput). Batching is choosing the bus.

## Where they pull against each other

| Technique | Throughput | Latency |
|---|---|---|
| **Batching** (Kafka `linger.ms`, bulk DB inserts) | ↑ fewer, larger operations | ↑ items wait for the batch |
| **Queueing** work for later | ↑ smooths and absorbs spikes | ↑ time spent waiting in queue |
| **High utilisation** (running servers at 90%) | ↑ more work per machine | ↑ sharply, as queues build up |
| **Compression** | ↑ less data moved | ± CPU cost vs network saving |
| **Parallelism / more servers** | ↑ | → unchanged or ↓ |
| **Caching** | ↑ | ↓ both improve |

### Utilisation and the queueing cliff
As a server approaches 100% utilisation, wait times grow non-linearly. In a simple queueing model, the average time in the system grows like `1 / (1 − utilisation)`:

```text
utilisation 50% → 2× the service time
utilisation 80% → 5×
utilisation 90% → 10×
utilisation 95% → 20×
```

That's why latency-sensitive services run at 50–70% peak utilisation, while batch systems happily run near 100%.

> [!REAL] A toll booth at 95%
> At 50% utilisation, cars barely wait. At 95%, every small surge creates a long jam. That's why servers are run at 60–70% CPU, not 95%.

### Little's Law
`concurrency = throughput × latency`. If a service handles 1,000 requests/s at 50 ms each, about 50 requests are in flight at any moment. Use it to size thread pools and connection pools, and to see that higher latency (e.g. a slow dependency) needs more concurrency to keep the same throughput.

> [!REAL] People in a café
> If 30 customers arrive per hour and each stays 20 minutes (⅓ hour), there are on average 10 people inside. Requests in flight = arrival rate × time each spends in the system.

## Which to optimise

**Optimise latency for**
- User-facing interactions: page loads, search-as-you-type, checkout, gaming, trading.
- Anything with tight SLOs on p99.

**Optimise throughput for**
- Batch jobs, ETL, data pipelines, log ingestion, video encoding, ML training.
- Background processing where nobody is waiting for an individual item.

**Many systems do both:** a low-latency synchronous path for the user, and high-throughput asynchronous pipelines behind it.

## Measuring correctly

- Latency: percentiles (p50, p95, p99), not averages.
- Throughput: sustained rate at an acceptable latency, not the absolute max. A system "handling 50K RPS" at a p99 of 8 seconds isn't really handling it.
- Plot latency against load to find the knee of the curve.

> [!INTERVIEW] Show you know the tension
> "The ingestion pipeline is throughput-bound, so producers batch with `linger.ms=50` and compression. The read API is latency-bound, so it runs at 60% CPU at peak, serves from cache and never waits on batches."

## Key takeaways

- Latency = time per request; throughput = requests per unit time.
- Batching, queueing and high utilisation trade latency for throughput.
- Latency explodes near full utilisation; keep headroom for interactive services.
- Little's Law links them: concurrency = throughput × latency.
