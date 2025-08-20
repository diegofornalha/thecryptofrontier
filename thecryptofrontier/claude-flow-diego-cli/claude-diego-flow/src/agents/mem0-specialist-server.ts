#!/usr/bin/env npx tsx

import express from 'express';
import { Mem0SpecialistAgent } from './mem0-specialist-agent';
import { Message } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const agent = new Mem0SpecialistAgent();

// Inicializar agente
async function initialize() {
    console.log('🧠 Inicializando Mem0 Specialist Server...');
    await agent.initialize();
    console.log('✅ Agente inicializado com sucesso');
}

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Verificar se os serviços estão disponíveis
        const mem0BridgeUrl = process.env.MEM0_BRIDGE_URL || 'http://mem0-bridge:3002';
        const chromaUrl = process.env.CHROMA_URL || 'http://mem0-chroma:8000';
        
        const checks = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                mem0Bridge: false,
                chroma: false
            }
        };
        
        // Verificar mem0-bridge
        try {
            const bridgeResponse = await fetch(`${mem0BridgeUrl}/health`);
            checks.services.mem0Bridge = bridgeResponse.ok;
        } catch (e) {
            // Service not available
        }
        
        // Verificar chroma
        try {
            const chromaResponse = await fetch(`${chromaUrl}/api/v1/heartbeat`);
            checks.services.chroma = chromaResponse.ok;
        } catch (e) {
            // Service not available
        }
        
        // Status geral
        const allHealthy = Object.values(checks.services).every(v => v);
        checks.status = allHealthy ? 'healthy' : 'degraded';
        
        res.status(allHealthy ? 200 : 503).json(checks);
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Info endpoint
app.get('/info', (req, res) => {
    res.json({
        name: 'Mem0 Specialist',
        version: '1.0.0',
        description: 'Especialista em gerenciamento de memórias',
        capabilities: [
            'memory-management',
            'memory-search',
            'memory-categorization',
            'memory-cleanup',
            'service-monitoring',
            'memory-backup',
            'memory-restore',
            'memory-analytics'
        ],
        endpoints: {
            health: '/health',
            info: '/info',
            command: '/command',
            listMemories: '/memories',
            searchMemories: '/memories/search',
            statistics: '/statistics',
            servicesHealth: '/services/health',
            backup: '/backup',
            monitor: '/monitor/report'
        }
    });
});

// Command endpoint - processa comandos em linguagem natural
app.post('/command', async (req, res) => {
    try {
        const { command } = req.body;
        
        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }
        
        console.log(`📥 Comando recebido: ${command}`);
        
        const message: Message = {
            role: 'user',
            content: command,
            metadata: {
                source: 'http-api',
                timestamp: new Date().toISOString()
            }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            command: command,
            response: response.content,
            metadata: response.metadata
        });
    } catch (error) {
        console.error('Erro ao processar comando:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// List memories endpoint
app.get('/memories', async (req, res) => {
    try {
        const message: Message = {
            role: 'user',
            content: 'listar memórias',
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            memories: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Search memories endpoint
app.post('/memories/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const message: Message = {
            role: 'user',
            content: `buscar ${query}`,
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            query: query,
            results: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Statistics endpoint
app.get('/statistics', async (req, res) => {
    try {
        const message: Message = {
            role: 'user',
            content: 'estatísticas',
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            statistics: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Services health endpoint
app.get('/services/health', async (req, res) => {
    try {
        const message: Message = {
            role: 'user',
            content: 'verificar saúde',
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            health: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Backup endpoint
app.post('/backup', async (req, res) => {
    try {
        const message: Message = {
            role: 'user',
            content: 'fazer backup',
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            backup: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Monitor report endpoint
app.get('/monitor/report', async (req, res) => {
    try {
        // Executar o monitor para gerar relatório
        const { stdout } = await execAsync('npx tsx src/agents/mem0-monitor.ts report');
        
        res.json({
            success: true,
            report: stdout
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Instructions endpoints
app.get('/instructions', async (req, res) => {
    try {
        const message: Message = {
            role: 'user',
            content: 'ver instruções',
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            instructions: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

app.post('/instructions', async (req, res) => {
    try {
        const { instructions } = req.body;
        
        if (!instructions) {
            return res.status(400).json({ error: 'Instructions are required' });
        }
        
        const message: Message = {
            role: 'user',
            content: `definir instruções: ${instructions}`,
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            message: 'Instructions updated',
            response: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

app.delete('/instructions', async (req, res) => {
    try {
        const message: Message = {
            role: 'user',
            content: 'remover instruções',
            metadata: { source: 'http-api' }
        };
        
        const response = await agent.processMessage(message);
        
        res.json({
            success: true,
            message: 'Instructions cleared',
            response: response.content
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: {
            health: 'GET /health',
            info: 'GET /info',
            command: 'POST /command',
            listMemories: 'GET /memories',
            searchMemories: 'POST /memories/search',
            statistics: 'GET /statistics',
            servicesHealth: 'GET /services/health',
            backup: 'POST /backup',
            monitorReport: 'GET /monitor/report',
            getInstructions: 'GET /instructions',
            setInstructions: 'POST /instructions',
            deleteInstructions: 'DELETE /instructions'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM recebido, iniciando shutdown...');
    await agent.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT recebido, iniciando shutdown...');
    await agent.shutdown();
    process.exit(0);
});

// Iniciar servidor
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Mem0 Specialist Server rodando na porta ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
        console.log(`📍 Info: http://localhost:${PORT}/info`);
        console.log(`📍 Command: POST http://localhost:${PORT}/command`);
    });
}).catch(error => {
    console.error('❌ Erro ao inicializar:', error);
    process.exit(1);
});