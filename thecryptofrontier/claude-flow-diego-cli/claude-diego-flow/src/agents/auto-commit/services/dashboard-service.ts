/**
 * Serviço de Dashboard para o Auto Commit Agent
 */

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AutoCommitAgent } from '../auto-commit-core';
import { DashboardMetrics, AgentState, NotificationEvent } from '../interfaces';

export class DashboardService {
  private app: express.Application;
  private server?: http.Server;
  private wss?: WebSocket.Server;
  private agent: AutoCommitAgent;
  private port: number;
  private updateInterval?: NodeJS.Timer;

  constructor(agent: AutoCommitAgent, port: number = 3030) {
    this.agent = agent;
    this.port = port;
    this.app = express();
    
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Inicia o servidor do dashboard
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`📊 Dashboard disponível em: http://localhost:${this.port}`);
        this.startMetricsUpdate();
        resolve();
      }).on('error', reject);
    });
  }

  /**
   * Para o servidor do dashboard
   */
  async stop(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Configura rotas da API
   */
  private setupRoutes(): void {
    this.app.use(express.json());
    this.app.use(express.static(__dirname + '/public'));

    // Endpoint de status
    this.app.get('/api/status', (req, res) => {
      res.json(this.agent.getState());
    });

    // Endpoint de métricas
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.agent.getMetrics());
    });

    // Endpoint para forçar commit
    this.app.post('/api/commit', async (req, res) => {
      try {
        const result = await this.agent.forceCommit(req.body.message);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint para pausar/resumir
    this.app.post('/api/pause', (req, res) => {
      this.agent.pause();
      res.json({ success: true });
    });

    this.app.post('/api/resume', (req, res) => {
      this.agent.resume();
      res.json({ success: true });
    });

    // Endpoint para gerenciar SSH
    this.app.post('/api/ssh/store', async (req, res) => {
      try {
        const success = await this.agent.storeSSHKey(req.body.key);
        res.json({ success });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.delete('/api/ssh', (req, res) => {
      const success = this.agent.removeSSHKey();
      res.json({ success });
    });

    // Endpoint de configuração
    this.app.get('/api/config', (req, res) => {
      const state = this.agent.getState();
      res.json(state.config);
    });

    // HTML básico para o dashboard
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });
  }

  /**
   * Configura WebSocket para atualizações em tempo real
   */
  private setupWebSocket(): void {
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('Cliente conectado ao dashboard');

      // Enviar estado inicial
      ws.send(JSON.stringify({
        type: 'initial',
        data: this.agent.getState()
      }));

      ws.on('close', () => {
        console.log('Cliente desconectado do dashboard');
      });
    });

    // Escutar eventos do agente
    this.agent.on('commit-success', (result) => {
      this.broadcast({
        type: 'commit',
        data: result
      });
    });

    this.agent.on('error', (error) => {
      this.broadcast({
        type: 'error',
        data: { message: error.message }
      });
    });
  }

  /**
   * Inicia atualização periódica de métricas
   */
  private startMetricsUpdate(): void {
    this.updateInterval = setInterval(() => {
      this.broadcast({
        type: 'metrics',
        data: this.agent.getMetrics()
      });
    }, 5000); // Atualizar a cada 5 segundos
  }

  /**
   * Envia mensagem para todos os clientes WebSocket
   */
  private broadcast(message: any): void {
    if (this.wss) {
      const data = JSON.stringify(message);
      
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  }

  /**
   * HTML básico do dashboard
   */
  private getDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Auto Commit Agent Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .header h1 { 
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status { 
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .status.running { background: #d4edda; color: #155724; }
        .status.paused { background: #fff3cd; color: #856404; }
        .status.stopped { background: #f8d7da; color: #721c24; }
        .grid { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h2 { 
            font-size: 18px;
            margin-bottom: 15px;
            color: #666;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child { border-bottom: none; }
        .metric-value { 
            font-size: 24px;
            font-weight: bold;
            color: #2196F3;
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-primary { background: #2196F3; color: white; }
        .btn-primary:hover { background: #1976D2; }
        .btn-secondary { background: #ddd; color: #333; }
        .btn-secondary:hover { background: #ccc; }
        .log {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        .log-entry {
            padding: 5px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .log-entry:last-child { border-bottom: none; }
        .timestamp { color: #666; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                🤖 Auto Commit Agent Dashboard
                <span id="status" class="status">Carregando...</span>
            </h1>
        </div>

        <div class="grid">
            <div class="card">
                <h2>📊 Métricas</h2>
                <div class="metric">
                    <span>Total de Commits</span>
                    <span id="totalCommits" class="metric-value">0</span>
                </div>
                <div class="metric">
                    <span>Mudanças Processadas</span>
                    <span id="totalChanges" class="metric-value">0</span>
                </div>
                <div class="metric">
                    <span>Mudanças Pendentes</span>
                    <span id="queuedChanges" class="metric-value">0</span>
                </div>
                <div class="metric">
                    <span>Tempo Ativo</span>
                    <span id="uptime" class="metric-value">0h</span>
                </div>
            </div>

            <div class="card">
                <h2>🔑 Status SSH</h2>
                <div class="metric">
                    <span>Chave Configurada</span>
                    <span id="sshConfigured" class="metric-value">Não</span>
                </div>
                <div class="metric">
                    <span>Status</span>
                    <span id="sshStatus" class="metric-value">-</span>
                </div>
                <div class="metric">
                    <span>Falhas</span>
                    <span id="sshFailures" class="metric-value">0</span>
                </div>
            </div>

            <div class="card">
                <h2>🎮 Controles</h2>
                <div class="actions">
                    <button id="pauseBtn" class="btn btn-secondary">Pausar</button>
                    <button id="forceCommitBtn" class="btn btn-primary">Forçar Commit</button>
                </div>
            </div>

            <div class="card" style="grid-column: 1 / -1;">
                <h2>📝 Log de Atividades</h2>
                <div id="log" class="log">
                    <div class="log-entry">
                        <span class="timestamp">Aguardando eventos...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const ws = new WebSocket('ws://localhost:${this.port}');
        let isPaused = false;

        // Elementos
        const statusEl = document.getElementById('status');
        const totalCommitsEl = document.getElementById('totalCommits');
        const totalChangesEl = document.getElementById('totalChanges');
        const queuedChangesEl = document.getElementById('queuedChanges');
        const uptimeEl = document.getElementById('uptime');
        const sshConfiguredEl = document.getElementById('sshConfigured');
        const sshStatusEl = document.getElementById('sshStatus');
        const sshFailuresEl = document.getElementById('sshFailures');
        const logEl = document.getElementById('log');
        const pauseBtn = document.getElementById('pauseBtn');
        const forceCommitBtn = document.getElementById('forceCommitBtn');

        // WebSocket handlers
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            switch(message.type) {
                case 'initial':
                    updateState(message.data);
                    break;
                case 'metrics':
                    updateMetrics(message.data);
                    break;
                case 'commit':
                    addLogEntry('Commit realizado: ' + message.data.message, 'success');
                    break;
                case 'error':
                    addLogEntry('Erro: ' + message.data.message, 'error');
                    break;
            }
        };

        // Atualizar estado
        function updateState(state) {
            isPaused = state.isPaused;
            updateStatus(state.isRunning, state.isPaused);
            updateMetrics(state.metrics);
            pauseBtn.textContent = isPaused ? 'Resumir' : 'Pausar';
        }

        // Atualizar status
        function updateStatus(isRunning, isPaused) {
            if (!isRunning) {
                statusEl.textContent = 'Parado';
                statusEl.className = 'status stopped';
            } else if (isPaused) {
                statusEl.textContent = 'Pausado';
                statusEl.className = 'status paused';
            } else {
                statusEl.textContent = 'Executando';
                statusEl.className = 'status running';
            }
        }

        // Atualizar métricas
        function updateMetrics(metrics) {
            totalCommitsEl.textContent = metrics.totalCommits;
            totalChangesEl.textContent = metrics.totalChanges;
            queuedChangesEl.textContent = metrics.queuedChanges;
            
            // Calcular uptime
            const hours = Math.floor(metrics.uptime / 3600000);
            const minutes = Math.floor((metrics.uptime % 3600000) / 60000);
            uptimeEl.textContent = hours + 'h ' + minutes + 'm';
            
            // SSH status
            sshConfiguredEl.textContent = metrics.sshKeyStatus.isValid ? 'Sim' : 'Não';
            sshStatusEl.textContent = metrics.sshKeyStatus.isValid ? 'Válida' : 'Inválida';
            sshFailuresEl.textContent = metrics.sshKeyStatus.failureCount;
        }

        // Adicionar entrada no log
        function addLogEntry(message, type = '') {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            
            const timestamp = new Date().toLocaleTimeString();
            entry.innerHTML = \`
                <span class="timestamp">[\${timestamp}]</span>
                <span class="\${type}">\${message}</span>
            \`;
            
            logEl.insertBefore(entry, logEl.firstChild);
            
            // Limitar a 50 entradas
            while (logEl.children.length > 50) {
                logEl.removeChild(logEl.lastChild);
            }
        }

        // Handlers de botões
        pauseBtn.onclick = async () => {
            const endpoint = isPaused ? '/api/resume' : '/api/pause';
            const response = await fetch(endpoint, { method: 'POST' });
            
            if (response.ok) {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Resumir' : 'Pausar';
                updateStatus(true, isPaused);
            }
        };

        forceCommitBtn.onclick = async () => {
            const message = prompt('Mensagem do commit (opcional):');
            
            const response = await fetch('/api/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            const result = await response.json();
            
            if (result.success) {
                addLogEntry('Commit forçado com sucesso', 'success');
            } else {
                addLogEntry('Falha no commit: ' + result.message, 'error');
            }
        };

        // Atualizar métricas periodicamente
        setInterval(async () => {
            const response = await fetch('/api/metrics');
            if (response.ok) {
                const metrics = await response.json();
                updateMetrics(metrics);
            }
        }, 5000);
    </script>
</body>
</html>
    `;
  }
}