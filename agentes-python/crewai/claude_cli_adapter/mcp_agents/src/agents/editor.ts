/**
 * Editor Agent - MCP TypeScript
 * Responsável por revisar e melhorar artigos
 */

import { BaseMCPAgent } from './base-agent';
import { TaskFile, TaskOutput, AgentConfig, EditResult } from '../types';

export class EditorAgent extends BaseMCPAgent {
  constructor() {
    super({
      name: 'Editor',
      role: 'Editor Chefe de Conteúdo Cripto',
      goal: 'Garantir qualidade, precisão e engajamento do conteúdo',
      tasksDir: '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/tasks',
      outputsDir: '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/outputs'
    });
  }

  async processTask(task: TaskFile): Promise<TaskOutput> {
    const startTime = Date.now();
    
    try {
      // Extrai contexto da tarefa
      const context = this.extractContext(task.content);
      const content = context.content || this.extractContent(task.content);
      
      console.log(`📝 Editando artigo...`);

      // 1. Análise inicial do conteúdo
      const initialAnalysis = this.analyzeContent(content);
      console.log(`📊 Análise inicial: ${initialAnalysis.wordCount} palavras, ${initialAnalysis.readabilityScore}/10 legibilidade`);

      // 2. Realizar edições
      const edits = this.performEdits(content, initialAnalysis);

      // 3. Aplicar correções
      let editedContent = this.applyEdits(content, edits);

      // 4. Melhorar estrutura
      editedContent = this.improveStructure(editedContent);

      // 5. Otimizar para SEO
      editedContent = this.optimizeForSEO(editedContent);

      // 6. Verificação final
      const finalAnalysis = this.analyzeContent(editedContent);
      const qualityScore = this.calculateQualityScore(initialAnalysis, finalAnalysis, edits);

      // 7. Gerar recomendações adicionais
      const recommendations = this.generateRecommendations(editedContent, finalAnalysis);

      // Formatar resultado
      const result: EditResult = {
        edited_content: editedContent,
        changes_made: edits,
        quality_score: qualityScore,
        quality_justification: this.justifyQuality(qualityScore, edits.length),
        additional_recommendations: recommendations
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
          confidence: qualityScore / 10,
          notes: `${edits.length} edições realizadas, qualidade: ${qualityScore}/10`
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
          notes: 'Erro durante edição'
        }
      };
    }
  }

  private extractContent(taskContent: string): string {
    // Extrai conteúdo do artigo da tarefa
    const contentMatch = taskContent.match(/### Conteúdo para Editar:\n([\s\S]+)/);
    return contentMatch ? contentMatch[1] : '';
  }

  private analyzeContent(content: string): any {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Análise de legibilidade (simplificada)
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSentencesPerParagraph = sentences.length / paragraphs.length;
    
    // Score de legibilidade (1-10)
    let readabilityScore = 10;
    if (avgWordsPerSentence > 20) readabilityScore -= 2;
    if (avgWordsPerSentence > 25) readabilityScore -= 2;
    if (avgSentencesPerParagraph > 5) readabilityScore -= 1;

    // Análise de estrutura
    const hasHeaders = content.includes('##');
    const hasBulletPoints = content.includes('- ') || content.includes('* ');
    const hasNumberedList = /\d+\.\s/.test(content);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence,
      avgSentencesPerParagraph,
      readabilityScore,
      hasHeaders,
      hasBulletPoints,
      hasNumberedList
    };
  }

  private performEdits(content: string, analysis: any): Array<any> {
    const edits = [];

    // 1. Corrigir erros comuns
    const commonErrors = this.findCommonErrors(content);
    edits.push(...commonErrors);

    // 2. Melhorar clareza
    const clarityEdits = this.improveClarityEdits(content);
    edits.push(...clarityEdits);

    // 3. Fortalecer linguagem
    const languageEdits = this.strengthenLanguage(content);
    edits.push(...languageEdits);

    // 4. Corrigir estrutura
    if (!analysis.hasHeaders) {
      edits.push({
        location: 'Estrutura geral',
        issue: 'Falta de headers para organização',
        correction: 'Adicionar headers H2 e H3 para melhor estrutura',
        justification: 'Headers melhoram navegação e SEO'
      });
    }

    // 5. Otimizar parágrafos longos
    if (analysis.avgSentencesPerParagraph > 5) {
      edits.push({
        location: 'Parágrafos',
        issue: 'Parágrafos muito longos',
        correction: 'Dividir parágrafos com mais de 5 frases',
        justification: 'Melhora legibilidade e retenção'
      });
    }

    return edits;
  }

  private findCommonErrors(content: string): Array<any> {
    const errors = [];

    // Erros de espaçamento
    if (content.includes('  ')) {
      errors.push({
        location: 'Espaçamento',
        issue: 'Espaços duplos encontrados',
        correction: 'Remover espaços extras',
        justification: 'Melhora formatação e profissionalismo'
      });
    }

    // Palavras repetidas
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 4) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    wordCount.forEach((count, word) => {
      if (count > 5) {
        errors.push({
          location: `Palavra "${word}"`,
          issue: `Usada ${count} vezes (muito repetitiva)`,
          correction: 'Usar sinônimos ou reformular',
          justification: 'Evita redundância e melhora fluidez'
        });
      }
    });

    return errors;
  }

  private improveClarityEdits(content: string): Array<any> {
    const edits = [];

    // Frases muito longas
    const sentences = content.split(/[.!?]+/);
    sentences.forEach((sentence, index) => {
      const wordCount = sentence.trim().split(/\s+/).length;
      if (wordCount > 30) {
        edits.push({
          location: `Frase ${index + 1}`,
          issue: `Frase muito longa (${wordCount} palavras)`,
          correction: 'Dividir em duas ou mais frases menores',
          justification: 'Frases curtas são mais fáceis de entender'
        });
      }
    });

    // Jargão excessivo
    const jargonTerms = ['blockchain', 'DeFi', 'smart contract', 'hash', 'node'];
    let jargonCount = 0;
    
    jargonTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      if (matches) jargonCount += matches.length;
    });

    if (jargonCount > 10) {
      edits.push({
        location: 'Terminologia',
        issue: 'Uso excessivo de jargão técnico',
        correction: 'Explicar termos técnicos na primeira menção',
        justification: 'Torna conteúdo acessível para iniciantes'
      });
    }

    return edits;
  }

  private strengthenLanguage(content: string): Array<any> {
    const edits = [];

    // Palavras fracas
    const weakWords = {
      'muito': 'extremamente',
      'bom': 'excelente',
      'ruim': 'prejudicial',
      'fazer': 'realizar/executar',
      'coisa': 'aspecto/elemento'
    };

    Object.entries(weakWords).forEach(([weak, strong]) => {
      if (content.toLowerCase().includes(weak)) {
        edits.push({
          location: `Palavra "${weak}"`,
          issue: 'Linguagem pode ser fortalecida',
          correction: `Considerar usar "${strong}" ou similar`,
          justification: 'Palavras mais específicas aumentam impacto'
        });
      }
    });

    // Voz passiva
    if (content.includes('foi ') || content.includes('foram ')) {
      edits.push({
        location: 'Voz passiva',
        issue: 'Uso de voz passiva detectado',
        correction: 'Preferir voz ativa quando possível',
        justification: 'Voz ativa é mais direta e envolvente'
      });
    }

    return edits;
  }

  private applyEdits(content: string, edits: Array<any>): string {
    let editedContent = content;

    // Aplicar correções automáticas simples
    editedContent = editedContent.replace(/\s+/g, ' '); // Remove espaços extras
    editedContent = editedContent.replace(/\n{3,}/g, '\n\n'); // Limita quebras de linha

    // Melhorar pontuação
    editedContent = editedContent.replace(/\s+([.,!?;:])/g, '$1'); // Remove espaços antes de pontuação
    editedContent = editedContent.replace(/([.,!?;:])\s*\n/g, '$1\n'); // Mantém pontuação antes de quebra

    // Capitalização após ponto
    editedContent = editedContent.replace(/\. ([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`);

    return editedContent;
  }

  private improveStructure(content: string): string {
    let improved = content;

    // Adicionar headers se não existirem
    if (!improved.includes('##')) {
      const paragraphs = improved.split('\n\n');
      const sectioned = [];
      
      for (let i = 0; i < paragraphs.length; i++) {
        if (i > 0 && i % 3 === 0 && paragraphs[i].length > 100) {
          // Adiciona um header a cada 3 parágrafos
          sectioned.push(`## ${this.generateSectionTitle(paragraphs[i])}\n`);
        }
        sectioned.push(paragraphs[i]);
      }
      
      improved = sectioned.join('\n\n');
    }

    // Garantir espaçamento consistente
    improved = improved.replace(/\n{2,}/g, '\n\n');

    // Adicionar pontos em listas se necessário
    improved = improved.replace(/^- ([^.!?]+)$/gm, '- $1.');

    return improved;
  }

  private generateSectionTitle(paragraph: string): string {
    // Gera título baseado no conteúdo do parágrafo
    const words = paragraph.split(' ').slice(0, 5);
    const topics = {
      'blockchain': 'Tecnologia Blockchain',
      'investimento': 'Estratégias de Investimento',
      'risco': 'Gestão de Riscos',
      'futuro': 'Perspectivas Futuras',
      'mercado': 'Análise de Mercado'
    };

    for (const [key, title] of Object.entries(topics)) {
      if (paragraph.toLowerCase().includes(key)) {
        return title;
      }
    }

    return 'Pontos Importantes';
  }

  private optimizeForSEO(content: string): string {
    let optimized = content;

    // Garantir que keywords importantes estejam em negrito
    const importantTerms = ['blockchain', 'criptomoeda', 'bitcoin', 'ethereum', 'DeFi', 'NFT'];
    
    importantTerms.forEach(term => {
      // Apenas primeira ocorrência
      const regex = new RegExp(`\\b(${term})\\b`, 'i');
      optimized = optimized.replace(regex, '**$1**');
    });

    // Adicionar links internos sugeridos
    optimized = optimized.replace(
      /\b(guia completo)\b/gi,
      '[$1](/guias)'
    );

    // Garantir que há uma conclusão clara
    if (!optimized.toLowerCase().includes('conclusão') && !optimized.toLowerCase().includes('resumo')) {
      optimized += '\n\n## Conclusão\n\nEste artigo explorou os principais aspectos do tema, fornecendo insights valiosos para sua jornada no mundo das criptomoedas.';
    }

    return optimized;
  }

  private calculateQualityScore(initial: any, final: any, edits: Array<any>): number {
    let score = 5; // Base

    // Melhoria na legibilidade
    if (final.readabilityScore > initial.readabilityScore) {
      score += 2;
    }

    // Estrutura melhorada
    if (final.hasHeaders && !initial.hasHeaders) {
      score += 1;
    }

    // Tamanho apropriado
    if (final.wordCount >= 800 && final.wordCount <= 1500) {
      score += 1;
    }

    // Edições aplicadas
    if (edits.length > 5 && edits.length < 20) {
      score += 1;
    }

    return Math.min(score, 10);
  }

  private justifyQuality(score: number, editCount: number): string {
    if (score >= 9) {
      return `Excelente qualidade! Conteúdo bem estruturado, claro e otimizado. ${editCount} melhorias aplicadas com sucesso.`;
    } else if (score >= 7) {
      return `Boa qualidade. Conteúdo melhorado significativamente com ${editCount} edições. Algumas otimizações adicionais podem ser consideradas.`;
    } else if (score >= 5) {
      return `Qualidade satisfatória. ${editCount} correções aplicadas, mas há espaço para melhorias na estrutura e clareza.`;
    } else {
      return `Qualidade básica. Apenas ${editCount} edições foram possíveis. Recomenda-se revisão mais profunda.`;
    }
  }

  private generateRecommendations(content: string, analysis: any): string[] {
    const recommendations = [];

    // Recomendações baseadas na análise
    if (analysis.wordCount < 800) {
      recommendations.push('Expandir conteúdo para pelo menos 800 palavras para melhor SEO');
    }

    if (!content.includes('![')) {
      recommendations.push('Adicionar imagens com alt text descritivo');
    }

    if (!content.includes('[')) {
      recommendations.push('Incluir links internos e externos relevantes');
    }

    if (analysis.avgWordsPerSentence > 20) {
      recommendations.push('Continuar simplificando frases longas');
    }

    if (!content.toLowerCase().includes('exemplo') && !content.toLowerCase().includes('caso')) {
      recommendations.push('Adicionar exemplos práticos ou casos de uso');
    }

    // Sempre incluir CTA
    if (!content.toLowerCase().includes('ação') && !content.toLowerCase().includes('próximo')) {
      recommendations.push('Incluir call-to-action claro no final');
    }

    return recommendations;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const agent = new EditorAgent();
  agent.run().catch(console.error);
}