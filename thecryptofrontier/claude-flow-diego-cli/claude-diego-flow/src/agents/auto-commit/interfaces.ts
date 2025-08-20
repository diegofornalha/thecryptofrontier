/**
 * Interfaces e tipos para o Auto Commit Agent modularizado
 */

export interface AutoCommitConfig {
  watchPath: string;
  debounceTime?: number;
  sshKeyPath?: string;
  gitSSHCommand?: string;
  strategy?: CommitStrategy;
  enableDashboard?: boolean;
  enableMCP?: boolean;
  enableMem0?: boolean;
  dockerized?: boolean;
  strapiUrl?: string;
  maxAuthFailures?: number;
  keyValidationInterval?: number;
}

export interface CommitStrategy {
  shouldCommit(changes: FileChange[]): boolean;
  generateMessage(changes: FileChange[]): string;
  getPriority(): number;
}

export interface FileChange {
  action: 'added' | 'modified' | 'deleted';
  path: string;
  timestamp: Date;
  size?: number;
  type?: string;
}

export interface CommitResult {
  success: boolean;
  message: string;
  hash?: string;
  changes: number;
  timestamp: Date;
  error?: string;
}

export interface SSHKeyInfo {
  path: string;
  fingerprint?: string;
  createdAt: Date;
  lastValidated?: Date;
  isValid: boolean;
  failureCount: number;
}

export interface DashboardMetrics {
  totalCommits: number;
  totalChanges: number;
  lastCommit?: CommitResult;
  uptime: number;
  sshKeyStatus: SSHKeyInfo;
  activeWatchers: number;
  queuedChanges: number;
}

export interface NotificationEvent {
  type: 'commit' | 'error' | 'warning' | 'info' | 'ssh-failure';
  message: string;
  timestamp: Date;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MCPMessage {
  from: string;
  to: string;
  action: string;
  payload: any;
  timestamp: Date;
}

export interface StrapiCommitRecord {
  id?: string;
  hash: string;
  message: string;
  changes: FileChange[];
  timestamp: Date;
  author: string;
  branch: string;
  repository: string;
}

export interface DockerConfig {
  image?: string;
  volumes?: string[];
  environment?: Record<string, string>;
  network?: string;
  restart?: 'no' | 'always' | 'unless-stopped';
}

export interface AgentState {
  isRunning: boolean;
  isPaused: boolean;
  watchedPaths: string[];
  pendingChanges: FileChange[];
  lastError?: string;
  config: AutoCommitConfig;
  metrics: DashboardMetrics;
}