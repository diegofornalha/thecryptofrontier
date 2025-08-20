export interface AgentState {
  isRunning: boolean;
  isPaused: boolean;
  watchedPaths: string[];
  pendingChanges: FileChange[];
  lastError?: string;
  config: {
    watchPath: string;
    debounceTime: number;
    enableDashboard: boolean;
    enableMCP: boolean;
    enableMem0: boolean;
  };
  metrics: DashboardMetrics;
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

export interface FileChange {
  action: 'added' | 'modified' | 'deleted';
  path: string;
  timestamp: string;
  size?: number;
  type?: string;
}

export interface CommitResult {
  success: boolean;
  message: string;
  hash?: string;
  changes: number;
  timestamp: string;
  error?: string;
}

export interface SSHKeyInfo {
  path: string;
  fingerprint?: string;
  createdAt: string;
  lastValidated?: string;
  isValid: boolean;
  failureCount: number;
}

export interface CommitHistory {
  hash: string;
  message: string;
  date: string;
  changes: number;
}

export interface WebSocketMessage {
  type: 'initial' | 'metrics' | 'commit' | 'error' | 'notification';
  data: any;
}