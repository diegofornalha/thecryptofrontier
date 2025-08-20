/**
 * Memória Mem0 para Auto Commit Agent
 * Armazena instruções personalizadas do Diego
 */

import { MemoryClient } from './mock-mem0';

export class AutoCommitMemory {
  private mem0: MemoryClient;
  private readonly agentUserId = 'auto-commit-agent-diego';
  private readonly instructionsNamespace = 'diego_instructions';

  constructor() {
    this.mem0 = new MemoryClient();
    this.initializeMemory();
  }

  /**
   * Inicializa a memória com instruções padrão
   */
  private async initializeMemory() {
    const customInstructions = `
    Auto Commit Agent - Instruções do Diego:
    
    1. SEMPRE usar mensagens de commit em português
    2. Incluir emojis relevantes nas mensagens
    3. Agrupar mudanças relacionadas em um único commit
    4. Ignorar arquivos temporários e de cache
    5. Priorizar commits de features sobre refatorações
    6. Incluir contexto sobre o que foi alterado
    7. Fazer commits mais frequentes em horário comercial
    8. Avisar quando houver mudanças críticas em produção
    `;

    try {
      await this.mem0.update_project({ custom_instructions: customInstructions });
      console.log('✅ Memória do Auto Commit Agent inicializada');
    } catch (error) {
      console.error('❌ Erro ao inicializar memória:', error);
    }
  }

  /**
   * Adiciona nova instrução do Diego
   */
  async addInstruction(instruction: string): Promise<void> {
    const message = {
      role: 'user',
      content: `Diego está adicionando uma nova instrução para o Auto Commit Agent: ${instruction}`
    };

    await this.mem0.add(
      [message],
      {
        user_id: this.agentUserId,
        metadata: {
          type: 'instruction',
          from: 'diego',
          timestamp: new Date().toISOString(),
          namespace: this.instructionsNamespace
        }
      }
    );

    console.log(`📝 Nova instrução adicionada: ${instruction}`);
  }

  /**
   * Busca instruções relevantes para o contexto atual
   */
  async getRelevantInstructions(context: string): Promise<string[]> {
    const results = await this.mem0.search({
      query: context,
      user_id: this.agentUserId,
      limit: 10
    });

    return results.results
      .filter(r => r.metadata?.namespace === this.instructionsNamespace)
      .map(r => r.memory);
  }

  /**
   * Adiciona preferências de commit do Diego
   */
  async addCommitPreference(preference: {
    pattern: string;
    message_template: string;
    priority?: number;
  }): Promise<void> {
    const message = {
      role: 'user',
      content: `Diego define preferência de commit: Para arquivos "${preference.pattern}", usar template "${preference.message_template}"`
    };

    await this.mem0.add(
      [message],
      {
        user_id: this.agentUserId,
        metadata: {
          type: 'commit_preference',
          pattern: preference.pattern,
          template: preference.message_template,
          priority: preference.priority || 0,
          namespace: this.instructionsNamespace
        }
      }
    );
  }

  /**
   * Adiciona regras de ignore personalizadas
   */
  async addIgnoreRule(rule: string, reason: string): Promise<void> {
    const message = {
      role: 'user',
      content: `Diego instrui: Ignorar arquivos/pastas "${rule}" porque ${reason}`
    };

    await this.mem0.add(
      [message],
      {
        user_id: this.agentUserId,
        metadata: {
          type: 'ignore_rule',
          rule: rule,
          reason: reason,
          namespace: this.instructionsNamespace
        }
      }
    );
  }

  /**
   * Adiciona horários preferenciais para commits
   */
  async setCommitSchedule(schedule: {
    start_hour: number;
    end_hour: number;
    days: string[];
    frequency_minutes: number;
  }): Promise<void> {
    const message = {
      role: 'user',
      content: `Diego define horário preferencial: Commits das ${schedule.start_hour}h às ${schedule.end_hour}h nos dias ${schedule.days.join(', ')}, a cada ${schedule.frequency_minutes} minutos`
    };

    await this.mem0.add(
      [message],
      {
        user_id: this.agentUserId,
        metadata: {
          type: 'schedule',
          ...schedule,
          namespace: this.instructionsNamespace
        }
      }
    );
  }

  /**
   * Aprende com feedback do Diego
   */
  async learnFromFeedback(feedback: {
    commit_message: string;
    was_good: boolean;
    suggestion?: string;
  }): Promise<void> {
    const message = {
      role: 'user',
      content: feedback.was_good 
        ? `Diego aprovou o commit: "${feedback.commit_message}"`
        : `Diego não gostou do commit: "${feedback.commit_message}". Sugestão: ${feedback.suggestion}`
    };

    await this.mem0.add(
      [message],
      {
        user_id: this.agentUserId,
        metadata: {
          type: 'feedback',
          commit_message: feedback.commit_message,
          approved: feedback.was_good,
          suggestion: feedback.suggestion,
          namespace: this.instructionsNamespace
        }
      }
    );
  }

  /**
   * Obtém todas as instruções do Diego
   */
  async getAllInstructions(): Promise<any[]> {
    const memories = await this.mem0.get_all({
      user_id: this.agentUserId,
      page: 1,
      page_size: 100
    });

    return memories.results.filter(
      m => m.metadata?.namespace === this.instructionsNamespace
    );
  }

  /**
   * Gera mensagem de commit baseada nas instruções
   */
  async generateCommitMessage(changes: {
    files: string[];
    actions: string[];
  }): Promise<string> {
    // Buscar instruções relevantes
    const context = `Arquivos modificados: ${changes.files.join(', ')}. Ações: ${changes.actions.join(', ')}`;
    const instructions = await this.getRelevantInstructions(context);

    // Buscar preferências de commit
    const preferences = await this.mem0.search({
      query: context,
      user_id: this.agentUserId,
      filter: { type: 'commit_preference' }
    });

    // Aplicar template se encontrar match
    for (const pref of preferences.results) {
      const pattern = pref.metadata?.pattern;
      if (pattern && changes.files.some(f => f.includes(pattern))) {
        return this.applyTemplate(pref.metadata.template, changes);
      }
    }

    // Gerar mensagem padrão com instruções do Diego
    return this.generateDefaultMessage(changes, instructions);
  }

  /**
   * Aplica template de mensagem
   */
  private applyTemplate(template: string, changes: any): string {
    return template
      .replace('{files}', changes.files.length)
      .replace('{action}', changes.actions[0] || 'update')
      .replace('{timestamp}', new Date().toLocaleTimeString('pt-BR'));
  }

  /**
   * Gera mensagem padrão considerando instruções
   */
  private generateDefaultMessage(changes: any, instructions: string[]): string {
    // Exemplo incorporando instruções do Diego
    const hasEmoji = instructions.some(i => i.includes('emoji'));
    const inPortuguese = instructions.some(i => i.includes('português'));

    let message = '';
    
    if (hasEmoji) {
      message += '🔄 ';
    }

    if (inPortuguese) {
      message += `Atualização: ${changes.files.length} arquivo(s)`;
    } else {
      message += `Update: ${changes.files.length} file(s)`;
    }

    return message;
  }
}

// Singleton para uso global
export const autoCommitMemory = new AutoCommitMemory();