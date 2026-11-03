Putting a CDN in front of a site is easy. Getting a 95%+ hit ratio, fast first loads and fresh content takes deliberate work. This lesson covers the levers.

## 1. Control caching with headers

The origin tells the CDN and browsers what to do via `Cache-Control`:

| Header | Meaning |
|---|---|
| `max-age=N` | Browsers (and CDNs) may use it for N seconds |
| `s-maxage=N` | Shared caches (CDNs) use this instead of max-age |
| `public` / `private` | Shared caches may / may not store it |
| `no-cache` | Store it, but revalidate before every use |
| `no-store` | Never store it (sensitive data) |
| `immutable` | Will never change; don't even revalidate |
| `stale-while-revalidate=N` | Serve stale for up to N seconds while refreshing in background |
| `stale-if-error=N` | Serve stale for up to N seconds if the origin errors |

Typical settings:

```text
/assets/app.3f9a1c.js     Cache-Control: public, max-age=31536000, immutable
/index.html               Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300
/api/products?page=1      Cache-Control: public, s-maxage=30, stale-while-revalidate=60
/api/me                   Cache-Control: private, no-store
```

> [!REAL] The label on the food box
> "Best before 1 year" on a pickle jar and "consume today" on fresh paneer tell the shop how long to keep each item. `Cache-Control: max-age=31536000` vs `no-store` tells the CDN the same thing.

## 2. Version static assets

Put a content hash in the filename (`app.3f9a1c.js`). Each build produces new names, so:
- old files can be cached **forever**,
- new deploys are visible instantly (the HTML references new names),
- you never need to purge assets.

Only the small HTML entry point needs a short TTL or revalidation.

> [!REAL] A new edition of the textbook
> When a textbook changes, the publisher prints "2nd edition" on the cover so nobody confuses it with the old one. `app.3f9c2.js` is the 2nd edition; the old file can stay cached for a year without causing harm.

## 3. Design cache keys carefully

The cache key decides what counts as "the same object". A bad cache key destroys the hit ratio.

- **Strip irrelevant query parameters** (`utm_source`, `fbclid`, random cache-busters). Otherwise every campaign link creates a separate cache entry.
- **Normalise** parameter order and case.
- **Vary only on what matters.** `Vary: Accept-Encoding` is fine; `Vary: User-Agent` explodes into thousands of variants. Prefer a normalised device-class header if you must vary by device.
- **Never** include cookies or auth headers in keys for public content, and never cache personalised responses as public.

> [!REAL] Tracking parameters break the cache
> `/shoes?utm_source=instagram` and `/shoes?utm_source=whatsapp` are the same page. If both are separate cache keys, the CDN fetches the page twice. Strip tracking parameters from the key.

## 4. Tiered caching / origin shield

With hundreds of PoPs, each missing independently, the origin sees a request from every PoP for each object. An **origin shield** (a designated mid-tier cache) collapses them into one, raising the effective hit ratio and protecting the origin, especially for long-tail content.

> [!REAL] The district warehouse
> Village shops order from the district warehouse, not the national factory. Only the district warehouse talks to the factory, so the factory sees a handful of requests instead of thousands.

## 5. Request collapsing

When many users request the same uncached object at the same moment, a good CDN sends **one** request to the origin and serves everyone from that response. This is the CDN version of stampede protection. It matters for live video, where thousands request the newest segment simultaneously.

> [!REAL] One trip for the whole office
> When 20 colleagues want samosas at the same time, one person goes and brings back 20. When 10,000 viewers request a new video chunk at once, the edge sends a single request to the origin.

## 6. Optimise what is delivered

- **Compression:** Brotli for text (smaller than gzip), served based on `Accept-Encoding`.
- **Image optimisation at the edge:** resize to the requested dimensions, convert to WebP/AVIF, strip metadata. Often a 50–80% byte saving.
- **Minification** of JS and CSS.
- **Modern protocols:** HTTP/2 multiplexing and HTTP/3 (QUIC), which avoids head-of-line blocking and handles lossy mobile networks better; TLS 1.3 with session resumption and 0-RTT for repeat visitors.

## 7. Prefetching and warming

- **Pre-warm** the cache before a launch or a big sale by requesting key URLs through the CDN.
- For video, the player prefetches upcoming segments; some CDNs prefetch the next segment at the edge when the current one is requested.

## 8. Edge compute

Run small functions at the edge (Cloudflare Workers, Lambda@Edge, Fastly Compute) to:
- personalise a cached page by injecting small user-specific fragments,
- rewrite URLs, do A/B bucketing or geo-redirects,
- validate tokens and reject bad requests before they reach the origin,
- assemble responses from cached fragments (edge-side includes).

This turns "uncacheable because personalised" into "mostly cached plus a little edge logic".

> [!REAL] Fixing it at the counter
> Instead of sending every form back to head office, the counter clerk handles simple changes on the spot. Cloudflare Workers can redirect, A/B-test or check a token at the edge, close to the user.

## 9. Measure

| Metric | Why |
|---|---|
| Cache hit ratio (requests and bytes) | Primary efficiency metric; byte hit ratio drives cost |
| Origin offload / origin requests per second | Shows how protected the origin is |
| Time to first byte (TTFB) at edge | User-perceived latency |
| Error rates by PoP | Detect regional problems |
| Purge latency | How quickly updates become visible |

Use response headers (`X-Cache`, `Age`, `CF-Cache-Status` or equivalents) to debug individual requests.

> [!TIP] The two highest-impact moves
> 1. Fingerprinted asset filenames with one-year immutable caching.
> 2. Clean cache keys (strip tracking parameters, minimal `Vary`).
> Together they often lift hit ratios from ~70% to 95%+.

> [!INTERVIEW] Caching an API through a CDN
> "The product listing API is public and identical for everyone, so we serve it with `s-maxage=30, stale-while-revalidate=60`. The CDN absorbs 99% of listing traffic during a sale, and data is at most about 30 seconds old. Cart and checkout APIs are `private, no-store` and go straight to the origin."

## Key takeaways

- `Cache-Control` drives CDN and browser behaviour; learn the directives.
- Fingerprint assets and cache them forever; keep HTML short-lived.
- Clean cache keys and minimal `Vary` protect the hit ratio.
- Origin shields, request collapsing, compression, image optimisation and HTTP/3 add up.
- Edge compute lets you cache more by moving small personalisation to the edge.
