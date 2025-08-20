/**
 * Comandos para Diego gerenciar o Auto Commit Agent
 */

import { autoCommitMemory } from './mem0-instructions';
import { AutoCommitAgent } from '../auto-commit-agent';

export class DiegoCommands {
  private agent: AutoCommitAgent;
  private memory = autoCommitMemory;

  constructor(agent: AutoCommitAgent) {
    this.agent = agent;
  }

  /**
   * Comandos disponíveis para Diego
   */
  async execute(command: string, ...args: any[]): Promise<string> {
    const [cmd, ...params] = command.split(' ');

    switch (cmd) {
      case 'instrucao':
      case 'instruction':
        return await this.addInstruction(params.join(' '));

      case 'preferencia':
      case 'preference':
        return await this.setPreference(params);

      case 'ignorar':
      case 'ignore':
        return await this.addIgnoreRule(params);

      case 'horario':
      case 'schedule':
        return await this.setSchedule(params);

      case 'feedback':
        return await this.giveFeedback(params);

      case 'listar':
      case 'list':
        return await this.listInstructions();

      case 'ajuda':
      case 'help':
        return this.showHelp();

      default:
        return `❌ Comando não reconhecido: ${cmd}. Use 'ajuda' para ver comandos disponíveis.`;
    }
  }

  /**
   * Adiciona nova instrução
   */
  private async addInstruction(instruction: string): Promise<string> {
    if (!instruction) {
      return '❌ Por favor, forneça uma instrução.';
    }

    await this.memory.addInstruction(instruction);
    return `✅ Instrução adicionada: "${instruction}"`;
  }

  /**
   * Define preferência de commit
   */
  private async setPreference(params: string[]): Promise<string> {
    // Formato: preferencia *.tsx "feat: {action} componente React"
    if (params.length < 2) {
      return '❌ Uso: preferencia <padrão> "<template>"';
    }

    const pattern = params[0];
    const template = params.slice(1).join(' ').replace(/"/g, '');

    await this.memory.addCommitPreference({
      pattern,
      message_template: template
    });

    return `✅ Preferência adicionada: ${pattern} → ${template}`;
  }

  /**
   * Adiciona regra de ignore
   */
  private async addIgnoreRule(params: string[]): Promise<string> {
    if (params.length < 2) {
      return '❌ Uso: ignorar <padrão> <razão>';
    }

    const rule = params[0];
    const reason = params.slice(1).join(' ');

    await this.memory.addIgnoreRule(rule, reason);
    return `✅ Regra de ignore adicionada: ${rule} (${reason})`;
  }

  /**
   * Define horário de commits
   */
  private async setSchedule(params: string[]): Promise<string> {
    // Formato: horario 9-18 seg-sex 30
    if (params.length < 3) {
      return '❌ Uso: horario <início-fim> <dias> <frequência-minutos>';
    }

    const [hours, days, freq] = params;
    const [start, end] = hours.split('-').map(Number);
    const daysList = this.parseDays(days);

    await this.memory.setCommitSchedule({
      start_hour: start,
      end_hour: end,
      days: daysList,
      frequency_minutes: parseInt(freq)
    });

    return `✅ Horário definido: ${start}h-${end}h, ${daysList.join(', ')}, a cada ${freq} minutos`;
  }

  /**
   * Feedback sobre commit
   */
  private async giveFeedback(params: string[]): Promise<string> {
    // Formato: feedback bom "mensagem do commit" ou feedback ruim "mensagem" "sugestão"
    if (params.length < 2) {
      return '❌ Uso: feedback <bom|ruim> "<mensagem>" ["<sugestão>"]';
    }

    const isGood = params[0] === 'bom';
    const message = params[1].replace(/"/g, '');
    const suggestion = params[2]?.replace(/"/g, '');

    await this.memory.learnFromFeedback({
      commit_message: message,
      was_good: isGood,
      suggestion
    });

    return isGood 
      ? `✅ Feedback positivo registrado para: "${message}"`
      : `✅ Feedback negativo registrado. Sugestão: ${suggestion}`;
  }

  /**
   * Lista todas as instruções
   */
  private async listInstructions(): Promise<string> {
    const instructions = await this.memory.getAllInstructions();
    
    if (instructions.length === 0) {
      return '📋 Nenhuma instrução encontrada.';
    }

    let output = '📋 Instruções do Auto Commit Agent:\n\n';
    
    instructions.forEach((inst, index) => {
      output += `${index + 1}. `;
      
      switch (inst.metadata?.type) {
        case 'instruction':
          output += `📝 ${inst.memory}\n`;
          break;
        case 'commit_preference':
          output += `🎯 Preferência: ${inst.metadata.pattern} → ${inst.metadata.template}\n`;
          break;
        case 'ignore_rule':
          output += `🚫 Ignorar: ${inst.metadata.rule} (${inst.metadata.reason})\n`;
          break;
        case 'schedule':
          output += `⏰ Horário: ${inst.metadata.start_hour}h-${inst.metadata.end_hour}h\n`;
          break;
        case 'feedback':
          output += inst.metadata.approved ? '👍 ' : '👎 ';
          output += `Feedback: ${inst.metadata.commit_message}\n`;
          break;
      }
    });

    return output;
  }

  /**
   * Mostra ajuda
   */
  private showHelp(): string {
    return `
🤖 Comandos do Auto Commit Agent para Diego:

📝 **Instruções Gerais:**
   instrucao <texto>
   Ex: instrucao sempre incluir número da issue no commit

🎯 **Preferências de Commit:**
   preferencia <padrão> "<template>"
   Ex: preferencia *.tsx "✨ feat: {action} componente React"

🚫 **Regras de Ignore:**
   ignorar <padrão> <razão>
   Ex: ignorar *.log arquivos de log não devem ser commitados

⏰ **Horário de Commits:**
   horario <início-fim> <dias> <frequência-minutos>
   Ex: horario 9-18 seg-sex 30

💬 **Feedback:**
   feedback bom "<mensagem>"
   feedback ruim "<mensagem>" "<sugestão>"

📋 **Listar Instruções:**
   listar

❓ **Ajuda:**
   ajuda

Exemplos de uso:
- instrucao usar emojis do gitmoji
- preferencia *.py "🐍 {action}: {files} arquivo(s) Python"
- ignorar node_modules dependências não devem ser versionadas
- horario 8-18 seg-sex 15
- feedback bom "✨ feat: novo componente de login"
- feedback ruim "update files" "✨ feat: implementa autenticação OAuth"
`;
  }

  /**
   * Parse de dias da semana
   */
  private parseDays(days: string): string[] {
    const dayMap: Record<string, string[]> = {
      'seg-sex': ['seg', 'ter', 'qua', 'qui', 'sex'],
      'todos': ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
      'semana': ['seg', 'ter', 'qua', 'qui', 'sex'],
      'fds': ['sab', 'dom']
    };

    return dayMap[days] || days.split(',');
  }
}

// Função helper para uso direto
export async function diegoCommand(command: string, agent?: AutoCommitAgent): Promise<string> {
  const agentInstance = agent || new AutoCommitAgent();
  const commands = new DiegoCommands(agentInstance);
  return await commands.execute(command);
}