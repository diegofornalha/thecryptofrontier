/**
 * Cliente Mem0 Real para Auto Commit Agent
 * Substitui o mock pela implementação real
 */

import { MemoryClient } from 'mem0';
import * as dotenv from 'dotenv';
import { quote } from 'shell-quote';

dotenv.config();

export class Mem0RealClient {
  private client: MemoryClient;
  private readonly agentUserId = 'auto-commit-agent-diego';
  private readonly namespace = 'diego_instructions';
  
  constructor() {
    // Configurar cliente Mem0 real
    this.client = new MemoryClient({
      api_key: process.env.MEM0_API_KEY || 'mem0-auto-commit-key',
      // Se usar instalação local, configurar base_url
      // base_url: 'http://localhost:8000'
    });
    
    this.initializeProject();
  }

  /**
   * Inicializa projeto com instruções customizadas
   */
  private async initializeProject() {
    try {
      const customInstructions = `
      Auto Commit Agent - Instruções Personalizadas do Diego:
      
      SEGURANÇA:
      1. SEMPRE sanitizar mensagens de commit para evitar injeção
      2. NUNCA fazer commit em branches protegidas (main, master, production)
      3. SEMPRE verificar por secrets antes de commitar
      4. Validar chaves SSH antes de usar
      
      PREFERÊNCIAS DO DIEGO:
      1. Usar mensagens em português brasileiro
      2. Incluir emojis relevantes (gitmoji)
      3. Mencionar número da issue quando disponível
      4. Ser específico sobre mudanças realizadas
      5. Respeitar .gitignore com timestamp dinâmico
      
      COMPORTAMENTO:
      1. Agrupar mudanças relacionadas
      2. Commits mais frequentes em horário comercial
      3. Avisar sobre mudanças críticas
      4. Manter histórico de todas as operações
      `;
      
      await this.client.update_project({
        custom_instructions: customInstructions
      });
      
      console.log('✅ Mem0 Real inicializado com instruções do Diego');
    } catch (error) {
      console.error('❌ Erro ao inicializar Mem0:', error);
    }
  }

  /**
   * Adiciona instrução com sanitização
   */
  async addInstruction(instruction: string): Promise<void> {
    // Sanitizar entrada
    const safeInstruction = this.sanitizeInput(instruction);
    
    const message = {
      role: 'user',
      content: `Diego adiciona instrução: ${safeInstruction}`
    };

    await this.client.add(
      [message],
      user_id: this.agentUserId,
      metadata: {
        type: 'instruction',
        from: 'diego',
        timestamp: new Date().toISOString(),
        namespace: this.namespace,
        sanitized: true
      }
    );
  }

  /**
   * Busca instruções relevantes com cache
   */
  private instructionCache = new Map<string, { data: string[], timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async getRelevantInstructions(context: string): Promise<string[]> {
    // Verificar cache
    const cached = this.instructionCache.get(context);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Buscar no Mem0
    const results = await this.client.search(
      query: context,
      user_id: this.agentUserId,
      limit: 10,
      filter: { namespace: this.namespace }
    );

    const instructions = results.results.map(r => r.memory);
    
    // Atualizar cache
    this.instructionCache.set(context, {
      data: instructions,
      timestamp: Date.now()
    });

    return instructions;
  }

  /**
   * Adiciona preferência de commit com validação
   */
  async addCommitPreference(preference: {
    pattern: string;
    message_template: string;
    priority?: number;
  }): Promise<void> {
    // Validar template
    if (!this.isValidTemplate(preference.message_template)) {
      throw new Error('Template inválido. Use placeholders como {action}, {files}, {timestamp}');
    }

    const message = {
      role: 'user',
      content: `Diego define: Para "${preference.pattern}", usar "${preference.message_template}"`
    };

    await this.client.add(
      [message],
      user_id: this.agentUserId,
      metadata: {
        type: 'commit_preference',
        pattern: preference.pattern,
        template: preference.message_template,
        priority: preference.priority || 0,
        namespace: this.namespace
      }
    );
  }

  /**
   * Verifica branches protegidas
   */
  async isProtectedBranch(branch: string): Promise<boolean> {
    const protectedBranches = ['main', 'master', 'production', 'develop'];
    
    // Buscar branches protegidas customizadas
    const customProtected = await this.client.search(
      query: 'branches protegidas',
      user_id: this.agentUserId,
      filter: { type: 'protected_branch' }
    );

    const allProtected = [
      ...protectedBranches,
      ...customProtected.results.map(r => r.metadata?.branch).filter(Boolean)
    ];

    return allProtected.includes(branch);
  }

  /**
   * Gera mensagem de commit segura
   */
  async generateSecureCommitMessage(changes: {
    files: string[];
    actions: string[];
  }): Promise<string> {
    // Buscar instruções relevantes
    const context = `Arquivos: ${changes.files.join(', ')}`;
    const instructions = await this.getRelevantInstructions(context);

    // Buscar preferências
    const preferences = await this.client.search(
      query: context,
      user_id: this.agentUserId,
      filter: { type: 'commit_preference' }
    );

    // Gerar mensagem
    let message = await this.buildMessage(changes, instructions, preferences.results);

    // Sanitizar mensagem final
    message = this.sanitizeCommitMessage(message);

    // Registrar no histórico
    await this.logCommit(message, changes);

    return message;
  }

  /**
   * Sanitização de entrada
   */
  private sanitizeInput(input: string): string {
    // Remover caracteres perigosos
    return input
      .replace(/[`$()]/g, '')
      .replace(/\n/g, ' ')
      .trim();
  }

  /**
   * Sanitização de mensagem de commit
   */
  private sanitizeCommitMessage(message: string): string {
    // Usar shell-quote para escapar corretamente
    const parts = quote([message]);
    return parts;
  }

  /**
   * Validação de template
   */
  private isValidTemplate(template: string): boolean {
    const validPlaceholders = ['{action}', '{files}', '{timestamp}', '{branch}'];
    const hasPlaceholder = validPlaceholders.some(p => template.includes(p));
    const hasInjection = /[`$\\]/.test(template);
    
    return hasPlaceholder && !hasInjection;
  }

  /**
   * Constrói mensagem baseada em instruções
   */
  private async buildMessage(
    changes: any,
    instructions: string[],
    preferences: any[]
  ): Promise<string> {
    // Verificar preferências específicas
    for (const pref of preferences) {
      const pattern = pref.metadata?.pattern;
      if (pattern && changes.files.some(f => f.includes(pattern))) {
        return this.applyTemplate(pref.metadata.template, changes);
      }
    }

    // Aplicar instruções gerais
    const useEmoji = instructions.some(i => i.toLowerCase().includes('emoji'));
    const inPortuguese = instructions.some(i => i.toLowerCase().includes('português'));

    let message = '';
    
    if (useEmoji) {
      const emoji = this.getEmoji(changes.actions[0]);
      message += `${emoji} `;
    }

    const action = this.translateAction(changes.actions[0], inPortuguese);
    message += `${action}: ${changes.files.length} arquivo(s)`;

    return message;
  }

  /**
   * Aplica template com placeholders
   */
  private applyTemplate(template: string, changes: any): string {
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return template
      .replace('{files}', changes.files.length)
      .replace('{action}', changes.actions[0] || 'update')
      .replace('{timestamp}', timestamp);
  }

  /**
   * Obtém emoji apropriado
   */
  private getEmoji(action: string): string {
    const emojiMap: Record<string, string> = {
      'added': '✨',
      'modified': '🔧',
      'deleted': '🗑️',
      'renamed': '🔄',
      'fixed': '🐛',
      'docs': '📝',
      'style': '💄',
      'refactor': '♻️',
      'test': '✅',
      'chore': '🔨'
    };

    return emojiMap[action] || '📦';
  }

  /**
   * Traduz ação para português
   */
  private translateAction(action: string, inPortuguese: boolean): string {
    if (!inPortuguese) return action;

    const translations: Record<string, string> = {
      'added': 'adiciona',
      'modified': 'modifica',
      'deleted': 'remove',
      'renamed': 'renomeia',
      'update': 'atualiza'
    };

    return translations[action] || action;
  }

  /**
   * Registra commit no histórico
   */
  private async logCommit(message: string, changes: any): Promise<void> {
    await this.client.add(
      [{
        role: 'system',
        content: `Commit realizado: "${message}" com ${changes.files.length} arquivo(s)`
      }],
      user_id: this.agentUserId,
      metadata: {
        type: 'commit_log',
        message,
        files: changes.files,
        timestamp: new Date().toISOString(),
        namespace: this.namespace
      }
    );
  }

  /**
   * Limpa cache periodicamente
   */
  startCacheCleaner(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.instructionCache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.instructionCache.delete(key);
        }
      }
    }, 60000); // A cada minuto
  }
}

// Singleton
export const mem0RealClient = new Mem0RealClient();