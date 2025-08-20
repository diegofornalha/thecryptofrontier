#!/usr/bin/env npx tsx
import express from 'express';
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3010;
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        agent: 'mcp-direct-agent',
        version: '1.0.0',
        note: 'Standalone MCP agent service'
    });
});
// Process endpoint
app.post('/process', async (req, res) => {
    try {
        const { tool, params } = req.body;
        res.json({
            success: true,
            message: `MCP Direct Agent would execute ${tool} with params`,
            tool,
            params,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Info endpoint
app.get('/info', (req, res) => {
    res.json({
        agent: 'MCP Direct Agent',
        version: '1.0.0',
        description: 'Direct MCP tool execution without Claude API',
        capabilities: [
            'direct-tool-execution',
            'sequential-processing',
            'parallel-processing'
        ]
    });
});
app.listen(PORT, () => {
    console.log(`MCP Direct Agent Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
