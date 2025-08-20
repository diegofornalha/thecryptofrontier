#!/usr/bin/env npx tsx

import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3011;
const GUARDIAN_API_URL = process.env.GUARDIAN_API_URL || 'http://guardian-orchestrator:3000';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        agent: 'guardian-bridge',
        version: '1.0.0',
        guardianUrl: GUARDIAN_API_URL
    });
});

// Request analysis endpoint
app.post('/request-analysis', async (req, res) => {
    try {
        console.log('🔗 Solicitando análise ao Guardian...');
        
        // Simular resposta por enquanto
        const mockStatus = {
            status: 'active',
            score: 97,
            lastRun: new Date().toISOString(),
            issues: Math.floor(Math.random() * 5)
        };
        
        res.json({
            success: true,
            analysis: mockStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get Guardian status
app.get('/guardian-status', async (req, res) => {
    try {
        // Tentar conectar ao Guardian real
        const response = await fetch(`${GUARDIAN_API_URL}/health`);
        const health = await response.json();
        
        res.json({
            connected: true,
            guardian: health
        });
    } catch (error) {
        res.json({
            connected: false,
            error: 'Guardian not reachable'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Guardian Bridge Service running on port ${PORT}`);
    console.log(`Connecting to Guardian at: ${GUARDIAN_API_URL}`);
});