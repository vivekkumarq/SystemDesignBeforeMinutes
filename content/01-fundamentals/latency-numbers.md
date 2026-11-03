Designing a fast system starts with knowing what is slow. The numbers below are approximate and shift with hardware generations, but their **ratios** have stayed remarkably stable. Those ratios are what you reason with.

## The cheatsheet

| Operation | Approx. time | Think of it as |
|---|---|---|
| L1 cache reference | 1 ns | instant |
| Branch mispredict | 3 ns | |
| L2 cache reference | 4 ns | |
| Mutex lock/unlock | 20 ns | |
| Main memory (RAM) reference | 100 ns | 100× L1 |
| Compress 1 KB with a fast codec | 2 µs | |
| Send 1 KB over a 10 Gbps network | 1 µs | |
| Read 4 KB randomly from an SSD | 20–100 µs | |
| Read 1 MB sequentially from RAM | 3 µs | |
| Round trip within one data centre | 500 µs | 0.5 ms |
| Read 1 MB sequentially from an SSD | 50 µs – 1 ms | |
| Disk (HDD) seek | 2–10 ms | |
| Read 1 MB sequentially from an HDD | 5–10 ms | |
| Round trip between nearby regions | 10–40 ms | |
| Round trip India ↔ US East | ~200–250 ms | |
| Round trip across the globe | ~150–300 ms | |

Units: 1 ns = 10⁻⁹ s, 1 µs = 10⁻⁶ s, 1 ms = 10⁻³ s.

## Make it human

Scale everything up so that 1 ns becomes 1 second:

- L1 cache hit: **1 second**
- RAM access: **under 2 minutes**
- SSD random read: **about a day**
- Network round trip inside a data centre: **about 6 days**
- HDD seek: **3 to 4 months**
- Round trip to another continent: **5 to 8 years**

That is why caching works, and why a chatty service that calls another region ten times per request feels painfully slow.

> [!REAL] Fetching sugar
> Reading from memory is taking sugar from the jar on the kitchen counter. Reading from SSD is walking to the store room. A network call inside the data centre is popping to the neighbour's house. A call to another continent is ordering sugar by post from abroad. That's why you cache.

## Lessons that fall out of these numbers

### 1. Memory is far faster than disk
Reading from RAM is roughly 1,000× faster than an SSD random read and 100,000× faster than an HDD seek. This is the entire justification for caches like Redis and for keeping hot indexes in memory.

> [!REAL] Why Redis exists
> A Flipkart product page that reads price and stock from Redis (memory) answers in about 1 ms; the same read from a disk-backed database under load can take 10–20 ms. Over 30 lookups per page, that's the difference between a snappy page and a sluggish one.

### 2. Sequential beats random
A disk reading sequentially is many times faster than one jumping around. Databases exploit this with **write-ahead logs** and **log-structured storage** (LSM trees), which turn random writes into sequential appends. Kafka's speed comes from the same idea. See [How Databases Store Data on Disk](#/l/03-databases/storage-engines).

> [!REAL] Reading a novel vs a dictionary
> Reading a novel page by page is fast. Looking up 500 random words in a dictionary means flipping back and forth. Kafka is fast because it only appends to the end of a file and reads it front to back.

### 3. Network calls are expensive, cross-region calls more so
A call inside a data centre costs ~0.5 ms. A call to another region costs 50–100× more. Design rules that follow:
- Batch requests instead of making many small ones.
- Avoid synchronous cross-region calls on the request path.
- Put data close to users (CDNs, regional replicas).

> [!REAL] The 40-call page
> If a page makes 40 service calls one after another at 5 ms each, the user waits 200 ms before anything else happens. Batch them, run them in parallel, or put the services in the same region.

### 4. The speed of light is a hard limit
Light in fibre travels about 200,000 km/s, so a 10,000 km trip takes at least 50 ms one way. No amount of engineering removes that. If a user in Mumbai talks to a server in Virginia, every round trip costs ~200 ms before your code runs at all. A TLS handshake plus the request can take three or four round trips.

> [!REAL] Mumbai to New York
> Mumbai to New York is ~12,500 km; light in fibre needs ~60 ms one way, ~120 ms there and back, before any server work. That's why Netflix, Google and others put servers inside Indian ISPs instead of serving India from the US.

### 5. Compression is cheap
Compressing data costs microseconds; sending it across a network costs milliseconds. Compressing before sending is almost always worth it.

> [!REAL] Vacuum-packed luggage
> Vacuum-packing clothes takes a minute but saves a whole suitcase. Gzip/Brotli on a 500 KB JSON response takes microseconds and can shrink it to ~80 KB, which matters a lot on a 4G connection.

## Using these numbers in an interview

```text
"Each feed request makes 3 sequential calls inside the data centre (~1.5 ms),
 one Redis lookup (~0.5 ms) and, on a cache miss, one database query that
 hits an index in memory (~2–5 ms). So p50 around 10 ms is realistic.
 If we called the recommendation service in another region synchronously,
 we would add ~80 ms, so that call has to be asynchronous or precomputed."
```

That kind of reasoning shows you can **budget latency**, which is exactly what senior engineers do.

> [!INTERVIEW] Latency budgets
> If the product needs a page in 200 ms and the network round trip from the user already costs 100 ms, your backend has about 100 ms in total. Divide it among the services you call. Anything that does not fit has to be cached, precomputed or moved off the request path.

## Key takeaways

- Memory ≫ SSD ≫ HDD ≫ network to another continent.
- Sequential I/O is dramatically faster than random I/O.
- Count network round trips; cross-region ones dominate latency.
- Use these numbers to build a latency budget for the request path.
