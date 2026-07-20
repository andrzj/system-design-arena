import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function articleContent(title: string, topic: string) {
  return `# ${title}

${topic} is a core concept in system design interviews and production engineering.

## Why This Matters

Understanding ${topic.toLowerCase()} helps you make trade-offs under real constraints like latency, cost, and reliability.

## Mental Model

Break the problem into read path, write path, and failure modes. Identify bottlenecks before adding complexity.

## Key Ideas

- Start with requirements and scale estimates.
- Prefer simple designs that can evolve.
- Use caching, partitioning, and async work where they clearly help.

## Interview Walkthrough

State assumptions, estimate traffic, sketch a high-level diagram, then deep-dive on the riskiest component.

## Common Mistakes

Over-engineering early, ignoring operational cost, and skipping back-of-the-envelope math.

## Practice in Arena

Apply this concept in a [design session](/problems).`;
}

const problems = [
  {
    title: 'Design a URL Shortener',
    slug: 'design-url-shortener',
    difficulty: 'easy',
    tags: ['hashing', 'caching', 'databases', 'scalability'],
    brief: 'Build a service like bit.ly that maps long URLs to short codes at scale.',
    requirements: `1. Shorten a long URL to a 7-character alias (e.g., bit.ly/abc123).
2. Redirect users from the short URL to the original URL.
3. Handle 100M URLs/day with a 10:1 read-to-write ratio.
4. Ensure high availability and low latency globally.`,
    keyConsiderations: `1. Hash generation: How to generate unique short codes? (Base62, MD5, SHA-1, or custom hash)
2. Collision handling: What if two URLs generate the same hash?
3. Storage: Where to store the mappings? (SQL vs NoSQL, read/write patterns)
4. Caching: How to reduce database load for popular URLs?
5. CDN: How to distribute redirects globally?
6. Analytics: How to track clicks and user data?`,
    referenceArchitecture: `\`\`\`mermaid
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
\`\`\``,
    order: 1,
  },
  {
    title: 'Design a News Feed',
    slug: 'design-news-feed',
    difficulty: 'medium',
    tags: ['feeds', 'storage', 'caching', 'realtime'],
    brief: 'Build a personalized news feed for a social media app like Facebook or Twitter.',
    requirements: `1. Users should see a ranked list of posts from people they follow.
2. Posts should be ordered by relevance (not just chronological).
3. Support 1B daily active users with 10M new posts/day.
4. Ensure low latency (<100ms) for feed generation.
5. Handle real-time updates (new posts, likes, comments).`,
    keyConsiderations: `1. Feed generation: Pull vs push model for generating feeds.
2. Ranking: How to rank posts by relevance? (Engagement, recency, user preferences)
3. Storage: How to store posts and user relationships? (SQL vs NoSQL)
4. Caching: How to cache feeds for fast retrieval?
5. Fan-out: How to distribute new posts to followers efficiently?
6. Real-time updates: How to push new posts to users in real-time?
7. Scalability: How to handle hot users (celebrities with millions of followers)?`,
    referenceArchitecture: `\`\`\`mermaid
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
\`\`\``,
    order: 2,
  },
  {
    title: 'Design a Rate Limiter',
    slug: 'design-rate-limiter',
    difficulty: 'hard',
    tags: ['algorithms', 'distributed systems', 'caching', 'scalability'],
    brief: 'Build a distributed rate limiter to protect APIs from abuse and DDoS attacks.',
    requirements: `1. Limit API requests to 1000 requests/hour per user.
2. Support 1M concurrent users across multiple data centers.
3. Ensure low latency (<10ms) for rate limit checks.
4. Handle burst traffic gracefully.
5. Provide accurate rate limiting even if the user is behind a proxy or VPN.`,
    keyConsiderations: `1. Algorithm: Token bucket vs fixed window vs sliding window.
2. Storage: Where to store rate limit counters? (Redis, in-memory, database)
3. Distributed coordination: How to synchronize counters across data centers?
4. Granularity: Per-user, per-IP, per-endpoint, or per-API key?
5. Burst handling: How to allow short bursts without compromising security?
6. Accuracy: How to avoid false positives/negatives?
7. Fallback: What to do if the rate limiter service fails?`,
    referenceArchitecture: `\`\`\`mermaid
graph TD
    A[Client] -->|request| B[API Gateway]
    B --> C[Rate Limiter Service]
    C --> D[Redis Cluster]
    D -->|counter| C
    C -->|allow/deny| B
    B -->|allow| E[API Service]
    B -->|deny| A
\`\`\``,
    order: 3,
  },
  {
    title: 'Design a Chat System',
    slug: 'design-chat-system',
    difficulty: 'medium',
    tags: ['realtime', 'websockets', 'scalability', 'storage'],
    brief: 'Build a real-time chat system like WhatsApp or Slack for 10M concurrent users.',
    requirements: `1. Support 1:1 and group chats (up to 100 users per group).
2. Deliver messages in real-time (<100ms latency).
3. Store messages for offline users and sync when they come online.
4. Support message status (sent, delivered, read).
5. Handle 100K messages/second at peak.
6. Ensure end-to-end encryption for 1:1 chats.`,
    keyConsiderations: `1. Real-time delivery: WebSockets vs polling vs Server-Sent Events.
2. Message storage: How to store messages? (SQL vs NoSQL, indexing)
3. Group chats: How to fan-out messages to group members?
4. Offline support: How to sync messages when users come online?
5. Message status: How to track sent/delivered/read status?
6. Scalability: How to handle 10M concurrent connections?
7. Encryption: How to implement end-to-end encryption?`,
    referenceArchitecture: `\`\`\`mermaid
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
\`\`\``,
    order: 4,
  },
  {
    title: 'Design a Distributed Cache',
    slug: 'design-distributed-cache',
    difficulty: 'hard',
    tags: ['caching', 'distributed systems', 'consistency', 'scalability'],
    brief: 'Build a distributed cache like Redis or Memcached for a high-traffic e-commerce site.',
    requirements: `1. Support 10K requests/second with <10ms latency.
2. Cache 100GB of data across 100 nodes.
3. Ensure high availability (99.99% uptime).
4. Handle cache eviction and memory management.
5. Support data persistence for disaster recovery.
6. Provide strong consistency for critical data (e.g., inventory).`,
    keyConsiderations: `1. Data partitioning: How to distribute data across nodes? (Consistent hashing)
2. Replication: How to replicate data for fault tolerance?
3. Consistency: Strong vs eventual consistency for different data types.
4. Eviction policy: LRU vs LFU vs FIFO for cache eviction.
5. Memory management: How to handle memory fragmentation?
6. Scalability: How to add/remove nodes without downtime?
7. Persistence: How to persist data to disk for recovery?`,
    referenceArchitecture: `\`\`\`mermaid
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
\`\`\``,
    order: 5,
  },
] as const;

const articles = [
  // Foundations (8)
  {
    title: 'Introduction to System Design',
    slug: 'intro-to-system-design',
    category: 'foundations',
    summary: 'Learn the fundamentals of system design, including scalability, availability, and common architectural patterns.',
    content: articleContent('Introduction to System Design', 'System design fundamentals'),
    featured: true,
    relatedProblemIds: [1, 2, 3],
    order: 1,
  },
  {
    title: 'System Design Structure',
    slug: 'system-design-structure',
    category: 'foundations',
    summary: 'A repeatable framework for structuring system design answers in interviews and real projects.',
    content: articleContent('System Design Structure', 'Structured design approach'),
    featured: false,
    relatedProblemIds: [1],
    order: 2,
  },
  {
    title: 'Databases and Caching',
    slug: 'databases-and-caching',
    category: 'foundations',
    summary: 'Compare storage engines and learn when caching improves latency and throughput.',
    content: articleContent('Databases and Caching', 'Database and cache trade-offs'),
    featured: false,
    relatedProblemIds: [1, 5],
    order: 3,
  },
  {
    title: 'Cache Eviction Internals',
    slug: 'cache-eviction-internals',
    category: 'foundations',
    summary: 'Understand LRU, LFU, and TTL policies and how they affect hit rate under real traffic.',
    content: articleContent('Cache Eviction Internals', 'Cache eviction policies'),
    featured: false,
    relatedProblemIds: [5],
    order: 4,
  },
  {
    title: 'CAP Theorem',
    slug: 'cap-theorem',
    category: 'foundations',
    summary: 'Learn consistency, availability, and partition tolerance trade-offs in distributed systems.',
    content: articleContent('CAP Theorem', 'CAP trade-offs'),
    featured: false,
    relatedProblemIds: [5],
    order: 5,
  },
  {
    title: 'Hot Keys and Cache Stampedes',
    slug: 'hot-keys-and-cache-stampedes',
    category: 'foundations',
    summary: 'Detect hot keys and prevent thundering herd failures during cache misses.',
    content: articleContent('Hot Keys and Cache Stampedes', 'Hot key mitigation'),
    featured: false,
    relatedProblemIds: [1, 5],
    order: 6,
  },
  {
    title: 'Scaling: Vertical vs Horizontal',
    slug: 'scaling-vertical-vs-horizontal',
    category: 'foundations',
    summary: 'When to scale up a single node versus adding more nodes to a cluster.',
    content: articleContent('Scaling: Vertical vs Horizontal', 'Scaling strategies'),
    featured: false,
    relatedProblemIds: [2, 3],
    order: 7,
  },
  {
    title: 'Throughput and Size Calculation',
    slug: 'throughput-and-size-calculation',
    category: 'foundations',
    summary: 'Back-of-the-envelope math for QPS, storage growth, and bandwidth planning.',
    content: articleContent('Throughput and Size Calculation', 'Capacity estimation'),
    featured: false,
    relatedProblemIds: [1, 2],
    order: 8,
  },
  // Feeds & Storage (10)
  {
    title: 'Design a URL Shortener (Concept)',
    slug: 'url-shortener-concepts',
    category: 'feeds-storage',
    summary: 'Hashing, redirect paths, and analytics for URL shortening systems.',
    content: articleContent('URL Shortener Concepts', 'URL shortening'),
    featured: false,
    relatedProblemIds: [1],
    order: 9,
  },
  {
    title: 'Fan-Out Strategies',
    slug: 'fan-out-strategies',
    category: 'feeds-storage',
    summary: 'Compare push, pull, and hybrid fan-out models for feed generation.',
    content: articleContent('Fan-Out Strategies', 'Feed fan-out'),
    featured: true,
    relatedProblemIds: [2],
    order: 10,
  },
  {
    title: 'Sharding',
    slug: 'sharding',
    category: 'feeds-storage',
    summary: 'Partition data across shards with consistent hashing and rebalancing plans.',
    content: articleContent('Sharding', 'Database sharding'),
    featured: false,
    relatedProblemIds: [2, 5],
    order: 11,
  },
  {
    title: 'Message Queues',
    slug: 'message-queues',
    category: 'feeds-storage',
    summary: 'Use queues and streams to decouple producers and consumers at scale.',
    content: articleContent('Message Queues', 'Asynchronous messaging'),
    featured: false,
    relatedProblemIds: [2, 4],
    order: 12,
  },
  {
    title: 'Designing Feeds and Storage Systems',
    slug: 'designing-feeds-storage-systems',
    category: 'feeds-storage',
    summary: 'Learn how to design scalable feed systems and storage architectures for social media apps.',
    content: articleContent('Designing Feeds and Storage Systems', 'Feed and storage architecture'),
    featured: true,
    relatedProblemIds: [2, 5],
    order: 13,
  },
  {
    title: 'Scalability Patterns: Caching and CDNs',
    slug: 'scalability-patterns-caching-cdns',
    category: 'feeds-storage',
    summary: 'Learn how caching and CDNs can improve performance and reduce load on your backend systems.',
    content: articleContent('Scalability Patterns: Caching and CDNs', 'Caching and CDNs'),
    featured: false,
    relatedProblemIds: [1, 2],
    order: 14,
  },
  {
    title: 'Object Storage at Scale',
    slug: 'object-storage-at-scale',
    category: 'feeds-storage',
    summary: 'Store media and large blobs with durability, replication, and lifecycle policies.',
    content: articleContent('Object Storage at Scale', 'Object storage'),
    featured: false,
    relatedProblemIds: [2],
    order: 15,
  },
  {
    title: 'Indexing Strategies',
    slug: 'indexing-strategies',
    category: 'feeds-storage',
    summary: 'Choose indexes and access patterns that match your read/write workload.',
    content: articleContent('Indexing Strategies', 'Database indexing'),
    featured: false,
    relatedProblemIds: [1, 2],
    order: 16,
  },
  {
    title: 'Replication and Failover',
    slug: 'replication-and-failover',
    category: 'feeds-storage',
    summary: 'Leader-follower replication, quorum reads, and graceful failover patterns.',
    content: articleContent('Replication and Failover', 'Data replication'),
    featured: false,
    relatedProblemIds: [5],
    order: 17,
  },
  {
    title: 'Event Sourcing Basics',
    slug: 'event-sourcing-basics',
    category: 'feeds-storage',
    summary: 'Model state changes as append-only events for auditability and replay.',
    content: articleContent('Event Sourcing Basics', 'Event sourcing'),
    featured: false,
    relatedProblemIds: [2, 4],
    order: 18,
  },
  // Realtime & Geo (9)
  {
    title: 'WebSockets and Real-Time Communication',
    slug: 'websockets-and-realtime',
    category: 'realtime-geo',
    summary: 'Deliver low-latency updates with WebSockets, SSE, and connection scaling tactics.',
    content: articleContent('WebSockets and Real-Time Communication', 'Realtime delivery'),
    featured: true,
    relatedProblemIds: [4],
    order: 19,
  },
  {
    title: 'Presence and Typing Indicators',
    slug: 'presence-and-typing-indicators',
    category: 'realtime-geo',
    summary: 'Track online status and ephemeral signals without overloading your backend.',
    content: articleContent('Presence and Typing Indicators', 'User presence'),
    featured: false,
    relatedProblemIds: [4],
    order: 20,
  },
  {
    title: 'Geospatial Indexing',
    slug: 'geospatial-indexing',
    category: 'realtime-geo',
    summary: 'Query nearby entities efficiently with geohashes and spatial indexes.',
    content: articleContent('Geospatial Indexing', 'Geospatial queries'),
    featured: false,
    relatedProblemIds: [2],
    order: 21,
  },
  {
    title: 'Location-Aware Load Balancing',
    slug: 'location-aware-load-balancing',
    category: 'realtime-geo',
    summary: 'Route users to the nearest healthy region for lower latency and better resilience.',
    content: articleContent('Location-Aware Load Balancing', 'Geo routing'),
    featured: false,
    relatedProblemIds: [1, 3],
    order: 22,
  },
  {
    title: 'Multi-Region Active-Active',
    slug: 'multi-region-active-active',
    category: 'realtime-geo',
    summary: 'Run services in multiple regions while managing consistency and conflict resolution.',
    content: articleContent('Multi-Region Active-Active', 'Multi-region architecture'),
    featured: false,
    relatedProblemIds: [3, 5],
    order: 23,
  },
  {
    title: 'Rate Limiting at the Edge',
    slug: 'rate-limiting-at-the-edge',
    category: 'realtime-geo',
    summary: 'Enforce quotas close to users with edge rate limiters and token buckets.',
    content: articleContent('Rate Limiting at the Edge', 'Edge rate limiting'),
    featured: false,
    relatedProblemIds: [3],
    order: 24,
  },
  {
    title: 'Realtime Analytics Pipelines',
    slug: 'realtime-analytics-pipelines',
    category: 'realtime-geo',
    summary: 'Stream events into aggregations for live dashboards and anomaly detection.',
    content: articleContent('Realtime Analytics Pipelines', 'Streaming analytics'),
    featured: false,
    relatedProblemIds: [2],
    order: 25,
  },
  {
    title: 'Conflict-Free Replicated Data Types',
    slug: 'crdt-overview',
    category: 'realtime-geo',
    summary: 'Merge concurrent edits safely in collaborative and offline-first systems.',
    content: articleContent('Conflict-Free Replicated Data Types', 'CRDTs'),
    featured: false,
    relatedProblemIds: [4],
    order: 26,
  },
  {
    title: 'Designing for Global Latency',
    slug: 'designing-for-global-latency',
    category: 'realtime-geo',
    summary: 'Combine CDNs, regional caches, and async replication to serve users worldwide.',
    content: articleContent('Designing for Global Latency', 'Global latency optimization'),
    featured: false,
    relatedProblemIds: [1, 2],
    order: 27,
  },
] as const;

async function main() {
  console.log('Seeding problems...');
  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        title: problem.title,
        difficulty: problem.difficulty,
        tags: [...problem.tags],
        brief: problem.brief,
        requirements: problem.requirements,
        keyConsiderations: problem.keyConsiderations,
        referenceArchitecture: problem.referenceArchitecture,
        order: problem.order,
        isPublic: true,
      },
      create: {
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        tags: [...problem.tags],
        brief: problem.brief,
        requirements: problem.requirements,
        keyConsiderations: problem.keyConsiderations,
        referenceArchitecture: problem.referenceArchitecture,
        order: problem.order,
        isPublic: true,
      },
    });
  }

  console.log('Seeding articles...');
  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        category: article.category,
        summary: article.summary,
        content: article.content,
        featured: article.featured,
        relatedProblemIds: [...article.relatedProblemIds],
        order: article.order,
        isPublished: true,
      },
      create: {
        title: article.title,
        slug: article.slug,
        category: article.category,
        summary: article.summary,
        content: article.content,
        featured: article.featured,
        relatedProblemIds: [...article.relatedProblemIds],
        order: article.order,
        isPublished: true,
      },
    });
  }

  console.log(`Seeded ${problems.length} problems and ${articles.length} articles.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
