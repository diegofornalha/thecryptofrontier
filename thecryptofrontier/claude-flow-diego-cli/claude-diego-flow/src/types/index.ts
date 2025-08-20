/**
 * Tipos base para o sistema de agentes
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    agent?: string;
    timestamp?: string;
    source?: string;
    [key: string]: any;
  };
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  id?: string;
}

export interface ToolResult {
  toolCallId?: string;
  result: any;
  error?: string;
}

export interface AgentContext {
  sessionId?: string;
  userId?: string;
  previousMessages?: Message[];
  tools?: string[];
}

export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentMetadata {
  version?: string;
  author?: string;
  lastUpdated?: string;
  dependencies?: string[];
}