export interface AgentResult {
  name: string;
  output: any;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface Agent {
  name: string;
  description: string;
  execute(input: any): Promise<AgentResult>;
}