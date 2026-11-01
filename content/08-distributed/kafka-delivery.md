"Will every message arrive exactly once?" is one of the most common Kafka interview questions. The honest answer depends on choices at three points: the **producer**, the **broker** and the **consumer**.

## The three guarantees

| Guarantee | Lost messages? | Duplicates? |
|---|---|---|
| At most once | Possible | No |
| At least once | No | Possible |
| Exactly once | No | No (for the effect) |

## Producer side

### Acknowledgements (`acks`)
- `acks=0`: fire and forget. Fastest; messages lost if the broker didn't get them.
- `acks=1`: the partition **leader** stored it. Lost if the leader dies before followers copy it.
- `acks=all`: all **in-sync replicas** stored it. Safest. Pair with `min.insync.replicas=2` on a replication-factor-3 topic.

### Retries and duplicates
If the producer sends a batch, the broker writes it, but the acknowledgement is lost, the producer retries, and the batch is written **twice**.

### Idempotent producer
`enable.idempotence=true` (the default in modern clients) gives each producer an ID and numbers each batch per partition. The broker discards duplicates of a sequence it has already written. So retries no longer create duplicates **within a partition, for a producer session**, and ordering is preserved even with retries.

## Consumer side: when to commit the offset

The consumer's position is the **committed offset**. When it's committed relative to processing decides the guarantee.

### At most once: commit before processing
```text
poll → commit offset → process
```
If the consumer crashes during processing, those messages are skipped on restart. Lost, never duplicated.

### At least once: process, then commit
```text
poll → process → commit offset
```
If it crashes after processing but before committing, the messages are processed again on restart. Never lost, sometimes duplicated. **This is the usual choice.**

> [!WARNING] Auto-commit surprises
> With `enable.auto.commit=true`, offsets are committed on a timer in the background, which can commit messages you haven't finished processing (loss on crash) or not commit ones you have (duplicates). For important pipelines, commit manually after processing.

## Exactly once

Kafka offers exactly-once semantics (EOS) for **read-process-write within Kafka**:

1. Idempotent producer (no duplicates from retries).
2. **Transactions:** a producer with a `transactional.id` writes output records to several partitions **and** commits the consumer offsets **in one atomic transaction**.
3. Downstream consumers read with `isolation.level=read_committed`, so they never see records from aborted transactions.

```mermaid
sequenceDiagram
  participant App as Stream app
  participant In as Input topic
  participant Out as Output topic
  participant Off as __consumer_offsets
  App->>In: poll records 100–149
  App->>App: process
  App->>Out: beginTransaction, send results
  App->>Off: sendOffsetsToTransaction (150)
  App->>Out: commitTransaction (atomic: outputs + offsets)
```

If the app crashes mid-transaction, the transaction aborts: outputs are discarded and offsets not advanced, so reprocessing produces the same result once. Kafka Streams enables this with one setting (`processing.guarantee=exactly_once_v2`).

### The limit: side effects outside Kafka
Kafka transactions can't include your database, an email or a payment API. For those, exactly-once is achieved by **idempotent processing**:
- Store the processed offset (or event ID) **in the same database transaction** as the business change, and on restart resume from the stored offset.
- Or deduplicate by event ID (an inbox table with a unique constraint).
- Or make the operation naturally idempotent (`UPSERT`, `SET status = 'PAID'`).

## Recommended settings

**Producer (reliable):**
```properties
acks=all
enable.idempotence=true
retries=2147483647
max.in.flight.requests.per.connection=5   # safe with idempotence
delivery.timeout.ms=120000
```

**Topic:** replication factor 3, `min.insync.replicas=2`, `unclean.leader.election.enable=false` (never elect an out-of-sync replica as leader, which would lose data).

**Consumer:** `enable.auto.commit=false`, commit after processing, idempotent handlers, `isolation.level=read_committed` if consuming transactional topics.

## Choosing per use case

| Use case | Guarantee | How |
|---|---|---|
| Metrics, logs, clickstream | At most / at least once | Throughput first; duplicates tolerable |
| Order events, notifications | At least once + idempotent consumer | Manual commits, dedup by event ID |
| Stream aggregations within Kafka | Exactly once | Kafka Streams / transactions |
| Payments to an external system | Effectively once | Idempotency keys with the provider + dedup |

> [!INTERVIEW] The precise answer
> "Kafka gives exactly-once only for consume-transform-produce inside Kafka, using idempotent producers and transactions. Anything touching an external system is at-least-once delivery, made effectively-once by idempotent processing: we store the event ID in the same database transaction as the update and skip duplicates."

## Key takeaways

- `acks=all` + `min.insync.replicas=2` + no unclean elections protect against loss.
- Idempotent producers remove duplicates caused by producer retries.
- Commit after processing for at-least-once; it is the standard choice.
- Kafka transactions give exactly-once within Kafka; external side effects need idempotency.
