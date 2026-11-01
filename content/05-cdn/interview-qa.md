Answer aloud first, then open each to compare.

## Interview questions

<details>
<summary>How does a CDN route a user to the nearest edge?</summary>

Either through DNS (the CDN's authoritative DNS answers with the IP of a nearby, healthy PoP based on the resolver's or client's location) or through anycast (the same IP is announced from every PoP, and BGP routing delivers packets to the topologically closest one). Many CDNs combine both.

</details>

<details>
<summary>Push vs pull CDN?</summary>

Pull: the edge fetches from the origin on the first miss and caches it. Easy to set up, and the default for websites. Push: you upload content to the CDN in advance, so it is available immediately, which suits large predictable files such as software releases. Push requires managing uploads and storage.

</details>

<details>
<summary>How do you deploy new JS/CSS without users getting stale files?</summary>

Fingerprint filenames with a content hash, cache them with a one-year immutable TTL, and give the HTML that references them a short TTL or revalidation. Each deploy produces new filenames, so no purge is needed. Upload assets before switching the HTML, and keep old assets for a while.

</details>

<details>
<summary>Your CDN hit ratio is only 60%. What do you check?</summary>

Cache keys (tracking query parameters, cookies or `Vary: User-Agent` creating many variants), origin headers (`no-cache`, `private` or missing `Cache-Control`), TTLs that are too short, a long tail of rarely requested objects (add an origin shield / tiered caching), and personalised responses on cacheable paths.

</details>

<details>
<summary>What is an origin shield?</summary>

A designated intermediate cache layer between the edges and the origin. Edge misses go to the shield first, so the origin sees one request per object instead of one per PoP. It raises the effective hit ratio and protects the origin.

</details>

<details>
<summary>How do you protect paid video content on a CDN?</summary>

Signed URLs or signed cookies with short expiry, verified at the edge; a private storage bucket readable only by the CDN; optionally DRM encryption of the media and geo-restrictions for licensing.

</details>

<details>
<summary>How can a CDN improve availability, not just speed?</summary>

`stale-if-error` serves the last good copy when the origin fails; origin failover switches to a backup origin; edges absorb DDoS and spikes. For the CDN itself, multi-CDN with DNS steering avoids a single-provider outage.

</details>

<details>
<summary>What is the most dangerous CDN misconfiguration?</summary>

Caching personalised or authenticated responses as public, so one user's data is served to others. Mark them `private, no-store`, never key public caches without the identity they depend on, and avoid extension-based caching rules that attackers can exploit (cache deception).

</details>

<details>
<summary>Can a CDN help with dynamic, uncacheable APIs?</summary>

Yes. TLS terminates near the user (fewer long round trips), the edge keeps warm connections to the origin over an optimised backbone, WAF and rate limits filter bad traffic, and edge compute can handle simple logic. Short micro-caching (1–5 seconds) also helps for public dynamic data under heavy load.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Path of a miss | Edge → origin shield → origin |
| Routing | GeoDNS or anycast |
| Static assets | Hashed names + `max-age=31536000, immutable` |
| HTML | Short `s-maxage` + `stale-while-revalidate` |
| Private data | `private, no-store` |
| Cache key hygiene | Strip `utm_*`; minimal `Vary` |
| Purging | URL purge, cache tags, or versioned URLs |
| Security | DDoS, WAF, bots, rate limits, signed URLs, locked origin |
| Availability | `stale-if-error`, origin failover, multi-CDN |
| Video | Immutable segments (long TTL), live manifests (short TTL) |

## Quiz

```quiz
[
  {"q": "Which header lets a CDN keep serving cached content when the origin fails?", "options": ["no-store", "stale-if-error", "private", "Vary"], "answer": 1, "why": "stale-if-error allows serving a stale copy during origin errors."},
  {"q": "Best way to update a JS bundle cached for a year?", "options": ["Purge every PoP", "Lower the TTL", "Change the filename via a content hash", "Disable the CDN during deploy"], "answer": 2, "why": "A new filename is a new object; the old one can remain cached safely."},
  {"q": "What does an origin shield reduce?", "options": ["Edge latency", "Requests reaching the origin", "DNS lookups", "TLS handshakes"], "answer": 1, "why": "It collapses misses from many PoPs into one request to the origin."},
  {"q": "Which response must never be cached publicly?", "options": ["/assets/logo.svg", "GET /api/products", "GET /api/me", "/video/seg_12.ts"], "answer": 2, "why": "It returns the logged-in user's own data."},
  {"q": "Why do campaign links with utm_ parameters hurt hit ratio?", "options": ["They disable compression", "Each unique query string becomes a separate cache entry", "They bypass DNS", "They force HTTP/1.1"], "answer": 1, "why": "Strip irrelevant parameters from the cache key."}
]
```
