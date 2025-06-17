/**
 * Researcher Agent - MCP TypeScript
 * Responsável por pesquisar e coletar informações
 */

import { BaseMCPAgent } from './base-agent';
import { TaskFile, TaskOutput, AgentConfig, ResearchResult } from '../types';
import { WebScraperTool } from '../tools/web-scraper';
import { RSSReaderTool } from '../tools/rss-reader';

export class ResearcherAgent extends BaseMCPAgent {
  private webScraper: WebScraperTool;
  private rssReader: RSSReaderTool;

  constructor() {
    super({
      name: 'Researcher',
      role: 'Especialista em Pesquisa de Criptomoedas',
      goal: 'Coletar e analisar informações relevantes sobre cripto',
      tasksDir: '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/tasks',
      outputsDir: '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/outputs'
    });

    this.webScraper = new WebScraperTool();
    this.rssReader = new RSSReaderTool();
  }

  async processTask(task: TaskFile): Promise<TaskOutput> {
    const startTime = Date.now();
    
    try {
      // Extrai contexto da tarefa
      const context = this.extractContext(task.content);
      const topic = context.topic || this.extractTopic(task.content);
      
      console.log(`🔍 Pesquisando sobre: ${topic}`);

      // 1. Buscar em feeds RSS
      const rssFeeds = [
        'https://cointelegraph.com/rss',
        'https://coindesk.com/arc/outboundfeeds/rss/',
        'https://decrypt.co/feed',
        'https://blog.ethereum.org/feed.xml'
      ];

      const rssItems = await this.rssReader.readFeeds(rssFeeds, 5);
      const trends = this.rssReader.analyzeTrends(rssItems);

      // 2. Analisar tendências
      const relevantItems = rssItems.filter(item => 
        item.title.toLowerCase().includes(topic.toLowerCase()) ||
        item.contentSnippet.toLowerCase().includes(topic.toLowerCase())
      );

      // 3. Buscar informações adicionais (simulado para MVP)
      const research = await this.performResearch(topic, relevantItems, trends);

      // 4. Formatar resultado
      const result: ResearchResult = {
        topic,
        summary: this.generateSummary(research),
        current_context: {
          market_situation: this.analyzeMarketSituation(trends),
          recent_developments: this.extractDevelopments(relevantItems),
          key_players: this.identifyKeyPlayers(research)
        },
        detailed_analysis: {
          technical_aspects: this.analyzeTechnicalAspects(topic, research),
          market_impact: this.assessMarketImpact(research),
          opportunities: this.identifyOpportunities(research),
          risks: this.identifyRisks(research)
        },
        trends: {
          short_term: this.extractTrends(research, 'short'),
          medium_term: this.extractTrends(research, 'medium'),
          long_term: this.extractTrends(research, 'long')
        },
        sources: this.compileSources(relevantItems),
        unique_insights: this.generateInsights(research, trends)
      };

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

      return {
        agent: this.config.name,
        task_id: task.id,
        timestamp: new Date().toISOString(),
        status: 'success',
        result,
        metadata: {
          processing_time: `${processingTime}s`,
          confidence: this.calculateConfidence(result),
          notes: `Pesquisa completa com ${result.sources.length} fontes`
        }
      };

    } catch (error) {
      return {
        agent: this.config.name,
        task_id: task.id,
        timestamp: new Date().toISOString(),
        status: 'failed',
        result: { error: error.message },
        metadata: {
          processing_time: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
          confidence: 0,
          notes: 'Erro durante pesquisa'
        }
      };
    }
  }

  private extractTopic(content: string): string {
    const topicMatch = content.match(/## Pesquisar sobre: (.+)/);
    return topicMatch ? topicMatch[1] : 'Criptomoedas';
  }

  private async performResearch(topic: string, rssItems: any[], trends: any): Promise<any> {
    // Simulação de pesquisa para MVP
    return {
      topic,
      rssItems,
      trends,
      timestamp: new Date().toISOString()
    };
  }

  private generateSummary(research: any): string[] {
    return [
      `Análise completa sobre ${research.topic}`,
      `${research.rssItems.length} artigos relevantes encontrados`,
      `Sentimento do mercado: ${research.trends.sentiment}`,
      `Principais keywords: ${research.trends.keywords.slice(0, 5).join(', ')}`
    ];
  }

  private analyzeMarketSituation(trends: any): string {
    const sentiment = trends.sentiment;
    if (sentiment === 'positive') {
      return 'Mercado em tendência de alta com sentimento otimista';
    } else if (sentiment === 'negative') {
      return 'Mercado cauteloso com pressão vendedora';
    }
    return 'Mercado lateral aguardando definições';
  }

  private extractDevelopments(items: any[]): string[] {
    return items.slice(0, 5).map(item => 
      `${item.title} (${new Date(item.pubDate).toLocaleDateString('pt-BR')})`
    );
  }

  private identifyKeyPlayers(research: any): string[] {
    // Simulação para MVP
    return ['Bitcoin', 'Ethereum', 'DeFi protocols', 'Layer 2 solutions'];
  }

  private analyzeTechnicalAspects(topic: string, research: any): string[] {
    // Análise técnica baseada no tópico
    const aspects = [];
    
    if (topic.toLowerCase().includes('defi')) {
      aspects.push('Protocolos de liquidez automatizada');
      aspects.push('Yield farming e staking strategies');
      aspects.push('Composabilidade entre protocolos');
    }
    
    if (topic.toLowerCase().includes('nft')) {
      aspects.push('Padrões ERC-721 e ERC-1155');
      aspects.push('Marketplace dynamics');
      aspects.push('Metadata e armazenamento descentralizado');
    }
    
    aspects.push('Smart contracts e segurança');
    aspects.push('Escalabilidade e taxas de transação');
    
    return aspects;
  }

  private assessMarketImpact(research: any): string {
    const sentiment = research.trends?.sentiment || 'neutral';
    
    if (sentiment === 'positive') {
      return 'Impacto positivo esperado com potencial de crescimento significativo';
    } else if (sentiment === 'negative') {
      return 'Impacto limitado no curto prazo, necessita monitoramento';
    }
    
    return 'Impacto moderado com potencial de evolução gradual';
  }

  private identifyOpportunities(research: any): string[] {
    return [
      'Entrada antecipada em novos protocolos',
      'Arbitragem entre diferentes plataformas',
      'Participação em governança de DAOs',
      'Yield optimization strategies'
    ];
  }

  private identifyRisks(research: any): string[] {
    return [
      'Volatilidade de mercado',
      'Riscos de smart contracts',
      'Mudanças regulatórias',
      'Liquidez insuficiente em alguns protocolos'
    ];
  }

  private extractTrends(research: any, timeframe: 'short' | 'medium' | 'long'): string[] {
    const trends = {
      short: [
        'Aumento de volume em DEXs',
        'Novos lançamentos de tokens',
        'Correções de mercado pontuais'
      ],
      medium: [
        'Adoção institucional crescente',
        'Desenvolvimento de Layer 2',
        'Integração DeFi-TradFi'
      ],
      long: [
        'Regulamentação global',
        'Web3 mass adoption',
        'Interoperabilidade blockchain'
      ]
    };
    
    return trends[timeframe];
  }

  private compileSources(items: any[]): Array<any> {
    return items.map(item => ({
      title: item.title,
      url: item.link,
      date: item.pubDate,
      credibility: this.assessCredibility(item.link)
    }));
  }

  private assessCredibility(url: string): number {
    // Avalia credibilidade baseado na fonte
    if (url.includes('coindesk.com') || url.includes('cointelegraph.com')) {
      return 0.9;
    } else if (url.includes('ethereum.org')) {
      return 1.0;
    }
    return 0.7;
  }

  private generateInsights(research: any, trends: any): string[] {
    const insights = [];
    
    // Insights baseados em tendências
    if (trends.sentiment === 'positive' && trends.keywords.includes('defi')) {
      insights.push('Momento favorável para explorar novos protocolos DeFi');
    }
    
    if (trends.keywords.includes('ethereum') && trends.keywords.includes('upgrade')) {
      insights.push('Atualizações do Ethereum podem impactar taxas e velocidade');
    }
    
    // Insights gerais
    insights.push('Diversificação entre diferentes protocolos reduz riscos');
    insights.push('Acompanhar desenvolvimento de Layer 2 para oportunidades');
    
    return insights;
  }

  private calculateConfidence(result: ResearchResult): number {
    // Calcula confiança baseado em quantidade e qualidade das fontes
    let confidence = 0.5;
    
    if (result.sources.length > 5) confidence += 0.2;
    if (result.sources.length > 10) confidence += 0.1;
    
    const avgCredibility = result.sources.reduce((sum, s) => sum + s.credibility, 0) / result.sources.length;
    confidence += avgCredibility * 0.2;
    
    return Math.min(confidence, 1.0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const agent = new ResearcherAgent();
  agent.run().catch(console.error);
}