/**
 * Agent Management Tools
 * 
 * Ferramentas para listar e gerenciar agentes do sistema
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ToolResult, MCPError, ErrorCode } from '../../core/types.js';
import { createContentBlock } from '../../utils/content.js';
import { logger } from '../../utils/logger.js';

const toolLogger = logger.forTool('agents');

// Caminho base dos agentes - Guardian e agentes CLI
const AGENTS_BASE_PATH = '/home/strapi/thecryptofrontier/claude-flow-diego-cli/claude-diego-flow/src/agents';

interface AgentInfo {
  name: string;
  id: string;
  description: string;
  status: 'implemented' | 'referenced' | 'template';
  executable: boolean;
  hasMCP: boolean;
  capabilities?: string[];
  filePath: string;
}

/**
 * Lista todos os agentes disponíveis no sistema
 */
export async function handleAgentsList(): Promise<ToolResult<{ agents: AgentInfo[] }>> {
  try {
    toolLogger.info('Listando agentes do sistema');
    
    // Verificar se o diretório existe
    try {
      await fs.access(AGENTS_BASE_PATH);
    } catch {
      throw new Error(`Diretório de agentes não encontrado: ${AGENTS_BASE_PATH}`);
    }
    
    // Listar todos os arquivos .ts no diretório
    const files = await fs.readdir(AGENTS_BASE_PATH);
    const agentFiles = files.filter(file => file.endsWith('.ts'));
    
    const agents: AgentInfo[] = [];
    
    // Analisar cada arquivo de agente
    for (const file of agentFiles) {
      const filePath = path.join(AGENTS_BASE_PATH, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extrair informações do agente
      const agentInfo = await analyzeAgentFile(file, filePath, content);
      agents.push(agentInfo);
    }
    
    // Ordenar agentes por status e nome
    agents.sort((a, b) => {
      if (a.status !== b.status) {
        const statusOrder = { 'implemented': 0, 'referenced': 1, 'template': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.name.localeCompare(b.name);
    });
    
    // Criar resposta formatada
    const summary = createAgentsSummary(agents);
    
    toolLogger.info(`Encontrados ${agents.length} agentes`);
    
    return {
      success: true,
      data: { agents },
      content: [createContentBlock(summary)]
    };
    
  } catch (error) {
    toolLogger.error('Erro ao listar agentes:', error instanceof Error ? error : new Error(String(error)));
    const errorMessage = error instanceof Error ? error.message : String(error);
    const mcpError = new MCPError(
      ErrorCode.INTERNAL_ERROR,
      errorMessage,
      error
    );
    return {
      success: false,
      error: mcpError,
      content: [createContentBlock(`Erro ao listar agentes: ${errorMessage}`)]
    };
  }
}

/**
 * Analisa um arquivo de agente para extrair informações
 */
async function analyzeAgentFile(filename: string, filePath: string, content: string): Promise<AgentInfo> {
  // Extrair nome base do arquivo
  const baseName = filename.replace('.ts', '');
  
  // Verificar se é executável
  const executable = content.includes('#!/usr/bin/env npx tsx');
  
  // Verificar se tem MCP
  const hasMCP = content.includes('MCPClient') || content.includes('MCPBridge') || content.includes('mcp');
  
  // Extrair ID do agente
  const idMatch = content.match(/id:\s*['"`]([^'"`]+)['"`]/);
  const id = idMatch ? idMatch[1] : baseName;
  
  // Extrair nome do agente
  const nameMatch = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
  const name = nameMatch ? nameMatch[1] : formatAgentName(baseName);
  
  // Extrair descrição
  const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  const description = descMatch ? descMatch[1] : 'Sem descrição disponível';
  
  // Extrair capabilities
  const capMatch = content.match(/capabilities:\s*\[([\s\S]*?)\]/);
  let capabilities: string[] = [];
  if (capMatch && capMatch[1]) {
    const capString = capMatch[1];
    const caps = capString.match(/['"`]([^'"`]+)['"`]/g);
    if (caps) {
      capabilities = caps.map(cap => cap.replace(/['"`]/g, ''));
    }
  }
  
  // Determinar status
  let status: 'implemented' | 'referenced' | 'template' = 'implemented';
  if (baseName.includes('template')) {
    status = 'template';
  } else if (!content.includes('export class') && !content.includes('export default')) {
    status = 'referenced';
  }
  
  // Verificar se o arquivo existe de fato (para agentes referenciados mas não implementados)
  try {
    await fs.access(filePath);
  } catch {
    status = 'referenced';
  }
  
  return {
    name: name || 'Unknown Agent',
    id: id || baseName,
    description: description || 'Sem descrição disponível',
    status,
    executable,
    hasMCP,
    capabilities: capabilities.length > 0 ? capabilities : undefined,
    filePath
  };
}

/**
 * Formata o nome do agente baseado no nome do arquivo
 */
function formatAgentName(filename: string): string {
  return filename
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Cria um resumo formatado dos agentes
 */
function createAgentsSummary(agents: AgentInfo[]): string {
  const implemented = agents.filter(a => a.status === 'implemented');
  const referenced = agents.filter(a => a.status === 'referenced');
  const templates = agents.filter(a => a.status === 'template');
  const withMCP = agents.filter(a => a.hasMCP);
  const executable = agents.filter(a => a.executable);
  
  let summary = `# 🤖 Lista de Agentes do Sistema\n\n`;
  summary += `## 📊 Resumo\n`;
  summary += `- Total de agentes: **${agents.length}**\n`;
  summary += `- Implementados: **${implemented.length}**\n`;
  summary += `- Referenciados mas não implementados: **${referenced.length}**\n`;
  summary += `- Templates: **${templates.length}**\n`;
  summary += `- Com integração MCP: **${withMCP.length}**\n`;
  summary += `- Executáveis: **${executable.length}**\n\n`;
  
  // Listar agentes implementados
  if (implemented.length > 0) {
    summary += `## ✅ Agentes Implementados\n\n`;
    for (const agent of implemented) {
      summary += formatAgentEntry(agent);
    }
  }
  
  // Listar agentes referenciados mas não implementados
  if (referenced.length > 0) {
    summary += `## ⚠️ Agentes Referenciados (Não Implementados)\n\n`;
    for (const agent of referenced) {
      summary += formatAgentEntry(agent);
    }
  }
  
  // Listar templates
  if (templates.length > 0) {
    summary += `## 📄 Templates de Agentes\n\n`;
    for (const agent of templates) {
      summary += formatAgentEntry(agent);
    }
  }
  
  return summary;
}

/**
 * Formata uma entrada de agente
 */
function formatAgentEntry(agent: AgentInfo): string {
  let entry = `### ${agent.name}\n`;
  entry += `- **ID**: \`${agent.id}\`\n`;
  entry += `- **Descrição**: ${agent.description}\n`;
  entry += `- **Arquivo**: \`${path.basename(agent.filePath)}\`\n`;
  
  const features = [];
  if (agent.executable) features.push('Executável');
  if (agent.hasMCP) features.push('MCP');
  
  if (features.length > 0) {
    entry += `- **Features**: ${features.join(', ')}\n`;
  }
  
  if (agent.capabilities && agent.capabilities.length > 0) {
    entry += `- **Capacidades**: ${agent.capabilities.join(', ')}\n`;
  }
  
  entry += '\n';
  return entry;
}