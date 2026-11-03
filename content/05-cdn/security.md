Because a CDN sits in front of everything, it becomes your first line of defence and a big part of your availability story. It also introduces its own risks if configured carelessly.

## Security at the edge

### DDoS protection
A distributed denial-of-service attack floods you with traffic from many machines.
- **Network-layer (L3/L4) floods** (SYN floods, UDP amplification) are absorbed by the CDN's huge total capacity, spread across hundreds of PoPs by anycast. No single origin could absorb a multi-terabit attack; a large CDN can.
- **Application-layer (L7) floods** (millions of legitimate-looking HTTP requests) are handled with rate limiting, bot detection, challenges and caching (cached responses cost the origin nothing).

> [!REAL] A flood at the gate
> A DDoS attack is like a thousand people blocking a shop's entrance so real customers can't get in. A CDN spreads the crowd across hundreds of locations and turns away the fakes. In 2023, Cloudflare and Google reported absorbing attacks of hundreds of millions of requests per second.

### Web Application Firewall (WAF)
Inspects HTTP requests and blocks common attacks before they reach your servers: SQL injection, cross-site scripting, path traversal, known exploit signatures. Managed rule sets are updated as new vulnerabilities appear, giving you **virtual patching** while you fix the application.

> [!REAL] The security guard who checks bags
> A WAF looks inside each request for known attack patterns like SQL injection (`' OR 1=1 --`) and blocks it before it reaches your servers.

### Bot management
Distinguishes humans, good bots (search crawlers) and bad bots (scrapers, credential stuffing, inventory hoarding during sales) using fingerprints, behaviour and challenges.

> [!REAL] Tatkal ticket bots
> Scripts that grab Tatkal tickets or sneakers in seconds look like users but behave like machines. Bot management spots that behaviour and challenges or blocks it.

### Rate limiting
Limits per IP, per API key or per path (e.g. 5 login attempts per minute) at the edge, so abusive traffic never consumes origin resources.

### TLS at the edge
- The CDN terminates TLS close to users (faster handshakes) and manages certificates.
- Use **TLS 1.2+** (prefer 1.3), HSTS, and re-encrypt traffic from the CDN to the origin.

## Protecting the origin

A CDN only protects you if attackers cannot go around it.

- **Hide or lock down the origin:** accept traffic only from the CDN's IP ranges, or require a secret header, or use mutual TLS between CDN and origin, or keep the origin entirely private and let the CDN connect through a tunnel.
- **Don't leak the origin IP** through DNS history, mail servers or other subdomains that point directly at it.

## Protecting content

### Signed URLs and signed cookies
For paid or private content (videos, downloads, documents), the application issues a URL containing an expiry time and a cryptographic signature. The edge verifies the signature before serving. Links stop working after expiry and cannot be modified.

```text
https://cdn.example.com/videos/ep1/720p.m3u8?expires=1767225600&sig=7c1e…
```

> [!REAL] A movie ticket with your seat and time
> A signed URL is like a ticket that works only for one movie, one show time and expires afterwards. Udemy and Netflix use signed URLs so a copied video link stops working.

### Hotlink protection
Block other websites from embedding your images and making you pay for their bandwidth, by checking the `Referer` or requiring signed URLs.

> [!REAL] Someone else using your water tap
> Another site embeds your images directly, and you pay the bandwidth. Hotlink protection refuses requests whose `Referer` isn't your own site.

### Geo-restrictions
Block or allow countries for licensing or legal reasons.

> [!REAL] Matches available only in some countries
> A cricket match may stream on Hotstar in India but be licensed to a different broadcaster abroad. The CDN checks the viewer's country and blocks unlicensed regions.

## Configuration risks

> [!WARNING] Caching private data publicly
> The most damaging CDN mistake is caching a personalised response (account page, API returning user data) as public. The next user then receives someone else's data. Mark such responses `private, no-store`, and never let the CDN cache responses that depend on cookies or auth headers unless the key includes them.

- **Web cache poisoning / deception:** attackers trick the cache into storing a malicious or private response under a public key (e.g. through unkeyed headers that change the response, or path tricks like `/account/profile.css`). Defences: only cache by explicit rules for known static paths, include relevant headers in the cache key, and avoid caching based on file extension alone.
- **Over-broad purge permissions:** protect purge APIs; a mass purge is effectively a self-inflicted origin attack.

## Reliability

### The CDN as an availability layer
- **Stale-if-error / serve-stale:** if the origin is down or returns errors, the edge keeps serving the last good copy. Many outages go unnoticed by users because of this.
- **Origin failover:** configure a primary and a backup origin (another region or a static fallback bucket); the CDN switches on health-check failure.
- **Load balancing across origins** in multiple regions.

### The CDN as a dependency
The CDN can fail too. Large CDN outages have taken down major parts of the web at once. For critical services:
- **Multi-CDN:** two providers, with DNS-based traffic steering between them based on health and performance.
- Keep the ability to bypass the CDN in an emergency (with origin capacity and protection to match).
- Monitor from real user locations, not just from inside your cloud.

> [!INTERVIEW] Edge security in a design
> "Everything public goes through the CDN with WAF managed rules and per-IP rate limits on login and search. The origin load balancer only accepts CDN IP ranges plus a shared secret header. Paid videos use signed URLs that expire after two hours. If the origin fails, the edge serves stale catalogue pages for up to an hour."

> [!REAL] When the CDN itself goes down
> In June 2021, a bug at Fastly briefly took down sites including Amazon, Reddit and the UK government's website. Critical sites keep a second CDN or a way to bypass it.

## Key takeaways

- CDNs absorb DDoS attacks, run WAF rules, manage bots and rate-limit at the edge.
- Lock the origin down so attackers can't bypass the CDN.
- Signed URLs protect private content; never cache personalised responses publicly.
- Serve-stale and origin failover improve availability; multi-CDN protects against the CDN itself failing.
