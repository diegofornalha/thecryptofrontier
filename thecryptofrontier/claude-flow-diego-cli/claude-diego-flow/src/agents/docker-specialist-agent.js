#!/usr/bin/env npx tsx
import { MCPClient } from '../mcp/mcp-client';
import { Agent } from '../core/agent';
import { MemoryNamespaces } from '../constants/memory-constants';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
/**
 * Docker Specialist Agent
 *
 * Especialista em Docker com integração MCP para:
 * - Análise e otimização de Dockerfiles
 * - Gerenciamento de containers e imagens
 * - Docker Compose e orquestração
 * - Monitoramento e diagnóstico
 * - Segurança de containers
 * - CI/CD com Docker
 */
export class DockerSpecialistAgent extends Agent {
    constructor() {
        super({
            id: 'docker-specialist',
            name: 'Docker Specialist',
            description: 'Especialista em Docker e containerização com integração MCP',
            capabilities: [
                'dockerfile-analysis',
                'container-management',
                'compose-orchestration',
                'image-optimization',
                'security-scanning',
                'ci-cd-integration',
                'performance-monitoring',
                'troubleshooting'
            ]
        });
        this.projectRoot = '/home/strapi/thecryptofrontier';
        this.mcpClient = new MCPClient({
            name: 'docker-mcp',
            version: '1.0.0'
        });
    }
    async initialize() {
        await this.mcpClient.connect();
        console.log('🐋 Docker Specialist Agent initialized with MCP support');
    }
    async processMessage(message) {
        console.log(`\n🐋 Docker Specialist processing: ${message.content}`);
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
        if (lowerRequest.includes('dockerfile') || lowerRequest.includes('docker file')) {
            return await this.analyzeDockerfiles();
        }
        if (lowerRequest.includes('compose') || lowerRequest.includes('docker-compose')) {
            return await this.analyzeComposeFiles();
        }
        if (lowerRequest.includes('container') || lowerRequest.includes('running')) {
            return await this.checkContainers();
        }
        if (lowerRequest.includes('image') || lowerRequest.includes('images')) {
            return await this.analyzeImages();
        }
        if (lowerRequest.includes('optimize') || lowerRequest.includes('otimizar')) {
            return await this.optimizeDocker();
        }
        if (lowerRequest.includes('security') || lowerRequest.includes('segurança')) {
            return await this.securityAudit();
        }
        return await this.generalDockerAnalysis();
    }
    async analyzeDockerfiles() {
        console.log('🔍 Analyzing Dockerfiles...');
        // Buscar todos os Dockerfiles
        const dockerfiles = await this.findDockerfiles();
        let analysis = '# 📋 Análise de Dockerfiles\n\n';
        for (const dockerfile of dockerfiles) {
            const content = await fs.readFile(dockerfile, 'utf-8');
            analysis += await this.analyzeDockerfileContent(dockerfile, content);
        }
        // Usar MCP para análise avançada
        if (this.mcpClient.isConnected()) {
            try {
                const mcpAnalysis = await this.mcpClient.callTool('docker_analyze', {
                    files: dockerfiles,
                    checks: ['security', 'best-practices', 'optimization']
                });
                analysis += '\n## 🤖 Análise MCP Docker\n' + mcpAnalysis;
            }
            catch (error) {
                console.error('MCP analysis error:', error);
            }
        }
        return analysis;
    }
    async analyzeDockerfileContent(filePath, content) {
        const lines = content.split('\n');
        const issues = [];
        const recommendations = [];
        // Análises de boas práticas
        let hasUserInstruction = false;
        let hasHealthcheck = false;
        let hasCopyBeforeRun = false;
        let lastInstruction = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            // Verificar USER instruction
            if (trimmed.startsWith('USER ')) {
                hasUserInstruction = true;
            }
            // Verificar HEALTHCHECK
            if (trimmed.startsWith('HEALTHCHECK')) {
                hasHealthcheck = true;
            }
            // Verificar ordem COPY/RUN
            if (trimmed.startsWith('COPY') && lastInstruction === 'RUN') {
                hasCopyBeforeRun = true;
            }
            // Verificar múltiplos RUN
            if (trimmed.startsWith('RUN') && lastInstruction === 'RUN') {
                issues.push('⚠️ Múltiplos comandos RUN consecutivos (aumenta layers)');
            }
            // Verificar apt-get update sem install
            if (trimmed.includes('apt-get update') && !trimmed.includes('apt-get install')) {
                issues.push('⚠️ apt-get update sem install no mesmo RUN');
            }
            // Verificar sudo
            if (trimmed.includes('sudo')) {
                issues.push('⚠️ Uso de sudo detectado (desnecessário em containers)');
            }
            lastInstruction = trimmed.split(' ')[0];
        }
        // Gerar recomendações
        if (!hasUserInstruction) {
            recommendations.push('🔒 Adicionar instrução USER para não rodar como root');
        }
        if (!hasHealthcheck) {
            recommendations.push('💊 Adicionar HEALTHCHECK para monitoramento');
        }
        if (hasCopyBeforeRun) {
            recommendations.push('📦 Considerar reordenar COPY após RUN para melhor cache');
        }
        let result = `\n## 📄 ${path.relative(this.projectRoot, filePath)}\n`;
        if (issues.length > 0) {
            result += '\n### ⚠️ Problemas Encontrados:\n';
            issues.forEach(issue => result += `- ${issue}\n`);
        }
        if (recommendations.length > 0) {
            result += '\n### 💡 Recomendações:\n';
            recommendations.forEach(rec => result += `- ${rec}\n`);
        }
        return result;
    }
    async findDockerfiles() {
        const dockerfiles = [];
        async function searchDir(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await searchDir(fullPath);
                }
                else if (entry.isFile() && (entry.name === 'Dockerfile' || entry.name.startsWith('Dockerfile.'))) {
                    dockerfiles.push(fullPath);
                }
            }
        }
        await searchDir(this.projectRoot);
        return dockerfiles;
    }
    async analyzeComposeFiles() {
        var _a;
        console.log('🔍 Analyzing Docker Compose files...');
        const composeFiles = await this.findComposeFiles();
        let analysis = '# 📋 Análise de Docker Compose\n\n';
        for (const file of composeFiles) {
            const content = await fs.readFile(file, 'utf-8');
            analysis += `\n## 📄 ${path.relative(this.projectRoot, file)}\n`;
            // Análise básica
            if (content.includes('version:')) {
                const version = (_a = content.match(/version:\s*['"]?(\d+\.?\d*)/)) === null || _a === void 0 ? void 0 : _a[1];
                analysis += `- Version: ${version || 'não detectada'}\n`;
            }
            // Contar serviços
            const services = content.match(/^\s{2}\w+:/gm);
            if (services) {
                analysis += `- Serviços: ${services.length}\n`;
                analysis += `  - ${services.map(s => s.trim().replace(':', '')).join(', ')}\n`;
            }
            // Verificar volumes
            if (content.includes('volumes:')) {
                analysis += '- ✅ Volumes configurados\n';
            }
            // Verificar networks
            if (content.includes('networks:')) {
                analysis += '- ✅ Networks customizadas\n';
            }
            // Verificar healthchecks
            const healthchecks = content.match(/healthcheck:/gi);
            if (healthchecks) {
                analysis += `- 💊 Healthchecks: ${healthchecks.length} serviços\n`;
            }
        }
        return analysis;
    }
    async findComposeFiles() {
        const composeFiles = [];
        async function searchDir(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await searchDir(fullPath);
                }
                else if (entry.isFile() &&
                    (entry.name === 'docker-compose.yml' ||
                        entry.name === 'docker-compose.yaml' ||
                        entry.name.startsWith('docker-compose.'))) {
                    composeFiles.push(fullPath);
                }
            }
        }
        await searchDir(this.projectRoot);
        return composeFiles;
    }
    async checkContainers() {
        console.log('🔍 Checking running containers...');
        let analysis = '# 🐋 Status dos Containers\n\n';
        try {
            // Listar containers em execução com formato personalizado para extrair portas
            const { stdout: runningData } = await execAsync('docker ps --format "{{.Names}}|||{{.Status}}|||{{.Ports}}"');
            // Processar e salvar informações de portas
            const containers = runningData.trim().split('\n').filter(line => line);
            const portMappings = {};
            for (const container of containers) {
                const [name, status, ports] = container.split('|||');
                if (ports && ports.trim()) {
                    // Extrair portas (formato: "0.0.0.0:3000->3000/tcp, 0.0.0.0:3001->3001/tcp")
                    const portList = ports.split(',').map(p => {
                        const match = p.match(/(\d+\.\d+\.\d+\.\d+:)?(\d+)->(\d+)/);
                        return match ? match[2] : null;
                    }).filter(Boolean);
                    if (portList.length > 0) {
                        portMappings[name] = portList;
                    }
                }
            }
            // Salvar informações de portas na memória
            if (Object.keys(portMappings).length > 0) {
                try {
                    // Usar API REST do Mem0 Bridge diretamente
                    const memoryData = {
                        user_id: MemoryNamespaces.AGENT('docker-specialist'),
                        content: `Portas dos serviços Docker: ${JSON.stringify(portMappings)}`,
                        category: 'docker-ports',
                        tags: ['docker', 'ports', 'services'],
                        metadata: {
                            portMappings,
                            timestamp: new Date().toISOString(),
                            source: 'docker-ps'
                        }
                    };
                    const response = await fetch('http://localhost:3002/mcp/add_memory', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(memoryData)
                    });
                    if (response.ok) {
                        console.log('✅ Portas dos serviços salvas na memória:', portMappings);
                    }
                    else {
                        console.error('Erro ao salvar portas na memória:', await response.text());
                    }
                }
                catch (error) {
                    console.error('Erro ao salvar portas na memória:', error);
                }
            }
            // Listar containers em execução (formato de tabela para exibição)
            const { stdout: running } = await execAsync('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"');
            analysis += '## ✅ Containers em Execução:\n```\n' + running + '```\n';
            // Adicionar informação sobre portas salvas
            if (Object.keys(portMappings).length > 0) {
                analysis += '\n### 📌 Portas Mapeadas (salvas na memória):\n';
                for (const [container, ports] of Object.entries(portMappings)) {
                    analysis += `- **${container}**: ${ports.join(', ')}\n`;
                }
                analysis += '\n';
            }
            // Listar todos os containers
            const { stdout: all } = await execAsync('docker ps -a --format "table {{.Names}}\t{{.Status}}" | head -10');
            analysis += '\n## 📦 Todos os Containers (últimos 10):\n```\n' + all + '```\n';
            // Estatísticas de uso
            const { stdout: stats } = await execAsync('docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"');
            analysis += '\n## 📊 Estatísticas de Uso:\n```\n' + stats + '```\n';
        }
        catch (error) {
            analysis += '\n⚠️ Erro ao acessar Docker. Verifique se o Docker está em execução.\n';
        }
        return analysis;
    }
    async analyzeImages() {
        console.log('🔍 Analyzing Docker images...');
        let analysis = '# 🖼️ Análise de Imagens Docker\n\n';
        try {
            // Listar imagens
            const { stdout: images } = await execAsync('docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -20');
            analysis += '## 📦 Imagens Disponíveis (top 20):\n```\n' + images + '```\n';
            // Imagens sem uso (dangling)
            const { stdout: dangling } = await execAsync('docker images -f "dangling=true" -q | wc -l');
            const danglingCount = parseInt(dangling.trim());
            if (danglingCount > 0) {
                analysis += `\n⚠️ **${danglingCount} imagens órfãs encontradas**\n`;
                analysis += 'Execute `docker image prune` para limpar\n';
            }
            // Espaço usado
            const { stdout: dfOutput } = await execAsync('docker system df');
            analysis += '\n## 💾 Uso de Espaço:\n```\n' + dfOutput + '```\n';
        }
        catch (error) {
            analysis += '\n⚠️ Erro ao analisar imagens Docker.\n';
        }
        return analysis;
    }
    async optimizeDocker() {
        console.log('🔧 Generating Docker optimization recommendations...');
        let recommendations = '# 🚀 Recomendações de Otimização Docker\n\n';
        // Analisar Dockerfiles para otimizações
        const dockerfiles = await this.findDockerfiles();
        recommendations += '## 📦 Otimizações de Build:\n\n';
        recommendations += '### 1. Multi-stage Builds\n';
        recommendations += '```dockerfile\n';
        recommendations += '# Build stage\n';
        recommendations += 'FROM node:18-alpine AS builder\n';
        recommendations += 'WORKDIR /app\n';
        recommendations += 'COPY package*.json ./\n';
        recommendations += 'RUN npm ci --only=production\n\n';
        recommendations += '# Production stage\n';
        recommendations += 'FROM node:18-alpine\n';
        recommendations += 'WORKDIR /app\n';
        recommendations += 'COPY --from=builder /app/node_modules ./node_modules\n';
        recommendations += 'COPY . .\n';
        recommendations += 'CMD ["node", "index.js"]\n';
        recommendations += '```\n\n';
        recommendations += '### 2. Layer Caching\n';
        recommendations += '- Copiar package.json antes do código\n';
        recommendations += '- Agrupar comandos RUN\n';
        recommendations += '- Ordenar instruções da menos para mais frequente mudança\n\n';
        recommendations += '### 3. Redução de Tamanho\n';
        recommendations += '- Usar imagens Alpine\n';
        recommendations += '- Limpar cache do gerenciador de pacotes\n';
        recommendations += '- Remover arquivos desnecessários\n\n';
        // Verificar uso atual
        try {
            const { stdout: systemDf } = await execAsync('docker system df');
            recommendations += '## 💾 Limpeza Recomendada:\n```\n' + systemDf + '```\n\n';
            recommendations += '### Comandos de Limpeza:\n';
            recommendations += '```bash\n';
            recommendations += '# Remover containers parados\n';
            recommendations += 'docker container prune -f\n\n';
            recommendations += '# Remover imagens não utilizadas\n';
            recommendations += 'docker image prune -a -f\n\n';
            recommendations += '# Limpeza completa\n';
            recommendations += 'docker system prune -a -f --volumes\n';
            recommendations += '```\n';
        }
        catch (error) {
            recommendations += '\n⚠️ Não foi possível verificar o uso atual do Docker.\n';
        }
        return recommendations;
    }
    async securityAudit() {
        console.log('🔒 Performing Docker security audit...');
        let audit = '# 🔒 Auditoria de Segurança Docker\n\n';
        // Verificar Dockerfiles
        const dockerfiles = await this.findDockerfiles();
        audit += '## 📄 Análise de Dockerfiles:\n\n';
        for (const dockerfile of dockerfiles) {
            const content = await fs.readFile(dockerfile, 'utf-8');
            const securityIssues = [];
            // Verificações de segurança
            if (!content.includes('USER ')) {
                securityIssues.push('❌ Executando como root (adicionar USER)');
            }
            if (content.match(/COPY.*\*/)) {
                securityIssues.push('⚠️ COPY com wildcard pode expor arquivos sensíveis');
            }
            if (content.includes('latest')) {
                securityIssues.push('⚠️ Usando tag "latest" (especificar versão)');
            }
            if (content.match(/ENV.*PASSWORD|TOKEN|KEY/i)) {
                securityIssues.push('🚨 Possíveis credenciais em ENV');
            }
            if (!content.includes('HEALTHCHECK')) {
                securityIssues.push('💊 Sem HEALTHCHECK definido');
            }
            if (securityIssues.length > 0) {
                audit += `### ${path.relative(this.projectRoot, dockerfile)}\n`;
                securityIssues.forEach(issue => audit += `- ${issue}\n`);
                audit += '\n';
            }
        }
        // Verificar configurações do daemon
        audit += '## 🔧 Configurações do Docker Daemon:\n\n';
        audit += '### Recomendações:\n';
        audit += '- ✅ Habilitar user namespaces\n';
        audit += '- ✅ Configurar logging driver\n';
        audit += '- ✅ Limitar recursos por container\n';
        audit += '- ✅ Usar secrets ao invés de env vars\n';
        audit += '- ✅ Habilitar Content Trust (DOCKER_CONTENT_TRUST=1)\n\n';
        // Exemplo de docker-compose seguro
        audit += '## 📝 Exemplo de docker-compose.yml seguro:\n';
        audit += '```yaml\n';
        audit += 'version: "3.8"\n';
        audit += 'services:\n';
        audit += '  app:\n';
        audit += '    image: myapp:1.0.0  # Versão específica\n';
        audit += '    user: "1000:1000"   # Non-root user\n';
        audit += '    read_only: true     # Filesystem read-only\n';
        audit += '    security_opt:\n';
        audit += '      - no-new-privileges:true\n';
        audit += '    cap_drop:\n';
        audit += '      - ALL\n';
        audit += '    cap_add:\n';
        audit += '      - NET_BIND_SERVICE\n';
        audit += '    healthcheck:\n';
        audit += '      test: ["CMD", "curl", "-f", "http://localhost/health"]\n';
        audit += '      interval: 30s\n';
        audit += '    deploy:\n';
        audit += '      resources:\n';
        audit += '        limits:\n';
        audit += '          cpus: "0.5"\n';
        audit += '          memory: 512M\n';
        audit += '```\n';
        return audit;
    }
    async generalDockerAnalysis() {
        console.log('📊 Performing general Docker analysis...');
        let analysis = '# 🐋 Análise Geral Docker\n\n';
        // Resumo do projeto
        const dockerfiles = await this.findDockerfiles();
        const composeFiles = await this.findComposeFiles();
        analysis += '## 📊 Resumo do Projeto:\n';
        analysis += `- Dockerfiles encontrados: ${dockerfiles.length}\n`;
        analysis += `- Docker Compose files: ${composeFiles.length}\n\n`;
        // Listar arquivos
        if (dockerfiles.length > 0) {
            analysis += '### 📄 Dockerfiles:\n';
            dockerfiles.forEach(f => analysis += `- ${path.relative(this.projectRoot, f)}\n`);
            analysis += '\n';
        }
        if (composeFiles.length > 0) {
            analysis += '### 📄 Docker Compose:\n';
            composeFiles.forEach(f => analysis += `- ${path.relative(this.projectRoot, f)}\n`);
            analysis += '\n';
        }
        // Ações disponíveis
        analysis += '## 🛠️ Ações Disponíveis:\n\n';
        analysis += '1. **Análise de Dockerfiles** - Verificar boas práticas\n';
        analysis += '2. **Análise de Compose** - Revisar orquestração\n';
        analysis += '3. **Status de Containers** - Ver containers em execução\n';
        analysis += '4. **Análise de Imagens** - Verificar imagens e uso de espaço\n';
        analysis += '5. **Otimização** - Receber dicas de otimização\n';
        analysis += '6. **Segurança** - Auditoria de segurança\n\n';
        analysis += '💡 **Dica**: Peça uma análise específica para obter informações detalhadas!\n';
        return analysis;
    }
    async shutdown() {
        if (this.mcpClient.isConnected()) {
            await this.mcpClient.disconnect();
        }
        console.log('🐋 Docker Specialist Agent shutdown complete');
    }
}
// Executar se chamado diretamente
if (require.main === module) {
    const agent = new DockerSpecialistAgent();
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
