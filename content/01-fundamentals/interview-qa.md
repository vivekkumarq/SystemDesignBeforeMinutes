Use this page to test yourself on the chapter. Try to answer each question aloud before opening it.

## Interview questions

<details>
<summary>What is the difference between latency and throughput? Can you improve one without the other?</summary>

Latency is how long one request takes; throughput is how many requests finish per second. They are independent levers. Adding servers behind a load balancer raises throughput without making any single request faster. Batching raises throughput but *increases* latency, because each item waits for the batch to fill. Caching usually improves both.

</details>

<details>
<summary>Why do we measure p99 latency instead of the average?</summary>

Averages hide the tail. If 99 requests take 10 ms and one takes 5 seconds, the average is ~60 ms, which describes nobody's experience. At scale the tail matters a lot: a page that makes 50 backend calls will hit at least one p99-slow call on most loads. The p99 tells you how bad the worst common experience is.

</details>

<details>
<summary>What does 99.99% availability mean in practice?</summary>

About 52 minutes of downtime per year, or about 4 minutes per month. Reaching it typically means no single points of failure, automated failover, redundant instances across availability zones and careful deployments (canaries, quick rollback). Each additional nine costs roughly ten times more effort.

</details>

<details>
<summary>Explain idempotency and why it matters in distributed systems.</summary>

An operation is idempotent if repeating it has the same effect as doing it once. Networks time out and clients retry, so a "charge ₹500" request might arrive twice. To make it safe, the client sends a unique **idempotency key**; the server stores the result of the first request under that key and returns the same result for duplicates instead of charging again.

</details>

<details>
<summary>Estimate the QPS for a service with 50 million daily users who each make 20 requests a day.</summary>

50M × 20 = 1 billion requests/day. Divide by ~10⁵ seconds/day → **~10,000 QPS average**. With a 2–3× peak factor, plan for **20,000–30,000 QPS**. At ~5,000 requests/s per server and 60% target utilisation, that is roughly 7–10 servers, plus spares.

</details>

<details>
<summary>What is the difference between functional and non-functional requirements? Which matters more for architecture?</summary>

Functional requirements are features ("users can post a photo"). Non-functional requirements are qualities: scale, latency, availability, consistency, durability, cost. The NFRs usually drive architecture more, because the same feature at 100 users and at 100 million users needs completely different designs.

</details>

<details>
<summary>Why is a cross-region call on the request path dangerous?</summary>

A round trip between distant regions costs 50–250 ms, compared with ~0.5 ms inside a data centre. A few sequential cross-region calls can consume the entire latency budget. They also couple your availability to another region's. Prefer asynchronous replication, local replicas or precomputed results.

</details>

<details>
<summary>How do you start a system design interview?</summary>

Clarify before drawing. Agree on three to five core features and explicitly park the rest. Ask about scale, latency, availability and consistency needs. Do a quick estimate and state what it implies. Only then sketch the API, data model and high-level design.

</details>

## Cheatsheet

| Concept | Remember |
|---|---|
| Seconds per day | ~10⁵ (86,400) |
| Peak factor | 2–3× average, more for spiky products |
| 99.9% / 99.99% | 8.8 h / 52 min down per year |
| RAM vs SSD vs HDD | ~100 ns / ~100 µs / ~10 ms |
| Same-DC round trip | ~0.5 ms |
| Cross-continent round trip | ~150–250 ms |
| One app server | ~1K–10K req/s |
| One Redis node | ~100K ops/s |
| Storage estimate | writes/day × size × days × replicas (+ overhead) |
| Server count | peak RPS ÷ (per-server RPS × 0.6) + spares |
| Interview flow | Requirements → Estimates → API → Data → HLD → Deep dives |

## Quiz

```quiz
[
  {"q": "Roughly how many seconds are in a day, for estimation purposes?", "options": ["10³", "10⁴", "10⁵", "10⁶"], "answer": 2, "why": "86,400 rounds to 10⁵, which makes daily-to-per-second conversion a single division."},
  {"q": "A system has an average latency of 50 ms but a p99 of 3 s. What does that tell you?", "options": ["The system is fast for everyone", "A meaningful slice of requests is very slow", "The average is wrong", "Throughput is too low"], "answer": 1, "why": "The tail is long: 1 in 100 requests takes 3 seconds. At high volume that is a lot of unhappy users."},
  {"q": "Which operation is idempotent?", "options": ["INCREMENT likes BY 1", "INSERT a new order row", "SET status = 'SHIPPED' WHERE id = 42", "Append a log line"], "answer": 2, "why": "Setting a field to a fixed value has the same result however many times you run it."},
  {"q": "Which requirement is non-functional?", "options": ["Users can follow other users", "The feed loads in under 200 ms at p99", "Users can upload a profile picture", "Users can delete a post"], "answer": 1, "why": "Latency targets describe how well the system behaves, not what it does."},
  {"q": "About how long is a random read from an SSD?", "options": ["1 ns", "100 ns", "20–100 µs", "10 ms"], "answer": 2, "why": "SSD random reads are tens of microseconds: much slower than RAM, much faster than an HDD seek."},
  {"q": "What should you do first in a design interview?", "options": ["Draw the architecture", "Pick the database", "Clarify features and scale", "Write the API code"], "answer": 2, "why": "Requirements and scale decide every later choice."}
]
```
