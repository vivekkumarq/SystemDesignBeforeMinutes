A Kafka producer has dozens of settings, but five of them decide most of its behaviour: how durable writes are, how duplicates and ordering are handled, and how throughput trades against latency.

## 1. `acks`: how many replicas must confirm

| Value | Waits for | Durability | Latency |
|---|---|---|---|
| `0` | Nothing | Lowest: lost if broker didn't receive | Lowest |
| `1` | Leader only | Lost if leader fails before replication | Low |
| `all` (`-1`) | All in-sync replicas | Highest | Higher |

`acks=all` is only as strong as the topic's `min.insync.replicas`. With replication factor 3 and `min.insync.replicas=2`, a write needs at least two copies or it fails with an error, instead of silently relying on one broker.

**Choose:** `all` for business events; `1` or `0` only for data you can afford to lose (high-volume telemetry).

> [!REAL] Asking for a receipt
> `acks=0` is dropping a letter in the post box and walking away. `acks=1` is getting a receipt from the counter clerk. `acks=all` is waiting until head office confirms it's filed in every copy of the register.

## 2. `enable.idempotence`: no duplicates from retries

When enabled, the broker uses a producer ID plus per-partition sequence numbers to drop duplicate batches caused by retries, and keeps batches **in order** even with several in flight.

- Requires `acks=all`, `retries > 0` and `max.in.flight.requests.per.connection ≤ 5`.
- Enabled by default in modern clients. Leave it on.
- Scope: one producer session and per partition. It doesn't deduplicate across application restarts; use transactions (`transactional.id`) or consumer-side dedup for that.

> [!REAL] A cheque number
> If you hand over the same cheque twice by mistake, the bank sees the same cheque number and clears it only once. The idempotent producer numbers every message so the broker ignores retried duplicates.

## 3. `retries` and `delivery.timeout.ms`: how hard to try

- `retries`: how many times to retry transient errors (leader changes, timeouts). Modern default is effectively infinite.
- `delivery.timeout.ms` (default 120 s): the **total** time allowed for a send, including retries. After that, the send fails and your callback gets the error.
- `retry.backoff.ms`: pause between retries.

Think in terms of the total timeout, not the retry count: "a record must be written within 2 minutes or we surface an error".

> [!WARNING] Handle send failures
> `producer.send()` is asynchronous. If you never check the returned future or callback, failed sends vanish silently. Log, alert or route failures to a fallback (e.g. a local outbox).

## 4. `batch.size` and `linger.ms`: throughput vs latency

The producer groups records per partition into batches.
- `batch.size` (bytes, default 16 KB): the maximum batch size. A larger size means fewer, bigger requests.
- `linger.ms` (default 5 ms in recent versions, 0 in older ones): how long to wait for more records before sending a batch that isn't full.

```text
linger.ms = 0    → send immediately: lowest latency, many small requests
linger.ms = 10–50 → fuller batches: much higher throughput and better compression, +ms latency
```

For high-throughput pipelines, `batch.size=64–256 KB` with `linger.ms=10–50` often multiplies throughput. For latency-sensitive paths, keep `linger.ms` small.

> [!REAL] The shared auto
> An auto driver waits a few seconds to fill all seats before leaving. Each passenger waits slightly longer, but far more people move per hour. `linger.ms` is that short wait.

## 5. `compression.type`: fewer bytes on the wire and on disk

Options: `none`, `gzip`, `snappy`, `lz4`, `zstd`.
- Compression works per batch, so it pairs with batching. Bigger batches compress better.
- `lz4` and `snappy`: fast with a moderate ratio. `zstd`: an excellent ratio at good speed, often the best default today. `gzip`: a good ratio but CPU-heavy.
- Reduces network usage, broker disk and replication traffic, usually for a small CPU cost.

> [!REAL] Vacuum bags
> JSON events are full of repeated field names. Compressing a batch is like vacuum-packing clothes: the same content in a fraction of the space.

## Honourable mentions

- `max.in.flight.requests.per.connection`: requests sent without waiting for responses. Up to 5 is safe with idempotence.
- `buffer.memory` and `max.block.ms`: how much memory the producer can use for unsent records, and how long `send()` blocks when the buffer is full (backpressure).
- `partitioner` / **key choice**: decides ordering and load spread. Choose keys carefully to avoid hot partitions.
- `transactional.id`: enables transactions for exactly-once read-process-write.

## Recipes

**Reliable business events**
```properties
acks=all
enable.idempotence=true
delivery.timeout.ms=120000
linger.ms=5
compression.type=zstd
```

**High-throughput telemetry**
```properties
acks=1
linger.ms=50
batch.size=262144
compression.type=lz4
```

**Low-latency notifications**
```properties
acks=all
enable.idempotence=true
linger.ms=0
compression.type=none
```

> [!INTERVIEW] Explain the trade-off, not just the setting
> "For payment events we use `acks=all` with `min.insync.replicas=2` and idempotence, accepting a few milliseconds more latency so a broker failure can't lose or duplicate an event. For clickstream we use `acks=1`, `linger.ms=50` and lz4, trading a little durability for five times the throughput."

## Key takeaways

- `acks` decides durability; combine `all` with `min.insync.replicas`.
- Idempotence removes retry duplicates and keeps ordering; keep it on.
- Think in `delivery.timeout.ms` and always handle send failures.
- `batch.size` + `linger.ms` + compression trade a little latency for big throughput gains.
