/**
 * Tipos compartilhados para os agentes MCP
 */

export interface TaskFile {
  id: string;
  agent: string;
  created: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  content: string;
}

export interface TaskOutput {
  agent: string;
  task_id: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  result: any;
  metadata: {
    processing_time: string;
    confidence: number;
    notes?: string;
  };
}

export interface AgentConfig {
  name: string;
  role: string;
  goal: string;
  tasksDir: string;
  outputsDir: string;
}

export interface ResearchResult {
  topic: string;
  summary: string[];
  current_context: {
    market_situation: string;
    recent_developments: string[];
    key_players: string[];
  };
  detailed_analysis: {
    technical_aspects: string[];
    market_impact: string;
    opportunities: string[];
    risks: string[];
  };
  trends: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  sources: Array<{
    title: string;
    url: string;
    date: string;
    credibility: number;
  }>;
  unique_insights: string[];
}

export interface ArticleContent {
  title: string;
  slug: string;
  meta_description: string;
  content: string;
  excerpt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  tags: string[];
  categories: string[];
  suggested_images: Array<{
    position: string;
    description: string;
    alt_text: string;
  }>;
}

export interface EditResult {
  edited_content: string;
  changes_made: Array<{
    location: string;
    issue: string;
    correction: string;
    justification: string;
  }>;
  quality_score: number;
  quality_justification: string;
  additional_recommendations: string[];
}