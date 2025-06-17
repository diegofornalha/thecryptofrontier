/**
 * Researcher Agent - MCP TypeScript
 * Responsável por pesquisar e coletar informações
 */
import { BaseMCPAgent } from './base-agent';
import { WebScraperTool } from '../tools/web-scraper';
import { RSSReaderTool } from '../tools/rss-reader';
export class ResearcherAgent extends BaseMCPAgent {
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
    async processTask(task) {
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
            const relevantItems = rssItems.filter(item => item.title.toLowerCase().includes(topic.toLowerCase()) ||
                item.contentSnippet.toLowerCase().includes(topic.toLowerCase()));
            // 3. Buscar informações adicionais (simulado para MVP)
            const research = await this.performResearch(topic, relevantItems, trends);
            // 4. Formatar resultado
            const result = {
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
        }
        catch (error) {
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
    extractTopic(content) {
        const topicMatch = content.match(/## Pesquisar sobre: (.+)/);
        return topicMatch ? topicMatch[1] : 'Criptomoedas';
    }
    async performResearch(topic, rssItems, trends) {
        // Simulação de pesquisa para MVP
        return {
            topic,
            rssItems,
            trends,
            timestamp: new Date().toISOString()
        };
    }
    generateSummary(research) {
        return [
            `Análise completa sobre ${research.topic}`,
            `${research.rssItems.length} artigos relevantes encontrados`,
            `Sentimento do mercado: ${research.trends.sentiment}`,
            `Principais keywords: ${research.trends.keywords.slice(0, 5).join(', ')}`
        ];
    }
    analyzeMarketSituation(trends) {
        const sentiment = trends.sentiment;
        if (sentiment === 'positive') {
            return 'Mercado em tendência de alta com sentimento otimista';
        }
        else if (sentiment === 'negative') {
            return 'Mercado cauteloso com pressão vendedora';
        }
        return 'Mercado lateral aguardando definições';
    }
    extractDevelopments(items) {
        return items.slice(0, 5).map(item => `${item.title} (${new Date(item.pubDate).toLocaleDateString('pt-BR')})`);
    }
    identifyKeyPlayers(research) {
        // Simulação para MVP
        return ['Bitcoin', 'Ethereum', 'DeFi protocols', 'Layer 2 solutions'];
    }
    analyzeTechnicalAspects(topic, research) {
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
    assessMarketImpact(research) {
        var _a;
        const sentiment = ((_a = research.trends) === null || _a === void 0 ? void 0 : _a.sentiment) || 'neutral';
        if (sentiment === 'positive') {
            return 'Impacto positivo esperado com potencial de crescimento significativo';
        }
        else if (sentiment === 'negative') {
            return 'Impacto limitado no curto prazo, necessita monitoramento';
        }
        return 'Impacto moderado com potencial de evolução gradual';
    }
    identifyOpportunities(research) {
        return [
            'Entrada antecipada em novos protocolos',
            'Arbitragem entre diferentes plataformas',
            'Participação em governança de DAOs',
            'Yield optimization strategies'
        ];
    }
    identifyRisks(research) {
        return [
            'Volatilidade de mercado',
            'Riscos de smart contracts',
            'Mudanças regulatórias',
            'Liquidez insuficiente em alguns protocolos'
        ];
    }
    extractTrends(research, timeframe) {
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
    compileSources(items) {
        return items.map(item => ({
            title: item.title,
            url: item.link,
            date: item.pubDate,
            credibility: this.assessCredibility(item.link)
        }));
    }
    assessCredibility(url) {
        // Avalia credibilidade baseado na fonte
        if (url.includes('coindesk.com') || url.includes('cointelegraph.com')) {
            return 0.9;
        }
        else if (url.includes('ethereum.org')) {
            return 1.0;
        }
        return 0.7;
    }
    generateInsights(research, trends) {
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
    calculateConfidence(result) {
        // Calcula confiança baseado em quantidade e qualidade das fontes
        let confidence = 0.5;
        if (result.sources.length > 5)
            confidence += 0.2;
        if (result.sources.length > 10)
            confidence += 0.1;
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
