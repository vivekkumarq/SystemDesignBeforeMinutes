Answer aloud first, then open each to compare.

## Interview questions

<details>
<summary>What happens when you type a URL into a browser and press Enter?</summary>

The browser checks its caches, then resolves the hostname via DNS (OS cache, recursive resolver, root/TLD/authoritative servers if needed). It opens a TCP connection (or QUIC), performs a TLS handshake, sends the HTTP request, which is usually answered by a CDN edge or passed through load balancers to application servers. The browser parses the HTML, fetches sub-resources (multiplexed over HTTP/2 or 3), runs JavaScript and renders the page.

</details>

<details>
<summary>TCP vs UDP: when would you choose UDP?</summary>

When timeliness matters more than completeness: voice and video calls, live streaming, games, DNS queries. A retransmitted packet would arrive too late to be useful. UDP has no handshake, ordering or retransmission, so latency is minimal. QUIC builds reliability per stream on top of UDP.

</details>

<details>
<summary>What problem does HTTP/2 solve, and what does HTTP/3 add?</summary>

HTTP/2 multiplexes many requests over one TCP connection with header compression, removing HTTP/1.1's one-request-at-a-time limit. But one lost TCP packet still stalls every stream. HTTP/3 runs over QUIC (UDP), where streams are independent, handshakes are faster (combined with TLS 1.3, 0-RTT on resumption) and connections survive network changes.

</details>

<details>
<summary>Explain DNS resolution and where caching happens.</summary>

Browser and OS caches, then the recursive resolver, which asks root servers for the TLD servers, the TLD for the domain's authoritative servers, and the authoritative server for the record. Each answer is cached for its TTL at the resolver, OS and browser, so most lookups are served from cache.

</details>

<details>
<summary>How would you migrate a service to a new IP with minimal disruption?</summary>

Lower the record's TTL (e.g. to 60 s) a day or two before, so long-cached copies expire. Run old and new endpoints in parallel, switch the record, watch traffic move, then keep the old endpoint alive until traffic on it drops to zero (some clients ignore TTLs). Restore a longer TTL afterwards.

</details>

<details>
<summary>How can DNS be used for load balancing, and what are its limits?</summary>

Round-robin, weighted, geolocation/latency-based and health-checked answers. Limits: caching means changes and failovers are slow and not fully controllable; the authoritative server often sees the resolver's location rather than the user's; there is no per-request load awareness. Use it for coarse, global steering and rely on in-region load balancers for the rest.

</details>

<details>
<summary>What is DNSSEC, and what doesn't it protect against?</summary>

DNSSEC signs records so validating resolvers can verify they are authentic, which defeats cache poisoning. It doesn't encrypt queries (DoH/DoT do that), and it doesn't help if attackers take over your registrar or DNS provider account and change records legitimately.

</details>

<details>
<summary>How do you make DNS not a single point of failure?</summary>

Use an anycast provider, add a second independent authoritative provider listed in your NS records, keep zones in sync via DNS-as-code, choose TTLs so cached answers survive brief outages, and monitor resolution from many locations.

</details>

<details>
<summary>What is TCP slow start and why does it matter?</summary>

New TCP connections begin by sending a small amount of data and double it each round trip until loss occurs, so a fresh connection can't use the full bandwidth immediately. Reusing connections (keep-alive, HTTP/2, connection pools) and edge termination avoid repeatedly paying this cost.

</details>

## Cheatsheet

| Topic | Remember |
|---|---|
| Layers | L7 app · L4 TCP/UDP/QUIC · L3 IP · L2/L1 link |
| TCP | Handshake, reliable, ordered, congestion control, HOL blocking |
| UDP | No handshake, no guarantees, lowest latency |
| TLS 1.3 | 1-RTT handshake, 0-RTT resumption |
| HTTP/2 | Multiplexing over one TCP connection |
| HTTP/3 | QUIC over UDP; no TCP HOL blocking; connection migration |
| DNS chain | Browser → OS → resolver → root → TLD → authoritative |
| Records | A/AAAA, CNAME, NS, MX, TXT, SRV, CAA |
| TTL | Long = fast + slow to change; lower before migrations |
| DNS routing | Weighted, geo/latency, health-checked failover |
| DNS security | Poisoning → DNSSEC; privacy → DoH/DoT; hijack → account lock + MFA |
| Resilience | Anycast, two providers, DNS as code, monitoring |

## Quiz

```quiz
[
  {"q": "Which protocol is the better fit for a live voice call?", "options": ["TCP", "UDP-based (e.g. WebRTC)", "HTTP/1.1 polling", "SMTP"], "answer": 1, "why": "Late audio packets are useless; dropping beats retransmitting."},
  {"q": "What does HTTP/3 fix that HTTP/2 cannot?", "options": ["Header compression", "Multiplexing", "TCP head-of-line blocking across streams", "Caching"], "answer": 2, "why": "QUIC streams are independent, so one lost packet doesn't stall the others."},
  {"q": "You plan to move a domain to a new IP next week. What should you do now?", "options": ["Raise the TTL", "Lower the TTL", "Remove the A record", "Enable DNSSEC"], "answer": 1, "why": "Lowering it in advance ensures caches expire quickly at switch time."},
  {"q": "DNSSEC primarily protects against…", "options": ["Eavesdropping on queries", "Forged DNS answers", "DDoS on name servers", "Registrar account takeover"], "answer": 1, "why": "Signatures let resolvers verify answers are authentic."},
  {"q": "Which server holds the actual record for shop.example.com?", "options": ["Root server", ".com TLD server", "Authoritative server for example.com", "The browser"], "answer": 2, "why": "Root and TLD servers only refer the resolver onward."}
]
```
