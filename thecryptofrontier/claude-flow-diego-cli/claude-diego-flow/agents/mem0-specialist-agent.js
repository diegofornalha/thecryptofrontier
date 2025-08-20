#!/usr/bin/env npx tsx
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mem0SpecialistAgent = void 0;
const mcp_client_1 = require("../mcp/mcp-client");
const agent_1 = require("../core/agent");
const fs = __importStar(require("fs/promises"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Mem0 Specialist Agent
 *
 * Especialista em gerenciamento de memórias com integração MCP para:
 * - Gerenciar e manter as memórias do sistema
 * - Monitorar a saúde dos serviços de memória (qdrant, redis, postgres)
 * - Organizar e categorizar memórias existentes
 * - Fazer limpeza de memórias antigas ou irrelevantes
 * - Garantir integridade e consistência dos dados
 * - Fornecer interface simplificada para outros agentes
 */
class Mem0SpecialistAgent extends agent_1.Agent {
    constructor() {
        super({
            id: 'mem0-specialist',
            name: 'Mem0 Specialist',
            description: 'Especialista em gerenciamento de memórias e sistema Mem0',
            capabilities: [
                'memory-management',
                'memory-search',
                'memory-categorization',
                'memory-cleanup',
                'service-monitoring',
                'memory-backup',
                'memory-restore',
                'memory-analytics',
                'cross-agent-sync'
            ]
        });
        this.mem0ApiUrl = 'http://localhost:8000';
        this.mem0BridgeUrl = 'http://localhost:3002';
        this.qdrantUrl = 'http://localhost:6333';
        this.redisUrl = 'redis://localhost:6379';
        this.postgresUrl = 'postgresql://mem0:mem0password@localhost:5432/mem0db';
        this.mcpClient = new mcp_client_1.MCPClient({
            name: 'mem0-mcp',
            version: '1.0.0'
        });
    }
    async initialize() {
        await this.mcpClient.connect();
        console.log('🧠 Mem0 Specialist Agent initialized with MCP support');
        // Verificar saúde inicial dos serviços
        await this.checkServicesHealth();
    }
    async processMessage(message) {
        console.log(`\n🧠 Mem0 Specialist processing: ${message.content}`);
        const response = await this.analyzeRequest(message.content);
        return {
            role: 'assistant',
            content: response,
            metadata: {
                agent: this.config.id,
                timestamp: new Date().toISOString()
            }
        };
    }
    async analyzeRequest(request) {
        const lowerRequest = request.toLowerCase();
        if (lowerRequest.includes('listar') || lowerRequest.includes('list') || lowerRequest.includes('show')) {
            return await this.listMemories();
        }
        if (lowerRequest.includes('buscar') || lowerRequest.includes('search') || lowerRequest.includes('find')) {
            const query = this.extractSearchQuery(request);
            return await this.searchMemories(query);
        }
        if (lowerRequest.includes('limpar') || lowerRequest.includes('clean') || lowerRequest.includes('delete')) {
            return await this.cleanupMemories();
        }
        if (lowerRequest.includes('categorizar') || lowerRequest.includes('categorize') || lowerRequest.includes('organize')) {
            return await this.categorizeMemories();
        }
        if (lowerRequest.includes('saúde') || lowerRequest.includes('health') || lowerRequest.includes('status')) {
            return await this.getServicesHealth();
        }
        if (lowerRequest.includes('backup')) {
            return await this.backupMemories();
        }
        if (lowerRequest.includes('restore') || lowerRequest.includes('restaurar')) {
            return await this.restoreMemories();
        }
        if (lowerRequest.includes('estatísticas') || lowerRequest.includes('stats') || lowerRequest.includes('analytics')) {
            return await this.getMemoryStatistics();
        }
        return await this.generalAnalysis();
    }
    async listMemories() {
        console.log('📋 Listing memories...');
        let result = '# 📋 Memórias do Sistema\n\n';
        try {
            // Buscar memórias via Mem0 Bridge
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: '*',
                    limit: 100
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch memories: ${response.status}`);
            }
            const data = await response.json();
            const memories = data.memories || [];
            // Agrupar por categoria
            const categorized = {};
            memories.forEach((memory) => {
                const category = memory.category || 'uncategorized';
                if (!categorized[category]) {
                    categorized[category] = [];
                }
                categorized[category].push(memory);
            });
            // Exibir memórias por categoria
            for (const [category, mems] of Object.entries(categorized)) {
                result += `## 📁 ${category} (${mems.length} memórias)\n\n`;
                mems.slice(0, 5).forEach((mem, index) => {
                    result += `### ${index + 1}. ${mem.id || 'N/A'}\n`;
                    result += `- **Conteúdo**: ${mem.content?.substring(0, 100)}...\n`;
                    result += `- **User ID**: ${mem.user_id || 'N/A'}\n`;
                    result += `- **Tags**: ${mem.tags?.join(', ') || 'Nenhuma'}\n`;
                    result += `- **Criado em**: ${mem.created_at || 'N/A'}\n\n`;
                });
                if (mems.length > 5) {
                    result += `*... e mais ${mems.length - 5} memórias*\n\n`;
                }
            }
            result += `\n**Total de memórias**: ${memories.length}\n`;
        }
        catch (error) {
            result += `\n⚠️ Erro ao listar memórias: ${error}\n`;
        }
        return result;
    }
    async searchMemories(query) {
        console.log(`🔍 Searching memories for: ${query}`);
        let result = `# 🔍 Busca de Memórias: "${query}"\n\n`;
        try {
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    limit: 20
                })
            });
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const data = await response.json();
            const memories = data.memories || [];
            if (memories.length === 0) {
                result += '❌ Nenhuma memória encontrada.\n';
            }
            else {
                result += `✅ Encontradas ${memories.length} memórias:\n\n`;
                memories.forEach((mem, index) => {
                    result += `## ${index + 1}. ${mem.id || 'N/A'}\n`;
                    result += `- **Conteúdo**: ${mem.content}\n`;
                    result += `- **Relevância**: ${mem.score || 'N/A'}\n`;
                    result += `- **Categoria**: ${mem.category || 'uncategorized'}\n`;
                    result += `- **Tags**: ${mem.tags?.join(', ') || 'Nenhuma'}\n\n`;
                });
            }
        }
        catch (error) {
            result += `\n⚠️ Erro na busca: ${error}\n`;
        }
        return result;
    }
    async cleanupMemories() {
        console.log('🧹 Cleaning up old memories...');
        let result = '# 🧹 Limpeza de Memórias\n\n';
        try {
            // Buscar memórias antigas (mais de 30 dias)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: '*',
                    filters: {
                        created_before: thirtyDaysAgo.toISOString()
                    },
                    limit: 1000
                })
            });
            if (response.ok) {
                const data = await response.json();
                const oldMemories = data.memories || [];
                result += `## 📊 Análise de Limpeza:\n`;
                result += `- Memórias com mais de 30 dias: ${oldMemories.length}\n`;
                // Identificar memórias duplicadas
                const contentMap = new Map();
                oldMemories.forEach((mem) => {
                    const content = mem.content || '';
                    contentMap.set(content, (contentMap.get(content) || 0) + 1);
                });
                const duplicates = Array.from(contentMap.entries())
                    .filter(([_, count]) => count > 1)
                    .length;
                result += `- Possíveis duplicatas: ${duplicates}\n\n`;
                result += '### 🗑️ Recomendações de Limpeza:\n';
                result += '1. Remover memórias duplicadas\n';
                result += '2. Arquivar memórias antigas mas importantes\n';
                result += '3. Deletar memórias temporárias expiradas\n';
                result += '4. Consolidar memórias relacionadas\n\n';
                result += '⚠️ **Nota**: Execute a limpeza com cuidado para não perder informações importantes.\n';
            }
        }
        catch (error) {
            result += `\n⚠️ Erro na análise de limpeza: ${error}\n`;
        }
        return result;
    }
    async categorizeMemories() {
        console.log('🏷️ Categorizing memories...');
        let result = '# 🏷️ Categorização de Memórias\n\n';
        try {
            // Buscar memórias sem categoria
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: '*',
                    filters: {
                        category: 'uncategorized'
                    },
                    limit: 100
                })
            });
            if (response.ok) {
                const data = await response.json();
                const uncategorized = data.memories || [];
                result += `## 📊 Status de Categorização:\n`;
                result += `- Memórias sem categoria: ${uncategorized.length}\n\n`;
                // Sugerir categorias baseadas no conteúdo
                const suggestions = {
                    'docker': ['docker', 'container', 'image', 'compose'],
                    'strapi': ['strapi', 'cms', 'content', 'api'],
                    'frontend': ['react', 'next', 'component', 'ui', 'css'],
                    'backend': ['node', 'express', 'database', 'server'],
                    'devops': ['deploy', 'ci/cd', 'pipeline', 'kubernetes'],
                    'security': ['security', 'auth', 'password', 'token'],
                    'config': ['config', 'env', 'settings', 'environment']
                };
                result += '### 🏷️ Sugestões de Categorização:\n\n';
                for (const [category, keywords] of Object.entries(suggestions)) {
                    const matches = uncategorized.filter((mem) => {
                        const content = (mem.content || '').toLowerCase();
                        return keywords.some(kw => content.includes(kw));
                    });
                    if (matches.length > 0) {
                        result += `**${category}**: ${matches.length} memórias podem ser categorizadas\n`;
                    }
                }
                result += '\n### 🔧 Ações Recomendadas:\n';
                result += '1. Aplicar categorização automática baseada em palavras-chave\n';
                result += '2. Revisar manualmente memórias ambíguas\n';
                result += '3. Criar novas categorias conforme necessário\n';
                result += '4. Estabelecer padrões de categorização para novos dados\n';
            }
        }
        catch (error) {
            result += `\n⚠️ Erro na categorização: ${error}\n`;
        }
        return result;
    }
    async getServicesHealth() {
        console.log('🏥 Checking services health...');
        let result = '# 🏥 Saúde dos Serviços Mem0\n\n';
        // Verificar cada serviço
        const services = [
            { name: 'Mem0 API', url: `${this.mem0ApiUrl}/health`, container: 'mem0-api' },
            { name: 'Mem0 Bridge', url: `${this.mem0BridgeUrl}/health`, container: 'mem0-bridge' },
            { name: 'Qdrant', url: `${this.qdrantUrl}/collections`, container: 'mem0-qdrant' },
            { name: 'Redis', container: 'mem0-redis', checkCmd: 'redis-cli ping' },
            { name: 'PostgreSQL', container: 'mem0-postgres', checkCmd: 'pg_isready' }
        ];
        for (const service of services) {
            result += `## 🔍 ${service.name}\n`;
            try {
                // Verificar se o container está rodando
                const { stdout: psOutput } = await execAsync(`docker ps --filter name=${service.container} --format "{{.Status}}"`);
                if (psOutput.trim()) {
                    result += `✅ Container rodando: ${psOutput.trim()}\n`;
                    // Verificar endpoint HTTP se disponível
                    if (service.url) {
                        try {
                            const response = await fetch(service.url, {
                                method: 'GET',
                                signal: AbortSignal.timeout(5000)
                            });
                            result += `✅ Endpoint respondendo: ${response.status}\n`;
                        }
                        catch (error) {
                            result += `❌ Endpoint não acessível\n`;
                        }
                    }
                    // Verificar estatísticas do container
                    const { stdout: statsOutput } = await execAsync(`docker stats ${service.container} --no-stream --format "CPU: {{.CPUPerc}} | Mem: {{.MemUsage}}"`);
                    result += `📊 ${statsOutput.trim()}\n`;
                }
                else {
                    result += `❌ Container não está rodando\n`;
                }
            }
            catch (error) {
                result += `⚠️ Erro ao verificar: ${error}\n`;
            }
            result += '\n';
        }
        // Verificar uso de disco
        try {
            const { stdout: dfOutput } = await execAsync('df -h /var/lib/docker/volumes/thecryptofrontier-data');
            result += '## 💾 Uso de Disco:\n```\n' + dfOutput + '```\n';
        }
        catch (error) {
            result += '## 💾 Uso de Disco: Não foi possível verificar\n';
        }
        return result;
    }
    async backupMemories() {
        console.log('💾 Creating memory backup...');
        let result = '# 💾 Backup de Memórias\n\n';
        const backupDir = '/home/strapi/thecryptofrontier/backups/mem0';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${backupDir}/backup-${timestamp}`;
        try {
            // Criar diretório de backup
            await fs.mkdir(backupPath, { recursive: true });
            result += `📁 Criando backup em: ${backupPath}\n\n`;
            // 1. Exportar dados do PostgreSQL
            result += '## 1. Backup PostgreSQL\n';
            const pgDumpCmd = `docker exec mem0-postgres pg_dump -U mem0 mem0db > ${backupPath}/postgres-backup.sql`;
            await execAsync(pgDumpCmd);
            result += '✅ Dados do PostgreSQL exportados\n\n';
            // 2. Exportar dados do Qdrant
            result += '## 2. Backup Qdrant\n';
            try {
                const collections = await fetch(`${this.qdrantUrl}/collections`);
                if (collections.ok) {
                    const data = await collections.json();
                    await fs.writeFile(`${backupPath}/qdrant-collections.json`, JSON.stringify(data, null, 2));
                    result += '✅ Metadados do Qdrant exportados\n';
                }
            }
            catch (error) {
                result += '⚠️ Não foi possível exportar dados do Qdrant\n';
            }
            // 3. Exportar snapshot do Redis
            result += '\n## 3. Backup Redis\n';
            const redisBackupCmd = `docker exec mem0-redis redis-cli BGSAVE`;
            await execAsync(redisBackupCmd);
            result += '✅ Snapshot do Redis iniciado\n\n';
            // 4. Criar arquivo de metadados
            const metadata = {
                timestamp: new Date().toISOString(),
                services: {
                    postgres: 'backed_up',
                    qdrant: 'metadata_only',
                    redis: 'snapshot'
                },
                agent: this.config.id
            };
            await fs.writeFile(`${backupPath}/backup-metadata.json`, JSON.stringify(metadata, null, 2));
            // 5. Comprimir backup
            result += '## 4. Comprimindo backup\n';
            const tarCmd = `cd ${backupDir} && tar -czf backup-${timestamp}.tar.gz backup-${timestamp}/`;
            await execAsync(tarCmd);
            result += '✅ Backup comprimido criado\n\n';
            // Limpar diretório temporário
            await execAsync(`rm -rf ${backupPath}`);
            result += `### ✅ Backup concluído!\n`;
            result += `📦 Arquivo: ${backupDir}/backup-${timestamp}.tar.gz\n`;
        }
        catch (error) {
            result += `\n⚠️ Erro durante backup: ${error}\n`;
        }
        return result;
    }
    async restoreMemories() {
        console.log('📥 Restoring memories...');
        let result = '# 📥 Restauração de Memórias\n\n';
        const backupDir = '/home/strapi/thecryptofrontier/backups/mem0';
        try {
            // Listar backups disponíveis
            const files = await fs.readdir(backupDir);
            const backups = files.filter(f => f.startsWith('backup-') && f.endsWith('.tar.gz'));
            if (backups.length === 0) {
                result += '❌ Nenhum backup encontrado.\n';
                return result;
            }
            result += '## 📋 Backups Disponíveis:\n';
            backups.forEach((backup, index) => {
                result += `${index + 1}. ${backup}\n`;
            });
            result += '\n### ⚠️ Instruções para Restauração:\n';
            result += '1. Escolha o backup desejado\n';
            result += '2. Pare os serviços antes de restaurar\n';
            result += '3. Execute o processo de restauração\n';
            result += '4. Reinicie os serviços\n\n';
            result += '**Comandos para restauração manual**:\n';
            result += '```bash\n';
            result += '# Parar serviços\n';
            result += 'docker-compose -f infrastructure-docker/docker-yml/docker-compose.mem0.yml down\n\n';
            result += '# Extrair backup\n';
            result += 'cd /home/strapi/thecryptofrontier/backups/mem0\n';
            result += 'tar -xzf backup-TIMESTAMP.tar.gz\n\n';
            result += '# Restaurar PostgreSQL\n';
            result += 'docker-compose -f ../../infrastructure-docker/docker-yml/docker-compose.mem0.yml up -d mem0-postgres\n';
            result += 'docker exec -i mem0-postgres psql -U mem0 mem0db < backup-TIMESTAMP/postgres-backup.sql\n\n';
            result += '# Reiniciar todos os serviços\n';
            result += 'docker-compose -f ../../infrastructure-docker/docker-yml/docker-compose.mem0.yml up -d\n';
            result += '```\n';
        }
        catch (error) {
            result += `\n⚠️ Erro ao listar backups: ${error}\n`;
        }
        return result;
    }
    async getMemoryStatistics() {
        console.log('📊 Generating memory statistics...');
        let result = '# 📊 Estatísticas de Memórias\n\n';
        try {
            // Buscar todas as memórias para análise
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: '*',
                    limit: 10000
                })
            });
            if (response.ok) {
                const data = await response.json();
                const memories = data.memories || [];
                // Estatísticas gerais
                result += '## 📈 Estatísticas Gerais:\n';
                result += `- **Total de memórias**: ${memories.length}\n`;
                // Por categoria
                const byCategory = {};
                memories.forEach((mem) => {
                    const cat = mem.category || 'uncategorized';
                    byCategory[cat] = (byCategory[cat] || 0) + 1;
                });
                result += '\n### 📁 Por Categoria:\n';
                Object.entries(byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .forEach(([cat, count]) => {
                    const percent = ((count / memories.length) * 100).toFixed(1);
                    result += `- **${cat}**: ${count} (${percent}%)\n`;
                });
                // Por agente
                const byAgent = {};
                memories.forEach((mem) => {
                    const agent = mem.user_id?.split('/').pop() || 'unknown';
                    byAgent[agent] = (byAgent[agent] || 0) + 1;
                });
                result += '\n### 🤖 Por Agente:\n';
                Object.entries(byAgent)
                    .sort(([, a], [, b]) => b - a)
                    .forEach(([agent, count]) => {
                    result += `- **${agent}**: ${count} memórias\n`;
                });
                // Análise temporal
                const now = new Date();
                const last24h = memories.filter((mem) => {
                    const created = new Date(mem.created_at);
                    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
                }).length;
                const last7d = memories.filter((mem) => {
                    const created = new Date(mem.created_at);
                    return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
                }).length;
                result += '\n### ⏱️ Atividade Recente:\n';
                result += `- Últimas 24h: ${last24h} memórias\n`;
                result += `- Últimos 7 dias: ${last7d} memórias\n`;
                // Tags mais comuns
                const tagCount = {};
                memories.forEach((mem) => {
                    (mem.tags || []).forEach((tag) => {
                        tagCount[tag] = (tagCount[tag] || 0) + 1;
                    });
                });
                const topTags = Object.entries(tagCount)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10);
                if (topTags.length > 0) {
                    result += '\n### 🏷️ Top 10 Tags:\n';
                    topTags.forEach(([tag, count]) => {
                        result += `- **${tag}**: ${count} usos\n`;
                    });
                }
            }
            else {
                result += '⚠️ Não foi possível obter estatísticas\n';
            }
        }
        catch (error) {
            result += `\n⚠️ Erro ao gerar estatísticas: ${error}\n`;
        }
        return result;
    }
    async checkServicesHealth() {
        try {
            const services = ['mem0-api', 'mem0-qdrant', 'mem0-redis', 'mem0-postgres'];
            const runningServices = [];
            for (const service of services) {
                const { stdout } = await execAsync(`docker ps --filter name=${service} --format "{{.Names}}"`);
                if (stdout.trim()) {
                    runningServices.push(service);
                }
            }
            if (runningServices.length < services.length) {
                console.log('⚠️ Alguns serviços Mem0 não estão rodando. Execute:');
                console.log('docker-compose -f infrastructure-docker/docker-yml/docker-compose.mem0.yml up -d');
            }
            else {
                console.log('✅ Todos os serviços Mem0 estão rodando');
            }
        }
        catch (error) {
            console.error('Erro ao verificar serviços:', error);
        }
    }
    async generalAnalysis() {
        console.log('📊 Performing general Mem0 analysis...');
        let analysis = '# 🧠 Sistema Mem0 - Análise Geral\n\n';
        analysis += '## 🎯 Propósito\n';
        analysis += 'O Mem0 é o sistema de memória persistente que permite aos agentes:\n';
        analysis += '- Armazenar e recuperar contexto entre conversas\n';
        analysis += '- Compartilhar conhecimento entre agentes\n';
        analysis += '- Manter histórico de interações e aprendizados\n\n';
        analysis += '## 🛠️ Componentes\n';
        analysis += '1. **Qdrant**: Vector database para busca semântica\n';
        analysis += '2. **PostgreSQL**: Metadados e estrutura\n';
        analysis += '3. **Redis**: Cache e sessões\n';
        analysis += '4. **Mem0 API**: Interface REST\n';
        analysis += '5. **Mem0 Bridge**: Integração MCP\n\n';
        analysis += '## 📋 Ações Disponíveis\n\n';
        analysis += '### Gerenciamento de Memórias\n';
        analysis += '- **Listar**: Ver todas as memórias do sistema\n';
        analysis += '- **Buscar**: Encontrar memórias específicas\n';
        analysis += '- **Limpar**: Remover memórias antigas ou desnecessárias\n';
        analysis += '- **Categorizar**: Organizar memórias por categoria\n\n';
        analysis += '### Manutenção do Sistema\n';
        analysis += '- **Saúde**: Verificar status dos serviços\n';
        analysis += '- **Backup**: Criar backup completo\n';
        analysis += '- **Restore**: Restaurar de backup\n';
        analysis += '- **Estatísticas**: Ver métricas de uso\n\n';
        analysis += '### Integração com Agentes\n';
        analysis += '- Interface simplificada via MCP\n';
        analysis += '- Sincronização automática\n';
        analysis += '- Busca contextual\n\n';
        analysis += '💡 **Dica**: Use comandos específicos para ações detalhadas!\n';
        return analysis;
    }
    extractSearchQuery(request) {
        // Tentar extrair query após palavras-chave
        const patterns = [
            /buscar?\s+(?:por\s+)?["']?(.+?)["']?$/i,
            /search\s+(?:for\s+)?["']?(.+?)["']?$/i,
            /find\s+["']?(.+?)["']?$/i
        ];
        for (const pattern of patterns) {
            const match = request.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        // Se não encontrar padrão, usar a request inteira removendo comando
        return request.replace(/^(buscar|search|find)\s*/i, '').trim();
    }
    async shutdown() {
        if (this.mcpClient.isConnected()) {
            await this.mcpClient.disconnect();
        }
        console.log('🧠 Mem0 Specialist Agent shutdown complete');
    }
}
exports.Mem0SpecialistAgent = Mem0SpecialistAgent;
// Executar se chamado diretamente
if (require.main === module) {
    const agent = new Mem0SpecialistAgent();
    async function run() {
        await agent.initialize();
        // Processar argumento da linha de comando ou fazer análise geral
        const request = process.argv[2] || 'analyze';
        const message = {
            role: 'user',
            content: request,
            metadata: {
                source: 'cli'
            }
        };
        const response = await agent.processMessage(message);
        console.log('\n' + response.content);
        await agent.shutdown();
    }
    run().catch(console.error);
}
