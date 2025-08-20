/**
 * Guardian API Server
 * Expõe o Guardian Orchestrator via API REST
 */

import express from 'express';
import cors from 'cors';
import { GuardianOrchestratorMCP } from './guardian-orchestrator-mcp';

const app = express();
const port = process.env.GUARDIAN_API_PORT || 3000;

app.use(cors());
app.use(express.json());

// Instância do Guardian
let guardian: GuardianOrchestratorMCP | null = null;
let isProcessing = false;

// Inicializar Guardian
async function initializeGuardian() {
  if (!guardian) {
    guardian = new GuardianOrchestratorMCP();
    await guardian.initialize();
  }
  return guardian;
}

// Health check
app.get('/health', async (req, res) => {
  try {
    const g = await initializeGuardian();
    res.json({
      status: 'ok',
      service: 'guardian-orchestrator',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      projectRoot: process.env.PROJECT_ROOT || '/workspace',
      isProcessing
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

// Processar mensagem
app.post('/analyze', async (req, res) => {
  if (isProcessing) {
    return res.status(429).json({
      error: 'Guardian is already processing a request'
    });
  }

  try {
    isProcessing = true;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const g = await initializeGuardian();
    console.log('Processing message:', message);
    const messageObj = { 
      role: 'user' as const, 
      content: message 
    };
    console.log('Message object:', messageObj);
    const result = await g.processMessage(messageObj);
    
    res.json({
      success: true,
      message,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  } finally {
    isProcessing = false;
  }
});

// Listar agentes
app.get('/agents', async (req, res) => {
  try {
    const g = await initializeGuardian();
    const specialists = Array.from(g['specialists'].keys());
    
    res.json({
      agents: specialists,
      total: specialists.length
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Status do sistema
app.get('/status', async (req, res) => {
  try {
    const g = await initializeGuardian();
    
    res.json({
      status: 'ok',
      isProcessing,
      mcpConnected: g['mcpBridge'] ? true : false,
      specialists: Array.from(g['specialists'].keys()),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        projectRoot: process.env.PROJECT_ROOT || '/workspace'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🛡️ Guardian API Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔧 Analyze endpoint: POST http://localhost:${port}/analyze`);
  console.log(`👥 Agents list: http://localhost:${port}/agents`);
  console.log(`📈 System status: http://localhost:${port}/status`);
});