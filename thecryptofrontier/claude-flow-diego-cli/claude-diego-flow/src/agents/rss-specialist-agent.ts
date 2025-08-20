import { Agent } from '../interfaces/agent.interface';
import { Memory } from '../interfaces/memory.interface';
import { Logger } from '../utils/logger';
import { Parser } from 'rss-parser';
import { parseISO, isAfter, subHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { translate } from '../services/translation-service';
import axios from 'axios';

/**
 * RSS Specialist Agent
 * Responsável por monitorar feeds RSS e importar conteúdo automaticamente
 */
export class RSSSpecialistAgent implements Agent {
  id = 'rss-specialist';
  name = 'RSS Specialist';
  private logger: Logger;
  private parser: Parser;
  private processedGuids: Set<string> = new Set();
  private lastCheck: Date | null = null;
  
  // Configurações
  private readonly RSS_FEEDS = [
    {
      name: 'The Crypto Basic',
      url: 'https://thecryptobasic.com/feed/',
      language: 'en',
      category: 'crypto-news'
    }
  ];
  
  private readonly STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
  private readonly STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb';

  constructor() {
    this.logger = new Logger('RSSSpecialistAgent');
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail', 'content:encoded']
      }
    });
    this.loadProcessedGuids();
  }

  /**
   * Carrega GUIDs já processados da memória
   */
  private async loadProcessedGuids(): Promise<void> {
    try {
      const memory = await this.getMemory('processed_rss_guids');
      if (memory && memory.content) {
        const guids = JSON.parse(memory.content);
        this.processedGuids = new Set(guids);
        this.logger.info(`Carregados ${this.processedGuids.size} artigos já processados`);
      }
    } catch (error) {
      this.logger.error('Erro ao carregar GUIDs processados:', error);
    }
  }

  /**
   * Salva GUIDs processados na memória
   */
  private async saveProcessedGuids(): Promise<void> {
    try {
      await this.saveMemory({
        id: 'processed_rss_guids',
        user_id: this.id,
        content: JSON.stringify(Array.from(this.processedGuids)),
        category: 'rss-tracking',
        tags: ['rss', 'processed'],
        metadata: JSON.stringify({
          count: this.processedGuids.size,
          lastUpdate: new Date().toISOString()
        })
      });
    } catch (error) {
      this.logger.error('Erro ao salvar GUIDs processados:', error);
    }
  }

  /**
   * Processa um comando
   */
  async processCommand(command: string, context?: any): Promise<string> {
    this.logger.info(`Processando comando: ${command}`);

    if (command.includes('verificar') || command.includes('check')) {
      return await this.checkFeeds();
    }

    if (command.includes('importar') || command.includes('import')) {
      const match = command.match(/(\d+)/);
      const limit = match ? parseInt(match[1]) : 5;
      return await this.importArticles(limit);
    }

    if (command.includes('status')) {
      return await this.getStatus();
    }

    if (command.includes('limpar') || command.includes('clear')) {
      return await this.clearProcessedGuids();
    }

    return this.getHelp();
  }

  /**
   * Verifica feeds RSS por novos artigos
   */
  private async checkFeeds(): Promise<string> {
    const results: string[] = [];
    let totalNew = 0;

    for (const feedConfig of this.RSS_FEEDS) {
      try {
        this.logger.info(`Verificando feed: ${feedConfig.name}`);
        const feed = await this.parser.parseURL(feedConfig.url);
        
        const newArticles = feed.items.filter(item => {
          const guid = item.guid || item.link || '';
          return guid && !this.processedGuids.has(guid);
        });

        totalNew += newArticles.length;
        results.push(`${feedConfig.name}: ${newArticles.length} novos artigos`);

        // Mostrar títulos dos primeiros 5 artigos novos
        if (newArticles.length > 0) {
          const preview = newArticles.slice(0, 5).map(item => 
            `  - ${item.title}`
          ).join('\n');
          results.push(preview);
        }
      } catch (error) {
        this.logger.error(`Erro ao verificar ${feedConfig.name}:`, error);
        results.push(`${feedConfig.name}: Erro ao verificar`);
      }
    }

    this.lastCheck = new Date();
    
    return `🔍 Verificação de Feeds RSS\n\n${results.join('\n')}\n\nTotal: ${totalNew} novos artigos encontrados`;
  }

  /**
   * Importa artigos dos feeds RSS
   */
  private async importArticles(limit: number = 5): Promise<string> {
    const results: string[] = [];
    let totalImported = 0;

    for (const feedConfig of this.RSS_FEEDS) {
      try {
        this.logger.info(`Importando de ${feedConfig.name} (máximo: ${limit})`);
        const feed = await this.parser.parseURL(feedConfig.url);
        
        const newArticles = feed.items
          .filter(item => {
            const guid = item.guid || item.link || '';
            return guid && !this.processedGuids.has(guid);
          })
          .slice(0, limit);

        for (const article of newArticles) {
          try {
            const imported = await this.importArticle(article, feedConfig);
            if (imported) {
              totalImported++;
              results.push(`✅ ${article.title}`);
              
              // Marcar como processado
              const guid = article.guid || article.link || '';
              this.processedGuids.add(guid);
            }
          } catch (error) {
            this.logger.error(`Erro ao importar artigo:`, error);
            results.push(`❌ ${article.title}: ${error.message}`);
          }
        }
      } catch (error) {
        this.logger.error(`Erro ao importar de ${feedConfig.name}:`, error);
        results.push(`❌ ${feedConfig.name}: Erro ao importar`);
      }
    }

    // Salvar GUIDs processados
    await this.saveProcessedGuids();

    return `📥 Importação de Artigos RSS\n\n${results.join('\n')}\n\nTotal importado: ${totalImported} artigos`;
  }

  /**
   * Importa um artigo individual
   */
  private async importArticle(article: any, feedConfig: any): Promise<boolean> {
    try {
      // Preparar dados do artigo
      const publishedAt = article.pubDate ? new Date(article.pubDate) : new Date();
      const brazilTime = formatInTimeZone(publishedAt, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');

      // Extrair conteúdo
      let content = article['content:encoded'] || article.content || article.summary || '';
      
      // Limpar HTML básico
      content = content
        .replace(/<[^>]*>/g, '') // Remove tags HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();

      // Traduzir se necessário
      let translatedContent = content;
      let translatedTitle = article.title;
      
      if (feedConfig.language !== 'pt-BR') {
        this.logger.info('Traduzindo conteúdo...');
        translatedTitle = await this.translateText(article.title, feedConfig.language, 'pt-BR');
        translatedContent = await this.translateText(content, feedConfig.language, 'pt-BR');
      }

      // Gerar slug
      const slug = this.generateSlug(translatedTitle);

      // Criar excerpt
      const excerpt = translatedContent.substring(0, 160) + '...';

      // Preparar dados para o Strapi
      const postData = {
        data: {
          title: translatedTitle,
          slug: slug,
          content: translatedContent,
          excerpt: excerpt,
          publishedAt: publishedAt.toISOString(),
          author: 'RSS Import',
          category: feedConfig.category,
          tags: ['crypto', 'news', 'imported'],
          source: feedConfig.name,
          sourceUrl: article.link,
          metadata: {
            originalTitle: article.title,
            importedAt: new Date().toISOString(),
            brazilTime: brazilTime
          }
        }
      };

      // Enviar para o Strapi
      const response = await axios.post(
        `${this.STRAPI_URL}/api/posts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.STRAPI_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        this.logger.info(`Artigo importado com sucesso: ${translatedTitle}`);
        
        // Registrar na memória
        await this.saveMemory({
          id: `rss-import-${Date.now()}`,
          user_id: this.id,
          content: `Artigo importado: ${translatedTitle}`,
          category: 'rss-import',
          tags: ['rss', 'import', 'success'],
          metadata: JSON.stringify({
            strapiId: response.data.data.id,
            originalTitle: article.title,
            source: feedConfig.name,
            publishedAt: publishedAt.toISOString()
          })
        });

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Erro ao importar artigo:', error);
      throw error;
    }
  }

  /**
   * Traduz texto usando um serviço simples
   */
  private async translateText(text: string, from: string, to: string): Promise<string> {
    // Por enquanto, retorna o texto original
    // Aqui você pode integrar com um serviço de tradução local
    // ou usar uma API gratuita como LibreTranslate
    return text;
  }

  /**
   * Gera slug a partir do título
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')     // Substitui não-alfanuméricos por hífen
      .replace(/^-+|-+$/g, '')          // Remove hífens do início e fim
      .substring(0, 100);               // Limita tamanho
  }

  /**
   * Retorna status do agente
   */
  private async getStatus(): Promise<string> {
    const stats = {
      processedArticles: this.processedGuids.size,
      lastCheck: this.lastCheck ? formatInTimeZone(this.lastCheck, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss') : 'Nunca',
      feeds: this.RSS_FEEDS.length,
      strapiUrl: this.STRAPI_URL
    };

    return `📊 Status do RSS Specialist

✅ Artigos processados: ${stats.processedArticles}
🕐 Última verificação: ${stats.lastCheck}
📡 Feeds configurados: ${stats.feeds}
🌐 Strapi URL: ${stats.strapiUrl}

Use 'verificar' para checar novos artigos
Use 'importar [quantidade]' para importar artigos`;
  }

  /**
   * Limpa GUIDs processados
   */
  private async clearProcessedGuids(): Promise<string> {
    const count = this.processedGuids.size;
    this.processedGuids.clear();
    await this.saveProcessedGuids();
    
    return `🧹 Cache limpo! ${count} GUIDs removidos.`;
  }

  /**
   * Retorna ajuda do agente
   */
  private getHelp(): Promise<string> {
    return Promise.resolve(`🤖 RSS Specialist - Comandos disponíveis:

📍 verificar - Verifica feeds por novos artigos
📥 importar [quantidade] - Importa artigos (padrão: 5)
📊 status - Mostra status do agente
🧹 limpar - Limpa cache de artigos processados

Exemplo: "importar 10" - importa até 10 novos artigos`);
  }

  /**
   * Métodos de memória
   */
  async saveMemory(memory: Partial<Memory>): Promise<void> {
    // Implementação será conectada ao sistema de memória
    this.logger.info('Salvando memória:', memory);
  }

  async getMemory(id: string): Promise<Memory | null> {
    // Implementação será conectada ao sistema de memória
    return null;
  }

  async searchMemories(query: string, limit?: number): Promise<Memory[]> {
    // Implementação será conectada ao sistema de memória
    return [];
  }
}

// Exportar instância singleton
export const rssSpecialist = new RSSSpecialistAgent();