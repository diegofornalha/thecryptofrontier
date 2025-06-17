/**
 * RSS Reader Tool para MCP Agents
 */

import Parser from 'rss-parser';

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  categories?: string[];
}

export class RSSReaderTool {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Lê múltiplos feeds RSS
   */
  async readFeeds(feedUrls: string[], limit: number = 10): Promise<RSSItem[]> {
    const allItems: RSSItem[] = [];

    for (const url of feedUrls) {
      try {
        const feed = await this.parser.parseURL(url);
        const items = feed.items.slice(0, limit).map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || '',
          content: item.content || '',
          contentSnippet: item.contentSnippet || '',
          guid: item.guid || '',
          categories: item.categories || []
        }));

        allItems.push(...items);
      } catch (error) {
        console.error(`Erro ao ler feed ${url}:`, error);
      }
    }

    // Ordena por data mais recente
    return allItems.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  /**
   * Analisa tendências nos feeds
   */
  analyzeTrends(items: RSSItem[]): {
    topics: Map<string, number>;
    sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
  } {
    const topics = new Map<string, number>();
    const allText = items.map(item => 
      `${item.title} ${item.contentSnippet}`
    ).join(' ').toLowerCase();

    // Palavras-chave comuns em cripto
    const cryptoKeywords = [
      'bitcoin', 'ethereum', 'btc', 'eth', 'blockchain',
      'defi', 'nft', 'altcoin', 'crypto', 'trading',
      'bullish', 'bearish', 'pump', 'dump', 'hodl',
      'market', 'price', 'analysis', 'prediction'
    ];

    // Conta ocorrências
    cryptoKeywords.forEach(keyword => {
      const count = (allText.match(new RegExp(keyword, 'g')) || []).length;
      if (count > 0) {
        topics.set(keyword, count);
      }
    });

    // Análise de sentimento simples
    const positiveWords = ['bullish', 'growth', 'up', 'high', 'positive', 'gain'];
    const negativeWords = ['bearish', 'crash', 'down', 'low', 'negative', 'loss'];

    const positiveCount = positiveWords.reduce((sum, word) => 
      sum + (allText.match(new RegExp(word, 'g')) || []).length, 0
    );
    const negativeCount = negativeWords.reduce((sum, word) => 
      sum + (allText.match(new RegExp(word, 'g')) || []).length, 0
    );

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount * 1.5) sentiment = 'positive';
    else if (negativeCount > positiveCount * 1.5) sentiment = 'negative';

    // Top keywords
    const keywords = Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);

    return { topics, sentiment, keywords };
  }
}