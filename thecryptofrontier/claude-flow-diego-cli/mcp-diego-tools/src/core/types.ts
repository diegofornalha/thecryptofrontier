/**
 * Type definitions for MCP Puppeteer + GitHub Server
 */

import { Browser, Page } from 'puppeteer';
import { Octokit } from '@octokit/rest';

// ==================== Enums ====================

export enum ToolName {
  // Puppeteer Tools
  PUPPETEER_NAVIGATE = 'puppeteer_navigate',
  PUPPETEER_SCREENSHOT = 'puppeteer_screenshot',
  PUPPETEER_CLICK = 'puppeteer_click',
  PUPPETEER_TYPE = 'puppeteer_type',
  PUPPETEER_GET_CONTENT = 'puppeteer_get_content',
  
  
  // Git Local Tools
  GIT_STATUS = 'git_status',
  GIT_COMMIT = 'git_commit',
  GIT_PUSH = 'git_push',
  GIT_PULL = 'git_pull',
  
  // Mem0 Memory Tools
  MEM0_ADD_MEMORY = 'mem0_add_memory',
  MEM0_SEARCH_MEMORY = 'mem0_search_memory',
  MEM0_LIST_MEMORIES = 'mem0_list_memories',
  MEM0_DELETE_MEMORIES = 'mem0_delete_memories',
  
  // Guardian Organization Tools
  GUARDIAN_ANALYZE = 'guardian_analyze',
  GUARDIAN_STATUS = 'guardian_status',
  GUARDIAN_HISTORY = 'guardian_history',
  GUARDIAN_HEALTH = 'guardian_health',
  GUARDIAN_BACKUP_CREATE = 'guardian_backup_create',
  GUARDIAN_BACKUP_STATUS = 'guardian_backup_status',
  GUARDIAN_CLEANUP_SUGGESTIONS = 'guardian_cleanup_suggestions',
  GUARDIAN_CLEANUP_EXECUTE = 'guardian_cleanup_execute',
  GUARDIAN_LOGS_STATUS = 'guardian_logs_status',
  GUARDIAN_LOGS_ROTATE = 'guardian_logs_rotate',
  GUARDIAN_AGENTS_LIST = 'guardian_agents_list',
  
  // Agent Management Tools
  AGENTS_LIST = 'agents_list',
}

export enum IssueState {
  OPEN = 'open',
  CLOSED = 'closed',
  ALL = 'all'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// ==================== Configuration Types ====================

export interface ServerConfig {
  name: string;
  version: string;
  description: string;
  logLevel?: LogLevel;
}

export interface PuppeteerConfig {
  headless?: boolean;
  defaultTimeout?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}


// ==================== Tool Parameter Types ====================

// Puppeteer Tool Parameters
export interface NavigateParams {
  url: string;
}

export interface ScreenshotParams {
  path: string;
  fullPage?: boolean;
}

export interface ClickParams {
  selector: string;
}

export interface TypeParams {
  selector: string;
  text: string;
}

// Git Local Tools Params
export interface GitStatusParams {
  detailed?: boolean;
}

export interface GitCommitParams {
  message: string;
  addAll?: boolean;
  files?: string[];
}

export interface GitPushParams {
  branch?: string;
  force?: boolean;
  upstream?: boolean;
}

export interface GitPullParams {
  branch?: string;
  rebase?: boolean;
}

// Mem0 Memory Tool Parameters
export interface AddMemoryParams {
  content: string;
  user_id: string;
  metadata?: Record<string, any>;
  tags?: string[];
  category?: string;
}

export interface SearchMemoryParams {
  query: string;
  user_id: string;
  limit?: number;
  filters?: Record<string, any>;
}

export interface ListMemoriesParams {
  user_id: string;
  limit?: number;
}

export interface DeleteMemoriesParams {
  user_id: string;
  memory_id?: string;
}

export interface ListUsersParams {
  limit?: number;
  offset?: number;
}

export interface Memory {
  id: string;
  content: string;
  user_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
  tags?: string[];
  category?: string;
  emotion?: string;
}

export interface MemorySearchResult {
  memory: string;
  score: number;
  id: string;
  metadata?: Record<string, any>;
}


// ==================== Response Types ====================

export type ToolResult<T = any> = 
  | { success: true; data: T; content: ContentBlock[] }
  | { success: false; error: MCPError; content: ContentBlock[] };

export interface ContentBlock {
  type: 'text' | 'image' | 'resource';
  text?: string;
  uri?: string;
  mimeType?: string;
}

// ==================== Error Types ====================

export enum ErrorCode {
  // General errors
  UNKNOWN = 'UNKNOWN',
  INVALID_PARAMS = 'INVALID_PARAMS',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  
  // Puppeteer errors
  BROWSER_NOT_INITIALIZED = 'BROWSER_NOT_INITIALIZED',
  PAGE_LOAD_FAILED = 'PAGE_LOAD_FAILED',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  SCREENSHOT_FAILED = 'SCREENSHOT_FAILED',
  
}

export class MCPError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

// ==================== State Management Types ====================

export interface ServerState {
  browser?: Browser;
  page?: Page;
  octokit?: Octokit;
  lastActivity: number;
  requestCount: number;
}

// ==================== Tool Definition Types ====================

export interface ToolDefinition {
  name: ToolName;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<ToolResult>;
}

// ==================== Type Guards ====================

export function isNavigateParams(params: any): params is NavigateParams {
  return typeof params?.url === 'string';
}

export function isScreenshotParams(params: any): params is ScreenshotParams {
  return typeof params?.path === 'string';
}

export function isMCPError(error: any): error is MCPError {
  return error instanceof MCPError;
}

// ==================== Utility Types ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer U> ? U : never;

export type ExtractToolParams<T extends ToolName> = 
  T extends ToolName.PUPPETEER_NAVIGATE ? NavigateParams :
  T extends ToolName.PUPPETEER_SCREENSHOT ? ScreenshotParams :
  T extends ToolName.PUPPETEER_CLICK ? ClickParams :
  T extends ToolName.PUPPETEER_TYPE ? TypeParams :
  never;