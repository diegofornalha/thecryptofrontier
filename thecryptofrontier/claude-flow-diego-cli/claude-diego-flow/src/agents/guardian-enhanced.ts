#!/usr/bin/env npx tsx

import express from 'express';
import cors from 'cors';
import { getLogRotationService } from '../services/log-rotation';
import { getMemoryBackupService } from '../services/memory-backup';
import { getCleanupService } from '../services/cleanup-service';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const logRotation = getLogRotationService({
  logDirectory: process.env.LOG_DIR || '/app/logs',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  maxAge: 30,
  compress: true
});

const memoryBackup = getMemoryBackupService({
  backupDirectory: process.env.BACKUP_DIR || '/app/backups',
  mem0Url: process.env.MEM0_URL || 'http://mem0-local:3002',
  maxBackups: 7,
  compress: true,
  scheduleInterval: 24 // Daily
});

const cleanupService = getCleanupService({
  projectRoot: process.env.PROJECT_PATH || '/workspace',
  archiveDirectory: '/workspace/archived-tests',
  dryRun: true, // Start in dry run mode for safety
  autoCleanInterval: 24 // Daily
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'guardian-enhanced',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      logRotation: 'active',
      memoryBackup: 'active',
      cleanup: 'active'
    }
  });
});

// Status endpoint
app.get('/status', async (req, res) => {
  try {
    const [logStatus, backupStatus] = await Promise.all([
      logRotation.getStatus(),
      memoryBackup.getBackupStatus()
    ]);
    
    res.json({
      services: {
        guardian: 'online',
        logRotation: logStatus ? 'active' : 'error',
        memoryBackup: backupStatus ? 'active' : 'error'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      logRotation: logStatus,
      memoryBackup: backupStatus
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      services: {
        guardian: 'online',
        logRotation: 'error',
        memoryBackup: 'error'
      }
    });
  }
});

// Log rotation endpoints
app.post('/logs/rotate', async (req, res) => {
  try {
    const { logName } = req.body;
    await logRotation.rotateNow(logName);
    res.json({ success: true, message: 'Log rotation triggered' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/logs/status', async (req, res) => {
  try {
    const status = await logRotation.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Memory backup endpoints
app.post('/backup/create', async (req, res) => {
  try {
    const backupPath = await memoryBackup.performBackup();
    res.json({ 
      success: true, 
      backupPath,
      message: 'Backup created successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/backup/restore', async (req, res) => {
  try {
    const { backupPath } = req.body;
    if (!backupPath) {
      return res.status(400).json({ error: 'backupPath is required' });
    }
    
    const success = await memoryBackup.restoreBackup(backupPath);
    res.json({ 
      success,
      message: success ? 'Backup restored successfully' : 'Restore failed' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/backup/list', async (req, res) => {
  try {
    const backups = await memoryBackup.listBackups();
    res.json({ backups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/backup/status', async (req, res) => {
  try {
    const status = await memoryBackup.getBackupStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup endpoints
app.get('/cleanup/suggestions', async (req, res) => {
  try {
    const suggestions = await cleanupService.getSuggestions();
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/cleanup/execute', async (req, res) => {
  try {
    const { dryRun = true, patterns } = req.body;
    const report = await cleanupService.cleanupNow({ dryRun, patterns });
    res.json({ 
      success: true,
      report,
      message: dryRun ? 'Dry run completed' : 'Cleanup executed'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze endpoint (placeholder for future implementation)
app.post('/analyze', async (req, res) => {
  const { url, task } = req.body;
  
  res.json({
    success: true,
    task: task || 'general-analysis',
    analysis: {
      url,
      status: 'enhanced-analysis',
      message: 'Guardian Enhanced Service Active',
      features: {
        logRotation: 'enabled',
        memoryBackup: 'enabled',
        monitoring: 'planned'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Start services
async function startServices() {
  console.log('🚀 Starting Guardian Enhanced Services...');
  
  try {
    // Start log rotation
    await logRotation.start(60); // Check every hour
    console.log('✅ Log rotation service started');
    
    // Start memory backup
    await memoryBackup.start();
    console.log('✅ Memory backup service started');
    
    // Start cleanup service
    await cleanupService.start();
    console.log('✅ Cleanup service started (dry run mode)');
    
  } catch (error) {
    console.error('❌ Error starting services:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🛡️ Guardian Enhanced running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`📁 Logs: http://localhost:${PORT}/logs/status`);
  console.log(`💾 Backups: http://localhost:${PORT}/backup/status`);
  console.log(`🧹 Cleanup: http://localhost:${PORT}/cleanup/suggestions`);
  
  // Start background services
  await startServices();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  logRotation.stop();
  memoryBackup.stop();
  cleanupService.stop();
  process.exit(0);
});

// If run directly
if (require.main === module) {
  console.log('🛡️ Starting Guardian Enhanced Service...');
}