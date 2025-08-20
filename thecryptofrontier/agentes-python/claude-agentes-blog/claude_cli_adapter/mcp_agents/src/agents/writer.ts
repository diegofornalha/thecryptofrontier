/**
 * Writer Agent - MCP TypeScript
 * Responsável por escrever artigos baseados em pesquisas
 */

import { BaseMCPAgent } from './base-agent';
import { TaskFile, TaskOutput, AgentConfig, ArticleContent } from '../types';

export class WriterAgent extends BaseMCPAgent {
  constructor() {
    super({
      name: 'Writer',
      role: 'Redator Especializado em Criptomoedas',
      goal: 'Criar conteúdo envolvente e informativo sobre cripto',
      tasksDir: '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/tasks',
      outputsDir: '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/outputs'
    });
  }

  async processTask(task: TaskFile): Promise<TaskOutput> {
    const startTime = Date.now();
    
    try {
      // Extrai contexto da tarefa
      const context = this.extractContext(task.content);
      const topic = context.topic || 'Criptomoedas';
      const research = context.research_data || {};
      const keywords = context.keywords || [];
      
      console.log(`✍️  Escrevendo sobre: ${topic}`);

      // 1. Gerar estrutura do artigo
      const structure = this.generateArticleStructure(topic, research);

      // 2. Criar título e slug
      const title = this.generateTitle(topic, research);
      const slug = this.generateSlug(title);

      // 3. Escrever conteúdo
      const content = await this.writeContent(structure, research);

      // 4. Criar excerpt
      const excerpt = this.generateExcerpt(content);

      // 5. Otimizar SEO
      const seo = this.optimizeSEO(title, content, keywords);

      // 6. Gerar tags e categorias
      const tags = this.generateTags(topic, research, keywords);
      const categories = this.selectCategories(topic);

      // 7. Sugerir imagens
      const suggestedImages = this.suggestImages(structure);

      // Formatar resultado
      const result: ArticleContent = {
        title,
        slug,
        meta_description: seo.metaDescription,
        content,
        excerpt,
        seo,
        tags,
        categories,
        suggested_images: suggestedImages
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
          notes: `Artigo criado com ${content.split(' ').length} palavras`
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
          notes: 'Erro durante escrita'
        }
      };
    }
  }

  private generateArticleStructure(topic: string, research: any): any {
    return {
      introduction: {
        hook: this.createHook(topic),
        context: research.current_context || {},
        thesis: this.createThesis(topic)
      },
      sections: [
        {
          title: 'O Que Você Precisa Saber',
          content: this.createOverviewSection(topic, research)
        },
        {
          title: 'Análise Detalhada',
          content: this.createAnalysisSection(research)
        },
        {
          title: 'Oportunidades e Estratégias',
          content: this.createOpportunitiesSection(research)
        },
        {
          title: 'Riscos e Considerações',
          content: this.createRisksSection(research)
        }
      ],
      conclusion: {
        summary: this.createSummary(research),
        call_to_action: this.createCTA(topic)
      }
    };
  }

  private generateTitle(topic: string, research: any): string {
    // Gera títulos otimizados para SEO e engajamento
    const templates = [
      `${topic}: O Guia Completo para ${new Date().getFullYear()}`,
      `Como ${topic} Está Revolucionando as Finanças Digitais`,
      `${topic}: Tudo que Você Precisa Saber Agora`,
      `Descubra as Oportunidades em ${topic}`,
      `${topic}: Análise Completa e Perspectivas`
    ];
    
    // Escolhe template baseado no contexto
    if (research.trends?.sentiment === 'positive') {
      return templates[3]; // Foco em oportunidades
    } else if (topic.toLowerCase().includes('guia') || topic.toLowerCase().includes('tutorial')) {
      return templates[0]; // Formato guia
    }
    
    return templates[2]; // Padrão informativo
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início/fim
  }

  private async writeContent(structure: any, research: any): Promise<string> {
    const sections = [];

    // Introdução
    sections.push(`# ${structure.introduction.hook}\n`);
    sections.push(`${structure.introduction.thesis}\n`);

    // Seções principais
    for (const section of structure.sections) {
      sections.push(`## ${section.title}\n`);
      sections.push(`${section.content}\n`);
    }

    // Conclusão
    sections.push(`## Conclusão\n`);
    sections.push(`${structure.conclusion.summary}\n`);
    sections.push(`${structure.conclusion.call_to_action}\n`);

    return sections.join('\n');
  }

  private createHook(topic: string): string {
    return `Você sabia que ${topic} está transformando a maneira como pensamos sobre finanças digitais? Neste artigo, vamos explorar tudo que você precisa saber sobre esse fascinante mundo.`;
  }

  private createThesis(topic: string): string {
    return `Este guia completo sobre ${topic} oferece uma análise detalhada das tendências atuais, oportunidades de investimento e estratégias práticas para aproveitar ao máximo este mercado em evolução.`;
  }

  private createOverviewSection(topic: string, research: any): string {
    const points = research.summary || [
      `${topic} representa uma nova fronteira nas finanças digitais`,
      'A tecnologia blockchain permite transações seguras e descentralizadas',
      'O mercado está em constante evolução com novas oportunidades'
    ];

    return points.map(point => `- ${point}`).join('\n');
  }

  private createAnalysisSection(research: any): string {
    const analysis = research.detailed_analysis || {
      technical_aspects: ['Blockchain', 'Smart Contracts', 'Descentralização'],
      market_impact: 'Impacto significativo no mercado financeiro global'
    };

    let content = `### Aspectos Técnicos\n\n`;
    content += analysis.technical_aspects.map(aspect => `- ${aspect}`).join('\n');
    content += `\n\n### Impacto no Mercado\n\n${analysis.market_impact}`;

    return content;
  }

  private createOpportunitiesSection(research: any): string {
    const opportunities = research.detailed_analysis?.opportunities || [
      'Investimento em projetos inovadores',
      'Participação em governança descentralizada',
      'Yield farming e staking'
    ];

    return opportunities.map((opp, index) => 
      `${index + 1}. **${opp}**: Explore as possibilidades desta estratégia.`
    ).join('\n\n');
  }

  private createRisksSection(research: any): string {
    const risks = research.detailed_analysis?.risks || [
      'Volatilidade do mercado',
      'Riscos regulatórios',
      'Segurança de smart contracts'
    ];

    let content = `É importante estar ciente dos riscos:\n\n`;
    content += risks.map(risk => `- **${risk}**`).join('\n');
    content += `\n\nSempre faça sua própria pesquisa (DYOR) antes de investir.`;

    return content;
  }

  private createSummary(research: any): string {
    return `Exploramos os principais aspectos deste mercado dinâmico, desde os fundamentos técnicos até as estratégias práticas. O futuro das finanças digitais está sendo construído agora, e você pode fazer parte dessa revolução.`;
  }

  private createCTA(topic: string): string {
    return `**Pronto para começar sua jornada?** Mantenha-se atualizado com as últimas novidades sobre ${topic} seguindo nosso blog e participando da nossa comunidade!`;
  }

  private generateExcerpt(content: string): string {
    // Pega os primeiros 150-200 caracteres do conteúdo
    const cleanContent = content
      .replace(/#/g, '')
      .replace(/\*/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    const excerpt = cleanContent.substring(0, 200);
    const lastSpace = excerpt.lastIndexOf(' ');
    
    return excerpt.substring(0, lastSpace) + '...';
  }

  private optimizeSEO(title: string, content: string, keywords: string[]): any {
    // Meta title (50-60 caracteres)
    let metaTitle = title;
    if (metaTitle.length > 60) {
      metaTitle = metaTitle.substring(0, 57) + '...';
    }

    // Meta description (150-160 caracteres)
    const metaDescription = this.generateMetaDescription(title, content);

    // Keywords
    const seoKeywords = this.extractKeywords(content, keywords);

    return {
      metaTitle,
      metaDescription,
      keywords: seoKeywords
    };
  }

  private generateMetaDescription(title: string, content: string): string {
    const base = `Descubra tudo sobre ${title.toLowerCase()}. `;
    const addon = 'Guia completo com análises, estratégias e oportunidades no mercado cripto.';
    
    const description = base + addon;
    
    if (description.length > 160) {
      return description.substring(0, 157) + '...';
    }
    
    return description;
  }

  private extractKeywords(content: string, providedKeywords: string[]): string[] {
    const keywords = new Set(providedKeywords);
    
    // Adiciona keywords comuns de cripto
    const cryptoKeywords = [
      'blockchain', 'criptomoedas', 'bitcoin', 'ethereum',
      'defi', 'nft', 'web3', 'descentralização'
    ];
    
    cryptoKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        keywords.add(keyword);
      }
    });
    
    return Array.from(keywords).slice(0, 10); // Máximo 10 keywords
  }

  private generateTags(topic: string, research: any, keywords: string[]): string[] {
    const tags = new Set<string>();
    
    // Tags do tópico
    topic.split(' ').forEach(word => {
      if (word.length > 3) {
        tags.add(word.toLowerCase());
      }
    });
    
    // Tags das keywords
    keywords.forEach(keyword => tags.add(keyword));
    
    // Tags das tendências
    if (research.trends?.keywords) {
      research.trends.keywords.slice(0, 5).forEach(keyword => tags.add(keyword));
    }
    
    return Array.from(tags).slice(0, 7); // 5-7 tags
  }

  private selectCategories(topic: string): string[] {
    const categories = [];
    
    // Categorias baseadas no tópico
    if (topic.toLowerCase().includes('defi')) {
      categories.push('DeFi');
    }
    if (topic.toLowerCase().includes('nft')) {
      categories.push('NFTs');
    }
    if (topic.toLowerCase().includes('bitcoin') || topic.toLowerCase().includes('btc')) {
      categories.push('Bitcoin');
    }
    if (topic.toLowerCase().includes('ethereum') || topic.toLowerCase().includes('eth')) {
      categories.push('Ethereum');
    }
    
    // Categoria padrão
    if (categories.length === 0) {
      categories.push('Criptomoedas');
    }
    
    return categories;
  }

  private suggestImages(structure: any): Array<any> {
    return [
      {
        position: 'header',
        description: 'Imagem de capa relacionada ao tema principal',
        alt_text: 'Ilustração conceitual sobre criptomoedas e blockchain'
      },
      {
        position: 'section-2',
        description: 'Gráfico ou infográfico explicativo',
        alt_text: 'Infográfico mostrando conceitos-chave'
      },
      {
        position: 'conclusion',
        description: 'Imagem inspiracional ou call-to-action',
        alt_text: 'Visualização do futuro das finanças digitais'
      }
    ];
  }

  private calculateConfidence(result: ArticleContent): number {
    let confidence = 0.7; // Base
    
    // Avalia qualidade do conteúdo
    const wordCount = result.content.split(' ').length;
    if (wordCount > 800) confidence += 0.1;
    if (wordCount > 1200) confidence += 0.1;
    
    // Avalia SEO
    if (result.seo.keywords.length >= 5) confidence += 0.05;
    if (result.tags.length >= 5) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const agent = new WriterAgent();
  agent.run().catch(console.error);
}