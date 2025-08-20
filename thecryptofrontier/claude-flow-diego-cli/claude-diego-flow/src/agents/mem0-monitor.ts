#!/usr/bin/env npx tsx

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface ServiceStatus {
    name: string;
    container: string;
    running: boolean;
    health?: string;
    cpu?: string;
    memory?: string;
    uptime?: string;
    error?: string;
}

interface MemoryStats {
    total: number;
    byCategory: Record<string, number>;
    byAgent: Record<string, number>;
    recent24h: number;
    recent7d: number;
}

/**
 * Monitor do Sistema Mem0
 * 
 * Monitora continuamente a saúde dos serviços Mem0 e gera relatórios
 */
export class Mem0Monitor {
    private mem0BridgeUrl: string;
    private chromaUrl: string;
    private logDir: string;

    constructor() {
        this.mem0BridgeUrl = process.env.MEM0_BRIDGE_URL || 'http://localhost:3002';
        this.chromaUrl = 'http://localhost:8005';
        this.logDir = '/home/strapi/thecryptofrontier/logs/mem0';
    }

    async initialize(): Promise<void> {
        // Criar diretório de logs se não existir
        await fs.mkdir(this.logDir, { recursive: true });
        console.log(`📁 Logs serão salvos em: ${this.logDir}`);
    }

    async checkServiceStatus(): Promise<ServiceStatus[]> {
        const services = [
            { name: 'Mem0 Bridge', container: 'mem0-bridge' },
            { name: 'ChromaDB', container: 'mem0-chroma' }
        ];

        const statuses: ServiceStatus[] = [];

        for (const service of services) {
            const status: ServiceStatus = {
                name: service.name,
                container: service.container,
                running: false
            };

            try {
                // Verificar se está rodando
                const { stdout: psOutput } = await execAsync(
                    `docker ps --filter name=${service.container} --format "{{.Status}}"`
                );
                
                if (psOutput.trim()) {
                    status.running = true;
                    status.health = psOutput.trim();
                    
                    // Obter estatísticas
                    try {
                        const { stdout: statsOutput } = await execAsync(
                            `docker stats ${service.container} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}"`
                        );
                        const [cpu, memory] = statsOutput.trim().split('|');
                        status.cpu = cpu;
                        status.memory = memory;
                    } catch (e) {
                        // Ignore stats errors
                    }
                    
                    // Obter uptime
                    try {
                        const { stdout: uptimeOutput } = await execAsync(
                            `docker inspect -f '{{.State.StartedAt}}' ${service.container}`
                        );
                        const started = new Date(uptimeOutput.trim());
                        const uptime = Date.now() - started.getTime();
                        status.uptime = this.formatUptime(uptime);
                    } catch (e) {
                        // Ignore uptime errors
                    }
                }
            } catch (error) {
                status.error = error.toString();
            }

            statuses.push(status);
        }

        return statuses;
    }

    async getMemoryStats(): Promise<MemoryStats | null> {
        try {
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: '*',
                    limit: 10000
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch memories: ${response.status}`);
            }

            const data = await response.json();
            const memories = data.memories || [];

            // Calcular estatísticas
            const byCategory: Record<string, number> = {};
            const byAgent: Record<string, number> = {};
            
            memories.forEach((mem: any) => {
                // Por categoria
                const category = mem.category || 'uncategorized';
                byCategory[category] = (byCategory[category] || 0) + 1;
                
                // Por agente
                const agent = mem.user_id?.split('/').pop() || 'unknown';
                byAgent[agent] = (byAgent[agent] || 0) + 1;
            });

            // Atividade recente
            const now = Date.now();
            const recent24h = memories.filter((mem: any) => {
                const created = new Date(mem.created_at);
                return (now - created.getTime()) < 24 * 60 * 60 * 1000;
            }).length;

            const recent7d = memories.filter((mem: any) => {
                const created = new Date(mem.created_at);
                return (now - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length;

            return {
                total: memories.length,
                byCategory,
                byAgent,
                recent24h,
                recent7d
            };
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }

    async generateReport(): Promise<string> {
        const timestamp = new Date().toISOString();
        let report = `# 📊 Relatório de Monitoramento Mem0\n`;
        report += `📅 ${timestamp}\n\n`;

        // Status dos serviços
        report += `## 🔧 Status dos Serviços\n\n`;
        const services = await this.checkServiceStatus();
        
        for (const service of services) {
            report += `### ${service.name}\n`;
            report += `- **Container**: ${service.container}\n`;
            report += `- **Status**: ${service.running ? '✅ Rodando' : '❌ Parado'}\n`;
            
            if (service.running) {
                report += `- **Saúde**: ${service.health}\n`;
                if (service.cpu) report += `- **CPU**: ${service.cpu}\n`;
                if (service.memory) report += `- **Memória**: ${service.memory}\n`;
                if (service.uptime) report += `- **Uptime**: ${service.uptime}\n`;
            }
            
            if (service.error) {
                report += `- **Erro**: ${service.error}\n`;
            }
            
            report += '\n';
        }

        // Estatísticas de memórias
        report += `## 💾 Estatísticas de Memórias\n\n`;
        const stats = await this.getMemoryStats();
        
        if (stats) {
            report += `- **Total de memórias**: ${stats.total}\n`;
            report += `- **Últimas 24h**: ${stats.recent24h}\n`;
            report += `- **Últimos 7 dias**: ${stats.recent7d}\n\n`;
            
            report += `### Por Categoria:\n`;
            Object.entries(stats.byCategory)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .forEach(([cat, count]) => {
                    report += `- ${cat}: ${count}\n`;
                });
            
            report += `\n### Por Agente:\n`;
            Object.entries(stats.byAgent)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .forEach(([agent, count]) => {
                    report += `- ${agent}: ${count}\n`;
                });
        } else {
            report += `⚠️ Não foi possível obter estatísticas de memórias\n`;
        }

        // Alertas
        report += `\n## 🚨 Alertas\n\n`;
        let hasAlerts = false;
        
        // Verificar serviços parados
        const stoppedServices = services.filter(s => !s.running);
        if (stoppedServices.length > 0) {
            hasAlerts = true;
            report += `⚠️ **Serviços parados**: ${stoppedServices.map(s => s.name).join(', ')}\n`;
        }
        
        // Verificar memória alta
        for (const service of services) {
            if (service.memory) {
                const match = service.memory.match(/(\d+\.?\d*)MiB\s*\/\s*(\d+\.?\d*)MiB/);
                if (match) {
                    const used = parseFloat(match[1]);
                    const total = parseFloat(match[2]);
                    const percent = (used / total) * 100;
                    
                    if (percent > 80) {
                        hasAlerts = true;
                        report += `⚠️ **${service.name}**: Uso de memória alto (${percent.toFixed(1)}%)\n`;
                    }
                }
            }
        }
        
        if (!hasAlerts) {
            report += `✅ Nenhum alerta no momento\n`;
        }

        return report;
    }

    async saveReport(report: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `mem0-report-${timestamp}.md`;
        const filepath = path.join(this.logDir, filename);
        
        await fs.writeFile(filepath, report, 'utf-8');
        return filepath;
    }

    async monitorContinuously(intervalMinutes: number = 15): Promise<void> {
        console.log(`🔄 Iniciando monitoramento contínuo (a cada ${intervalMinutes} minutos)`);
        
        const runMonitor = async () => {
            console.log(`\n⏰ ${new Date().toISOString()} - Executando verificação...`);
            
            const report = await this.generateReport();
            const filepath = await this.saveReport(report);
            
            console.log(`✅ Relatório salvo em: ${filepath}`);
            
            // Verificar alertas críticos
            const services = await this.checkServiceStatus();
            const stoppedServices = services.filter(s => !s.running);
            
            if (stoppedServices.length > 0) {
                console.error(`\n🚨 ALERTA: Serviços parados detectados!`);
                stoppedServices.forEach(s => {
                    console.error(`   - ${s.name} (${s.container})`);
                });
                console.error(`\n   Execute: docker-compose -f infrastructure-docker/docker-yml/docker-compose.yml up -d`);
            }
        };
        
        // Executar imediatamente
        await runMonitor();
        
        // Configurar intervalo
        setInterval(runMonitor, intervalMinutes * 60 * 1000);
    }

    private formatUptime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m`;
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const monitor = new Mem0Monitor();
    
    async function run() {
        await monitor.initialize();
        
        const args = process.argv.slice(2);
        const command = args[0] || 'report';
        
        switch (command) {
            case 'report':
                // Gerar relatório único
                const report = await monitor.generateReport();
                console.log(report);
                const filepath = await monitor.saveReport(report);
                console.log(`\n📄 Relatório salvo em: ${filepath}`);
                break;
                
            case 'monitor':
                // Monitoramento contínuo
                const interval = parseInt(args[1]) || 15;
                await monitor.monitorContinuously(interval);
                break;
                
            case 'status':
                // Status rápido
                const services = await monitor.checkServiceStatus();
                console.log('\n🔍 Status Rápido dos Serviços:');
                services.forEach(s => {
                    console.log(`${s.running ? '✅' : '❌'} ${s.name}: ${s.health || 'Parado'}`);
                });
                break;
                
            default:
                console.log('Uso: mem0-monitor [comando] [opções]');
                console.log('Comandos:');
                console.log('  report   - Gerar relatório completo');
                console.log('  monitor [minutos] - Monitoramento contínuo (padrão: 15 min)');
                console.log('  status   - Status rápido dos serviços');
        }
    }
    
    run().catch(console.error);
}