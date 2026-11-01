Answer aloud first, then open each to compare.

## Interview questions

<details>
<summary>When should communication between services be synchronous, and when asynchronous?</summary>

Synchronous when the caller needs the answer to continue and the user is waiting (authorise a payment, fetch data to render). Asynchronous for side effects and workflows that can finish later (emails, indexing, analytics, downstream updates), for absorbing spikes, and to decouple availability. A common shape: a small synchronous core, then events for everything else.

</details>

<details>
<summary>WebSocket vs SSE vs long polling?</summary>

WebSocket: persistent, bidirectional, lowest latency; best for chat, games, collaboration; stateful connections complicate scaling. SSE: one-way server push over plain HTTP with auto-reconnect; best for notifications, feeds and token streaming. Long polling: HTTP fallback that holds requests open; works anywhere but costs a request per update.

</details>

<details>
<summary>Offset vs cursor pagination?</summary>

Offset (`LIMIT/OFFSET`) is simple and supports page jumping but gets slower with depth and returns duplicates or skips when data changes. Cursor (keyset) pagination encodes the last seen sort key and queries `WHERE key < cursor`, giving constant performance and stable results. Use cursors for feeds and large datasets.

</details>

<details>
<summary>How do you make a POST endpoint safe to retry?</summary>

Require an idempotency key. The server records the key with the request's result atomically; duplicates with the same key return the stored result instead of repeating the side effect. Keys expire after a retention window. Also make downstream processing idempotent.

</details>

<details>
<summary>Explain the saga pattern and its two styles.</summary>

A saga splits a cross-service transaction into local transactions, each with a compensating action that undoes it semantically if a later step fails. Choreography uses events between services with no coordinator (simple flows); orchestration uses a central state machine that issues commands (complex flows, better visibility). Steps must be idempotent and messages reliable (outbox).

</details>

<details>
<summary>What is the dual-write problem and how does the outbox pattern solve it?</summary>

Writing to the database and publishing to a broker are separate operations, so a crash between them loses or invents events. The outbox writes the event into a table in the same local transaction as the business change; a poller or CDC relay publishes outbox rows to the broker. Delivery becomes at-least-once, so consumers deduplicate.

</details>

<details>
<summary>JWT vs session cookies?</summary>

Sessions store state server-side: easy revocation, needs a shared store. JWTs are self-contained and verified locally: scalable and convenient across services, but hard to revoke before expiry. Mitigate with short-lived access tokens and revocable refresh tokens.

</details>

<details>
<summary>What is BOLA/IDOR and how do you prevent it?</summary>

Broken object-level authorisation: the API authenticates the user but doesn't check that the requested object belongs to them, so changing an ID exposes others' data. Prevent by checking ownership or permission for every object access in the service, using non-guessable IDs as an extra layer, and testing for it.

</details>

<details>
<summary>REST vs GraphQL vs gRPC: when do you use each?</summary>

REST for public APIs and cacheable resources; GraphQL for complex client screens aggregating many sources in one round trip; gRPC for fast, typed, streaming service-to-service calls. Many systems combine all three.

</details>

<details>
<summary>Blue-green vs canary deployment?</summary>

Blue-green runs two full environments and switches all traffic at once: instant rollback but double capacity and full blast radius at switch time. Canary shifts a small, growing percentage of traffic to the new version while comparing metrics: limited blast radius and automated rollback, but more routing and monitoring complexity.

</details>

<details>
<summary>How do you change a database schema without downtime?</summary>

Expand and contract: add new structures in a backward-compatible way, deploy code that writes both, backfill, switch reads, then remove the old structures in a later release. Never make a change that the currently running version can't handle.

</details>

<details>
<summary>What are the RED metrics and why use percentiles?</summary>

Rate, Errors, Duration for every request-serving component. Durations are recorded as histograms because averages hide tail latency; p95/p99 reveal what the slowest users experience, which dominates at scale and with fan-out.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Sync vs async | Simple + coupled vs decoupled + eventual |
| Real-time | Polling · long polling · SSE (1-way) · WebSocket (2-way) · webhooks (server→server) |
| REST basics | Nouns, methods, status codes, structured errors |
| Pagination | Cursor for feeds and big lists |
| Retries | Idempotency keys + backoff with jitter |
| Concurrency | ETag + If-Match → 412 |
| Saga | Local txns + compensations; choreography vs orchestration |
| Outbox | Event in same txn; relay via poller/CDC; at-least-once |
| Auth | API keys, sessions, JWT (short-lived), OAuth/OIDC, mTLS |
| Top vuln | BOLA: check object ownership |
| Observability | RED/USE, structured logs, traces with trace IDs, SLO burn alerts |
| API styles | REST public · GraphQL clients · gRPC internal |
| Deploys | Rolling · blue-green · canary · flags; expand-and-contract |

## Quiz

```quiz
[
  {"q": "Which mechanism is one-way server-to-client over plain HTTP with automatic reconnection?", "options": ["WebSocket", "Server-Sent Events", "Webhooks", "gRPC unary"], "answer": 1, "why": "SSE streams events from server to client over a long-lived HTTP response."},
  {"q": "Why is cursor pagination preferred for a social feed?", "options": ["It allows jumping to page 500", "Constant cost at depth and stable under inserts", "It needs no index", "It works without sorting"], "answer": 1, "why": "Keyset queries seek directly to the cursor position."},
  {"q": "In a saga, a compensating transaction…", "options": ["Rolls back the original database transaction", "Is a new transaction that semantically undoes a step", "Locks all services until commit", "Is optional"], "answer": 1, "why": "Earlier steps already committed; compensation is a new, opposite action."},
  {"q": "What delivery guarantee does the outbox pattern give by itself?", "options": ["At most once", "At least once", "Exactly once", "Best effort"], "answer": 1, "why": "The relay may republish after a crash, so consumers must deduplicate."},
  {"q": "Which API style makes HTTP/CDN caching hardest by default?", "options": ["REST", "GraphQL", "Static file serving", "Webhooks"], "answer": 1, "why": "Queries are usually POSTs to a single endpoint."},
  {"q": "Which deployment strategy limits blast radius by gradually shifting a percentage of traffic?", "options": ["Recreate", "Blue-green", "Canary", "Rolling with no health checks"], "answer": 2, "why": "Canary exposes a small slice first and expands as metrics stay healthy."},
  {"q": "A JWT access token's main drawback is…", "options": ["It requires a DB lookup per request", "It can't be easily revoked before expiry", "It can't carry user ID", "It doesn't work over HTTPS"], "answer": 1, "why": "Keep them short-lived and use revocable refresh tokens."}
]
```
