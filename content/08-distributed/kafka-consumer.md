Consumer configuration decides whether messages are lost or duplicated, how fast a group processes data, and how often it stalls in rebalances. These five settings matter most.

## 1. `group.id`: who shares the work

Consumers with the same `group.id` split a topic's partitions between them; each partition goes to exactly one member. Different groups each receive every message independently.

- Use one group per **logical application** (`billing-service`, `search-indexer`).
- Scaling a group beyond the number of partitions leaves extra consumers idle.
- Changing a group ID means starting from scratch (see `auto.offset.reset`).

> [!REAL] Team name on the attendance sheet
> Consumers with the same `group.id` are one team splitting the work. A new `group.id` is a brand-new team that reads everything from scratch.

## 2. `enable.auto.commit` (+ `auto.commit.interval.ms`): when progress is saved

- `true` (default): offsets of polled records are committed periodically in the background (every 5 s by default). Convenient, but commits are not tied to processing: a crash can skip unprocessed messages or replay processed ones.
- `false`: you commit explicitly **after processing**: `commitSync()` for safety, `commitAsync()` for speed (with a final `commitSync()` on shutdown).

```java
consumer.subscribe(List.of("orders"));
while (running) {
    ConsumerRecords<String, Order> records = consumer.poll(Duration.ofMillis(500));
    for (ConsumerRecord<String, Order> r : records) {
        handler.process(r.value());           // idempotent: dedups by event ID
    }
    consumer.commitSync();                    // at-least-once
}
```

For anything important, disable auto-commit and commit after processing.

> [!REAL] Bookmarking a book
> Auto-commit is your e-reader saving your page every 5 seconds, even if you didn't actually read the page. Commit manually after you finish processing, so a crash never skips a page.

## 3. `auto.offset.reset`: where to start with no saved offset

Applies when a group has no committed offset (new group) or the saved one has expired or been deleted.

- `latest` (default): start from new messages only; history is skipped.
- `earliest`: start from the oldest retained message; process everything.
- `none`: throw an error, forcing a deliberate decision.

A new service that must build its state from history (e.g. a new search indexer) needs `earliest`. Also remember that group offsets themselves expire after a period of inactivity (`offsets.retention.minutes` on the broker), which can silently trigger this reset.

> [!REAL] Joining a WhatsApp group
> `latest` is joining a group and only seeing new messages. `earliest` is scrolling up and reading the whole history first.

## 4. `max.poll.records` and `max.poll.interval.ms`: batch size vs liveness

- `max.poll.records` (default 500): the most records returned by one `poll()`.
- `max.poll.interval.ms` (default 5 minutes): the longest allowed gap between `poll()` calls. Exceed it and the consumer is considered stuck, removed from the group and its partitions are reassigned, triggering a **rebalance**. Its uncommitted work will be processed again by someone else.

If processing a batch is slow (calls to external APIs, heavy computation), either lower `max.poll.records` or raise `max.poll.interval.ms`, or hand records to a worker pool while pausing the partitions. A classic production incident is a consumer that takes 6 minutes per batch, gets kicked out, rejoins, gets the same batch, and loops forever.

> [!REAL] Taking too many plates
> If a waiter carries 50 plates and takes too long, the manager assumes he left and gives his tables to someone else. Smaller batches keep you inside the time limit.

## 5. `session.timeout.ms` and `heartbeat.interval.ms`: failure detection

- A background thread sends heartbeats to the group coordinator every `heartbeat.interval.ms` (default 3 s).
- If no heartbeat arrives within `session.timeout.ms` (default 45 s in recent versions), the consumer is declared dead and a rebalance starts.

Trade-off: a short session timeout detects crashes quickly but risks false positives during GC pauses or network blips (unnecessary rebalances). A long one avoids false positives but leaves partitions unprocessed for longer after a real crash. Keep heartbeat interval about one-third of the session timeout.

## Other settings worth knowing

| Setting | What it does |
|---|---|
| `fetch.min.bytes` / `fetch.max.wait.ms` | Wait for more data per fetch: higher throughput, slightly more latency |
| `max.partition.fetch.bytes` | Max data per partition per fetch; must fit your largest message |
| `isolation.level` | `read_committed` hides records from aborted transactions |
| `partition.assignment.strategy` | `CooperativeStickyAssignor` reduces rebalance disruption |
| `group.instance.id` | Static membership: a restarted consumer keeps its partitions without a rebalance |

## Recipes

**Reliable processing (at-least-once)**
```properties
enable.auto.commit=false
auto.offset.reset=earliest
max.poll.records=100
max.poll.interval.ms=300000
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
isolation.level=read_committed
```

**High-throughput analytics**
```properties
max.poll.records=2000
fetch.min.bytes=1048576
fetch.max.wait.ms=500
```

## Scaling consumption

- Parallelism is capped by partitions; plan partition counts for future consumer counts.
- Inside one consumer, you can process records concurrently, but commit only offsets below the lowest unfinished record per partition, and keep per-key ordering if needed.
- Monitor **consumer lag** per partition; autoscale on lag.

> [!INTERVIEW] A typical failure story
> "Our consumer called a slow external API for each of 500 records per poll, exceeded `max.poll.interval.ms`, was evicted and rebalanced repeatedly, so lag kept growing. We cut `max.poll.records` to 50, added a timeout on the API call, and switched to cooperative-sticky assignment with static membership. Rebalances stopped and lag drained."

## Key takeaways

- `group.id` defines who shares partitions; partitions cap parallelism.
- Disable auto-commit for important data; commit after processing.
- `auto.offset.reset` matters for new groups and expired offsets.
- Keep processing per poll within `max.poll.interval.ms`; tune session timeout and heartbeats for failure detection.
