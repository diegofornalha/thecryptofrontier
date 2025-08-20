/**
 * Servidor Web para Git+Memory Visualizer
 * 
 * Serve interface web para visualizar timeline Git+Memory
 * e oferece APIs para integração
 */

import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { GitMemoryIntegration } from '../utils/git-memory-integration';

export class GitMemoryServer {
  private app: express.Application;
  private gitMemory: GitMemoryIntegration;
  private port: number;

  constructor(port: number = 3005) {
    this.app = express();
    this.port = port;
    this.gitMemory = new GitMemoryIntegration();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname)));
    
    // Log das requisições
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Servir página principal
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'git-memory-visualizer.html'));
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'git-memory-server',
        port: this.port,
        timestamp: new Date().toISOString()
      });
    });

    // API: Obter timeline Git+Memory
    this.app.get('/api/timeline', async (req, res) => {
      try {
        const days = parseInt(req.query.days as string) || 7;
        const timeline = await this.gitMemory.createGitMemoryTimeline(days);
        
        // Converter para formato do frontend
        const formattedTimeline = this.formatTimelineForFrontend(timeline);
        
        res.json({
          success: true,
          data: formattedTimeline,
          metadata: {
            days_requested: days,
            total_entries: formattedTimeline.length,
            generated_at: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Erro ao gerar timeline:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          fallback_data: this.getMockData()
        });
      }
    });

    // API: Obter histórico de decisões para arquivo específico
    this.app.get('/api/file-history/:filePath(*)', async (req, res) => {
      try {
        const filePath = req.params.filePath;
        const history = await this.gitMemory.getFileDecisionHistory(filePath);
        
        res.json({
          success: true,
          file_path: filePath,
          decisions: history
        });
      } catch (error) {
        console.error('Erro ao obter histórico do arquivo:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: Registrar nova decisão do agente
    this.app.post('/api/decisions', async (req, res) => {
      try {
        const { agentName, reasoning, expectedImpact, filesAffected } = req.body;
        
        if (!agentName || !reasoning) {
          return res.status(400).json({
            success: false,
            error: 'agentName e reasoning são obrigatórios'
          });
        }

        await this.gitMemory.recordAgentDecision(
          agentName,
          reasoning,
          expectedImpact || 'TBD',
          filesAffected || []
        );

        res.json({
          success: true,
          message: 'Decisão registrada com sucesso'
        });
      } catch (error) {
        console.error('Erro ao registrar decisão:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: Criar snapshot das memórias
    this.app.post('/api/snapshot', async (req, res) => {
      try {
        const { commitMessage } = req.body;
        const snapshotPath = await this.gitMemory.createCommitMemorySnapshot(commitMessage);
        
        res.json({
          success: true,
          snapshot_path: snapshotPath,
          message: 'Snapshot criado com sucesso'
        });
      } catch (error) {
        console.error('Erro ao criar snapshot:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: Estatísticas Git+Memory
    this.app.get('/api/stats', async (req, res) => {
      try {
        const days = parseInt(req.query.days as string) || 30;
        const timeline = await this.gitMemory.createGitMemoryTimeline(days);
        
        const stats = this.calculateStats(timeline);
        
        res.json({
          success: true,
          stats,
          period_days: days
        });
      } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: Buscar eventos
    this.app.get('/api/search', async (req, res) => {
      try {
        const { query, days = 30 } = req.query;
        
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Parâmetro query é obrigatório'
          });
        }

        const timeline = await this.gitMemory.createGitMemoryTimeline(parseInt(days as string));
        const results = this.searchTimeline(timeline, query as string);
        
        res.json({
          success: true,
          query,
          results,
          total_found: results.length
        });
      } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook: Receber notificações Git
    this.app.post('/webhook/git', async (req, res) => {
      try {
        const { event, commit, branch } = req.body;
        
        console.log(`📡 Webhook Git recebido: ${event} em ${branch}`);
        
        if (event === 'push' && commit) {
          // Registrar commit no sistema de memórias
          await this.gitMemory.recordCommitCompletion(commit.hash, commit.message);
        }

        res.json({
          success: true,
          message: 'Webhook processado'
        });
      } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado',
        available_endpoints: [
          'GET /',
          'GET /health',
          'GET /api/timeline?days=N',
          'GET /api/file-history/:filePath',
          'POST /api/decisions',
          'POST /api/snapshot',
          'GET /api/stats?days=N',
          'GET /api/search?query=X&days=N',
          'POST /webhook/git'
        ]
      });
    });
  }

  /**
   * Converte timeline para formato do frontend
   */
  private formatTimelineForFrontend(timeline: any[]): any[] {
    const events = [];

    for (const entry of timeline) {
      // Adicionar commit como evento
      events.push({
        timestamp: new Date(entry.commit.date),
        type: 'commit',
        hash: entry.commit.shortHash,
        message: entry.commit.message,
        author: entry.commit.author,
        branch: entry.commit.branch,
        filesChanged: entry.commit.filesChanged,
        agentDecisions: entry.agentDecisions.map(decision => ({
          agent: decision.agentName,
          reasoning: decision.reasoning,
          impact: decision.expectedImpact
        }))
      });

      // Adicionar decisões como eventos separados
      for (const decision of entry.agentDecisions) {
        events.push({
          timestamp: new Date(decision.decisionTimestamp),
          type: 'decision',
          agent: decision.agentName,
          reasoning: decision.reasoning,
          impact: decision.expectedImpact,
          commitHash: decision.commitHash.substring(0, 7)
        });
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Calcula estatísticas da timeline
   */
  private calculateStats(timeline: any[]): any {
    const events = this.formatTimelineForFrontend(timeline);
    
    const stats = {
      total_events: events.length,
      commits: events.filter(e => e.type === 'commit').length,
      decisions: events.filter(e => e.type === 'decision').length,
      agents: [...new Set(events.map(e => e.agent || e.author).filter(Boolean))],
      branches: [...new Set(events.map(e => e.branch).filter(Boolean))],
      files_most_changed: this.getMostChangedFiles(events),
      agents_most_active: this.getMostActiveAgents(events),
      activity_by_day: this.getActivityByDay(events)
    };

    return stats;
  }

  /**
   * Busca na timeline
   */
  private searchTimeline(timeline: any[], query: string): any[] {
    const events = this.formatTimelineForFrontend(timeline);
    const searchTerm = query.toLowerCase();

    return events.filter(event => {
      const searchFields = [
        event.message,
        event.reasoning,
        event.impact,
        event.agent,
        event.author
      ].filter(Boolean).join(' ').toLowerCase();

      return searchFields.includes(searchTerm);
    });
  }

  /**
   * Obtém arquivos mais modificados
   */
  private getMostChangedFiles(events: any[]): any[] {
    const fileCounts = {};
    
    events.forEach(event => {
      if (event.filesChanged) {
        event.filesChanged.forEach(file => {
          fileCounts[file] = (fileCounts[file] || 0) + 1;
        });
      }
    });

    return Object.entries(fileCounts)
      .map(([file, count]) => ({ file, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Obtém agentes mais ativos
   */
  private getMostActiveAgents(events: any[]): any[] {
    const agentCounts = {};
    
    events.forEach(event => {
      const agent = event.agent || event.author;
      if (agent) {
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      }
    });

    return Object.entries(agentCounts)
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Obtém atividade por dia
   */
  private getActivityByDay(events: any[]): any[] {
    const dayActivity = {};
    
    events.forEach(event => {
      const day = event.timestamp.toISOString().split('T')[0];
      dayActivity[day] = (dayActivity[day] || 0) + 1;
    });

    return Object.entries(dayActivity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Dados mock para fallback
   */
  private getMockData(): any[] {
    return [
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: 'commit',
        hash: 'abc123f',
        message: 'feat: adicionar sistema Git+Memory',
        author: 'DiegoFornalha',
        branch: 'main',
        filesChanged: ['src/utils/git-memory-integration.ts'],
        agentDecisions: [
          {
            agent: 'Universal Organization Guardian',
            reasoning: 'Integração necessária para rastreamento de decisões',
            impact: 'Melhora rastreabilidade e auditoria'
          }
        ]
      }
    ];
  }

  /**
   * Inicia o servidor
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`\n🌐 Git+Memory Visualizer iniciado!`);
        console.log(`📡 Porta: ${this.port}`);
        console.log(`🖥️  Interface: http://localhost:${this.port}`);
        console.log(`📊 API: http://localhost:${this.port}/api/timeline`);
        console.log(`💚 Health: http://localhost:${this.port}/health\n`);
        resolve();
      });
    });
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const port = parseInt(process.env.GIT_MEMORY_PORT || '3005');
  const server = new GitMemoryServer(port);
  
  server.start().catch(error => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Parando Git+Memory Server...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('🛑 Parando Git+Memory Server...');
    process.exit(0);
  });
}