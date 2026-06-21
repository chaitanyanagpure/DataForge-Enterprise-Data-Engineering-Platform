// ============================================
// CORE DOMAIN TYPES — DataForge
// ============================================

export type UserRole = 'admin' | 'data_engineer' | 'data_scientist' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  organizationId: string
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'pro' | 'enterprise'
  logoUrl?: string
  createdAt: string
  memberCount: number
}

export interface Project {
  id: string
  name: string
  description: string
  organizationId: string
  color: string
  icon: string
  datasetCount: number
  pipelineCount: number
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived'
}

// ============================================
// DATASET TYPES
// ============================================

export type DatasetFormat = 'csv' | 'parquet' | 'json' | 'excel' | 'avro'
export type DatasetSource = 'upload' | 'postgres' | 'api' | 's3' | 'snowflake'

export interface ColumnSchema {
  name: string
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'array' | 'object'
  nullable: boolean
  unique: boolean
  missing: number
  missingPercent: number
  min?: number | string
  max?: number | string
  mean?: number
  stddev?: number
  cardinality?: number
  sampleValues: (string | number | boolean)[]
}

export interface Dataset {
  id: string
  name: string
  description: string
  projectId: string
  format: DatasetFormat
  source: DatasetSource
  tags: string[]
  owner: User
  rowCount: number
  columnCount: number
  sizeBytes: number
  qualityScore: number
  schema: ColumnSchema[]
  createdAt: string
  updatedAt: string
  lastRefreshed: string
  version: string
  status: 'ready' | 'processing' | 'error' | 'stale'
}

// ============================================
// DATA QUALITY TYPES
// ============================================

export interface QualityDimension {
  name: 'completeness' | 'consistency' | 'uniqueness' | 'validity' | 'timeliness'
  score: number
  trend: number
  failedChecks: number
  totalChecks: number
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  datasetId: string
  columnName?: string
  ruleType: 'not_null' | 'unique' | 'range' | 'regex' | 'custom' | 'referential'
  parameters: Record<string, unknown>
  severity: 'critical' | 'warning' | 'info'
  isActive: boolean
  lastRunAt: string
  lastResult: 'pass' | 'fail' | 'warning'
  failureCount: number
}

export interface QualityReport {
  id: string
  datasetId: string
  overallScore: number
  dimensions: QualityDimension[]
  rules: ValidationRule[]
  generatedAt: string
  rowsChecked: number
  failedRows: number
}

// ============================================
// PIPELINE TYPES
// ============================================

export type NodeType = 'source' | 'validation' | 'cleaning' | 'transformation' | 'feature_engineering' | 'storage' | 'join' | 'filter' | 'aggregate'

export interface PipelineNode {
  id: string
  type: NodeType
  label: string
  description: string
  position: { x: number; y: number }
  config: Record<string, unknown>
  status?: 'idle' | 'running' | 'success' | 'error'
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export type PipelineStatus = 'draft' | 'active' | 'paused' | 'error'
export type TriggerType = 'manual' | 'scheduled' | 'event'

export interface Pipeline {
  id: string
  name: string
  description: string
  projectId: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  status: PipelineStatus
  trigger: TriggerType
  schedule?: string
  lastRunAt?: string
  lastRunDuration?: number
  lastRunStatus?: 'success' | 'failure' | 'running'
  successRate: number
  totalRuns: number
  createdAt: string
  updatedAt: string
}

export interface PipelineRun {
  id: string
  pipelineId: string
  status: 'queued' | 'running' | 'success' | 'failure' | 'cancelled'
  startedAt: string
  finishedAt?: string
  duration?: number
  triggeredBy: string
  logs: LogEntry[]
  nodesStatus: Record<string, 'pending' | 'running' | 'success' | 'error'>
}

export interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  nodeId?: string
}

// ============================================
// FEATURE STORE TYPES
// ============================================

export interface Feature {
  id: string
  name: string
  description: string
  projectId: string
  datasetId: string
  columnName: string
  transformation?: string
  dataType: string
  owner: User
  tags: string[]
  usedByModels: string[]
  version: string
  isOnline: boolean
  isOffline: boolean
  createdAt: string
  updatedAt: string
  statistics?: {
    mean?: number
    stddev?: number
    min?: number
    max?: number
    nullPercent: number
  }
}

// ============================================
// LINEAGE TYPES
// ============================================

export type LineageNodeType = 'source' | 'dataset' | 'pipeline' | 'feature' | 'model' | 'sink'

export interface LineageNode {
  id: string
  type: LineageNodeType
  label: string
  description: string
  metadata: Record<string, unknown>
  position: { x: number; y: number }
}

export interface LineageEdge {
  id: string
  source: string
  target: string
  label?: string
}

// ============================================
// WORKFLOW TYPES
// ============================================

export interface Workflow {
  id: string
  name: string
  description: string
  projectId: string
  pipelineId?: string
  schedule?: string
  isActive: boolean
  nextRunAt?: string
  lastRunAt?: string
  lastStatus?: 'success' | 'failure' | 'running'
  runCount: number
  successCount: number
  failureCount: number
  avgDuration: number
  createdAt: string
}

export interface WorkflowRun {
  id: string
  workflowId: string
  status: 'queued' | 'running' | 'success' | 'failure' | 'cancelled'
  startedAt: string
  finishedAt?: string
  duration?: number
  triggeredBy: 'schedule' | 'manual' | 'api'
  errorMessage?: string
}

// ============================================
// MONITORING TYPES
// ============================================

export interface MetricPoint {
  timestamp: string
  value: number
}

export interface PipelineHealthMetric {
  pipelineId: string
  pipelineName: string
  successRate: number
  avgDuration: number
  lastRunStatus: 'success' | 'failure' | 'running' | 'idle'
  trend: MetricPoint[]
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  link?: string
}

// ============================================
// DATASET VERSION TYPES
// ============================================

export interface DatasetVersion {
  id: string
  datasetId: string
  version: string
  description: string
  rowCount: number
  columnCount: number
  sizeBytes: number
  author: User
  changes: VersionChange[]
  createdAt: string
  isCurrent: boolean
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified' | 'schema_change'
  description: string
  affectedColumns?: string[]
  rowDelta?: number
}

// ============================================
// AUDIT TYPES
// ============================================

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, unknown>
  ipAddress: string
  userAgent: string
  createdAt: string
}
