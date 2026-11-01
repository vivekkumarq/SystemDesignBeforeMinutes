**The short version:** strong consistency means every read sees the latest write, at the cost of latency and availability. Eventual consistency means replicas converge over time, which gives speed and availability at the cost of temporarily stale reads.

## Side by side

| | Strong consistency | Eventual consistency |
|---|---|---|
| Read after write | Always sees the write | May see older data briefly |
| Latency | Higher (coordination, quorum, leader) | Lower (any nearby replica) |
| Availability under partition | Some requests fail or wait | Keeps serving |
| Complexity for developers | Low; behaves like one machine | Higher; must handle staleness and conflicts |
| Typical mechanisms | Single leader, synchronous replication, consensus, quorum reads | Async replication, gossip, last-write-wins, CRDTs |

## Choose strong consistency for

- **Money:** balances, ledgers, payments.
- **Inventory and bookings** where overselling is unacceptable.
- **Uniqueness:** usernames, coupon redemption, seat allocation.
- **Permissions and security:** revoking access must take effect immediately.
- **Coordination:** leader election, locks, configuration.

## Eventual consistency is fine for

- Like, view and follower counts.
- Feeds, timelines, comments appearing a second later.
- Product reviews, recommendations, search indexes.
- Analytics, logs, metrics.
- Presence ("online" status), "last seen".

## The useful middle ground

Pure strong vs pure eventual is a false choice. These models fix the anomalies users actually notice, at much lower cost than full strong consistency:

- **Read-your-own-writes:** a user always sees their own changes (read their data from the leader, or wait for the replica to catch up to their write).
- **Monotonic reads:** a user never sees time go backwards (pin them to one replica).
- **Consistent prefix:** you never see an answer before its question (keep causally related writes in one partition).
- **Causal consistency:** operations that depend on each other are seen in order by everyone.
- **Bounded staleness:** reads are at most N seconds or N versions behind.

## Tuning in practice

- Quorum systems: `W + R > N` for strong reads; lower values for speed. See [Replication](#/l/03-databases/replication).
- Per-request choice: e.g. DynamoDB's strongly consistent reads, Cassandra's `QUORUM` vs `ONE`.
- Route by data type: balance read from the primary, history read from replicas.

> [!INTERVIEW] Pick per feature and name the anomaly
> "The wallet balance is strongly consistent: it's read from the primary, and transfers are single transactions. The transaction history page reads from a replica that can lag a second or so, but we guarantee read-your-own-writes, so after a transfer the user's history is read from the primary for 10 seconds."

## Key takeaways

- Strong: correct and simple, but slower and less available.
- Eventual: fast and available, but stale for a while.
- Session guarantees (read-your-writes, monotonic reads) cover most user-visible problems cheaply.
- Decide per feature by the cost of a stale or conflicting read.
