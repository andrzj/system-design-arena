-- Seed sample problems for System Design Arena
-- Run this AFTER schema.sql

-- Problem 1: Design a URL Shortener
INSERT INTO problems (
  title,
  slug,
  difficulty,
  tags,
  brief,
  requirements,
  key_considerations,
  reference_architecture,
  "order",
  is_public
) VALUES (
  'Design a URL Shortener',
  'design-url-shortener',
  'easy',
  ARRAY['hashing', 'caching', 'databases', 'scalability'],
  'Build a service like bit.ly that maps long URLs to short codes at scale.',
  '1. Shorten a long URL to a 7-character alias (e.g., bit.ly/abc123).
2. Redirect users from the short URL to the original URL.
3. Handle 100M URLs/day with a 10:1 read-to-write ratio.
4. Ensure high availability and low latency globally.',
  '1. Hash generation: How to generate unique short codes? (Base62, MD5, SHA-1, or custom hash)
2. Collision handling: What if two URLs generate the same hash?
3. Storage: Where to store the mappings? (SQL vs NoSQL, read/write patterns)
4. Caching: How to reduce database load for popular URLs?
5. CDN: How to distribute redirects globally?
6. Analytics: How to track clicks and user data?',
  '```mermaid
graph TD
    A[Client] -->|shorten| B[Load Balancer]
    B --> C[App Server]
    C --> D[Cache]
    D -->|hit| A
    D -->|miss| E[Database]
    E -->|store| D
    E --> C
    A -->|redirect| F[CDN]
    F -->|hit| A
    F -->|miss| B
```',
  1,
  true
);

-- Problem 2: Design a News Feed
INSERT INTO problems (
  title,
  slug,
  difficulty,
  tags,
  brief,
  requirements,
  key_considerations,
  reference_architecture,
  "order",
  is_public
) VALUES (
  'Design a News Feed',
  'design-news-feed',
  'medium',
  ARRAY['feeds', 'storage', 'caching', 'realtime'],
  'Build a personalized news feed for a social media app like Facebook or Twitter.',
  '1. Users should see a ranked list of posts from people they follow.
2. Posts should be ordered by relevance (not just chronological).
3. Support 1B daily active users with 10M new posts/day.
4. Ensure low latency (<100ms) for feed generation.
5. Handle real-time updates (new posts, likes, comments).',
  '1. Feed generation: Pull vs push model for generating feeds.
2. Ranking: How to rank posts by relevance? (Engagement, recency, user preferences)
3. Storage: How to store posts and user relationships? (SQL vs NoSQL)
4. Caching: How to cache feeds for fast retrieval?
5. Fan-out: How to distribute new posts to followers efficiently?
6. Real-time updates: How to push new posts to users in real-time?
7. Scalability: How to handle hot users (celebrities with millions of followers)?',
  '```mermaid
graph TD
    A[User] -->|request feed| B[Load Balancer]
    B --> C[Feed Service]
    C --> D[Cache]
    D -->|hit| C
    D -->|miss| E[Database]
    E -->|posts| C
    C -->|ranked feed| A
    F[Post Service] -->|new post| G[Fan-out Service]
    G -->|push to followers| H[Message Queue]
    H -->|update feeds| D
```',
  2,
  true
);

-- Problem 3: Design a Rate Limiter
INSERT INTO problems (
  title,
  slug,
  difficulty,
  tags,
  brief,
  requirements,
  key_considerations,
  reference_architecture,
  "order",
  is_public
) VALUES (
  'Design a Rate Limiter',
  'design-rate-limiter',
  'hard',
  ARRAY['algorithms', 'distributed systems', 'caching', 'scalability'],
  'Build a distributed rate limiter to protect APIs from abuse and DDoS attacks.',
  '1. Limit API requests to 1000 requests/hour per user.
2. Support 1M concurrent users across multiple data centers.
3. Ensure low latency (<10ms) for rate limit checks.
4. Handle burst traffic gracefully.
5. Provide accurate rate limiting even if the user is behind a proxy or VPN.',
  '1. Algorithm: Token bucket vs fixed window vs sliding window.
2. Storage: Where to store rate limit counters? (Redis, in-memory, database)
3. Distributed coordination: How to synchronize counters across data centers?
4. Granularity: Per-user, per-IP, per-endpoint, or per-API key?
5. Burst handling: How to allow short bursts without compromising security?
6. Accuracy: How to avoid false positives/negatives?
7. Fallback: What to do if the rate limiter service fails?',
  '```mermaid
graph TD
    A[Client] -->|request| B[API Gateway]
    B --> C[Rate Limiter Service]
    C --> D[Redis Cluster]
    D -->|counter| C
    C -->|allow/deny| B
    B -->|allow| E[API Service]
    B -->|deny| A
```',
  3,
  true
);

-- Problem 4: Design a Chat System
INSERT INTO problems (
  title,
  slug,
  difficulty,
  tags,
  brief,
  requirements,
  key_considerations,
  reference_architecture,
  "order",
  is_public
) VALUES (
  'Design a Chat System',
  'design-chat-system',
  'medium',
  ARRAY['realtime', 'websockets', 'scalability', 'storage'],
  'Build a real-time chat system like WhatsApp or Slack for 10M concurrent users.',
  '1. Support 1:1 and group chats (up to 100 users per group).
2. Deliver messages in real-time (<100ms latency).
3. Store messages for offline users and sync when they come online.
4. Support message status (sent, delivered, read).
5. Handle 100K messages/second at peak.
6. Ensure end-to-end encryption for 1:1 chats.',
  '1. Real-time delivery: WebSockets vs polling vs Server-Sent Events.
2. Message storage: How to store messages? (SQL vs NoSQL, indexing)
3. Group chats: How to fan-out messages to group members?
4. Offline support: How to sync messages when users come online?
5. Message status: How to track sent/delivered/read status?
6. Scalability: How to handle 10M concurrent connections?
7. Encryption: How to implement end-to-end encryption?',
  '```mermaid
graph TD
    A[User 1] -->|WebSocket| B[Load Balancer]
    B --> C[Chat Service]
    C --> D[Message Queue]
    D --> E[Fan-out Service]
    E --> F[User 2 WebSocket]
    E --> G[User 3 WebSocket]
    C --> H[Database]
    H -->|store| C
    I[Offline User] -->|poll| C
```',
  4,
  true
);

-- Problem 5: Design a Distributed Cache
INSERT INTO problems (
  title,
  slug,
  difficulty,
  tags,
  brief,
  requirements,
  key_considerations,
  reference_architecture,
  "order",
  is_public
) VALUES (
  'Design a Distributed Cache',
  'design-distributed-cache',
  'hard',
  ARRAY['caching', 'distributed systems', 'consistency', 'scalability'],
  'Build a distributed cache like Redis or Memcached for a high-traffic e-commerce site.',
  '1. Support 10K requests/second with <10ms latency.
2. Cache 100GB of data across 100 nodes.
3. Ensure high availability (99.99% uptime).
4. Handle cache eviction and memory management.
5. Support data persistence for disaster recovery.
6. Provide strong consistency for critical data (e.g., inventory).',
  '1. Data partitioning: How to distribute data across nodes? (Consistent hashing)
2. Replication: How to replicate data for fault tolerance?
3. Consistency: Strong vs eventual consistency for different data types.
4. Eviction policy: LRU vs LFU vs FIFO for cache eviction.
5. Memory management: How to handle memory fragmentation?
6. Scalability: How to add/remove nodes without downtime?
7. Persistence: How to persist data to disk for recovery?',
  '```mermaid
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Cache Node 1]
    B --> D[Cache Node 2]
    B --> E[Cache Node 3]
    C --> F[Consistent Hash Ring]
    D --> F
    E --> F
    F -->|partition| C
    F -->|partition| D
    F -->|partition| E
    C --> G[Replica Node 1]
    D --> H[Replica Node 2]
    E --> I[Replica Node 3]
```',
  5,
  true
);

-- Seed sample articles for the /learn section
INSERT INTO articles (
  title,
  slug,
  category,
  summary,
  content,
  featured,
  related_problem_ids,
  "order",
  is_published
) VALUES (
  'Introduction to System Design',
  'intro-to-system-design',
  'foundations',
  'Learn the fundamentals of system design, including scalability, availability, and common architectural patterns.',
  '# Introduction to System Design\n\nSystem design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements. It is a critical skill for software engineers, especially those preparing for technical interviews.\n\n## Key Concepts\n\n### Scalability\nScalability refers to the ability of a system to handle increased load by adding resources (horizontal scaling) or upgrading existing resources (vertical scaling).\n\n### Availability\nAvailability is the proportion of time a system is operational and accessible. It is often measured in "nines" (e.g., 99.9% availability means ~8.76 hours of downtime per year).\n\n### Latency vs Throughput\n- **Latency**: The time it takes for a single request to complete (e.g., 100ms).\n- **Throughput**: The number of requests a system can handle per unit of time (e.g., 1000 requests/second).\n\n## Common Architectural Patterns\n\n### Monolithic Architecture\nA single, unified codebase where all components are tightly coupled. Simple to develop but hard to scale.\n\n### Microservices Architecture\nThe system is broken into small, independent services that communicate via APIs. Highly scalable but complex to manage.\n\n### Serverless Architecture\nThe cloud provider manages the infrastructure, and you only pay for the compute time you use. Great for sporadic workloads.\n\n## Next Steps\n- Try a [system design problem](/problems) to apply these concepts.\n- Read more about [scalability patterns](/learn/scalability-patterns).',
  true,
  ARRAY[1, 2, 3],
  1,
  true
);

INSERT INTO articles (
  title,
  slug,
  category,
  summary,
  content,
  featured,
  related_problem_ids,
  "order",
  is_published
) VALUES (
  'Scalability Patterns: Caching and CDNs',
  'scalability-patterns-caching-cdns',
  'foundations',
  'Learn how caching and CDNs can improve performance and reduce load on your backend systems.',
  '# Scalability Patterns: Caching and CDNs\n\nCaching and Content Delivery Networks (CDNs) are two of the most effective ways to improve the performance and scalability of a system. This article explains how they work and when to use them.\n\n## Caching\n\nCaching stores copies of data in a fast-access layer (e.g., memory) to reduce latency and backend load.\n\n### Types of Caches\n1. **Client-Side Caching**: Browsers cache static assets (HTML, CSS, JS) to avoid re-downloading them.\n2. **Server-Side Caching**: Backend services cache database queries or computed results (e.g., Redis, Memcached).\n3. **Database Caching**: Databases like PostgreSQL cache frequently accessed data in memory.\n\n### Cache Invalidation\nCache invalidation is the process of removing stale data from the cache. Common strategies:\n- **Time-Based**: Data expires after a set time (TTL).\n- **Event-Based**: Data is invalidated when the source changes (e.g., database update).\n- **Write-Through**: Data is written to both the cache and the database simultaneously.\n\n## Content Delivery Networks (CDNs)\n\nCDNs distribute static assets (images, videos, CSS, JS) across geographically dispersed servers to reduce latency for users.\n\n### How CDNs Work\n1. A user requests an asset (e.g., `https://cdn.example.com/image.jpg`).\n2. The CDN routes the request to the nearest edge server.\n3. If the asset is cached, it is served immediately. If not, the edge server fetches it from the origin server and caches it.\n\n### Benefits of CDNs\n- **Reduced Latency**: Users get assets from a nearby server.\n- **Lower Bandwidth Costs**: Less traffic hits your origin server.\n- **Improved Availability**: CDNs can handle traffic spikes and DDoS attacks.\n\n## When to Use Caching and CDNs\n\n| Use Case | Caching | CDN |\n|---|---|---|\n| Reduce database load | ✅ | ❌ |\n| Serve static assets | ❌ | ✅ |\n| Personalized content | ✅ | ❌ |\n| Dynamic content | ✅ | ❌ |\n\n## Example: Caching in a URL Shortener\n\nIn a [URL shortener](/problems/design-url-shortener), caching can:\n- Reduce database lookups for popular URLs.\n- Improve redirect latency.\n\n## Example: CDN in a News Feed\n\nIn a [news feed](/problems/design-news-feed), a CDN can:\n- Serve static assets (images, videos) globally.\n- Reduce load on the origin server.\n\n## Next Steps\n- Try the [URL Shortener](/problems/design-url-shortener) problem to practice caching.\n- Try the [News Feed](/problems/design-news-feed) problem to practice CDNs.',
  false,
  ARRAY[1, 2],
  2,
  true
);

INSERT INTO articles (
  title,
  slug,
  category,
  summary,
  content,
  featured,
  related_problem_ids,
  "order",
  is_published
) VALUES (
  'Designing Feeds and Storage Systems',
  'designing-feeds-storage-systems',
  'feeds-storage',
  'Learn how to design scalable feed systems and storage architectures for social media apps.',
  '# Designing Feeds and Storage Systems\n\nFeed systems and storage architectures are critical components of social media apps, news aggregators, and content platforms. This article explains how to design them for scalability and performance.\n\n## Feed Systems\n\nA feed system displays a ranked list of content to users (e.g., Facebook News Feed, Twitter Timeline).\n\n### Feed Generation Models\n1. **Pull Model (Fan-Out on Read)**\n   - When a user requests their feed, the system fetches the latest posts from all followed users.\n   - Pros: Simple, always up-to-date.\n   - Cons: Slow for users with many followers (e.g., celebrities).\n\n2. **Push Model (Fan-Out on Write)**\n   - When a user creates a post, the system pushes it to the feeds of all followers.\n   - Pros: Fast feed retrieval.\n   - Cons: High write load, slow for users with many followers.\n\n3. **Hybrid Model**\n   - Use the push model for most users and the pull model for celebrities (users with many followers).\n   - Pros: Balances read and write performance.\n   - Cons: More complex to implement.\n\n### Ranking Feeds\n\nFeeds are rarely purely chronological. Instead, they are ranked by relevance using:\n- **Engagement**: Likes, comments, shares.\n- **Recency**: Newer posts are prioritized.\n- **User Preferences**: Topics the user interacts with.\n- **Diversity**: Avoid showing too many posts from the same user.\n\n## Storage Systems\n\nStorage systems must handle large volumes of data while ensuring low latency and high availability.\n\n### SQL vs NoSQL\n\n| Criteria | SQL (e.g., PostgreSQL) | NoSQL (e.g., MongoDB, Cassandra) |\n|---|---|---|\n| Schema | Fixed schema | Schema-less |\n| Scalability | Vertical scaling | Horizontal scaling |\n| Joins | Supported | Not supported |\n| Transactions | ACID | BASE |\n| Use Case | Structured data, complex queries | Unstructured data, high write throughput |\n\n### Data Partitioning\n\nPartitioning (sharding) distributes data across multiple servers to improve scalability.\n\n#### Types of Partitioning\n1. **Range-Based Partitioning**: Data is divided into ranges (e.g., users A-F, G-M, N-Z).\n   - Pros: Simple to implement.\n   - Cons: Uneven distribution if ranges are skewed.\n\n2. **Hash-Based Partitioning**: Data is hashed to determine the partition.\n   - Pros: Even distribution.\n   - Cons: Harder to range-query.\n\n3. **Directory-Based Partitioning**: A lookup service maps keys to partitions.\n   - Pros: Flexible.\n   - Cons: Lookup service can become a bottleneck.\n\n### Replication\n\nReplication copies data across multiple servers to improve availability and fault tolerance.\n\n#### Types of Replication\n1. **Leader-Follower**: One leader handles writes, followers handle reads.\n   - Pros: Strong consistency.\n   - Cons: Leader can become a bottleneck.\n\n2. **Multi-Leader**: Multiple leaders handle writes.\n   - Pros: Higher write throughput.\n   - Cons: Conflict resolution is complex.\n\n3. **Leaderless**: Any node can handle reads and writes.\n   - Pros: High availability.\n   - Cons: Eventual consistency.\n\n## Example: Designing a News Feed\n\nIn the [News Feed](/problems/design-news-feed) problem, you can apply these concepts:\n- Use a **hybrid model** for feed generation.\n- Store posts in a **NoSQL database** (e.g., Cassandra) for scalability.\n- Use **hash-based partitioning** to distribute posts evenly.\n- Use **leader-follower replication** for fault tolerance.\n\n## Next Steps\n- Try the [News Feed](/problems/design-news-feed) problem to practice feed systems.\n- Try the [Distributed Cache](/problems/design-distributed-cache) problem to practice storage systems.',
  true,
  ARRAY[2, 5],
  3,
  true
);
