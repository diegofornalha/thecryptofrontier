import * as fs from 'fs';
import * as path from 'path';
export class MCPUsageTracker {
    constructor() {
        this.logs = [];
        this.logFile = path.join(process.cwd(), 'logs', 'mcp-usage.json');
        this.loadLogs();
    }
    static getInstance() {
        if (!MCPUsageTracker.instance) {
            MCPUsageTracker.instance = new MCPUsageTracker();
        }
        return MCPUsageTracker.instance;
    }
    loadLogs() {
        try {
            if (fs.existsSync(this.logFile)) {
                const data = fs.readFileSync(this.logFile, 'utf-8');
                this.logs = JSON.parse(data);
            }
        }
        catch (error) {
            console.error('Error loading MCP logs:', error);
        }
    }
    saveLogs() {
        try {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.logFile, JSON.stringify(this.logs, null, 2));
        }
        catch (error) {
            console.error('Error saving MCP logs:', error);
        }
    }
    logAttempt(tool, caller, params, reason) {
        const log = {
            timestamp: new Date().toISOString(),
            tool,
            caller,
            params,
            result: 'skipped',
            reason: reason || 'MCP not available'
        };
        this.logs.push(log);
        this.saveLogs();
        console.log(`🔍 MCP Attempt: ${tool} by ${caller} - SKIPPED (${reason})`);
    }
    logCall(tool, caller, params) {
        const startTime = Date.now();
        const log = {
            timestamp: new Date().toISOString(),
            tool,
            caller,
            params,
            result: 'success'
        };
        console.log(`🚀 MCP Call: ${tool} by ${caller}`);
        return {
            complete: (success, error) => {
                log.duration = Date.now() - startTime;
                log.result = success ? 'success' : 'error';
                if (error) {
                    log.reason = error.message || error;
                }
                this.logs.push(log);
                this.saveLogs();
                console.log(`✅ MCP ${success ? 'Success' : 'Error'}: ${tool} (${log.duration}ms)`);
            }
        };
    }
    getStats() {
        const total = this.logs.length;
        const success = this.logs.filter(l => l.result === 'success').length;
        const errors = this.logs.filter(l => l.result === 'error').length;
        const skipped = this.logs.filter(l => l.result === 'skipped').length;
        const byTool = this.logs.reduce((acc, log) => {
            if (!acc[log.tool]) {
                acc[log.tool] = { total: 0, success: 0, error: 0, skipped: 0 };
            }
            acc[log.tool].total++;
            acc[log.tool][log.result]++;
            return acc;
        }, {});
        const byCaller = this.logs.reduce((acc, log) => {
            if (!acc[log.caller]) {
                acc[log.caller] = { total: 0, success: 0, error: 0, skipped: 0 };
            }
            acc[log.caller].total++;
            acc[log.caller][log.result]++;
            return acc;
        }, {});
        return {
            total,
            success,
            errors,
            skipped,
            successRate: total > 0 ? (success / total * 100).toFixed(2) + '%' : '0%',
            byTool,
            byCaller,
            lastCall: this.logs[this.logs.length - 1],
            recentCalls: this.logs.slice(-10)
        };
    }
    getRecentLogs(limit = 50) {
        return this.logs.slice(-limit);
    }
    getSuggestions() {
        const stats = this.getStats();
        const suggestions = [];
        if (stats.total === 0) {
            suggestions.push('Nenhuma tentativa de uso do MCP foi registrada');
            suggestions.push('Verifique se o MCPBridge está conectado');
            suggestions.push('Verifique se as condições para ativar MCP estão corretas');
        }
        if (stats.skipped > stats.success) {
            suggestions.push('Muitas chamadas MCP estão sendo puladas');
            suggestions.push('Verifique a conexão com o MCP Diego Tools');
        }
        if (stats.errors > 0) {
            suggestions.push(`${stats.errors} erros em chamadas MCP detectados`);
            suggestions.push('Verifique os logs de erro para mais detalhes');
        }
        // Analyze by tool
        Object.entries(stats.byTool).forEach(([tool, data]) => {
            if (data.error > data.success) {
                suggestions.push(`Ferramenta ${tool} tem mais erros que sucessos`);
            }
        });
        return suggestions;
    }
    // Helper para adicionar tracking a qualquer função
    static trackCall(toolName, caller) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            descriptor.value = async function (...args) {
                const tracker = MCPUsageTracker.getInstance();
                const tracking = tracker.logCall(toolName, caller, args[0]);
                try {
                    const result = await originalMethod.apply(this, args);
                    tracking.complete(true);
                    return result;
                }
                catch (error) {
                    tracking.complete(false, error);
                    throw error;
                }
            };
            return descriptor;
        };
    }
}
// Auto-start monitoring if run directly
if (require.main === module) {
    const tracker = MCPUsageTracker.getInstance();
    console.log('📊 MCP Usage Statistics:');
    console.log(JSON.stringify(tracker.getStats(), null, 2));
    console.log('\n💡 Suggestions:');
    tracker.getSuggestions().forEach(s => console.log(`- ${s}`));
    console.log('\n📜 Recent Logs:');
    tracker.getRecentLogs(10).forEach(log => {
        console.log(`${log.timestamp}: ${log.tool} (${log.result}) - ${log.reason || 'OK'}`);
    });
}
