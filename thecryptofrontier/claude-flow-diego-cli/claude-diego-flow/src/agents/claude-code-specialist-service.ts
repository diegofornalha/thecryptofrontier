#!/usr/bin/env npx tsx

import express from 'express';
import { ClaudeCodeSpecialistAgent } from './claude-code-specialist-agent';
import { Message } from '../types';

const app = express();
app.use(express.json());

const agent = new ClaudeCodeSpecialistAgent();
const PORT = process.env.PORT || 3008;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        agent: 'claude-code-specialist',
        version: '4.1.0'
    });
});

// Process message endpoint
app.post('/process', async (req, res) => {
    try {
        const { content, mode } = req.body;
        
        const message: Message = {
            role: 'user',
            content: content || 'analyze',
            metadata: {
                source: 'http',
                mode
            }
        };
        
        const response = await agent.processMessage(message);
        res.json({
            success: true,
            response: response.content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Info endpoint
app.get('/info', (req, res) => {
    res.json({
        agent: 'Claude Code Specialist',
        version: '4.1.0',
        capabilities: [
            'claude-code-best-practices',
            'memory-management',
            'code-conventions',
            'task-automation',
            'search-optimization',
            'tool-usage-efficiency',
            'security-compliance',
            'mode-switching',
            'slash-commands',
            'proactive-development'
        ],
        analyses: [
            'memory', 'conventions', 'security', 'tools',
            'productivity', 'artifacts', 'git-workflow',
            'banned-commands', 'verbosity', 'native-tools',
            'cli-commands', 'model-differences', 'citations',
            'search-guidelines'
        ]
    });
});

async function start() {
    await agent.initialize();
    
    app.listen(PORT, () => {
        console.log(`Claude Code Specialist Service running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Process message: POST http://localhost:${PORT}/process`);
        console.log(`Info: http://localhost:${PORT}/info`);
    });
}

start().catch(console.error);