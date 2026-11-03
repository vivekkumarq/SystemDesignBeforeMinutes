Trade-off questions don't have a right answer to memorise. They test whether you can reason from requirements to a choice and say what you're giving up. These rules of thumb make that reasoning fast and visible.

## The universal method

1. **State the requirement driving the choice.** "Reads outnumber writes 100:1", "a double charge is unacceptable", "users are global".
2. **Name two or three options.**
3. **Compare them on the one or two dimensions that matter here** (not every dimension).
4. **Choose, and say what you're sacrificing.** "I'll accept up to five seconds of staleness in exchange for serving reads from regional replicas."
5. **Say when you'd revisit.** "If write volume passes ~10K/s, we'd shard."

> [!REAL] Buying a car
> "Which car is best?" has no answer. "Best for a family of five on a ₹10 lakh budget with city driving" has one. Every trade-off question works the same way: state the requirement, then the choice follows.

## Rules of thumb

### Data
- **Default to a relational database** until access patterns or scale clearly say otherwise.
- **Reads scale by copying** (cache, replicas, CDN); **writes scale by splitting** (sharding, partitioning).
- **Choose the shard key by the most common query**, and check it spreads load evenly.
- **Strong consistency for money, inventory, identity and permissions**; eventual for counts, feeds and analytics.
- **Denormalise for hot read paths, normalise for correctness.**

### Performance
- **Cache what's read often and changes rarely**; never cache what must be exact at the moment of decision (e.g. stock at checkout).
- **Move work off the request path** if the user doesn't need to wait for it.
- **Precompute when reads are far more frequent than writes** (fan-out on write); compute on read when writes dominate or data is huge (fan-out on read).
- **Keep interactive services at 50–70% utilisation**; batch systems can run hot.
- **Measure p99**, not averages.

### Reliability
- **Every network call gets a timeout**; retries need backoff, jitter and idempotency.
- **Remove single points of failure** on the critical path; accept them off it.
- **Prefer graceful degradation over failure:** drop features before dropping requests.
- **Make operations idempotent** wherever messages or requests can repeat.
- **Changes cause most outages:** progressive rollouts and fast rollback beat heroic recovery.

### Architecture
- **Start simple and evolve:** modular monolith before microservices; one region before multi-region.
- **Synchronous for what the user waits on, asynchronous for everything else.**
- **Stateless services, stateful stores.**
- **Use managed services** unless running it yourself is a core competency or a cost necessity.
- **Don't add a component you can't justify with a number or a requirement.**

### Cost
- **Storage is cheap, but egress and memory aren't:** tier cold data, compress, use CDNs.
- **The cheapest request is the one you never serve:** caching, client-side caching and batching.

## Classic trade-off pairs at a glance

| Choice | Lean left when… | Lean right when… |
|---|---|---|
| SQL vs NoSQL | Relationships, transactions, ad-hoc queries | Massive scale, simple access patterns |
| Strong vs eventual | Wrong answers cost money/trust | Staleness is invisible or harmless |
| Latency vs throughput | A user is waiting | It's a pipeline or batch |
| Batch vs stream | Results can wait; simplicity | Seconds matter |
| Push vs pull (fan-out) | Few followers, read-heavy | Celebrities, write-heavy |
| Sync vs async | Caller needs the result | Side effects, spikes, decoupling |
| Monolith vs microservices | Small team, early product | Many teams, divergent scaling |
| Cache vs no cache | Hot, slowly changing reads | Must be exact, rarely reused |
| SQL replica read vs primary read | Staleness OK | Read-your-writes needed |
| Kafka vs RabbitMQ | Streams, replay, many consumers | Task queues, routing, per-message control |

## Phrases that signal good judgement

- "Given the 100:1 read ratio, I'd optimise the read path even at some cost to writes."
- "This is the one place we can't be eventually consistent, because…"
- "That's over-engineering for the current numbers; here's the trigger to revisit."
- "The trade-off is X; I'm comfortable with it because Y."
- "If the interviewer cares more about Z, I'd switch to the other option."

> [!TIP] Turn pushback into points
> When the interviewer challenges a choice, they're often handing you a deep dive. Restate the new constraint, re-weigh the options aloud, and change your mind if the facts changed. That's exactly the behaviour being graded.

## Key takeaways

- Requirement → options → compare on what matters → choose → name the sacrifice → name the trigger to revisit.
- Reads scale by copying, writes by splitting; strong consistency for money and identity.
- Start simple, add components only with a number or requirement behind them.
- Every choice has a cost; saying it out loud is what makes the answer senior.
