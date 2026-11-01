Answer each question aloud first, then open it to compare.

## Interview questions

<details>
<summary>When would you choose vertical scaling over horizontal scaling?</summary>

When the load fits comfortably on one bigger machine and simplicity matters more than unlimited growth: early-stage products, and stateful systems such as a relational database, where scaling out brings replication and sharding complexity. Vertical scaling needs no code changes. Its limits are a hardware ceiling, rising cost and a single point of failure, so pair it with a standby for availability.

</details>

<details>
<summary>What does it take to make a web tier horizontally scalable?</summary>

Make it stateless. Move sessions to a shared store or signed tokens, files to object storage and shared caches to a distributed cache. Then any instance can serve any request, the load balancer can use any algorithm and autoscaling can add or remove instances freely.

</details>

<details>
<summary>Round robin vs least connections: when does each fit?</summary>

Round robin fits identical servers and short, similar requests. Least connections fits requests with very different durations, such as uploads, long polling or WebSockets, because it sends new work to servers that are not tied up.

</details>

<details>
<summary>What is the difference between a Layer 4 and a Layer 7 load balancer?</summary>

L4 balances by IP and port without reading the payload: very fast and works for any TCP/UDP protocol, but cannot route by URL or header. L7 terminates the connection and parses HTTP, so it can route by path, host or cookie, terminate TLS, retry and rate-limit, at a higher cost per request. Large systems often put L4 in front of L7.

</details>

<details>
<summary>Why are sticky sessions considered an anti-pattern?</summary>

They pin users to one server, causing uneven load, lost sessions when that server dies and awkward scale-down. They exist only to work around in-memory state. Moving session state to Redis or a token removes the need.

</details>

<details>
<summary>Two components each have 99.9% availability and a request needs both. What is the combined availability? How do you improve it?</summary>

In series, multiply: 0.999 × 0.999 ≈ 99.8%. Improve it by adding redundancy (parallel copies, so both must fail together), removing the dependency from the request path (async, caching), or degrading gracefully when one fails.

</details>

<details>
<summary>Explain the circuit breaker pattern.</summary>

A wrapper around calls to a dependency. While calls succeed it is **closed**. After failures cross a threshold it **opens** and fails fast (or returns a fallback) without calling the dependency, giving it time to recover and protecting the caller's threads. After a cool-down it goes **half-open** and lets a few trial calls through; success closes it, failure opens it again.

</details>

<details>
<summary>Forward proxy vs reverse proxy?</summary>

A forward proxy acts for clients: it sends their requests out and hides them from servers (corporate filtering, egress control, privacy). A reverse proxy acts for servers: clients connect to it and it forwards to backends, providing load balancing, TLS termination, caching, security and routing.

</details>

<details>
<summary>Walk me through scaling a web app from 1,000 to 10 million users.</summary>

Separate the database; make the app stateless behind a load balancer; add caching and read replicas; move static content to a CDN and object storage; push slow work onto queues; spread across availability zones and then regions; finally partition data by domain and shard the largest tables. Justify each step with the bottleneck it removes.

</details>

<details>
<summary>How do you prevent a retry storm?</summary>

Bounded retries with exponential backoff and random jitter, retry only idempotent operations, use a retry budget (e.g. retries may add at most 10% extra load), add circuit breakers, and retry at one layer only so retries do not multiply through the stack.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Vertical | Simple, no code change, ceiling + SPOF |
| Horizontal | Needs statelessness; near-unlimited; fault tolerant |
| Round robin | Equal servers, equal requests |
| Least connections | Long or uneven requests |
| Power of two choices | Pick 2 random, use the less loaded |
| L4 vs L7 | Fast/any protocol vs HTTP-aware routing + TLS |
| Series availability | Multiply: always lower |
| Parallel availability | 1 − product of failure probabilities |
| Fault tolerance kit | Redundancy, failover, timeouts, retries+jitter, circuit breaker, bulkheads, degradation, load shedding |
| RTO / RPO | Time to recover / data you can lose |
| Forward vs reverse proxy | For clients vs for servers |

## Quiz

```quiz
[
  {"q": "Which is the main drawback of vertical scaling?", "options": ["It needs code changes", "It has a hardware ceiling and is a single point of failure", "It cannot run databases", "It requires a load balancer"], "answer": 1, "why": "One machine can only get so big, and if it fails everything fails."},
  {"q": "Which algorithm best fits a fleet handling long-lived WebSocket connections?", "options": ["Round robin", "Random", "Least connections", "IP hash with modulo"], "answer": 2, "why": "Connection counts reflect real load when connections last a long time."},
  {"q": "You need to route /api and /media to different services and terminate TLS. Which load balancer?", "options": ["Layer 4", "Layer 7", "DNS round robin", "None needed"], "answer": 1, "why": "Only L7 parses HTTP paths and terminates TLS."},
  {"q": "Two replicas, each 99% available, either can serve. Combined availability?", "options": ["98%", "99%", "99.5%", "99.99%"], "answer": 3, "why": "Both must fail together: 1 − 0.01 × 0.01 = 0.9999."},
  {"q": "A circuit breaker in the open state…", "options": ["Sends all calls through", "Fails fast without calling the dependency", "Retries every call three times", "Restarts the dependency"], "answer": 1, "why": "Open means stop calling; let the dependency recover."},
  {"q": "An API gateway is best described as…", "options": ["A forward proxy", "A specialised reverse proxy", "A database proxy", "A DNS server"], "answer": 1, "why": "It sits in front of services on their behalf, adding auth, routing and rate limits."},
  {"q": "Before sharding an overloaded read-heavy database, what should you try first?", "options": ["Microservices", "Caching and read replicas", "Multi-region", "A bigger load balancer"], "answer": 1, "why": "They remove most read load with far less complexity than sharding."}
]
```
