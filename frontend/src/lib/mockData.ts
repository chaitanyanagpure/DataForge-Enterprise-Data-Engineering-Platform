// ============================================
// MOCK DATA GENERATORS — DataForge
// ============================================

import type {
  User, Organization, Project, Dataset, ColumnSchema,
  Pipeline, PipelineNode, PipelineEdge, PipelineRun, LogEntry,
  Feature, LineageNode, LineageEdge, Workflow, WorkflowRun,
  QualityReport, QualityDimension, ValidationRule,
  DatasetVersion, VersionChange, Notification, AuditLog,
  PipelineHealthMetric, MetricPoint,
} from '@/types'

// ─── USERS ────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'u1', name: 'Alex Chen', email: 'alex@dataforge.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'admin', organizationId: 'org1',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'u2', name: 'Sarah Kim', email: 'sarah@dataforge.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'data_engineer', organizationId: 'org1',
    createdAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'u3', name: 'Marcus Lee', email: 'marcus@dataforge.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    role: 'data_scientist', organizationId: 'org1',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'u4', name: 'Priya Sharma', email: 'priya@dataforge.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    role: 'viewer', organizationId: 'org1',
    createdAt: '2024-03-20T11:00:00Z',
  },
]

// ─── ORGANIZATION ─────────────────────────────
export const MOCK_ORG: Organization = {
  id: 'org1',
  name: 'Nexus AI Labs',
  slug: 'nexus-ai-labs',
  plan: 'enterprise',
  createdAt: '2024-01-01T00:00:00Z',
  memberCount: 24,
}

// ─── PROJECTS ─────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj1', name: 'Customer Analytics', description: 'End-to-end customer behavior and churn prediction platform',
    organizationId: 'org1', color: '#6366F1', icon: 'users',
    datasetCount: 12, pipelineCount: 5,
    createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-06-18T14:30:00Z', status: 'active',
  },
  {
    id: 'proj2', name: 'Real-Time Fraud Detection', description: 'Streaming fraud detection with ML scoring pipeline',
    organizationId: 'org1', color: '#EF4444', icon: 'shield',
    datasetCount: 8, pipelineCount: 3,
    createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-06-17T09:00:00Z', status: 'active',
  },
  {
    id: 'proj3', name: 'Supply Chain Optimization', description: 'Demand forecasting and logistics optimization models',
    organizationId: 'org1', color: '#10B981', icon: 'truck',
    datasetCount: 15, pipelineCount: 7,
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-06-19T16:00:00Z', status: 'active',
  },
  {
    id: 'proj4', name: 'Product Recommendation', description: 'Personalization engine and collaborative filtering',
    organizationId: 'org1', color: '#06B6D4', icon: 'sparkles',
    datasetCount: 6, pipelineCount: 4,
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-06-16T11:00:00Z', status: 'active',
  },
]

// ─── COLUMNS ──────────────────────────────────
const makeColumns = (): ColumnSchema[] => [
  {
    name: 'customer_id', type: 'string', nullable: false, unique: true,
    missing: 0, missingPercent: 0, cardinality: 95420,
    sampleValues: ['CUS-001234', 'CUS-001235', 'CUS-001236'],
  },
  {
    name: 'age', type: 'integer', nullable: false, unique: false,
    missing: 312, missingPercent: 0.33, min: 18, max: 85, mean: 34.7, stddev: 11.2,
    cardinality: 68, sampleValues: [25, 34, 52, 19, 41],
  },
  {
    name: 'email', type: 'string', nullable: true, unique: true,
    missing: 89, missingPercent: 0.09, cardinality: 95331,
    sampleValues: ['alice@email.com', 'bob@email.com'],
  },
  {
    name: 'signup_date', type: 'datetime', nullable: false, unique: false,
    missing: 0, missingPercent: 0,
    min: '2020-01-01', max: '2024-06-18',
    sampleValues: ['2022-03-15', '2023-07-22', '2024-01-04'],
  },
  {
    name: 'total_spend', type: 'float', nullable: true, unique: false,
    missing: 1203, missingPercent: 1.26, min: 0.0, max: 89420.5, mean: 1847.3, stddev: 3201.8,
    sampleValues: [249.99, 1099.5, 45.0, 5840.25],
  },
  {
    name: 'country', type: 'string', nullable: false, unique: false,
    missing: 0, missingPercent: 0, cardinality: 42,
    sampleValues: ['US', 'DE', 'GB', 'FR', 'JP'],
  },
  {
    name: 'is_active', type: 'boolean', nullable: false, unique: false,
    missing: 0, missingPercent: 0, cardinality: 2,
    sampleValues: [true, false],
  },
  {
    name: 'last_login', type: 'datetime', nullable: true, unique: false,
    missing: 8430, missingPercent: 8.83,
    sampleValues: ['2024-06-18', '2024-05-30'],
  },
]

// ─── DATASETS ─────────────────────────────────
export const MOCK_DATASETS: Dataset[] = [
  {
    id: 'ds1', name: 'customers_v2', description: 'Master customer profile dataset with enriched demographic and behavioral attributes',
    projectId: 'proj1', format: 'parquet', source: 'postgres',
    tags: ['customers', 'pii', 'master', 'enriched'],
    owner: MOCK_USERS[0], rowCount: 95420, columnCount: 8,
    sizeBytes: 284_000_000, qualityScore: 94.2,
    schema: makeColumns(),
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-06-18T14:00:00Z',
    lastRefreshed: '2024-06-19T02:00:00Z',
    version: 'v2.4.1', status: 'ready',
  },
  {
    id: 'ds2', name: 'transactions_2024', description: 'Raw transaction records from all payment channels for Q1-Q2 2024',
    projectId: 'proj1', format: 'parquet', source: 's3',
    tags: ['transactions', 'financial', 'raw'],
    owner: MOCK_USERS[1], rowCount: 4_281_000, columnCount: 22,
    sizeBytes: 1_840_000_000, qualityScore: 87.6,
    schema: makeColumns(),
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-06-18T06:00:00Z',
    lastRefreshed: '2024-06-19T01:00:00Z',
    version: 'v1.0.0', status: 'ready',
  },
  {
    id: 'ds3', name: 'product_catalog', description: 'Product metadata, pricing, and inventory data synchronized from ERP',
    projectId: 'proj4', format: 'json', source: 'api',
    tags: ['products', 'catalog', 'inventory'],
    owner: MOCK_USERS[2], rowCount: 142_830, columnCount: 18,
    sizeBytes: 92_000_000, qualityScore: 72.4,
    schema: makeColumns(),
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-06-17T12:00:00Z',
    lastRefreshed: '2024-06-18T23:00:00Z',
    version: 'v3.1.0', status: 'stale',
  },
  {
    id: 'ds4', name: 'fraud_labels_train', description: 'Labeled fraud dataset for model training — reviewed by Risk team',
    projectId: 'proj2', format: 'csv', source: 'upload',
    tags: ['fraud', 'labeled', 'training', 'ml-ready'],
    owner: MOCK_USERS[1], rowCount: 890_000, columnCount: 41,
    sizeBytes: 410_000_000, qualityScore: 96.8,
    schema: makeColumns(),
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-06-15T09:00:00Z',
    lastRefreshed: '2024-06-15T09:00:00Z',
    version: 'v1.2.0', status: 'ready',
  },
  {
    id: 'ds5', name: 'supply_chain_events', description: 'Logistics and supply chain event stream from IoT sensors and WMS',
    projectId: 'proj3', format: 'parquet', source: 'api',
    tags: ['logistics', 'iot', 'streaming', 'events'],
    owner: MOCK_USERS[0], rowCount: 12_400_000, columnCount: 14,
    sizeBytes: 3_200_000_000, qualityScore: 81.3,
    schema: makeColumns(),
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-06-19T11:00:00Z',
    lastRefreshed: '2024-06-19T11:00:00Z',
    version: 'v2.0.0', status: 'processing',
  },
  {
    id: 'ds6', name: 'clickstream_june', description: 'Raw web clickstream events for June 2024',
    projectId: 'proj4', format: 'json', source: 'api',
    tags: ['clickstream', 'web', 'raw', 'behavioral'],
    owner: MOCK_USERS[2], rowCount: 28_900_000, columnCount: 11,
    sizeBytes: 8_100_000_000, qualityScore: 58.9,
    schema: makeColumns(),
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-19T00:00:00Z',
    lastRefreshed: '2024-06-19T00:00:00Z',
    version: 'v1.0.0', status: 'error',
  },
]

// ─── PIPELINES ────────────────────────────────
const pipelineNodes: PipelineNode[] = [
  { id: 'n1', type: 'source', label: 'PostgreSQL Source', description: 'Pull customer data from prod DB', position: { x: 100, y: 200 }, config: { host: 'db.nexus.io', table: 'customers' } },
  { id: 'n2', type: 'validation', label: 'Schema Validation', description: 'Validate incoming schema', position: { x: 340, y: 200 }, config: { strict: true } },
  { id: 'n3', type: 'cleaning', label: 'Data Cleansing', description: 'Remove nulls, fix types', position: { x: 580, y: 200 }, config: { dropNulls: false, fillStrategy: 'median' } },
  { id: 'n4', type: 'transformation', label: 'Feature Transform', description: 'Encode categoricals, normalize', position: { x: 820, y: 200 }, config: { normalize: true } },
  { id: 'n5', type: 'feature_engineering', label: 'Feature Engineering', description: 'Create derived features', position: { x: 1060, y: 200 }, config: {} },
  { id: 'n6', type: 'storage', label: 'Parquet Sink', description: 'Write to MinIO object storage', position: { x: 1300, y: 200 }, config: { bucket: 'features', format: 'parquet' } },
]

const pipelineEdges: PipelineEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3' },
  { id: 'e3', source: 'n3', target: 'n4' },
  { id: 'e4', source: 'n4', target: 'n5' },
  { id: 'e5', source: 'n5', target: 'n6' },
]

export const MOCK_PIPELINES: Pipeline[] = [
  {
    id: 'pl1', name: 'Customer ETL Pipeline', description: 'Full customer data extraction and transformation pipeline',
    projectId: 'proj1', nodes: pipelineNodes, edges: pipelineEdges,
    status: 'active', trigger: 'scheduled', schedule: '0 2 * * *',
    lastRunAt: '2024-06-19T02:00:00Z', lastRunDuration: 342000,
    lastRunStatus: 'success', successRate: 97.4, totalRuns: 184,
    createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-06-18T10:00:00Z',
  },
  {
    id: 'pl2', name: 'Fraud Feature Pipeline', description: 'Real-time fraud feature computation and serving pipeline',
    projectId: 'proj2', nodes: pipelineNodes.slice(0, 4), edges: pipelineEdges.slice(0, 3),
    status: 'error', trigger: 'event',
    lastRunAt: '2024-06-19T09:45:00Z', lastRunDuration: 89000,
    lastRunStatus: 'failure', successRate: 88.2, totalRuns: 520,
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-06-19T09:45:00Z',
  },
  {
    id: 'pl3', name: 'Supply Chain Aggregator', description: 'Daily supply chain KPI aggregation and forecasting prep',
    projectId: 'proj3', nodes: pipelineNodes, edges: pipelineEdges,
    status: 'active', trigger: 'scheduled', schedule: '0 6 * * *',
    lastRunAt: '2024-06-19T06:00:00Z', lastRunDuration: 1240000,
    lastRunStatus: 'success', successRate: 91.7, totalRuns: 96,
    createdAt: '2024-03-15T00:00:00Z', updatedAt: '2024-06-18T08:00:00Z',
  },
  {
    id: 'pl4', name: 'Recommendation Refresh', description: 'Weekly model retraining data preparation',
    projectId: 'proj4', nodes: pipelineNodes.slice(0, 5), edges: pipelineEdges.slice(0, 4),
    status: 'paused', trigger: 'scheduled', schedule: '0 0 * * 0',
    lastRunAt: '2024-06-15T00:00:00Z', lastRunDuration: 4800000,
    lastRunStatus: 'success', successRate: 95.0, totalRuns: 22,
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-06-15T01:20:00Z',
  },
]

// ─── PIPELINE RUNS ────────────────────────────
const makeLogs = (): LogEntry[] => [
  { timestamp: '2024-06-19T02:00:01Z', level: 'info', message: 'Pipeline execution started', nodeId: 'n1' },
  { timestamp: '2024-06-19T02:00:03Z', level: 'info', message: 'Connecting to PostgreSQL source...', nodeId: 'n1' },
  { timestamp: '2024-06-19T02:00:05Z', level: 'info', message: 'Connection established. Pulling 95,420 rows', nodeId: 'n1' },
  { timestamp: '2024-06-19T02:01:32Z', level: 'info', message: 'Source extraction complete in 87.3s', nodeId: 'n1' },
  { timestamp: '2024-06-19T02:01:33Z', level: 'info', message: 'Starting schema validation...', nodeId: 'n2' },
  { timestamp: '2024-06-19T02:02:01Z', level: 'warning', message: '312 rows have null age field — applying default', nodeId: 'n2' },
  { timestamp: '2024-06-19T02:02:10Z', level: 'info', message: 'Schema validation passed (1 warning)', nodeId: 'n2' },
  { timestamp: '2024-06-19T02:02:11Z', level: 'info', message: 'Starting data cleansing...', nodeId: 'n3' },
  { timestamp: '2024-06-19T02:03:45Z', level: 'info', message: 'Cleansing complete — 1,847 cells normalized', nodeId: 'n3' },
  { timestamp: '2024-06-19T02:03:46Z', level: 'info', message: 'Applying feature transformations...', nodeId: 'n4' },
  { timestamp: '2024-06-19T02:05:12Z', level: 'info', message: 'Feature engineering complete — 12 new features created', nodeId: 'n5' },
  { timestamp: '2024-06-19T02:05:42Z', level: 'info', message: 'Writing Parquet to MinIO bucket: features', nodeId: 'n6' },
  { timestamp: '2024-06-19T02:05:42Z', level: 'info', message: 'Pipeline execution complete in 342s', nodeId: 'n6' },
]

export const MOCK_PIPELINE_RUNS: PipelineRun[] = [
  {
    id: 'run1', pipelineId: 'pl1', status: 'success',
    startedAt: '2024-06-19T02:00:00Z', finishedAt: '2024-06-19T02:05:42Z',
    duration: 342000, triggeredBy: 'scheduler',
    logs: makeLogs(),
    nodesStatus: { n1: 'success', n2: 'success', n3: 'success', n4: 'success', n5: 'success', n6: 'success' },
  },
  {
    id: 'run2', pipelineId: 'pl1', status: 'success',
    startedAt: '2024-06-18T02:00:00Z', finishedAt: '2024-06-18T02:05:01Z',
    duration: 301000, triggeredBy: 'scheduler',
    logs: makeLogs(),
    nodesStatus: { n1: 'success', n2: 'success', n3: 'success', n4: 'success', n5: 'success', n6: 'success' },
  },
  {
    id: 'run3', pipelineId: 'pl2', status: 'failure',
    startedAt: '2024-06-19T09:45:00Z', finishedAt: '2024-06-19T09:46:29Z',
    duration: 89000, triggeredBy: 'event',
    logs: [
      ...makeLogs().slice(0, 6),
      { timestamp: '2024-06-19T09:46:29Z', level: 'error', message: 'ConnectionError: Redis stream unavailable. Max retries exceeded.', nodeId: 'n2' },
    ],
    nodesStatus: { n1: 'success', n2: 'error', n3: 'pending', n4: 'pending' },
  },
]

// ─── QUALITY REPORTS ──────────────────────────
export const MOCK_QUALITY_REPORTS: QualityReport[] = MOCK_DATASETS.map(ds => {
  const dims: QualityDimension[] = [
    { name: 'completeness', score: ds.qualityScore - 2, trend: 1.2, failedChecks: 2, totalChecks: 20 },
    { name: 'consistency', score: ds.qualityScore + 3, trend: -0.5, failedChecks: 1, totalChecks: 15 },
    { name: 'uniqueness', score: ds.qualityScore - 5, trend: 0, failedChecks: 3, totalChecks: 18 },
    { name: 'validity', score: ds.qualityScore + 1, trend: 2.1, failedChecks: 1, totalChecks: 22 },
    { name: 'timeliness', score: ds.qualityScore - 8, trend: -1.3, failedChecks: 4, totalChecks: 10 },
  ]
  const rules: ValidationRule[] = [
    { id: `vr-${ds.id}-1`, name: 'customer_id_not_null', description: 'Primary key must not be null', datasetId: ds.id, columnName: 'customer_id', ruleType: 'not_null', parameters: {}, severity: 'critical', isActive: true, lastRunAt: ds.lastRefreshed, lastResult: 'pass', failureCount: 0 },
    { id: `vr-${ds.id}-2`, name: 'customer_id_unique', description: 'Primary key must be unique', datasetId: ds.id, columnName: 'customer_id', ruleType: 'unique', parameters: {}, severity: 'critical', isActive: true, lastRunAt: ds.lastRefreshed, lastResult: 'pass', failureCount: 0 },
    { id: `vr-${ds.id}-3`, name: 'age_range_check', description: 'Age must be between 18 and 120', datasetId: ds.id, columnName: 'age', ruleType: 'range', parameters: { min: 18, max: 120 }, severity: 'warning', isActive: true, lastRunAt: ds.lastRefreshed, lastResult: ds.qualityScore > 85 ? 'pass' : 'fail', failureCount: ds.qualityScore > 85 ? 0 : 47 },
    { id: `vr-${ds.id}-4`, name: 'email_format_check', description: 'Email must match standard pattern', datasetId: ds.id, columnName: 'email', ruleType: 'regex', parameters: { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }, severity: 'warning', isActive: true, lastRunAt: ds.lastRefreshed, lastResult: 'warning', failureCount: 89 },
    { id: `vr-${ds.id}-5`, name: 'spend_non_negative', description: 'Total spend must not be negative', datasetId: ds.id, columnName: 'total_spend', ruleType: 'range', parameters: { min: 0 }, severity: 'critical', isActive: true, lastRunAt: ds.lastRefreshed, lastResult: 'pass', failureCount: 0 },
  ]
  return {
    id: `qr-${ds.id}`, datasetId: ds.id,
    overallScore: ds.qualityScore,
    dimensions: dims,
    rules,
    generatedAt: ds.lastRefreshed,
    rowsChecked: ds.rowCount,
    failedRows: Math.floor(ds.rowCount * (1 - ds.qualityScore / 100)),
  }
})

// ─── FEATURES ─────────────────────────────────
export const MOCK_FEATURES: Feature[] = [
  {
    id: 'ft1', name: 'customer_lifetime_value', description: 'Predicted 12-month customer lifetime value based on purchase history and engagement signals',
    projectId: 'proj1', datasetId: 'ds1', columnName: 'clv_score',
    transformation: 'log_normalize(rolling_sum(total_spend, 90d)) / recency_score',
    dataType: 'float64', owner: MOCK_USERS[1],
    tags: ['revenue', 'customer', 'ml-ready'],
    usedByModels: ['churn-predictor-v3', 'upsell-ranker-v2', 'ltv-regressor-v1'],
    version: 'v1.4', isOnline: true, isOffline: true,
    createdAt: '2024-02-15T00:00:00Z', updatedAt: '2024-06-18T00:00:00Z',
    statistics: { mean: 847.3, stddev: 2401.8, min: 0.0, max: 89420.5, nullPercent: 1.26 },
  },
  {
    id: 'ft2', name: 'transaction_velocity_7d', description: 'Number of transactions in the last 7 days — key fraud signal',
    projectId: 'proj2', datasetId: 'ds2', columnName: 'tx_count_7d',
    transformation: 'count(transaction_id) OVER (PARTITION BY customer_id ORDER BY ts RANGE INTERVAL 7 DAY PRECEDING)',
    dataType: 'int32', owner: MOCK_USERS[0],
    tags: ['fraud', 'behavioral', 'temporal'],
    usedByModels: ['fraud-detector-v5', 'risk-scorer-v2'],
    version: 'v2.1', isOnline: true, isOffline: false,
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-06-19T00:00:00Z',
    statistics: { mean: 4.2, stddev: 8.9, min: 0, max: 842, nullPercent: 0 },
  },
  {
    id: 'ft3', name: 'product_affinity_vector', description: '128-dimensional product category embedding from collaborative filtering',
    projectId: 'proj4', datasetId: 'ds3', columnName: 'prod_embedding',
    transformation: 'implicit_als(interaction_matrix, factors=128)',
    dataType: 'array<float32>[128]', owner: MOCK_USERS[2],
    tags: ['embedding', 'recommendation', 'deep-learning'],
    usedByModels: ['recommendation-engine-v4', 'search-ranker-v3'],
    version: 'v3.0', isOnline: false, isOffline: true,
    createdAt: '2024-04-10T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z',
    statistics: { nullPercent: 0.04 },
  },
  {
    id: 'ft4', name: 'supply_chain_risk_score', description: 'Composite risk score for supplier reliability based on delivery history',
    projectId: 'proj3', datasetId: 'ds5', columnName: 'risk_score',
    transformation: 'weighted_composite(delay_rate * 0.4 + quality_reject_rate * 0.35 + disruption_count * 0.25)',
    dataType: 'float32', owner: MOCK_USERS[1],
    tags: ['supply-chain', 'risk', 'composite'],
    usedByModels: ['demand-forecaster-v2'],
    version: 'v1.0', isOnline: false, isOffline: true,
    createdAt: '2024-05-01T00:00:00Z', updatedAt: '2024-06-10T00:00:00Z',
    statistics: { mean: 0.34, stddev: 0.18, min: 0.0, max: 1.0, nullPercent: 0.8 },
  },
  {
    id: 'ft5', name: 'customer_recency_score', description: 'RFM recency component — days since last purchase, min-max normalized',
    projectId: 'proj1', datasetId: 'ds1', columnName: 'recency_score',
    transformation: '1 - min_max_scale(days_since_last_purchase)',
    dataType: 'float32', owner: MOCK_USERS[2],
    tags: ['rfm', 'customer', 'behavioral'],
    usedByModels: ['churn-predictor-v3', 'ltv-regressor-v1'],
    version: 'v2.3', isOnline: true, isOffline: true,
    createdAt: '2024-02-20T00:00:00Z', updatedAt: '2024-06-18T00:00:00Z',
    statistics: { mean: 0.61, stddev: 0.24, min: 0.0, max: 1.0, nullPercent: 0.0 },
  },
]

// ─── LINEAGE NODES ────────────────────────────
export const MOCK_LINEAGE_NODES: LineageNode[] = [
  { id: 'ln1', type: 'source', label: 'PostgreSQL\n(prod-db)', description: 'Production customer database', metadata: { host: 'db.nexus.io', db: 'nexus_prod' }, position: { x: 80, y: 200 } },
  { id: 'ln2', type: 'source', label: 'Kafka Stream\n(transactions)', description: 'Real-time transaction events', metadata: { topic: 'tx.events', brokers: 3 }, position: { x: 80, y: 360 } },
  { id: 'ln3', type: 'source', label: 'REST API\n(product catalog)', description: 'Product catalog sync API', metadata: { endpoint: 'api.nexus.io/catalog' }, position: { x: 80, y: 520 } },
  { id: 'ln4', type: 'dataset', label: 'customers_v2', description: 'Processed customer master', metadata: { rows: 95420, format: 'parquet' }, position: { x: 340, y: 200 } },
  { id: 'ln5', type: 'dataset', label: 'transactions_2024', description: 'Transaction records', metadata: { rows: 4281000, format: 'parquet' }, position: { x: 340, y: 360 } },
  { id: 'ln6', type: 'dataset', label: 'product_catalog', description: 'Product metadata', metadata: { rows: 142830, format: 'json' }, position: { x: 340, y: 520 } },
  { id: 'ln7', type: 'pipeline', label: 'Customer ETL\nPipeline', description: 'Main customer data pipeline', metadata: { runs: 184, successRate: '97.4%' }, position: { x: 580, y: 200 } },
  { id: 'ln8', type: 'pipeline', label: 'Fraud Feature\nPipeline', description: 'Fraud detection pipeline', metadata: { runs: 520, successRate: '88.2%' }, position: { x: 580, y: 360 } },
  { id: 'ln9', type: 'pipeline', label: 'Reco Feature\nPipeline', description: 'Recommendation features', metadata: { runs: 22, successRate: '95%' }, position: { x: 580, y: 520 } },
  { id: 'ln10', type: 'feature', label: 'customer_ltv', description: 'Lifetime value feature', metadata: { version: 'v1.4', type: 'float64' }, position: { x: 820, y: 200 } },
  { id: 'ln11', type: 'feature', label: 'tx_velocity_7d', description: 'Transaction velocity feature', metadata: { version: 'v2.1', type: 'int32' }, position: { x: 820, y: 360 } },
  { id: 'ln12', type: 'feature', label: 'product_affinity', description: 'Product embedding feature', metadata: { version: 'v3.0', dims: 128 }, position: { x: 820, y: 520 } },
  { id: 'ln13', type: 'model', label: 'churn-predictor\nv3.2', description: 'Customer churn prediction model', metadata: { accuracy: '91.4%', framework: 'XGBoost' }, position: { x: 1060, y: 200 } },
  { id: 'ln14', type: 'model', label: 'fraud-detector\nv5.1', description: 'Real-time fraud scoring model', metadata: { precision: '98.7%', framework: 'LightGBM' }, position: { x: 1060, y: 360 } },
  { id: 'ln15', type: 'model', label: 'recommendation\nv4.0', description: 'Product recommendation model', metadata: { ndcg: 0.847, framework: 'PyTorch' }, position: { x: 1060, y: 520 } },
  { id: 'ln16', type: 'sink', label: 'Feature Store\n(Online)', description: 'Redis online feature store', metadata: { latency: '2ms p99' }, position: { x: 1300, y: 280 } },
  { id: 'ln17', type: 'sink', label: 'Feature Store\n(Offline)', description: 'Parquet offline feature store', metadata: { location: 's3://features' }, position: { x: 1300, y: 440 } },
]

export const MOCK_LINEAGE_EDGES: LineageEdge[] = [
  { id: 'le1', source: 'ln1', target: 'ln4', label: 'CDC' },
  { id: 'le2', source: 'ln2', target: 'ln5', label: 'Stream' },
  { id: 'le3', source: 'ln3', target: 'ln6', label: 'Sync' },
  { id: 'le4', source: 'ln4', target: 'ln7' },
  { id: 'le5', source: 'ln5', target: 'ln8' },
  { id: 'le6', source: 'ln5', target: 'ln9' },
  { id: 'le7', source: 'ln6', target: 'ln9' },
  { id: 'le8', source: 'ln7', target: 'ln10' },
  { id: 'le9', source: 'ln8', target: 'ln11' },
  { id: 'le10', source: 'ln9', target: 'ln12' },
  { id: 'le11', source: 'ln10', target: 'ln13' },
  { id: 'le12', source: 'ln11', target: 'ln14' },
  { id: 'le13', source: 'ln12', target: 'ln15' },
  { id: 'le14', source: 'ln13', target: 'ln16' },
  { id: 'le15', source: 'ln14', target: 'ln16' },
  { id: 'le16', source: 'ln10', target: 'ln17' },
  { id: 'le17', source: 'ln11', target: 'ln17' },
  { id: 'le18', source: 'ln12', target: 'ln17' },
]

// ─── WORKFLOWS ────────────────────────────────
export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf1', name: 'Daily Customer Refresh', description: 'Full customer ETL + quality checks every midnight',
    projectId: 'proj1', pipelineId: 'pl1', schedule: '0 2 * * *', isActive: true,
    nextRunAt: '2024-06-20T02:00:00Z', lastRunAt: '2024-06-19T02:00:00Z', lastStatus: 'success',
    runCount: 184, successCount: 179, failureCount: 5, avgDuration: 315000,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'wf2', name: 'Fraud Signal Refresh', description: 'Recompute fraud features every 6 hours',
    projectId: 'proj2', pipelineId: 'pl2', schedule: '0 */6 * * *', isActive: true,
    nextRunAt: '2024-06-19T12:00:00Z', lastRunAt: '2024-06-19T09:45:00Z', lastStatus: 'failure',
    runCount: 520, successCount: 459, failureCount: 61, avgDuration: 72000,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'wf3', name: 'Weekly Model Retraining Data', description: 'Prepare training datasets every Sunday',
    projectId: 'proj4', pipelineId: 'pl4', schedule: '0 0 * * 0', isActive: false,
    nextRunAt: '2024-06-23T00:00:00Z', lastRunAt: '2024-06-15T00:00:00Z', lastStatus: 'success',
    runCount: 22, successCount: 21, failureCount: 1, avgDuration: 4800000,
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'wf4', name: 'Supply Chain Daily KPI', description: 'Aggregate supply chain metrics and send alerts',
    projectId: 'proj3', pipelineId: 'pl3', schedule: '0 6 * * *', isActive: true,
    nextRunAt: '2024-06-20T06:00:00Z', lastRunAt: '2024-06-19T06:00:00Z', lastStatus: 'success',
    runCount: 96, successCount: 88, failureCount: 8, avgDuration: 1240000,
    createdAt: '2024-03-15T00:00:00Z',
  },
]

export const MOCK_WORKFLOW_RUNS: WorkflowRun[] = [
  { id: 'wr1', workflowId: 'wf1', status: 'success', startedAt: '2024-06-19T02:00:00Z', finishedAt: '2024-06-19T02:05:42Z', duration: 342000, triggeredBy: 'schedule' },
  { id: 'wr2', workflowId: 'wf1', status: 'success', startedAt: '2024-06-18T02:00:00Z', finishedAt: '2024-06-18T02:04:58Z', duration: 298000, triggeredBy: 'schedule' },
  { id: 'wr3', workflowId: 'wf1', status: 'failure', startedAt: '2024-06-15T02:00:00Z', finishedAt: '2024-06-15T02:01:12Z', duration: 72000, triggeredBy: 'schedule', errorMessage: 'Source DB connection timeout' },
  { id: 'wr4', workflowId: 'wf2', status: 'failure', startedAt: '2024-06-19T09:45:00Z', finishedAt: '2024-06-19T09:46:29Z', duration: 89000, triggeredBy: 'schedule', errorMessage: 'Redis stream unavailable' },
  { id: 'wr5', workflowId: 'wf3', status: 'success', startedAt: '2024-06-15T00:00:00Z', finishedAt: '2024-06-15T01:20:00Z', duration: 4800000, triggeredBy: 'schedule' },
  { id: 'wr6', workflowId: 'wf4', status: 'success', startedAt: '2024-06-19T06:00:00Z', finishedAt: '2024-06-19T06:20:40Z', duration: 1240000, triggeredBy: 'schedule' },
]

// ─── DATASET VERSIONS ─────────────────────────
export const MOCK_VERSIONS: DatasetVersion[] = [
  // ds1
  {
    id: 'dv1', datasetId: 'ds1', version: 'v2.4.1', description: 'Hotfix: Fix encoding issue for international characters in email column',
    rowCount: 95420, columnCount: 8, sizeBytes: 284_000_000,
    author: MOCK_USERS[1],
    changes: [{ type: 'modified', description: 'Fixed UTF-8 encoding in email column', affectedColumns: ['email'] }],
    createdAt: '2024-06-18T14:00:00Z', isCurrent: true,
  },
  {
    id: 'dv2', datasetId: 'ds1', version: 'v2.4.0', description: 'Added country_code column, normalized spend values',
    rowCount: 95410, columnCount: 7, sizeBytes: 271_000_000,
    author: MOCK_USERS[0],
    changes: [
      { type: 'added', description: 'Added country_code column', affectedColumns: ['country_code'], rowDelta: 10 },
      { type: 'modified', description: 'Normalized total_spend to USD', affectedColumns: ['total_spend'] },
    ],
    createdAt: '2024-06-10T10:00:00Z', isCurrent: false,
  },
  {
    id: 'dv3', datasetId: 'ds1', version: 'v2.3.0', description: 'Backfill missing age values using ML model',
    rowCount: 95400, columnCount: 7, sizeBytes: 268_000_000,
    author: MOCK_USERS[1],
    changes: [
      { type: 'modified', description: 'Backfilled 312 missing age values', affectedColumns: ['age'] },
    ],
    createdAt: '2024-05-22T08:00:00Z', isCurrent: false,
  },
  {
    id: 'dv4', datasetId: 'ds1', version: 'v2.2.0', description: 'Schema update: Added signup_channel, removed deprecated source field',
    rowCount: 95400, columnCount: 8, sizeBytes: 264_000_000,
    author: MOCK_USERS[0],
    changes: [
      { type: 'added', description: 'Added signup_channel column', affectedColumns: ['signup_channel'] },
      { type: 'removed', description: 'Removed deprecated source column', affectedColumns: ['source'] },
      { type: 'schema_change', description: 'Migrated status from int to enum string' },
    ],
    createdAt: '2024-05-01T09:00:00Z', isCurrent: false,
  },
  // ds2
  {
    id: 'dv_ds2_1', datasetId: 'ds2', version: 'v1.0.0', description: 'Initial Q1-Q2 transactions import',
    rowCount: 4281000, columnCount: 22, sizeBytes: 1840000000,
    author: MOCK_USERS[1],
    changes: [{ type: 'added', description: 'Initial import', affectedColumns: ['transaction_id', 'amount'] }],
    createdAt: '2024-06-18T06:00:00Z', isCurrent: true,
  },
  {
    id: 'dv_ds2_2', datasetId: 'ds2', version: 'v0.9.0', description: 'Beta transaction schema setup',
    rowCount: 3500000, columnCount: 20, sizeBytes: 1500000000,
    author: MOCK_USERS[0],
    changes: [{ type: 'added', description: 'Base schema structures' }],
    createdAt: '2024-06-01T12:00:00Z', isCurrent: false,
  },
  // ds3
  {
    id: 'dv_ds3_1', datasetId: 'ds3', version: 'v3.1.0', description: 'Update product prices and stock amounts from ERP',
    rowCount: 142830, columnCount: 18, sizeBytes: 92000000,
    author: MOCK_USERS[2],
    changes: [{ type: 'modified', description: 'Updated pricing and stocks', affectedColumns: ['price', 'inventory_count'] }],
    createdAt: '2024-06-17T12:00:00Z', isCurrent: true,
  },
  {
    id: 'dv_ds3_2', datasetId: 'ds3', version: 'v3.0.0', description: 'Add global currency converter mapping',
    rowCount: 142000, columnCount: 18, sizeBytes: 91500000,
    author: MOCK_USERS[1],
    changes: [{ type: 'added', description: 'Currency support' }],
    createdAt: '2024-06-05T09:00:00Z', isCurrent: false,
  },
  // ds4
  {
    id: 'dv_ds4_1', datasetId: 'ds4', version: 'v1.2.0', description: 'Risk team approved final labels for ML model',
    rowCount: 890000, columnCount: 41, sizeBytes: 410000000,
    author: MOCK_USERS[1],
    changes: [{ type: 'modified', description: 'Updated review labels', affectedColumns: ['is_fraud'] }],
    createdAt: '2024-06-15T09:00:00Z', isCurrent: true,
  },
  {
    id: 'dv_ds4_2', datasetId: 'ds4', version: 'v1.1.0', description: 'Draft label rules for transaction behavior',
    rowCount: 850000, columnCount: 40, sizeBytes: 390000000,
    author: MOCK_USERS[0],
    changes: [{ type: 'added', description: 'Transaction rules' }],
    createdAt: '2024-06-01T15:00:00Z', isCurrent: false,
  },
  // ds5
  {
    id: 'dv_ds5_1', datasetId: 'ds5', version: 'v2.0.0', description: 'Release IoT streams version 2 schema',
    rowCount: 12400000, columnCount: 14, sizeBytes: 3200000000,
    author: MOCK_USERS[0],
    changes: [{ type: 'schema_change', description: 'Schema upgrade' }],
    createdAt: '2024-06-19T11:00:00Z', isCurrent: true,
  },
  {
    id: 'dv_ds5_2', datasetId: 'ds5', version: 'v1.0.0', description: 'Initial logistics IoT stream release',
    rowCount: 10000000, columnCount: 12, sizeBytes: 2500000000,
    author: MOCK_USERS[1],
    changes: [{ type: 'added', description: 'Initial setup' }],
    createdAt: '2024-05-15T08:00:00Z', isCurrent: false,
  },
  // ds6
  {
    id: 'dv_ds6_1', datasetId: 'ds6', version: 'v1.0.0', description: 'Clickstream raw data import',
    rowCount: 28900000, columnCount: 11, sizeBytes: 8100000000,
    author: MOCK_USERS[2],
    changes: [{ type: 'added', description: 'Raw logs' }],
    createdAt: '2024-06-19T00:00:00Z', isCurrent: true,
  },
  {
    id: 'dv_ds6_2', datasetId: 'ds6', version: 'v0.8.0', description: 'Initial staging clickstream schema config',
    rowCount: 20000000, columnCount: 10, sizeBytes: 5600000000,
    author: MOCK_USERS[0],
    changes: [{ type: 'added', description: 'Initial schema setup' }],
    createdAt: '2024-06-10T10:00:00Z', isCurrent: false,
  }
]

// ─── NOTIFICATIONS ────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Pipeline Failed', message: 'Fraud Feature Pipeline encountered a Redis connection error', type: 'error', isRead: false, createdAt: '2024-06-19T09:46:00Z', link: '/pipelines/pl2' },
  { id: 'n2', title: 'Quality Alert', message: 'clickstream_june quality score dropped below 60%', type: 'warning', isRead: false, createdAt: '2024-06-19T08:00:00Z', link: '/quality' },
  { id: 'n3', title: 'Dataset Stale', message: 'product_catalog has not been refreshed in 24+ hours', type: 'warning', isRead: false, createdAt: '2024-06-19T06:00:00Z', link: '/catalog/ds3' },
  { id: 'n4', title: 'Pipeline Completed', message: 'Customer ETL Pipeline completed successfully in 5m 42s', type: 'success', isRead: true, createdAt: '2024-06-19T02:05:42Z', link: '/pipelines/pl1' },
  { id: 'n5', title: 'New Team Member', message: 'Priya Sharma joined the organization as Viewer', type: 'info', isRead: true, createdAt: '2024-06-18T14:30:00Z' },
  { id: 'n6', title: 'Feature Published', message: 'customer_lifetime_value v1.4 is now available in the online feature store', type: 'success', isRead: true, createdAt: '2024-06-18T10:00:00Z', link: '/features/ft1' },
]

// ─── AUDIT LOGS ────────────────────────────────
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', userId: 'u1', userName: 'Alex Chen', action: 'dataset.update', resource: 'Dataset', resourceId: 'ds1', details: { version: 'v2.4.1' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: '2024-06-18T14:00:00Z' },
  { id: 'al2', userId: 'u2', userName: 'Sarah Kim', action: 'pipeline.run', resource: 'Pipeline', resourceId: 'pl1', details: { trigger: 'manual' }, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', createdAt: '2024-06-18T13:00:00Z' },
  { id: 'al3', userId: 'u3', userName: 'Marcus Lee', action: 'feature.publish', resource: 'Feature', resourceId: 'ft1', details: { version: 'v1.4', store: 'online' }, ipAddress: '192.168.1.3', userAgent: 'Mozilla/5.0', createdAt: '2024-06-18T10:00:00Z' },
  { id: 'al4', userId: 'u1', userName: 'Alex Chen', action: 'user.invite', resource: 'User', resourceId: 'u4', details: { role: 'viewer' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: '2024-06-18T09:00:00Z' },
  { id: 'al5', userId: 'u2', userName: 'Sarah Kim', action: 'pipeline.create', resource: 'Pipeline', resourceId: 'pl1', details: { name: 'Customer ETL Pipeline' }, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', createdAt: '2024-06-17T15:30:00Z' },
  { id: 'al6', userId: 'u1', userName: 'Alex Chen', action: 'dataset.delete', resource: 'Dataset', resourceId: 'ds-old', details: { name: 'customers_v1_deprecated' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: '2024-06-17T11:00:00Z' },
]

// ─── MONITORING ────────────────────────────────
const genTimeSeries = (count: number, baseValue: number, variance: number): MetricPoint[] => {
  const points: MetricPoint[] = []
  const now = new Date('2024-06-19T12:00:00Z')
  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000)
    points.push({
      timestamp: d.toISOString(),
      value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance * 2)),
    })
  }
  return points
}

export const MOCK_HEALTH_METRICS: PipelineHealthMetric[] = MOCK_PIPELINES.map(p => ({
  pipelineId: p.id,
  pipelineName: p.name,
  successRate: p.successRate,
  avgDuration: p.lastRunDuration ?? 0,
  lastRunStatus: p.lastRunStatus ?? 'idle',
  trend: genTimeSeries(24, p.successRate, 8),
}))

// ─── DASHBOARD STATS ───────────────────────────
export const MOCK_DASHBOARD_STATS = {
  dataHealthScore: 88.4,
  dataHealthTrend: 2.1,
  activePipelines: 3,
  totalPipelines: 4,
  totalDatasets: MOCK_DATASETS.length,
  activeDatasets: MOCK_DATASETS.filter(d => d.status === 'ready').length,
  failedJobs: 2,
  failedJobsTrend: -1,
  storageUsed: 13_726_000_000,
  storageTotal: 50_000_000_000,
  processedRows: 45_702_850,
  processingTrend: 12.4,
  avgQualityScore: MOCK_DATASETS.reduce((s, d) => s + d.qualityScore, 0) / MOCK_DATASETS.length,
  features: MOCK_FEATURES.length,
  activeWorkflows: MOCK_WORKFLOWS.filter(w => w.isActive).length,
  chartData: {
    dailyProcessing: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      rows: Math.floor(Math.random() * 5_000_000 + 3_000_000),
      pipelines: Math.floor(Math.random() * 8 + 4),
    })),
    qualityTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      score: 82 + Math.random() * 10,
    })),
    pipelineStatus: [
      { name: 'Success', value: 179, color: '#10B981' },
      { name: 'Failed', value: 15, color: '#EF4444' },
      { name: 'Running', value: 3, color: '#3B82F6' },
    ],
  },
}
