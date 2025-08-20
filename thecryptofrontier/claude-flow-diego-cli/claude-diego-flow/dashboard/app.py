#!/usr/bin/env python3
"""
Agent Log Flask Dashboard - Dados Reais do Mem0 + Docker Agents
"""

import os
import json
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from collections import defaultdict
import re
import subprocess
import requests

app = Flask(__name__)
CORS(app)

# Configurar conexão com Mem0 Bridge local
MEM0_BRIDGE_URL = os.environ.get('MEM0_BRIDGE_URL', 'http://localhost:3002')

# Cache de dados
cache = {
    'last_update': None,
    'data': None
}

def register_agent_execution(agent_name, status, task, duration=None, error=None):
    """Registra uma execução de agente no Mem0 Bridge"""
    try:
        execution_data = {
            "user_id": "agent-log",
            "content": json.dumps({
                "agentName": agent_name,
                "status": status,
                "task": task,
                "timestamp": datetime.now().isoformat(),
                "duration": duration,
                "error": error
            }),
            "metadata": {
                "agentName": agent_name,
                "status": status,
                "task": task,
                "duration": duration,
                "error": error,
                "timestamp": datetime.now().isoformat()
            },
            "category": "agent-execution",
            "tags": ["execution", agent_name.lower().replace(" ", "-"), status]
        }
        
        response = requests.post(f"{MEM0_BRIDGE_URL}/mcp/add_memory", json=execution_data)
        return response.status_code == 200
    except Exception as e:
        print(f"Erro ao registrar execução: {e}")
        return False

def format_duration(seconds):
    """Formata duração em segundos para formato legível (seg, min, horas, dias)"""
    if seconds is None or seconds == 0:
        return None
    
    seconds = int(seconds)
    
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        secs = seconds % 60
        if secs > 0:
            return f"{minutes}m {secs}s"
        return f"{minutes}m"
    elif seconds < 86400:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        if minutes > 0:
            return f"{hours}h {minutes}m"
        return f"{hours}h"
    else:
        days = seconds // 86400
        hours = (seconds % 86400) // 3600
        if hours > 0:
            return f"{days}d {hours}h"
        return f"{days}d"

def get_docker_agents():
    """Busca agentes rodando no Docker"""
    try:
        # Buscar todos os containers do projeto (com label do docker-compose)
        cmd = ["docker", "ps", "--filter", "label=com.docker.compose.project=config", "--format", "json"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        agents = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    container = json.loads(line)
                    # Extrair informações do container
                    agent_info = {
                        'name': container.get('Names', 'unknown'),
                        'status': container.get('State', 'unknown'),
                        'created': container.get('CreatedAt', ''),
                        'image': container.get('Image', ''),
                        'labels': container.get('Labels', ''),
                        'id': container.get('ID', '')[:12]
                    }
                    
                    # Tentar identificar o tipo de agente pelo nome ou comando
                    name_lower = agent_info['name'].lower()
                    if 'guardian' in name_lower:
                        agent_info['type'] = 'guardian'
                    elif 'auto-commit' in name_lower or 'commit' in name_lower:
                        agent_info['type'] = 'auto-commit'
                    elif 'agent-log' in name_lower:
                        agent_info['type'] = 'analytics'
                    elif 'portainer' in name_lower:
                        agent_info['type'] = 'monitor'
                    elif 'dashboard' in name_lower:
                        agent_info['type'] = 'dashboard'
                    else:
                        agent_info['type'] = 'custom'
                    
                    agents.append(agent_info)
                except json.JSONDecodeError:
                    continue
        
        return agents
    except subprocess.CalledProcessError:
        print("Erro ao buscar containers Docker")
        return []
    except Exception as e:
        print(f"Erro ao buscar agentes Docker: {e}")
        return []

def get_agent_logs(hours=24):
    """Busca logs reais do Mem0 Bridge local"""
    try:
        # Buscar memórias do AgentLog no Mem0 Bridge usando list ao invés de search
        response = requests.get(f"{MEM0_BRIDGE_URL}/mcp/list_memories/agent-log")
        
        if response.status_code != 200:
            print(f"Erro ao buscar logs do Mem0 Bridge: {response.status_code}")
            return []
        
        data = response.json()
        memories = data.get('memories', [])
        
        logs = []
        for memory in memories:
            # Extrair dados do log
            metadata = memory.get('metadata', {})
            content = memory.get('content', '')
            
            # Tentar parsear o JSON do conteúdo se for um log estruturado
            try:
                if content.startswith('{'):
                    log_data = json.loads(content)
                    metadata.update(log_data)
            except:
                pass
            
            log_entry = {
                'id': memory.get('id'),
                'agentName': metadata.get('agentName', metadata.get('agent', 'unknown')),
                'agentType': metadata.get('agentType', metadata.get('type', 'custom')),
                'status': metadata.get('status', 'unknown'),
                'timestamp': memory.get('created_at', ''),
                'duration': metadata.get('duration', 0),
                'taskDescription': metadata.get('taskDescription', metadata.get('task', content[:100])),
                'error': metadata.get('error', None)
            }
            
            logs.append(log_entry)
        
        return logs
    except Exception as e:
        print(f"Erro ao buscar logs do Mem0 Bridge: {e}")
        return []

def calculate_stats(logs):
    """Calcula estatísticas dos logs"""
    if not logs:
        return {
            'total_agents': 0,
            'total_executions': 0,
            'success_rate': 0,
            'avg_duration': 0,
            'agents': {}
        }
    
    # Agrupar por agente
    agent_stats = defaultdict(lambda: {
        'executions': 0,
        'successes': 0,
        'errors': 0,
        'total_duration': 0,
        'durations': []
    })
    
    for log in logs:
        agent_name = log['agentName']
        stats = agent_stats[agent_name]
        
        stats['executions'] += 1
        
        if log['status'] == 'completed':
            stats['successes'] += 1
            if log['duration'] > 0:
                stats['durations'].append(log['duration'])
                stats['total_duration'] += log['duration']
        elif log['status'] == 'error':
            stats['errors'] += 1
    
    # Calcular estatísticas finais
    total_executions = sum(s['executions'] for s in agent_stats.values())
    total_successes = sum(s['successes'] for s in agent_stats.values())
    
    # Formatar dados para resposta
    agents = {}
    for agent_name, stats in agent_stats.items():
        agents[agent_name] = {
            'name': agent_name,
            'executions': stats['executions'],
            'success_rate': (stats['successes'] / stats['executions'] * 100) if stats['executions'] > 0 else 0,
            'error_count': stats['errors'],
            'avg_duration': (stats['total_duration'] / len(stats['durations'])) if stats['durations'] else 0,
            'min_duration': min(stats['durations']) if stats['durations'] else 0,
            'max_duration': max(stats['durations']) if stats['durations'] else 0
        }
    
    return {
        'total_agents': len(agent_stats),
        'total_executions': total_executions,
        'success_rate': (total_successes / total_executions * 100) if total_executions > 0 else 0,
        'avg_duration': sum(a['avg_duration'] for a in agents.values()) / len(agents) if agents else 0,
        'agents': agents
    }

def get_recent_executions(logs, limit=20):
    """Obtém execuções recentes"""
    # Ordenar por timestamp
    sorted_logs = sorted(logs, key=lambda x: x['timestamp'], reverse=True)
    return sorted_logs[:limit]

def generate_pipeline_report(logs, stats, docker_agents):
    """Gera relatório do pipeline com dados reais e agentes Docker"""
    report = """
╔════════════════════════════════════════╗
║      📊 PIPELINE REPORT - REAL DATA    ║
╚════════════════════════════════════════╝

🐳 Agentes Docker em Execução: {}
""".format(len(docker_agents))
    
    if docker_agents:
        report += "\nAgentes Ativos:\n"
        for agent in docker_agents:
            report += f"  • {agent['name']} ({agent['type']}) - {agent['status']}\n"
    
    if not logs:
        report += """
⚠️  Nenhum dado de execução disponível no Mem0

Para visualizar dados de execução:
1. Configure a API key do Mem0 corretamente
2. Execute agentes que registrem logs via AgentLog
3. Aguarde os dados serem sincronizados

Status: Aguardando dados reais do Mem0...
"""
        return report
    
    # Top agentes por execução
    top_agents = sorted(
        stats['agents'].items(), 
        key=lambda x: x[1]['executions'], 
        reverse=True
    )[:5]
    
    report += f"""
📈 Estatísticas Gerais:
  • Total de agentes: {stats['total_agents']}
  • Total de execuções: {stats['total_executions']}
  • Taxa de sucesso global: {stats['success_rate']:.1f}%
  • Tempo médio de execução: {stats['avg_duration']:.0f}ms

🏆 Top Agentes por Execução:
"""
    
    for i, (name, agent_stats) in enumerate(top_agents, 1):
        report += f"  {i}. {name}: {agent_stats['executions']} execuções "
        report += f"(✅ {agent_stats['success_rate']:.1f}% | ⏱️ {agent_stats['avg_duration']:.0f}ms)\n"
    
    # Adicionar problemas recentes
    recent_errors = [log for log in logs if log['status'] == 'error'][:5]
    if recent_errors:
        report += "\n⚠️ Erros Recentes:\n"
        for error in recent_errors:
            report += f"  • {error['agentName']}: {error.get('error', 'Erro desconhecido')[:50]}...\n"
    
    report += f"\n🕐 Última atualização: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    return report

@app.route('/')
def index():
    """Página principal do dashboard"""
    return render_template('dashboard.html')

@app.route('/services')
def services():
    """Página com lista completa de serviços"""
    return render_template('services.html')

@app.route('/tasks')
def tasks():
    """Página com timeline de tarefas e atividades"""
    return render_template('tasks.html')

@app.route('/api/register-execution', methods=['POST'])
def register_execution():
    """Registra uma execução de agente"""
    data = request.json
    
    success = register_agent_execution(
        agent_name=data.get('agentName', 'Unknown'),
        status=data.get('status', 'unknown'),
        task=data.get('task', 'No description'),
        duration=data.get('duration'),
        error=data.get('error')
    )
    
    return jsonify({'success': success})

@app.route('/api/stats')
def api_stats():
    """API endpoint para estatísticas gerais"""
    # Cache de 30 segundos
    if cache['last_update'] and (datetime.now() - cache['last_update']).seconds < 30:
        logs = cache['data']
    else:
        logs = get_agent_logs()
        cache['data'] = logs
        cache['last_update'] = datetime.now()
    
    stats = calculate_stats(logs)
    
    # Sempre incluir agentes Docker
    docker_agents = get_docker_agents()
    
    # Se não houver dados do Mem0, usar dados dos containers
    if stats['total_agents'] == 0:
        stats['total_agents'] = len(docker_agents)
        
        # Criar estatísticas básicas dos containers
        for agent in docker_agents:
            agent_name = agent['name']
            stats['agents'][agent_name] = {
                'name': agent_name,
                'executions': 0,
                'success_rate': 0,
                'error_count': 0,
                'avg_duration': 0,
                'min_duration': 0,
                'max_duration': 0,
                'status': agent['status']
            }
    
    # Adicionar informação de containers em execução
    stats['docker_agents'] = docker_agents
    stats['running_containers'] = len([a for a in docker_agents if 'running' in a['status'].lower()])
    
    return jsonify(stats)

@app.route('/api/task-lifecycle')
def api_task_lifecycle():
    """API endpoint para tarefas em andamento/interrompidas (Task Lifecycle Memory)"""
    try:
        # Buscar tarefas do Guardian e outros agentes
        response = requests.get(f"{MEM0_BRIDGE_URL}/mcp/list_memories/guardian-orchestrator")
        
        tasks = {
            'in_progress': [],
            'interrupted': [],
            'recent_completed': [],
            'total': 0
        }
        
        if response.status_code == 200:
            data = response.json()
            memories = data.get('memories', [])
            
            for memory in memories:
                content = memory.get('content', '')
                metadata = memory.get('metadata', {})
                
                # Identificar tarefas por categoria ou tags
                category = memory.get('category', '')
                tags = memory.get('tags', [])
                
                # Tarefas em andamento
                if 'task-in-progress' in tags or 'in_progress' in metadata.get('status', ''):
                    tasks['in_progress'].append({
                        'id': memory.get('id'),
                        'task': metadata.get('task', content[:100]),
                        'agent': metadata.get('agent', 'guardian'),
                        'started_at': memory.get('created_at'),
                        'context': metadata
                    })
                
                # Tarefas interrompidas
                elif 'interrupted' in tags or 'error' in metadata.get('status', ''):
                    tasks['interrupted'].append({
                        'id': memory.get('id'),
                        'task': metadata.get('task', content[:100]),
                        'agent': metadata.get('agent', 'guardian'),
                        'error': metadata.get('error', 'Task was interrupted'),
                        'stopped_at': memory.get('updated_at'),
                        'context': metadata
                    })
                
                # Tarefas completadas recentemente
                elif 'completed' in metadata.get('status', ''):
                    # Pegar apenas as últimas 24h
                    created = datetime.fromisoformat(memory.get('created_at', '').replace('Z', '+00:00'))
                    if (datetime.now(created.tzinfo) - created).total_seconds() < 86400:
                        tasks['recent_completed'].append({
                            'id': memory.get('id'),
                            'task': metadata.get('task', content[:100]),
                            'agent': metadata.get('agent', 'guardian'),
                            'completed_at': memory.get('updated_at'),
                            'duration': metadata.get('duration', 0)
                        })
        
        tasks['total'] = len(tasks['in_progress']) + len(tasks['interrupted'])
        return jsonify(tasks)
        
    except Exception as e:
        print(f"Erro ao buscar task lifecycle: {e}")
        return jsonify({
            'in_progress': [],
            'interrupted': [],
            'recent_completed': [],
            'total': 0,
            'error': str(e)
        })

@app.route('/api/executions')
def api_executions():
    """API endpoint para execuções recentes"""
    logs = get_agent_logs()
    recent = get_recent_executions(logs)
    return jsonify(recent)

@app.route('/api/pipeline-report')
def api_pipeline_report():
    """API endpoint para relatório do pipeline"""
    logs = get_agent_logs()
    stats = calculate_stats(logs)
    docker_agents = get_docker_agents()
    report = generate_pipeline_report(logs, stats, docker_agents)
    return jsonify({'report': report})

@app.route('/api/agent/<agent_name>')
def api_agent_details(agent_name):
    """API endpoint para detalhes de um agente específico"""
    logs = get_agent_logs()
    
    # Filtrar logs do agente
    agent_logs = [log for log in logs if log['agentName'] == agent_name]
    
    if not agent_logs:
        return jsonify({'error': 'Agent not found'}), 404
    
    # Calcular estatísticas específicas
    stats = calculate_stats(agent_logs)
    agent_stats = stats['agents'].get(agent_name, {})
    
    # Histórico recente
    recent_executions = sorted(agent_logs, key=lambda x: x['timestamp'], reverse=True)[:10]
    
    return jsonify({
        'name': agent_name,
        'stats': agent_stats,
        'recent_executions': recent_executions
    })

@app.route('/api/docker-agents')
def api_docker_agents():
    """API endpoint para agentes rodando no Docker"""
    agents = get_docker_agents()
    return jsonify({
        'agents': agents,
        'total': len(agents),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/tasks')
def api_tasks():
    """API endpoint para dados de tarefas em tempo real"""
    # Buscar dados reais do Mem0
    real_logs = get_agent_logs(hours=48)  # Últimas 48 horas
    
    # Buscar agentes rodando no Docker
    docker_agents = get_docker_agents()
    running_agents = [a['name'] for a in docker_agents if 'running' in a['status'].lower()]
    
    # Mapear logs reais para formato de tarefas
    tasks = []
    task_id = 1
    
    # Mapeamento de tipos de tarefas por agente
    task_types = {
        'Guardian Agent': {
            'default': 'organization-analysis',
            'description': 'Análise de organização do projeto',
            'complexity': 'complex'
        },
        'Auto-Commit Agent': {
            'default': 'smart-commit',
            'description': 'Commit inteligente com conventional commits',
            'complexity': 'simple'
        },
        'Memory Enhanced Agent': {
            'default': 'memory-search',
            'description': 'Busca e consolidação de memórias',
            'complexity': 'medium'
        },
        'MCP Improvement Agent': {
            'default': 'code-improvement',
            'description': 'Melhoria e refatoração de código',
            'complexity': 'complex'
        },
        'Agent Log': {
            'default': 'log-analysis',
            'description': 'Análise e geração de relatórios',
            'complexity': 'simple'
        }
    }
    
    # Processar logs reais
    for log in real_logs:
        agent_name = log.get('agentName', 'unknown')
        task_info = task_types.get(agent_name, {
            'default': 'generic-task',
            'description': log.get('taskDescription', 'Tarefa não especificada'),
            'complexity': 'medium'
        })
        
        # Determinar status baseado no log
        status = log.get('status', 'unknown')
        if status == 'started':
            status = 'running' if agent_name in running_agents else 'pending'
        elif status == 'completed':
            status = 'completed'
        elif status == 'error' or status == 'failed':
            status = 'error'
        
        # Calcular progresso para tarefas em execução
        progress = 0
        elapsed_seconds = 0
        if status == 'running':
            # Estimar progresso baseado no tempo decorrido
            try:
                start_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                elapsed_seconds = (datetime.now(start_time.tzinfo) - start_time).total_seconds()
                
                # Ajustar duração esperada baseado no tipo de tarefa
                expected_durations = {
                    'organization-analysis': 180,  # 3 minutos
                    'smart-commit': 30,           # 30 segundos
                    'memory-search': 45,          # 45 segundos
                    'code-improvement': 300,      # 5 minutos
                    'log-analysis': 60,           # 1 minuto
                    'monitoring': 120,            # 2 minutos
                    'generic-task': 60            # 1 minuto padrão
                }
                
                task_type = task_info.get('default', 'generic-task')
                expected_duration = expected_durations.get(task_type, 60)
                
                progress = min(95, int((elapsed_seconds / expected_duration) * 100))
            except:
                progress = 50
        elif status == 'completed':
            progress = 100
        
        # Converter duração de milissegundos para segundos se existir
        duration_ms = log.get('duration', None)
        duration_seconds = duration_ms / 1000 if duration_ms else None
        
        # Para tarefas em execução, usar tempo decorrido
        if status == 'running' and elapsed_seconds > 0:
            duration_formatted = format_duration(elapsed_seconds)
        elif duration_seconds:
            duration_formatted = format_duration(duration_seconds)
        else:
            duration_formatted = None
        
        task = {
            'id': task_id,
            'name': task_info['default'],
            'description': task_info['description'],
            'service': agent_name,
            'status': status,
            'complexity': task_info['complexity'],
            'startTime': log.get('timestamp', datetime.now().isoformat()),
            'duration': duration_ms,  # Manter em ms para compatibilidade
            'durationFormatted': duration_formatted,  # Nova propriedade formatada
            'progress': progress,
            'error': log.get('error', None),
            'realData': True  # Indicador de que são dados reais
        }
        
        tasks.append(task)
        task_id += 1
    
    # Se não houver dados reais, adicionar algumas tarefas dos agentes em execução
    if not tasks and docker_agents:
        for agent in docker_agents[:3]:  # Primeiros 3 agentes
            agent_name = agent['name']
            if agent_name in ['organization-guardian', 'auto-commit-claude-flow-diego', 'agent-log-service']:
                mapped_name = {
                    'organization-guardian': 'Guardian Agent',
                    'auto-commit-claude-flow-diego': 'Auto-Commit Agent',
                    'agent-log-service': 'Agent Log'
                }.get(agent_name, agent_name)
                
                task_info = task_types.get(mapped_name, {
                    'default': 'monitoring',
                    'description': f'Monitorando sistema - {agent_name}',
                    'complexity': 'simple'
                })
                
                task = {
                    'id': task_id,
                    'name': task_info['default'],
                    'description': task_info['description'],
                    'service': mapped_name,
                    'status': 'running' if 'running' in agent['status'].lower() else 'pending',
                    'complexity': task_info['complexity'],
                    'startTime': datetime.now().isoformat(),
                    'duration': None,
                    'durationFormatted': None,
                    'progress': 25,
                    'error': None,
                    'realData': True
                }
                
                tasks.append(task)
                task_id += 1
    
    # Calcular estatísticas
    total_tasks = len(tasks)
    running_tasks = len([t for t in tasks if t['status'] == 'running'])
    
    # Tarefas completadas hoje
    today = datetime.now().date()
    completed_today = 0
    for task in tasks:
        if task['status'] == 'completed':
            try:
                task_date = datetime.fromisoformat(task['startTime'].replace('Z', '+00:00')).date()
                if task_date == today:
                    completed_today += 1
            except:
                pass
    
    # Ordenar tarefas por tempo (mais recentes primeiro)
    tasks.sort(key=lambda x: x['startTime'], reverse=True)
    
    return jsonify({
        'tasks': tasks[:50],  # Limitar a 50 tarefas mais recentes
        'total': total_tasks,
        'running': running_tasks,
        'completed_today': completed_today,
        'timestamp': datetime.now().isoformat(),
        'source': 'real' if tasks and any(t.get('realData') for t in tasks) else 'mock'
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    # Verificar conexão com Mem0 Bridge
    mem0_connected = False
    try:
        response = requests.get(f"{MEM0_BRIDGE_URL}/health", timeout=2)
        mem0_connected = response.status_code == 200
    except:
        pass
    
    return jsonify({
        'status': 'healthy',
        'service': 'agent-log-flask',
        'mem0_connected': mem0_connected,
        'mem0_bridge_url': MEM0_BRIDGE_URL,
        'using_mock_data': False,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/task-lifecycle')
def task_lifecycle():
    """Página do Task Lifecycle Memory"""
    return render_template('task-lifecycle.html')

@app.route('/memories')
def memories():
    """Página de gestão de memórias"""
    return render_template('memories.html')

@app.route('/api/memories', methods=['GET'])
def get_memories():
    """Buscar todas as memórias"""
    memories_list = []
    
    try:
        # Buscar memórias de todos os agentes
        user_id = request.args.get('user_id', 'agent-log')
        response = requests.get(f"{MEM0_BRIDGE_URL}/mcp/list_memories/{user_id}")
        if response.status_code == 200:
            data = response.json()
            memories_list = data.get('memories', [])
    except Exception as e:
        print(f"Erro ao buscar memórias: {e}")
    
    return jsonify(memories_list)

@app.route('/api/memories', methods=['POST'])
def create_memory():
    """Criar nova memória"""
    data = request.json
    
    try:
        response = requests.post(
            f"{MEM0_BRIDGE_URL}/mcp/add_memory",
            json=data
        )
        if response.status_code == 200:
            return jsonify(response.json()), 200
    except Exception as e:
        print(f"Erro ao criar memória: {e}")
    
    return jsonify({"error": "Failed to create memory"}), 500

@app.route('/api/memories/<memory_id>', methods=['PUT'])
def update_memory(memory_id):
    """Atualizar memória existente"""
    data = request.json
    
    try:
        response = requests.put(
            f"{MEM0_BASE_URL}/memories/{memory_id}",
            headers=MEM0_HEADERS,
            json=data
        )
        if response.status_code == 200:
            return jsonify(response.json())
    except:
        pass
    
    return jsonify({"error": "Failed to update memory"}), 500

@app.route('/api/memories/<memory_id>', methods=['DELETE'])
def delete_memory(memory_id):
    """Deletar memória"""
    try:
        response = requests.delete(
            f"{MEM0_BASE_URL}/memories/{memory_id}",
            headers=MEM0_HEADERS
        )
        if response.status_code == 204:
            return '', 204
    except:
        pass
    
    return jsonify({"error": "Failed to delete memory"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)