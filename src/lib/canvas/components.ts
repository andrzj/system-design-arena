// Component definitions for the React Flow canvas
// These represent the 44 components available in the architecture designer

export const COMPONENT_DEFS = [
  // Client & User Devices
  {
    id: 'client',
    label: 'Client',
    type: 'client',
    category: 'client',
    description: 'End-user devices (web browsers, mobile apps, desktop clients)',
    color: '#3B82F6', // blue
    icon: '💻',
    defaults: { replicas: 1 }
  },
  {
    id: 'mobile',
    label: 'Mobile',
    type: 'mobile',
    category: 'client',
    description: 'Mobile applications and devices',
    color: '#3B82F6',
    icon: '📱',
    defaults: { replicas: 1 }
  },
  {
    id: 'tablet',
    label: 'Tablet',
    type: 'tablet',
    category: 'client',
    description: 'Tablet devices',
    color: '#3B82F6',
    icon: '📲',
    defaults: { replicas: 1 }
  },

  // Traffic & Edge
  {
    id: 'dns',
    label: 'DNS',
    type: 'dns',
    category: 'traffic',
    description: 'Domain Name System for resolving domain names to IP addresses',
    color: '#10B981', // emerald
    icon: '🌐',
    defaults: { replicas: 3 }
  },
  {
    id: 'cdn',
    label: 'CDN',
    type: 'cdn',
    category: 'traffic',
    description: 'Content Delivery Network for caching and delivering static assets globally',
    color: '#10B981',
    icon: '🚚',
    defaults: { replicas: 5 }
  },
  {
    id: 'load_balancer',
    label: 'Load Balancer',
    type: 'load_balancer',
    category: 'traffic',
    description: 'Distributes incoming network traffic across multiple servers',
    color: '#10B981',
    icon: '⚖️',
    defaults: { replicas: 2 }
  },
  {
    id: 'api_gateway',
    label: 'API Gateway',
    type: 'api_gateway',
    category: 'traffic',
    description: 'Entry point for API requests, handling authentication, rate limiting, and routing',
    color: '#10B981',
    icon: '🚪',
    defaults: { replicas: 3 }
  },
  {
    id: 'waf',
    label: 'WAF',
    type: 'waf',
    category: 'traffic',
    description: 'Web Application Firewall for protecting against common web exploits',
    color: '#10B981',
    icon: '🛡️',
    defaults: { replicas: 2 }
  },
  {
    id: 'ingress',
    label: 'Ingress Controller',
    type: 'ingress',
    category: 'traffic',
    description: 'Manages external access to services in a Kubernetes cluster',
    color: '#10B981',
    icon: '🚪',
    defaults: { replicas: 2 }
  },

  // Compute & Services
  {
    id: 'app_server',
    label: 'App Server',
    type: 'app_server',
    category: 'compute',
    description: 'Application servers running business logic',
    color: '#F59E0B', // amber
    icon: '💻',
    defaults: { replicas: 3 }
  },
  {
    id: 'worker',
    label: 'Worker',
    type: 'worker',
    category: 'compute',
    description: 'Background workers for processing asynchronous tasks',
    color: '#F59E0B',
    icon: '⚙️',
    defaults: { replicas: 2 }
  },
  {
    id: 'serverless',
    label: 'Serverless Function',
    type: 'serverless',
    category: 'compute',
    description: 'Event-driven compute functions that scale automatically',
    color: '#F59E0B',
    icon: '⚡',
    defaults: { replicas: 1 }
  },
  {
    id: 'auth_service',
    label: 'Auth Service',
    type: 'auth_service',
    category: 'compute',
    description: 'Authentication and authorization service',
    color: '#F59E0B',
    icon: '🔐',
    defaults: { replicas: 2 }
  },
  {
    id: 'search',
    label: 'Search Service',
    type: 'search',
    category: 'compute',
    description: 'Full-text search engine (e.g., Elasticsearch, Solr)',
    color: '#F59E0B',
    icon: '🔍',
    defaults: { replicas: 3 }
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    type: 'scheduler',
    category: 'compute',
    description: 'Job scheduling service (e.g., Cron, Celery Beat)',
    color: '#F59E0B',
    icon: '📅',
    defaults: { replicas: 2 }
  },
  {
    id: 'notifications',
    label: 'Notifications',
    type: 'notifications',
    category: 'compute',
    description: 'Service for sending emails, SMS, push notifications',
    color: '#F59E0B',
    icon: '📢',
    defaults: { replicas: 2 }
  },
  {
    id: 'analytics',
    label: 'Analytics',
    type: 'analytics',
    category: 'compute',
    description: 'Data processing and analytics pipeline',
    color: '#F59E0B',
    icon: '📊',
    defaults: { replicas: 2 }
  },

  // Storage & Databases
  {
    id: 'sql_db',
    label: 'SQL Database',
    type: 'sql_db',
    category: 'storage',
    description: 'Relational database (e.g., PostgreSQL, MySQL)',
    color: '#EF4444', // red
    icon: '🗃️',
    defaults: { replicas: 2 }
  },
  {
    id: 'nosql_db',
    label: 'NoSQL Database',
    type: 'nosql_db',
    category: 'storage',
    description: 'Non-relational database (e.g., MongoDB, Cassandra)',
    color: '#EF4444',
    icon: '🗄️',
    defaults: { replicas: 3 }
  },
  {
    id: 'cache',
    label: 'Cache',
    type: 'cache',
    category: 'storage',
    description: 'In-memory data store (e.g., Redis, Memcached)',
    color: '#EF4444',
    icon: '⚡',
    defaults: { replicas: 3 }
  },
  {
    id: 'object_store',
    label: 'Object Storage',
    type: 'object_store',
    category: 'storage',
    description: 'Blob storage for files and media (e.g., S3, Google Cloud Storage)',
    color: '#EF4444',
    icon: '📦',
    defaults: { replicas: 3 }
  },
  {
    id: 'data_warehouse',
    label: 'Data Warehouse',
    type: 'data_warehouse',
    category: 'storage',
    description: 'Analytical database for reporting and BI (e.g., Snowflake, BigQuery)',
    color: '#EF4444',
    icon: '🏭',
    defaults: { replicas: 2 }
  },
  {
    id: 'vector_db',
    label: 'Vector Database',
    type: 'vector_db',
    category: 'storage',
    description: 'Database optimized for vector embeddings and similarity search',
    color: '#EF4444',
    icon: '🔢',
    defaults: { replicas: 2 }
  },

  // Messaging & Streaming
  {
    id: 'message_queue',
    label: 'Message Queue',
    type: 'message_queue',
    category: 'messaging',
    description: 'Asynchronous message queue (e.g., RabbitMQ, SQS)',
    color: '#8B5CF6', // violet
    icon: '📨',
    defaults: { replicas: 3 }
  },
  {
    id: 'pubsub',
    label: 'Pub/Sub',
    type: 'pubsub',
    category: 'messaging',
    description: 'Publish-subscribe messaging pattern',
    color: '#8B5CF6',
    icon: '📢',
    defaults: { replicas: 3 }
  },
  {
    id: 'event_stream',
    label: 'Event Stream',
    type: 'event_stream',
    category: 'messaging',
    description: 'Streaming platform for real-time data feeds (e.g., Apache Kafka)',
    color: '#8B5CF6',
    icon: '🌊',
    defaults: { replicas: 3 }
  },
  {
    id: 'kafka',
    label: 'Kafka',
    type: 'kafka',
    category: 'messaging',
    description: 'Distributed event streaming platform',
    color: '#8B5CF6',
    icon: '🌊',
    defaults: { replicas: 3 }
  },

  // Observability & Monitoring
  {
    id: 'metrics',
    label: 'Metrics',
    type: 'metrics',
    category: 'observability',
    description: 'Metrics collection and monitoring system (e.g., Prometheus)',
    color: '#10B981', // emerald (reuse for consistency)
    icon: '📈',
    defaults: { replicas: 2 }
  },
  {
    id: 'logs',
    label: 'Logs',
    type: 'logs',
    category: 'observability',
    description: 'Log aggregation and management system (e.g., ELK Stack)',
    color: '#10B981',
    icon: '📜',
    defaults: { replicas: 2 }
  },
  {
    id: 'tracing',
    label: 'Tracing',
    type: 'tracing',
    category: 'observability',
    description: 'Distributed tracing system (e.g., Jaeger, Zipkin)',
    color: '#10B981',
    icon: '🔍',
    defaults: { replicas: 2 }
  },
  {
    id: 'alerting',
    label: 'Alerting',
    type: 'alerting',
    category: 'observability',
    description: 'Alerting and notification system for metrics and logs',
    color: '#10B981',
    icon: '🚨',
    defaults: { replicas: 2 }
  },
  {
    id: 'health_check',
    label: 'Health Check',
    type: 'health_check',
    category: 'observability',
    description: 'Service health monitoring and checks',
    color: '#10B981',
    icon: '❤️',
    defaults: { replicas: 2 }
  },

  // Network & Infrastructure
  {
    id: 'vpc',
    label: 'VPC',
    type: 'vpc',
    category: 'network',
    description: 'Virtual Private Cloud for isolated network resources',
    color: '#6B7280', // gray
    icon: '☁️',
    defaults: { replicas: 1 }
  },
  {
    id: 'subnet',
    label: 'Subnet',
    type: 'subnet',
    category: 'network',
    description: 'Subdivision of a VPC for organizing resources',
    color: '#6B7280',
    icon: '🔷',
    defaults: { replicas: 1 }
  },
  {
    id: 'nat_gateway',
    label: 'NAT Gateway',
    type: 'nat_gateway',
    category: 'network',
    description: 'Network Address Translation for private subnet internet access',
    color: '#6B7280',
    icon: '🔄',
    defaults: { replicas: 2 }
  },
  {
    id: 'vpn',
    label: 'VPN Gateway',
    type: 'vpn',
    category: 'network',
    description: 'Virtual Private Network for secure remote access',
    color: '#6B7280',
    icon: '🔒',
    defaults: { replicas: 2 }
  },
  {
    id: 'service_mesh',
    label: 'Service Mesh',
    type: 'service_mesh',
    category: 'network',
    description: 'Dedicated infrastructure layer for handling service-to-service communication',
    color: '#6B7280',
    icon: '🕸️',
    defaults: { replicas: 3 }
  },

  // AI & ML
  {
    id: 'llm_gateway',
    label: 'LLM Gateway',
    type: 'llm_gateway',
    category: 'ai',
    description: 'API gateway for Large Language Model services',
    color: '#8B5CF6', // violet (reuse for AI/ML)
    icon: '🤖',
    defaults: { replicas: 2 }
  },
  {
    id: 'orchestrator',
    label: 'Orchestrator',
    type: 'orchestrator',
    category: 'ai',
    description: 'Workflow orchestration for AI/ML pipelines',
    color: '#8B5CF6',
    icon: '🎻',
    defaults: { replicas: 2 }
  },
  {
    id: 'tool_registry',
    label: 'Tool Registry',
    type: 'tool_registry',
    category: 'ai',
    description: 'Registry for tools and functions available to AI agents',
    color: '#8B5CF6',
    icon: '🧰',
    defaults: { replicas: 2 }
  },
  {
    id: 'memory_fabric',
    label: 'Memory Fabric',
    type: 'memory_fabric',
    category: 'ai',
    description: 'Shared memory system for AI agent context and knowledge',
    color: '#8B5CF6',
    icon: '🧠',
    defaults: { replicas: 2 }
  },
  {
    id: 'safety_mesh',
    label: 'Safety Mesh',
    type: 'safety_mesh',
    category: 'ai',
    description: 'Safety and alignment layer for AI systems',
    color: '#8B5CF6',
    icon: '🛡️',
    defaults: { replicas: 2 }
  },

  // External Services
  {
    id: 'third_party_api',
    label: '3rd Party API',
    type: 'third_party_api',
    category: 'external',
    description: 'External APIs and services (payment, social media, etc.)',
    color: '#EF4444', // red (reuse for external)
    icon: '🔌',
    defaults: { replicas: 1 }
  },
  {
    id: 'payment',
    label: 'Payment Processor',
    type: 'payment',
    category: 'external',
    description: 'Payment processing service (e.g., Stripe, PayPal)',
    color: '#EF4444',
    icon: '💳',
    defaults: { replicas: 2 }
  },
  {
    id: 'email',
    label: 'Email Service',
    type: 'email',
    category: 'external',
    description: 'Email delivery service (e.g., SendGrid, SES)',
    color: '#EF4444',
    icon: '📧',
    defaults: { replicas: 2 }
  }
];

// Helper functions to get components by category
export const getComponentsByCategory = (category: string) => {
  return COMPONENT_DEFS.filter(component => component.category === category);
};

export const getComponentById = (id: string) => {
  return COMPONENT_DEFS.find(component => component.id === id);
};

export const getCategories = () => {
  return [...new Set(COMPONENT_DEFS.map(component => component.category))];
};

export default COMPONENT_DEFS;