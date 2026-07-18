// Chaos event definitions for the system design simulator
// These represent the 30 disaster scenarios that can be triggered during a session

export const CHAOS_EVENTS = [
  // Infrastructure Failures
  {
    id: 'server_crash',
    label: 'Server Crash',
    category: 'infrastructure',
    description: 'A server instance suddenly crashes and becomes unavailable',
    emoji: '💥',
    impact: 'Loss of computing capacity, potential data loss if not replicated',
    scope: 'node',
    duration: 'temporary',
    recovery_time: '30-120 seconds',
    effects: {
      is_disabled: true,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'power_outage',
    label: 'Power Outage',
    category: 'infrastructure',
    description: 'Data center loses power, affecting all services in the region',
    emoji: '🔌',
    impact: 'Complete service outage for affected region',
    scope: 'zone',
    duration: 'extended',
    recovery_time: '5-30 minutes',
    effects: {
      is_disabled: true,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'network_partition',
    label: 'Network Partition',
    category: 'infrastructure',
    description: 'Network split preventing communication between services',
    emoji: '🔗',
    impact: 'Services cannot communicate, leading to split-brain scenarios',
    scope: 'zone',
    duration: 'temporary',
    recovery_time: '10-60 seconds',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 0.7,
      throughput_multiplier: 0.3
    }
  },
  {
    id: 'disk_failure',
    label: 'Disk Failure',
    category: 'infrastructure',
    description: 'Storage device failure causing data inaccessibility',
    emoji: '💾',
    impact: 'Data loss for non-replicated storage, reduced I/O performance',
    scope: 'node',
    duration: 'permanent',
    recovery_time: 'Requires manual intervention',
    effects: {
      is_disabled: false,
      latency_multiplier: 5.0,
      error_rate: 0.3,
      throughput_multiplier: 0.2
    }
  },
  {
    id: 'ram_exhaustion',
    label: 'Memory Exhaustion',
    category: 'infrastructure',
    description: 'Server runs out of available memory, causing OOM kills',
    emoji: '🧠',
    impact: 'Processes killed, service degradation or crash',
    scope: 'node',
    duration: 'temporary',
    recovery_time: '30-90 seconds',
    effects: {
      is_disabled: false,
      latency_multiplier: 10.0,
      error_rate: 0.5,
      throughput_multiplier: 0.1
    }
  },

  // Network Issues
  {
    id: 'dns_failure',
    label: 'DNS Failure',
    category: 'network',
    description: 'Domain name resolution service becomes unavailable',
    emoji: '🌐',
    impact: 'Clients cannot resolve service names to IP addresses',
    scope: 'global',
    duration: 'temporary',
    recovery_time: '60-300 seconds',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 0.9,
      throughput_multiplier: 0.1
    }
  },
  {
    id: 'bandwidth_throttling',
    label: 'Bandwidth Throttling',
    category: 'network',
    description: 'Network bandwidth artificially restricted by ISP or cloud provider',
    emoji: '🚦',
    impact: 'Increased latency and reduced throughput for all network traffic',
    scope: 'zone',
    duration: 'sustained',
    recovery_time: 'Variable',
    effects: {
      is_disabled: false,
      latency_multiplier: 3.0,
      error_rate: 0.1,
      throughput_multiplier: 0.4
    }
  },
  {
    id: 'packet_loss',
    label: 'Packet Loss',
    category: 'network',
    description: 'Network packets are dropped during transmission',
    emoji: '📦',
    impact: 'Retransmissions increase latency and reduce effective throughput',
    scope: 'link',
    duration: 'intermittent',
    recovery_time: 'Self-healing',
    effects: {
      is_disabled: false,
      latency_multiplier: 2.0,
      error_rate: 0.2,
      throughput_multiplier: 0.7
    }
  },
  {
    id: 'high_latency',
    label: 'Network Latency Spike',
    category: 'network',
    description: 'Sudden increase in network delay between services',
    emoji: '⏳',
    impact: 'Increased response times, timeout errors',
    scope: 'link',
    duration: 'temporary',
    recovery_time: '10-120 seconds',
    effects: {
      is_disabled: false,
      latency_multiplier: 5.0,
      error_rate: 0.1,
      throughput_multiplier: 0.5
    }
  },
  {
    id: 'ssl_certificate_expired',
    label: 'SSL Certificate Expired',
    category: 'network',
    description: 'TLS certificates have expired, causing secure connections to fail',
    emoji: '🔒',
    impact: 'HTTPS connections rejected by clients',
    scope: 'service',
    duration: 'persistent',
    recovery_time: 'Requires certificate renewal',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },

  // Application Issues
  {
    id: 'memory_leak',
    label: 'Memory Leak',
    category: 'application',
    description: 'Application gradually consumes more memory over time',
    emoji: '🩸',
    impact: 'Gradual performance degradation leading to OOM crashes',
    scope: 'service',
    duration: 'progressive',
    recovery_time: 'Requires restart',
    effects: {
      is_disabled: false,
      latency_multiplier: 1.5,
      error_rate: 0.1,
      throughput_multiplier: 0.8
    }
  },
  {
    id: 'deadlock',
    label: 'Database Deadlock',
    category: 'application',
    description: 'Database transactions block each other indefinitely',
    emoji: '🔒',
    impact: 'Queries hang, application becomes unresponsive',
    scope: 'service',
    duration: 'persistent',
    recovery_time: 'Requires manual intervention',
    effects: {
      is_disabled: false,
      latency_multiplier: 10.0,
      error_rate: 0.3,
      throughput_multiplier: 0.1
    }
  },
  {
    id: 'cache_corruption',
    label: 'Cache Corruption',
    category: 'application',
    description: 'In-memory cache contains invalid or corrupted data',
    emoji: '💣',
    impact: 'Serving incorrect data, cache misses increase load on backend',
    scope: 'service',
    duration: 'detected',
    recovery_time: 'Cache flush and warm-up',
    effects: {
      is_disabled: false,
      latency_multiplier: 2.0,
      error_rate: 0.4,
      throughput_multiplier: 0.6
    }
  },
  {
    id: 'thread_exhaustion',
    label: 'Thread Pool Exhaustion',
    category: 'application',
    description: 'Application runs out of available threads to process requests',
    emoji: '🧵',
    impact: 'Requests queued or rejected, increased latency',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Thread pool recovery',
    effects: {
      is_disabled: false,
      latency_multiplier: 5.0,
      error_rate: 0.2,
      throughput_multiplier: 0.3
    }
  },
  {
    id: 'connection_pool_exhausted',
    label: 'Connection Pool Exhausted',
    category: 'application',
    description: 'Database or service connection pool is fully utilized',
    emoji: '🔗',
    impact: 'New connections rejected or queued, increasing latency',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Connection release',
    effects: {
      is_disabled: false,
      latency_multiplier: 4.0,
      error_rate: 0.2,
      throughput_multiplier: 0.4
    }
  },

  // Dependency Failures
  {
    id: 'dependency_timeout',
    label: 'Third-Party API Timeout',
    category: 'dependency',
    description: 'External service or API becomes slow or unresponsive',
    emoji: '⏱️',
    impact: 'Dependent features fail or degrade, increased latency',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Service recovery',
    effects: {
      is_disabled: false,
      latency_multiplier: 8.0,
      error_rate: 0.3,
      throughput_multiplier: 0.2
    }
  },
  {
    id: 'payment_gateway_failure',
    label: 'Payment Gateway Failure',
    category: 'dependency',
    description: 'Payment processing service becomes unavailable',
    emoji: '💳',
    impact: 'Unable to process transactions, revenue impact',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Provider issue resolution',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'email_service_down',
    label: 'Email Service Down',
    category: 'dependency',
    description: 'Email delivery service (SMTP, SendGrid, etc.) is unavailable',
    emoji: '📧',
    impact: 'Transactional and marketing emails not delivered',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Service restoration',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'cdn_origin_fetch_fail',
    label: 'CDN Origin Fetch Failure',
    category: 'dependency',
    description: 'CDN unable to fetch content from origin server',
    emoji: '🚚',
    impact: 'Cache misses result in errors, reduced hit ratio',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Origin recovery',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 0.5,
      throughput_multiplier: 0.5
    }
  },
  {
    id: 'auth_service_outage',
    label: 'Authentication Service Outage',
    category: 'dependency',
    description: 'User authentication and authorization service is down',
    emoji: '🔐',
    impact: 'Users unable to log in or access protected resources',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Service restoration',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 0.9,
      throughput_multiplier: 0.1
    }
  },

  // Data Issues
  {
    id: 'database_corruption',
    label: 'Database Corruption',
    category: 'data',
    description: 'Database files become corrupted, risking data loss',
    emoji: '💀',
    impact: 'Potential data loss, service unavailability',
    scope: 'service',
    duration: 'persistent',
    recovery_time: 'Restore from backup',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'replication_lag',
    label: 'Database Replication Lag',
    category: 'data',
    description: 'Secondary databases fall behind primary in replication',
    emoji: '🐢',
    impact: 'Read replicas serve stale data, consistency issues',
    scope: 'service',
    duration: 'variable',
    recovery_time: 'Catch-up period',
    effects: {
      is_disabled: false,
      latency_multiplier: 1.0,
      error_rate: 0.2,
      throughput_multiplier: 0.8
    }
  },
  {
    id: 'query_timeout',
    label: 'Slow Query Performance',
    category: 'data',
    description: 'Database queries take excessively long to execute',
    emoji: '🐌',
    impact: 'Increased latency, potential timeouts, resource exhaustion',
    scope: 'service',
    duration: 'sporadic',
    recovery_time: 'Query optimization or scaling',
    effects: {
      is_disabled: false,
      latency_multiplier: 10.0,
      error_rate: 0.2,
      throughput_multiplier: 0.1
    }
  },
  {
    id: 'deadlock_innodb',
    label: 'InnoDB Deadlock',
    category: 'data',
    description: 'Deadlock in MySQL InnoDB storage engine',
    emoji: '🔒',
    impact: 'Transactions rolled back, application errors',
    scope: 'service',
    duration: 'instantaneous',
    recovery_time: 'Automatic retry',
    effects: {
      is_disabled: false,
      latency_multiplier: 2.0,
      error_rate: 0.3,
      throughput_multiplier: 0.6
    }
  },
  {
    id: 'connection_limit_exceeded',
    label: 'Database Connection Limit Exceeded',
    category: 'data',
    description: 'Maximum number of database connections reached',
    emoji: '🚪',
    impact: 'New connections rejected, application errors',
    scope: 'service',
    duration: 'temporary',
    recovery_time: 'Connection release',
    effects: {
      is_disabled: false,
      latency_multiplier: 5.0,
      error_rate: 0.3,
      throughput_multiplier: 0.2
    }
  },

  // Security Incidents
  {
    id: 'ddos_attack',
    label: 'DDoS Attack',
    category: 'security',
    description: 'Distributed Denial of Service attack overwhelming network',
    emoji: '☠️',
    impact: 'Service unavailable due to traffic overload',
    scope: 'global',
    duration: 'attack_duration',
    recovery_time: 'Mitigation deployment',
    effects: {
      is_disabled: false,
      latency_multiplier: 10.0,
      error_rate: 0.5,
      throughput_multiplier: 0.1
    }
  },
  {
    id: 'sql_injection',
    label: 'SQL Injection Attack',
    category: 'security',
    description: 'Malicious SQL injection attempt targeting database',
    emoji: '💉',
    impact: 'Potential data breach, data manipulation or loss',
    scope: 'service',
    duration: 'instantaneous',
    recovery_time: 'Input validation and patching',
    effects: {
      is_disabled: false,
      latency_multiplier: 1.0,
      error_rate: 0.1,
      throughput_multiplier: 0.9
    }
  },
  {
    id: 'ransomware',
    label: 'Ransomware Detected',
    category: 'security',
    description: 'Malware encrypting files and demanding payment',
    emoji: '💰',
    impact: 'Data encrypted, services disrupted',
    scope: 'system',
    duration: 'persistent',
    recovery_time: 'Restore from clean backup',
    effects: {
      is_disabled: true,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'credential_leak',
    label: 'Credential Leak',
    category: 'security',
    description: 'API keys, passwords, or certificates exposed publicly',
    emoji: '🔑',
    impact: 'Unauthorized access to systems and data',
    scope: 'system',
    duration: 'persistent',
    recovery_time: 'Credential rotation and access review',
    effects: {
      is_disabled: false,
      latency_multiplier: 1.0,
      error_rate: 0.1,
      throughput_multiplier: 0.9
    }
  },
  {
    id: 'misconfigured_firewall',
    label: 'Misconfigured Firewall',
    category: 'security',
    description: 'Firewall rules blocking legitimate traffic',
    emoji: '🧱',
    impact: 'Services inaccessible from certain networks or users',
    scope: 'network',
    duration: 'persistent',
    recovery_time: 'Rule correction',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 0.8,
      throughput_multiplier: 0.2
    }
  },

  // Scaling Issues
  {
    id: 'autoscaling_failure',
    label: 'Auto-Scaling Failure',
    category: 'scaling',
    description: 'Auto-scaling group fails to add or remove instances',
    emoji: '📈',
    impact: 'Inability to handle load changes, over/under-provisioning',
    scope: 'cluster',
    duration: 'persistent',
    recovery_time: 'Manual scaling intervention',
    effects: {
      is_disabled: false,
      latency_multiplier: 3.0,
      error_rate: 0.2,
      throughput_multiplier: 0.5
    }
  },
  {
    id: 'resource_quota_exceeded',
    label: 'Resource Quota Exceeded',
    category: 'scaling',
    description: 'Cloud provider resource limits (CPU, memory, storage) reached',
    emoji: '🚫',
    impact: 'Cannot provision new resources, service degradation',
    scope: 'account',
    duration: 'persistent',
    recovery_time: 'Quota increase or optimization',
    effects: {
      is_disabled: false,
      latency_multiplier: 2.0,
      error_rate: 0.1,
      throughput_multiplier: 0.7
    }
  },
  {
    id: 'load_balancer_misconfig',
    label: 'Load Balancer Misconfiguration',
    category: 'scaling',
    description: 'Load balancer incorrectly routing health checks or traffic',
    emoji: '⚖️',
    impact: 'Uneven traffic distribution, health check failures',
    scope: 'service',
    duration: 'persistent',
    recovery_time: 'Configuration correction',
    effects: {
      is_disabled: false,
      latency_multiplier: 1.5,
      error_rate: 0.3,
      throughput_multiplier: 0.6
    }
  },
  {
    id: 'cache_thundering_herd',
    label: 'Cache Thundering Herd',
    category: 'scaling',
    description: 'Many requests simultaneously miss cache and hit backend',
    emoji: '🐘',
    impact: 'Sudden spike in backend load, potential overload',
    scope: 'service',
    duration: 'brief',
    recovery_time: 'Cache warm-up',
    effects: {
      is_disabled: false,
      latency_multiplier: 5.0,
      error_rate: 0.2,
      throughput_multiplier: 0.3
    }
  },

  // Human Factors
  {
    id: 'fat_finger_error',
    label: 'Fat Finger Error',
    category: 'human',
    description: 'Accidental command execution (e.g., dropping table, deleting bucket)',
    emoji: '✋',
    impact: 'Data loss or service disruption due to human mistake',
    scope: 'system',
    duration: 'persistent',
    recovery_time: 'Restore from backup',
    effects: {
      is_disabled: false,
      latency_multiplier: null,
      error_rate: 1.0,
      throughput_multiplier: 0
    }
  },
  {
    id: 'deploy_failure',
    label: 'Faulty Deployment',
    category: 'human',
    description: 'New code release introduces bugs or performance regressions',
    emoji: '🚀',
    impact: 'Degraded service quality, errors, or downtime',
    scope: 'service',
    duration: 'until_rollback',
    recovery_time: 'Rollback to previous version',
    effects: {
      is_disabled: false,
      latency_multiplier: 2.0,
      error_rate: 0.4,
      throughput_multiplier: 0.6
    }
  },
  {
    id: 'config_drift',
    label: 'Configuration Drift',
    category: 'human',
    description: 'Server configurations diverge from baseline or expected state',
    emoji: '📋',
    impact: 'Inconsistent behavior, debugging difficulties, security gaps',
    scope: 'system',
    duration: 'persistent',
    recovery_time: 'Configuration reconciliation',
    effects: {
      is_disabled: false,
      latency_multiplier: 1.2,
      error_rate: 0.2,
      throughput_multiplier: 0.8
    }
  }
];

// Helper functions to get events by category
export const getEventsByCategory = (category: string) => {
  return CHAOS_EVENTS.filter(event => event.category === category);
};

export const getEventById = (id: string) => {
  return CHAOS_EVENTS.find(event => event.id === id);
};

export const getCategories = () => {
  return [...new Set(CHAOS_EVENTS.map(event => event.category))];
};

export default CHAOS_EVENTS;