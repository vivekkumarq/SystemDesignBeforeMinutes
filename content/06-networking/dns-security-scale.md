If DNS fails, your service is unreachable even when every server is healthy. DNS is therefore both a security target and a critical dependency. This lesson covers the attacks, the defences and how large organisations run DNS reliably.

## Threats

### Cache poisoning (spoofing)
An attacker tricks a recursive resolver into caching a forged answer, so users asking for `bank.com` are sent to the attacker's IP. Classic attacks guessed the query ID and raced the real answer.
- **Defences:** source-port and query-ID randomisation in resolvers, and **DNSSEC**.

> [!REAL] A fake signboard
> Someone swaps the street sign so everyone heading to the bank ends up at a fake bank. A poisoned DNS cache sends users to a lookalike site with the real domain name in the address bar.

### DNS hijacking
The attacker changes the real records, by compromising the registrar account, the DNS provider account, or the domain's name-server delegation.
- **Defences:** registrar lock and registry lock, multi-factor authentication and least-privilege access on DNS accounts, change alerts, infrastructure-as-code with review.

> [!REAL] Someone changes your registered address
> If an attacker gets into your domain registrar account, they can point your domain anywhere. Registrar locks and 2FA on that account are basic hygiene.

### DDoS against DNS
Flooding authoritative servers with queries (often random subdomains, so caches don't help) makes the domain unresolvable. Large DNS outages have taken down many major sites at once.
- **Defences:** anycast providers with huge capacity, multiple independent providers, rate limiting.

> [!REAL] The 2016 Dyn attack
> In October 2016 the Mirai botnet, made of hacked cameras and routers, flooded the DNS provider Dyn. Twitter, Netflix, Reddit and GitHub became unreachable for many users because their names couldn't be looked up.

### DNS amplification (you as the weapon)
Attackers send small queries with a spoofed source IP to open resolvers, which send large responses to the victim.
- **Defences:** never run open resolvers; response rate limiting on authoritative servers.

### Subdomain takeover
A record points to a resource you no longer own (a deleted cloud bucket or app). An attacker claims that resource and now serves content under your domain.
- **Defences:** remove records when decommissioning resources; audit dangling CNAMEs regularly.

> [!REAL] An old shop board still up
> You close your shop on `promo.example.com` (a deleted cloud bucket) but leave the signboard (DNS record). Someone else rents the empty shop and now serves anything under your name. Delete DNS records when you delete the resource.

### Privacy and tampering on the network
Traditional DNS queries travel unencrypted, so networks can observe or alter them.
- **DNS over HTTPS (DoH)** and **DNS over TLS (DoT)** encrypt the query between client and resolver.

## DNSSEC

DNSSEC adds **cryptographic signatures** to DNS records.

- Each zone signs its records; the parent zone vouches for the child's key, forming a **chain of trust** from the root down.
- A validating resolver can prove an answer is authentic and unmodified, defeating cache poisoning.
- It does **not** encrypt anything (that's DoH/DoT), and it does not protect against a compromised registrar account.
- Operational cost: key management and key rollovers; mistakes can make a domain unresolvable for validating resolvers.

## Running DNS at scale

### Use more than one provider
A single DNS provider is a single point of failure. Many large companies serve their zone from **two independent authoritative providers**, both listed in NS records. If one is attacked or fails, resolvers use the other. The cost: keeping zones in sync, and some advanced features (traffic steering) differ between providers.

> [!REAL] Two phone networks
> Many people keep two SIMs so one network outage doesn't cut them off. After the Dyn attack, many large sites started using two DNS providers.

### Manage DNS as code
Store zones in version control and apply them through a pipeline (e.g. Terraform, OctoDNS). Benefits: review, history, rollback, synchronisation across providers, and fewer typos taking production down.

### Separate internal and external DNS
- **Public zones** expose only what must be public.
- **Private zones / split-horizon DNS** resolve internal names only inside the network, so internal topology is not exposed.

### Monitoring
- Resolve your key names from many locations continuously and alert on failures or wrong answers.
- Track query volume (spikes can indicate attacks), latency and error codes (`SERVFAIL`, `NXDOMAIN` rates).
- Monitor certificate and domain expiry: an expired domain registration is an entirely avoidable outage.

### Sensible TTL strategy
- Short TTLs on records involved in failover.
- Longer TTLs on stable records, which also reduces dependence on the provider during an outage (cached answers keep working).
- Some teams deliberately keep moderately long TTLs on critical records so a brief provider outage goes unnoticed. That trades failover speed for resilience.

### Internal resolver resilience
Large fleets run caching resolvers close to workloads (per host or per zone), so a slow upstream resolver doesn't slow every service call, and so query volume to upstreams stays manageable.

## Checklist

| Area | Practice |
|---|---|
| Accounts | MFA, least privilege, registrar + registry lock |
| Integrity | DNSSEC where operationally ready |
| Availability | Anycast, two authoritative providers |
| Change safety | DNS as code, review, alerts on changes |
| Hygiene | Remove dangling records; monitor domain and cert expiry |
| Privacy | DoH/DoT for clients; split-horizon for internal names |
| Observability | Global synthetic resolution checks, query metrics |

> [!INTERVIEW] DNS as a dependency
> "DNS is in the request path for every new client, so I treat it like any critical dependency: two authoritative providers, records managed as code, 60-second TTLs only on the failover records, and synthetic checks from several countries that page us if resolution fails."

## Key takeaways

- Attacks target resolvers (poisoning), accounts (hijacking), capacity (DDoS) and forgotten records (takeover).
- DNSSEC proves authenticity; DoH/DoT provide privacy; neither replaces account security.
- Large organisations use anycast, multiple providers, DNS-as-code and continuous monitoring.
- Choose TTLs balancing failover speed against resilience to provider outages.
