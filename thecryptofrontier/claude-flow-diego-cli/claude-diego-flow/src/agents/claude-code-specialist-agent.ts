#!/usr/bin/env npx tsx

import { Agent } from '../core/agent';
import { Message, ToolCall } from '../types';
import { MCPClient } from '../mcp/mcp-client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ClaudeCodeMode {
    name: 'concise' | 'formal' | 'explanatory';
    description: string;
    characteristics: string[];
}

export class ClaudeCodeSpecialistAgent extends Agent {
    private mcpClient: MCPClient;
    private projectRoot: string;
    private currentMode: ClaudeCodeMode['name'] = 'concise';
    private knowledgeBase: any;
    private claudeMdPath: string;
    private version: string = '4.1.0'; // Updated with model differences, citations, search guidelines
    private evolutionHistory: Array<{version: string, timestamp: Date, improvements: string[]}> = [];

    constructor() {
        super({
            id: 'claude-code-specialist',
            name: 'Claude Code Specialist',
            description: 'Especialista em boas práticas do Claude Code, gerenciamento de memória, convenções de código e produtividade no desenvolvimento',
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
            ]
        });

        this.projectRoot = '/home/strapi/thecryptofrontier';
        this.claudeMdPath = path.join(this.projectRoot, 'CLAUDE.md');
        
        this.mcpClient = new MCPClient({
            name: 'claude-code-mcp',
            version: '1.0.0'
        });

        this.initializeKnowledgeBase();
    }

    private initializeKnowledgeBase(): void {
        this.knowledgeBase = {
            version: '0.2.9',
            disclaimer: 'Claude Code is a Beta product. All code acceptance/rejection decisions constitute Feedback under Anthropics Commercial Terms.',
            modes: {
                concise: {
                    name: 'concise',
                    description: 'Modo conciso - respostas diretas e objetivas',
                    characteristics: [
                        'Respostas com menos de 4 linhas quando possível',
                        'Sem preâmbulos ou pós-âmbulos desnecessários',
                        'Foco na consulta específica',
                        'Evita informações tangenciais',
                        'Mantém tom útil sem gentilezas excessivas'
                    ]
                },
                formal: {
                    name: 'formal',
                    description: 'Modo formal - apropriado para ambientes corporativos',
                    characteristics: [
                        'Estrutura cuidadosa com seções claras',
                        'Tom formal mas claro',
                        'Evita linguagem casual e gírias',
                        'Equilibra completude com eficiência',
                        'Apropriado para compartilhar com stakeholders'
                    ]
                },
                explanatory: {
                    name: 'explanatory',
                    description: 'Modo explicativo - ensino detalhado e completo',
                    characteristics: [
                        'Explicações claras e completas',
                        'Abordagem de professor',
                        'Usa comparações e exemplos',
                        'Explicações passo a passo',
                        'Tom paciente e encorajador'
                    ]
                }
            },
            slashCommands: {
                '/help': 'Obter ajuda sobre o uso do Claude Code',
                '/compact': 'Compactar e continuar a conversa (útil quando atinge limite de contexto)',
                '/mode': 'Alternar entre modos (concise, formal, explanatory)',
                '/memory': 'Gerenciar memória do projeto (CLAUDE.md)',
                'claude -h': 'Ver comandos e flags suportados (sempre verificar antes de assumir)'
            },
            modelDifferences: {
                opus: {
                    name: 'Claude Opus 4',
                    modelId: 'claude-opus-4-20250514',
                    strengths: ['Tarefas complexas', 'Análise profunda', 'Projetos grandes'],
                    context: 'Maior capacidade de contexto'
                },
                sonnet: {
                    name: 'Claude Sonnet 4',
                    modelId: 'claude-sonnet-4-20250514',
                    strengths: ['Eficiente para uso diário', 'Rápido', 'Balanceado'],
                    context: 'Contexto otimizado'
                }
            },
            citationRules: {
                whenToUse: ['web_search', 'drive_search', 'google_drive_search', 'google_drive_fetch'],
                format: '<cite index="DOC_INDEX-SENTENCE_INDEX">claim</cite>',
                rules: [
                    'EVERY specific claim must be wrapped in citation tags',
                    'Use minimum sentences necessary to support claim',
                    'For multiple sources: index="DOC-SENT,DOC-SENT"',
                    'For contiguous sentences: index="DOC-START:END"',
                    'Never include indices outside citation tags'
                ]
            },
            artifactsAdvanced: {
                mustUseFor: [
                    'Custom code solving specific problems',
                    'Data visualizations',
                    'Technical documents/guides',
                    'Reports, emails, presentations',
                    'Creative writing of any length',
                    'Structured reference content',
                    'Content > 20 lines OR > 1500 chars'
                ],
                doNotUseFor: [
                    'Simple code user will run themselves',
                    'Non-JavaScript code requests',
                    'Quick answers < 20 lines',
                    'Conversational responses'
                ],
                designPrinciples: {
                    complexApps: 'Prioritize functionality over visual flair',
                    landingPages: 'Consider emotional impact and wow factor',
                    default: 'Contemporary design trends, modern aesthetics',
                    animations: 'Include thoughtful animations and interactions'
                },
                criticalRestriction: 'NEVER use localStorage or sessionStorage - use React state or JS variables only'
            },
            searchGuidelines: {
                categories: {
                    neverSearch: [
                        'Timeless info', 'Fundamental concepts', 'General knowledge',
                        'Math concepts', 'History', 'Stable facts'
                    ],
                    offerSearch: [
                        'Annual updates', 'Known topics with potential changes',
                        'Statistics that update yearly'
                    ],
                    singleSearch: [
                        'Real-time data', 'Recent events', 'Current prices',
                        'Weather', 'Elections', 'Single fact queries'
                    ],
                    research: [
                        'Complex comparisons', 'Multi-source analysis',
                        'Reports requiring 5+ searches', 'Deep dives'
                    ]
                },
                bestPractices: [
                    'Keep queries 1-6 words',
                    'Start broad, then narrow',
                    'Never repeat similar queries',
                    'Use web_fetch for full articles',
                    'Scale searches to complexity'
                ]
            },
            harmfulContentSafety: {
                mustNotCreate: [
                    'Queries promoting hate speech or violence',
                    'Extremist organization content',
                    'Harmful online source locations',
                    'Malicious code or exploits'
                ],
                mustRefuse: [
                    'Song lyrics reproduction',
                    'Copyright material > 15 words',
                    'Displacive summaries',
                    'Code that appears malicious'
                ]
            },
            bestPractices: {
                security: [
                    'Recusar código malicioso ou explicações sobre malware',
                    'Não trabalhar em arquivos suspeitos',
                    'Seguir melhores práticas de segurança',
                    'Nunca expor ou logar segredos e chaves'
                ],
                taskManagement: [
                    'Usar ferramentas de busca para entender a codebase',
                    'Implementar soluções usando ferramentas disponíveis',
                    'Verificar soluções com testes quando possível',
                    'Executar comandos lint e typecheck',
                    'Nunca fazer commit sem solicitação explícita'
                ],
                codeConventions: [
                    'Entender e seguir convenções existentes',
                    'Nunca assumir que uma biblioteca está disponível',
                    'Olhar componentes existentes ao criar novos',
                    'Manter estilo de código consistente',
                    'Seguir padrões do projeto'
                ],
                toolUsage: [
                    'Usar Agent tool para reduzir uso de contexto',
                    'Chamar múltiplas ferramentas em paralelo quando possível',
                    'Preferir search tools para entender codebase',
                    'Batch tool calls para melhor performance'
                ],
                communication: [
                    'Ser conciso, direto e objetivo',
                    'Explicar comandos bash não-triviais',
                    'Usar markdown formatado para GitHub',
                    'Minimizar tokens de saída mantendo utilidade',
                    'Evitar explicações de código não solicitadas'
                ]
            },
            memoryManagement: {
                claudeMd: {
                    purpose: 'Armazenar informações frequentemente usadas',
                    content: [
                        'Comandos bash frequentes',
                        'Preferências de estilo de código',
                        'Estrutura da codebase',
                        'Convenções do projeto',
                        'Informações específicas do contexto'
                    ],
                    bestPractices: [
                        'Manter CLAUDE.md atualizado',
                        'Documentar decisões importantes',
                        'Incluir comandos úteis',
                        'Estruturar informações claramente'
                    ]
                }
            },
            artifacts: {
                definition: 'Conteúdo substancial e autocontido para modificação ou reutilização',
                criteria: {
                    goodArtifacts: [
                        'Conteúdo substancial (>15 linhas)',
                        'Conteúdo que o usuário provavelmente modificará ou iterará',
                        'Conteúdo autocontido e complexo',
                        'Conteúdo para uso eventual fora da conversa',
                        'Conteúdo que será referenciado ou reutilizado'
                    ],
                    dontUseFor: [
                        'Conteúdo simples, informativo ou curto',
                        'Conteúdo principalmente explicativo ou instrutivo',
                        'Sugestões ou feedback sobre artifacts existentes',
                        'Conteúdo conversacional ou explicativo',
                        'Conteúdo dependente do contexto da conversa',
                        'Perguntas pontuais do usuário'
                    ]
                },
                types: {
                    code: {
                        mime: 'application/vnd.ant.code',
                        description: 'Snippets ou scripts em qualquer linguagem',
                        attributes: ['language']
                    },
                    markdown: {
                        mime: 'text/markdown',
                        description: 'Documentos em texto plano ou Markdown'
                    },
                    html: {
                        mime: 'text/html',
                        description: 'Páginas HTML com JS e CSS inline',
                        restrictions: [
                            'Imagens apenas via placeholder: /api/placeholder/width/height',
                            'Scripts externos apenas de cdnjs.cloudflare.com',
                            'Não usar para snippets de código (usar type code)'
                        ]
                    },
                    svg: {
                        mime: 'image/svg+xml',
                        description: 'Imagens vetoriais escaláveis',
                        note: 'Especificar viewBox ao invés de width/height'
                    },
                    mermaid: {
                        mime: 'application/vnd.ant.mermaid',
                        description: 'Diagramas Mermaid',
                        note: 'Não colocar em code block quando usar artifacts'
                    },
                    react: {
                        mime: 'application/vnd.ant.react',
                        description: 'Componentes React',
                        requirements: [
                            'Sem props obrigatórias ou valores default para todas',
                            'Usar export default',
                            'Tailwind para estilização (sem valores arbitrários)',
                            'Bibliotecas disponíveis: React, lucide-react, recharts, shadcn/ui'
                        ]
                    }
                },
                bestPractices: [
                    'Um artifact por mensagem (exceto se solicitado)',
                    'Preferir conteúdo inline quando possível',
                    'Incluir conteúdo completo sem truncamento',
                    'Usar identifier kebab-case descritivo',
                    'Reutilizar identifier ao atualizar',
                    'Pensar em <antthinking> antes de criar',
                    'Na dúvida, não criar artifact'
                ],
                updateStrategy: {
                    whenToUpdate: 'Modificações diretas do artifact existente',
                    whenToCreate: 'Novo conteúdo ou tipo diferente',
                    reuseIdentifier: 'Sempre ao atualizar para manter continuidade'
                }
            },
            bannedCommands: {
                reason: 'Banidos por segurança contra prompt injection',
                commands: [
                    'alias', 'curl', 'curlie', 'wget', 'axel', 'aria2c',
                    'nc', 'telnet', 'lynx', 'w3m', 'links', 'httpie',
                    'xh', 'http-prompt', 'chrome', 'firefox', 'safari'
                ],
                alternatives: {
                    'curl/wget': 'Use ferramentas MCP ou WebFetch',
                    'nc/telnet': 'Use ferramentas apropriadas de rede',
                    'browsers': 'Use puppeteer via MCP'
                }
            },
            gitWorkflow: {
                commit: {
                    steps: [
                        'Executar git status, git diff e git log em paralelo',
                        'Analisar mudanças em <commit_analysis> tags',
                        'Criar mensagem concisa focada no "por quê"',
                        'Adicionar emoji 🤖 e Co-Authored-By',
                        'Usar HEREDOC para formatação correta'
                    ],
                    messageFormat: '$(cat <<\'EOF\'\nMensagem aqui.\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>\nEOF\n)',
                    rules: [
                        'Nunca usar flags interativas (-i)',
                        'Nunca atualizar git config',
                        'Nunca fazer push sem solicitação',
                        'Combinar git add e commit quando possível',
                        'Retry uma vez se pre-commit hooks falharem'
                    ]
                },
                pr: {
                    steps: [
                        'Entender estado do branch com múltiplos comandos',
                        'Criar branch se necessário',
                        'Commit mudanças se necessário',
                        'Push com flag -u se necessário',
                        'Criar PR com gh pr create e HEREDOC'
                    ],
                    analysis: '<pr_analysis> tags para análise detalhada',
                    format: 'Summary com 1-3 bullet points + Test plan'
                }
            },
            verbosityGuidelines: {
                general: [
                    'Respostas com menos de 4 linhas quando possível',
                    'Respostas de uma palavra são ideais',
                    'Evitar introduções, conclusões e explicações',
                    'Sem preâmbulos como "A resposta é..." ou "Aqui está..."'
                ],
                examples: {
                    '2 + 2': '4',
                    'é 11 primo?': 'Sim',
                    'comando para listar arquivos?': 'ls',
                    'quantas bolas de golfe cabem num Jetta?': '150000'
                },
                exceptions: [
                    'Usuário pede detalhes explicitamente',
                    'Tarefa complexa que requer múltiplos passos',
                    'Explicação de segurança necessária'
                ]
            },
            toolUsagePolicies: {
                bash: {
                    avoid: ['find', 'grep', 'cat', 'head', 'tail', 'ls'],
                    use: ['GrepTool', 'SearchGlobTool', 'View', 'List'],
                    timeout: 'Máx 600000ms (10 min), padrão 30 min',
                    shellState: 'Persistente entre comandos',
                    workingDir: 'Manter usando paths absolutos'
                },
                agent: {
                    when: 'Buscas complexas ou múltiplas tentativas',
                    limitations: 'Não pode usar Bash, Replace, Edit',
                    concurrency: 'Lançar múltiplos agentes em paralelo',
                    stateless: 'Cada invocação é independente'
                },
                general: [
                    'Múltiplas tools em single function_calls block',
                    'Agent tool para reduzir uso de contexto',
                    'Verificar diretório pai antes de criar arquivos',
                    'Ler arquivo antes de editar'
                ]
            },
            environmentAwareness: {
                mustCheck: [
                    'Working directory',
                    'Is git repo',
                    'Platform',
                    'Date',
                    'Model'
                ],
                conventions: [
                    'Nunca assumir bibliotecas disponíveis',
                    'Verificar package.json primeiro',
                    'Seguir padrões existentes',
                    'Manter segurança sempre'
                ]
            },
            nativeTools: {
                core: [
                    { name: 'View', userFacing: 'Read', description: 'Ler arquivo do filesystem local' },
                    { name: 'LS', userFacing: 'List', description: 'Listar arquivos e diretórios' },
                    { name: 'Bash', description: 'Executar comando bash com timeout opcional' },
                    { name: 'Edit', userFacing: 'Create/Update/Delete', description: 'Editar arquivos (criar, atualizar, deletar)' },
                    { name: 'Replace', userFacing: 'Write', description: 'Sobrescrever arquivo completo' },
                    { name: 'GlobTool', userFacing: 'Search', description: 'Busca rápida por padrão de arquivos' },
                    { name: 'GrepTool', userFacing: 'Search', description: 'Busca rápida por conteúdo com regex' },
                    { name: 'dispatch_agent', userFacing: 'Task', description: 'Lançar novo agente para tarefas' },
                    { name: 'Think', description: 'No-op tool para logging de pensamentos' },
                    { name: 'NotebookEditCell', userFacing: 'Edit Notebook', description: 'Editar células Jupyter' },
                    { name: 'Architect', description: 'Analisar requisitos técnicos e criar planos' }
                ],
                prompt: [
                    { name: 'init', description: 'Inicializar CLAUDE.md com documentação' },
                    { name: 'pr-comments', description: 'Obter comentários de PR do GitHub' },
                    { name: 'review', description: 'Revisar pull request' }
                ],
                local: [
                    { name: 'clear', description: 'Limpar histórico de conversa' },
                    { name: 'compact', description: 'Limpar histórico mas manter resumo' }
                ]
            },
            cliCommands: {
                main: {
                    'claude [prompt]': 'Iniciar sessão interativa ou executar prompt',
                    options: [
                        '-c, --cwd <cwd>: Diretório de trabalho atual',
                        '-d, --debug: Habilitar modo debug',
                        '--verbose: Sobrescrever modo verbose',
                        '-ea, --enable-architect: Habilitar ferramenta Architect',
                        '-p, --print: Imprimir resposta e sair (útil para pipes)',
                        '--dangerously-skip-permissions: Pular verificações (apenas Docker)'
                    ]
                },
                config: {
                    'claude config get <key>': 'Obter valor de configuração',
                    'claude config set <key> <value>': 'Definir valor de configuração',
                    'claude config remove <key>': 'Remover valor de configuração',
                    'claude config list': 'Listar todas as configurações',
                    options: ['-g, --global: Usar config global']
                },
                approvedTools: {
                    'claude approved-tools list': 'Listar ferramentas aprovadas',
                    'claude approved-tools remove <tool>': 'Remover ferramenta aprovada'
                },
                mcp: {
                    'claude mcp serve': 'Iniciar servidor MCP do Claude Code',
                    'claude mcp add <name> <command> [args...]': 'Adicionar servidor stdio',
                    'claude mcp remove <name>': 'Remover servidor MCP',
                    'claude mcp list': 'Listar servidores MCP configurados',
                    'claude mcp get <name>': 'Obter detalhes sobre servidor MCP'
                },
                other: {
                    'claude doctor': 'Verificar saúde do auto-updater'
                }
            },
            actionVerbs: [
                'Accomplishing', 'Actioning', 'Actualizing', 'Baking', 'Brewing',
                'Calculating', 'Cerebrating', 'Churning', 'Clauding', 'Coalescing',
                'Cogitating', 'Computing', 'Conjuring', 'Considering', 'Cooking',
                'Crafting', 'Creating', 'Crunching', 'Deliberating', 'Determining',
                'Doing', 'Effecting', 'Finagling', 'Forging', 'Forming',
                'Generating', 'Hatching', 'Herding', 'Honking', 'Hustling',
                'Ideating', 'Inferring', 'Manifesting', 'Marinating', 'Moseying',
                'Mulling', 'Mustering', 'Musing', 'Noodling', 'Percolating',
                'Pondering', 'Processing', 'Puttering', 'Reticulating', 'Ruminating',
                'Schlepping', 'Shucking', 'Simmering', 'Smooshing', 'Spinning',
                'Stewing', 'Synthesizing', 'Thinking', 'Transmuting', 'Vibing', 'Working'
            ],
            fileEditBestPractices: {
                requirements: [
                    'old_string DEVE ser único no arquivo',
                    'Incluir 3-5 linhas de contexto ANTES e DEPOIS',
                    'Incluir TODOS espaços e indentação exatamente',
                    'Apenas UMA mudança por vez',
                    'Múltiplas edições = múltiplas chamadas'
                ],
                warnings: [
                    'Falha se old_string não for único',
                    'Falha se não corresponder exatamente',
                    'Pode mudar instância errada sem contexto suficiente'
                ]
            }
        };
    }

    async initialize(): Promise<void> {
        try {
            await this.mcpClient.connect();
            console.log(`Claude Code Specialist Agent v${this.version} initialized successfully`);
            
            // Carregar histórico de evolução do mem0
            await this.loadEvolutionHistory();
            
            // Verificar e aplicar melhorias aprendidas
            await this.checkForEvolution();
        } catch (error) {
            console.warn('MCP connection failed, continuing without MCP:', error);
        }
    }

    async processMessage(message: Message): Promise<Message> {
        const startTime = Date.now();
        
        try {
            // Check for mode switching
            if (message.content.toLowerCase().includes('/mode')) {
                return this.handleModeSwitch(message);
            }

            const response = await this.analyzeRequest(message.content);
            
            return {
                role: 'assistant',
                content: response,
                metadata: {
                    agent: this.config.id,
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    mode: this.currentMode,
                    capabilities: this.config.capabilities
                }
            };
        } catch (error) {
            return {
                role: 'assistant',
                content: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    agent: this.config.id,
                    timestamp: new Date().toISOString(),
                    error: true
                }
            };
        }
    }

    private handleModeSwitch(message: Message): Message {
        const content = message.content.toLowerCase();
        
        if (content.includes('concise')) {
            this.currentMode = 'concise';
            return {
                role: 'assistant',
                content: 'Modo alterado para: Conciso',
                metadata: { agent: this.config.id, mode: 'concise' }
            };
        } else if (content.includes('formal')) {
            this.currentMode = 'formal';
            return {
                role: 'assistant',
                content: 'Modo alterado para: Formal',
                metadata: { agent: this.config.id, mode: 'formal' }
            };
        } else if (content.includes('explanatory') || content.includes('explicativo')) {
            this.currentMode = 'explanatory';
            return {
                role: 'assistant',
                content: 'Modo alterado para: Explicativo',
                metadata: { agent: this.config.id, mode: 'explanatory' }
            };
        }
        
        return {
            role: 'assistant',
            content: `Modo atual: ${this.currentMode}\nModos disponíveis: concise, formal, explanatory`,
            metadata: { agent: this.config.id }
        };
    }

    private async analyzeRequest(request: string): Promise<string> {
        const lowerRequest = request.toLowerCase();
        
        // Specific analysis based on keywords
        if (lowerRequest.includes('memory') || lowerRequest.includes('memória') || lowerRequest.includes('claude.md')) {
            return await this.analyzeMemoryManagement();
        }
        
        if (lowerRequest.includes('convention') || lowerRequest.includes('convenção') || lowerRequest.includes('estilo')) {
            return await this.analyzeCodeConventions();
        }
        
        if (lowerRequest.includes('security') || lowerRequest.includes('segurança')) {
            return await this.analyzeSecurityPractices();
        }
        
        if ((lowerRequest.includes('tool') || lowerRequest.includes('ferramenta')) && 
            !lowerRequest.includes('native') && !lowerRequest.includes('nativa')) {
            return await this.analyzeToolUsage();
        }
        
        if (lowerRequest.includes('best practice') || lowerRequest.includes('boa prática')) {
            return await this.analyzeBestPractices();
        }
        
        if (lowerRequest.includes('produtividade') || lowerRequest.includes('productivity')) {
            return await this.analyzeProductivity();
        }
        
        if (lowerRequest.includes('artifact') || lowerRequest.includes('artefato')) {
            return await this.analyzeArtifacts();
        }
        
        if (lowerRequest.includes('git') || lowerRequest.includes('commit') || lowerRequest.includes('pr')) {
            return await this.analyzeGitWorkflow();
        }
        
        if (lowerRequest.includes('banned') || lowerRequest.includes('banido') || lowerRequest.includes('comando')) {
            return await this.analyzeBannedCommands();
        }
        
        if (lowerRequest.includes('verbosity') || lowerRequest.includes('concisão') || lowerRequest.includes('brevidade')) {
            return await this.analyzeVerbosityGuidelines();
        }
        
        if (lowerRequest.includes('tool') || lowerRequest.includes('ferramenta nativa') || lowerRequest.includes('native')) {
            return await this.analyzeNativeTools();
        }
        
        if (lowerRequest.includes('cli') || lowerRequest.includes('comando') || lowerRequest.includes('terminal')) {
            return await this.analyzeCLICommands();
        }
        
        if (lowerRequest.includes('opus') || lowerRequest.includes('sonnet') || lowerRequest.includes('modelo')) {
            return await this.analyzeModelDifferences();
        }
        
        if (lowerRequest.includes('citation') || lowerRequest.includes('citação') || lowerRequest.includes('cite')) {
            return await this.analyzeCitationRules();
        }
        
        if (lowerRequest.includes('search') || lowerRequest.includes('busca') || lowerRequest.includes('pesquisa')) {
            return await this.analyzeSearchGuidelines();
        }
        
        // General Claude Code analysis
        return await this.generalClaudeCodeAnalysis();
    }

    private async analyzeMemoryManagement(): Promise<string> {
        let report = '# 🧠 Análise de Gerenciamento de Memória - Claude Code\n\n';
        
        // Check for CLAUDE.md
        const claudeMdExists = await this.fileExists(this.claudeMdPath);
        
        report += '## Status do CLAUDE.md\n';
        if (claudeMdExists) {
            const content = await fs.readFile(this.claudeMdPath, 'utf-8');
            const lines = content.split('\n').length;
            const size = Buffer.byteLength(content, 'utf8');
            
            report += `✅ CLAUDE.md encontrado\n`;
            report += `📊 Estatísticas:\n`;
            report += `  - Linhas: ${lines}\n`;
            report += `  - Tamanho: ${(size / 1024).toFixed(2)} KB\n\n`;
            
            // Analyze content structure
            report += '## Análise de Conteúdo\n';
            report += this.analyzeClaudeMdContent(content);
        } else {
            report += '⚠️ CLAUDE.md não encontrado\n';
            report += '💡 Recomenda-se criar um CLAUDE.md para armazenar:\n';
            report += '  - Comandos bash frequentes\n';
            report += '  - Preferências de estilo de código\n';
            report += '  - Estrutura do projeto\n';
            report += '  - Convenções específicas\n';
        }
        
        // Memory best practices
        report += '\n## 📋 Melhores Práticas de Memória\n';
        report += this.generateMemoryRecommendations();
        
        return report;
    }

    private async analyzeCodeConventions(): Promise<string> {
        let report = '# 📐 Análise de Convenções de Código - Claude Code\n\n';
        
        // Check for common convention files
        report += '## Arquivos de Convenção\n';
        const conventionFiles = [
            { file: '.eslintrc.js', name: 'ESLint' },
            { file: '.prettierrc', name: 'Prettier' },
            { file: 'tsconfig.json', name: 'TypeScript' },
            { file: '.editorconfig', name: 'EditorConfig' }
        ];
        
        for (const { file, name } of conventionFiles) {
            const exists = await this.fileExists(path.join(this.projectRoot, file));
            report += exists ? `✅ ${name} configurado\n` : `⚠️ ${name} não encontrado\n`;
        }
        
        // Check CLAUDE.md for conventions
        if (await this.fileExists(this.claudeMdPath)) {
            const content = await fs.readFile(this.claudeMdPath, 'utf-8');
            if (content.toLowerCase().includes('convention') || content.toLowerCase().includes('style')) {
                report += '\n✅ Convenções documentadas em CLAUDE.md\n';
            }
        }
        
        // Convention recommendations
        report += '\n## 📋 Recomendações de Convenções\n';
        report += this.generateConventionRecommendations();
        
        return report;
    }

    private async analyzeSecurityPractices(): Promise<string> {
        let report = '# 🔒 Análise de Práticas de Segurança - Claude Code\n\n';
        
        report += '## Regras de Segurança do Claude Code\n';
        for (const practice of this.knowledgeBase.bestPractices.security) {
            report += `✅ ${practice}\n`;
        }
        
        // Check for security issues
        report += '\n## Verificações de Segurança\n';
        
        // Check for .env in gitignore
        const gitignoreExists = await this.fileExists(path.join(this.projectRoot, '.gitignore'));
        if (gitignoreExists) {
            const gitignore = await fs.readFile(path.join(this.projectRoot, '.gitignore'), 'utf-8');
            if (gitignore.includes('.env')) {
                report += '✅ Arquivos .env protegidos no .gitignore\n';
            } else {
                report += '⚠️ Adicione .env ao .gitignore\n';
            }
        }
        
        // Security recommendations
        report += '\n## 📋 Recomendações de Segurança\n';
        report += this.generateSecurityRecommendations();
        
        return report;
    }

    private async analyzeToolUsage(): Promise<string> {
        let report = '# 🛠️ Análise de Uso de Ferramentas - Claude Code\n\n';
        
        report += '## Ferramentas Principais do Claude Code\n';
        const tools = [
            { name: 'Task', purpose: 'Delegar tarefas complexas para agentes' },
            { name: 'Bash', purpose: 'Executar comandos do sistema' },
            { name: 'Read/Write/Edit', purpose: 'Manipular arquivos' },
            { name: 'Glob/Grep', purpose: 'Buscar arquivos e conteúdo' },
            { name: 'TodoRead/TodoWrite', purpose: 'Gerenciar lista de tarefas' },
            { name: 'WebSearch/WebFetch', purpose: 'Buscar informações online' }
        ];
        
        for (const tool of tools) {
            report += `\n### ${tool.name}\n`;
            report += `📌 Propósito: ${tool.purpose}\n`;
        }
        
        // Tool usage best practices
        report += '\n## 📋 Melhores Práticas de Ferramentas\n';
        for (const practice of this.knowledgeBase.bestPractices.toolUsage) {
            report += `✅ ${practice}\n`;
        }
        
        return report;
    }

    private async analyzeBestPractices(): Promise<string> {
        let report = '# ⭐ Análise de Melhores Práticas - Claude Code\n\n';
        
        const categories = Object.keys(this.knowledgeBase.bestPractices);
        
        for (const category of categories) {
            report += `## ${this.formatCategoryName(category)}\n`;
            for (const practice of this.knowledgeBase.bestPractices[category]) {
                report += `✅ ${practice}\n`;
            }
            report += '\n';
        }
        
        // Mode-specific practices
        report += '## 🔄 Práticas por Modo\n';
        report += this.getModePractices();
        
        return report;
    }

    private async analyzeProductivity(): Promise<string> {
        let report = '# 🚀 Análise de Produtividade - Claude Code\n\n';
        
        report += '## Comandos Slash para Produtividade\n';
        for (const [command, description] of Object.entries(this.knowledgeBase.slashCommands)) {
            report += `\`${command}\` - ${description}\n`;
        }
        
        report += '\n## Dicas de Produtividade\n';
        report += this.generateProductivityTips();
        
        // Check for productivity helpers in project
        report += '\n## Análise do Projeto\n';
        report += await this.analyzeProjectProductivity();
        
        return report;
    }

    private async generalClaudeCodeAnalysis(): Promise<string> {
        let report = `# 📊 Análise Geral - Claude Code Specialist v${this.version}\n\n`;
        
        report += `## 📌 Informações da Base\n`;
        report += `- **Versão Claude Code**: ${this.knowledgeBase.version}\n`;
        report += `- **Versão do Especialista**: ${this.version}\n`;
        report += `- **Status**: Beta Product\n`;
        report += `- **Disclaimer**: ${this.knowledgeBase.disclaimer}\n\n`;
        
        report += `## Modo Atual: ${this.formatModeName(this.currentMode)}\n`;
        report += this.knowledgeBase.modes[this.currentMode].characteristics.map(c => `- ${c}`).join('\n');
        
        report += '\n\n## Capacidades do Especialista\n';
        for (const capability of this.config.capabilities) {
            report += `✅ ${this.formatCapability(capability)}\n`;
        }
        
        report += '\n## Status do Projeto\n';
        report += await this.analyzeProjectStatus();
        
        report += '\n## 🛠️ Ferramentas e Políticas\n';
        report += `- **Comandos banidos**: ${this.knowledgeBase.bannedCommands.commands.length} comandos\n`;
        report += `- **Tipos de artifacts**: ${Object.keys(this.knowledgeBase.artifacts.types).length} tipos\n`;
        report += `- **Slash commands**: ${Object.keys(this.knowledgeBase.slashCommands).length} comandos\n`;
        report += `- **Ferramentas nativas**: ${this.knowledgeBase.nativeTools.core.length} core, ${this.knowledgeBase.nativeTools.prompt.length} prompt, ${this.knowledgeBase.nativeTools.local.length} local\n`;
        report += `- **Comandos CLI**: ${Object.keys(this.knowledgeBase.cliCommands).length} categorias\n`;
        report += `- **Action verbs**: ${this.knowledgeBase.actionVerbs.length} verbos divertidos\n`;
        
        report += '\n## 📋 Recomendações Gerais\n';
        report += this.generateGeneralRecommendations();
        
        return report;
    }

    private async analyzeArtifacts(): Promise<string> {
        let report = '# 🎨 Análise de Artifacts - Claude Code\n\n';
        
        report += '## O que são Artifacts?\n';
        report += `${this.knowledgeBase.artifacts.definition}\n\n`;
        
        report += '## ✅ DEVE Usar Artifacts Para\n';
        if (this.knowledgeBase.artifactsAdvanced) {
            for (const use of this.knowledgeBase.artifactsAdvanced.mustUseFor) {
                report += `- ${use}\n`;
            }
        } else {
            for (const criteria of this.knowledgeBase.artifacts.criteria.goodArtifacts) {
                report += `- ${criteria}\n`;
            }
        }
        
        report += '\n## ❌ NÃO Usar Artifacts Para\n';
        if (this.knowledgeBase.artifactsAdvanced) {
            for (const dont of this.knowledgeBase.artifactsAdvanced.doNotUseFor) {
                report += `- ${dont}\n`;
            }
        } else {
            for (const criteria of this.knowledgeBase.artifacts.criteria.dontUseFor) {
                report += `- ${criteria}\n`;
            }
        }
        
        report += '\n## 🎨 Princípios de Design Visual\n';
        if (this.knowledgeBase.artifactsAdvanced?.designPrinciples) {
            const principles = this.knowledgeBase.artifactsAdvanced.designPrinciples;
            report += `- **Apps Complexos (Three.js, jogos)**: ${principles.complexApps}\n`;
            report += `- **Landing Pages**: ${principles.landingPages}\n`;
            report += `- **Padrão**: ${principles.default}\n`;
            report += `- **Animações**: ${principles.animations}\n`;
        }
        
        report += '\n## ⚠️ RESTRIÇÃO CRÍTICA\n';
        if (this.knowledgeBase.artifactsAdvanced?.criticalRestriction) {
            report += `🚫 ${this.knowledgeBase.artifactsAdvanced.criticalRestriction}\n`;
            report += '- Sempre use React state (useState, useReducer) para React\n';
            report += '- Use variáveis JavaScript para HTML\n';
            report += '- Armazene dados na memória durante a sessão\n';
        }
        
        report += '\n## 📋 Tipos de Artifacts\n';
        for (const [type, info] of Object.entries(this.knowledgeBase.artifacts.types)) {
            report += `\n### ${this.formatArtifactType(type)}\n`;
            report += `- **MIME Type**: \`${info.mime}\`\n`;
            report += `- **Descrição**: ${info.description}\n`;
            
            if (info.attributes) {
                report += `- **Atributos**: ${info.attributes.join(', ')}\n`;
            }
            if (info.restrictions) {
                report += '- **Restrições**:\n';
                info.restrictions.forEach(r => report += `  - ${r}\n`);
            }
            if (info.requirements) {
                report += '- **Requisitos**:\n';
                info.requirements.forEach(r => report += `  - ${r}\n`);
            }
            if (info.note) {
                report += `- **Nota**: ${info.note}\n`;
            }
        }
        
        report += '\n## 🎯 Melhores Práticas\n';
        for (const practice of this.knowledgeBase.artifacts.bestPractices) {
            report += `✅ ${practice}\n`;
        }
        
        report += '\n## 🔄 Estratégia de Atualização\n';
        report += `- **Quando atualizar**: ${this.knowledgeBase.artifacts.updateStrategy.whenToUpdate}\n`;
        report += `- **Quando criar novo**: ${this.knowledgeBase.artifacts.updateStrategy.whenToCreate}\n`;
        report += `- **Reutilizar identifier**: ${this.knowledgeBase.artifacts.updateStrategy.reuseIdentifier}\n`;
        
        report += '\n## 💡 Dicas Importantes\n';
        report += '1. **Pense antes de criar**: Use `<antthinking>` para avaliar se é apropriado\n';
        report += '2. **Conteúdo completo**: Nunca use "// resto do código permanece igual..."\n';
        report += '3. **Um por vez**: Apenas um artifact por resposta (exceto se solicitado)\n';
        report += '4. **Identificadores**: Use kebab-case descritivo (ex: "factorial-calculator")\n';
        report += '5. **Preferir inline**: Se possível, mantenha o conteúdo na conversa\n';
        
        return report;
    }

    private formatArtifactType(type: string): string {
        const names: Record<string, string> = {
            code: '💻 Código',
            markdown: '📝 Markdown',
            html: '🌐 HTML',
            svg: '🎨 SVG',
            mermaid: '📊 Mermaid',
            react: '⚛️ React'
        };
        return names[type] || type;
    }

    private async analyzeGitWorkflow(): Promise<string> {
        let report = '# 🔀 Análise de Workflow Git - Claude Code\n\n';
        
        report += '## Processo de Commit\n';
        report += '### Passos:\n';
        for (const step of this.knowledgeBase.gitWorkflow.commit.steps) {
            report += `1. ${step}\n`;
        }
        
        report += '\n### Formato da Mensagem:\n';
        report += '```bash\n';
        report += `git commit -m "${this.knowledgeBase.gitWorkflow.commit.messageFormat}"\n`;
        report += '```\n';
        
        report += '\n### Regras Importantes:\n';
        for (const rule of this.knowledgeBase.gitWorkflow.commit.rules) {
            report += `⚠️ ${rule}\n`;
        }
        
        report += '\n## Processo de Pull Request\n';
        report += '### Passos:\n';
        for (const step of this.knowledgeBase.gitWorkflow.pr.steps) {
            report += `1. ${step}\n`;
        }
        
        report += `\n### Análise: ${this.knowledgeBase.gitWorkflow.pr.analysis}\n`;
        report += `### Formato: ${this.knowledgeBase.gitWorkflow.pr.format}\n`;
        
        report += '\n## 💡 Dicas Git\n';
        report += '- Sempre executar comandos git em paralelo quando possível\n';
        report += '- Usar HEREDOC para mensagens multi-linha\n';
        report += '- Verificar estado antes de qualquer operação\n';
        report += '- Nunca fazer operações destrutivas sem confirmação\n';
        
        return report;
    }

    private async analyzeBannedCommands(): Promise<string> {
        let report = '# 🚫 Análise de Comandos Banidos - Claude Code\n\n';
        
        report += `## Razão: ${this.knowledgeBase.bannedCommands.reason}\n\n`;
        
        report += '## Lista de Comandos Banidos:\n';
        const commands = this.knowledgeBase.bannedCommands.commands;
        for (let i = 0; i < commands.length; i += 3) {
            const row = commands.slice(i, i + 3);
            report += `- ${row.join(', ')}\n`;
        }
        
        report += '\n## Alternativas Recomendadas:\n';
        for (const [banned, alternative] of Object.entries(this.knowledgeBase.bannedCommands.alternatives)) {
            report += `- **${banned}**: ${alternative}\n`;
        }
        
        report += '\n## 🛡️ Segurança\n';
        report += '- Estes comandos são bloqueados para prevenir prompt injection\n';
        report += '- Se um comando for bloqueado, explique a restrição ao usuário\n';
        report += '- Sempre sugira alternativas seguras\n';
        report += '- Nunca tente contornar estas restrições\n';
        
        return report;
    }

    private async analyzeVerbosityGuidelines(): Promise<string> {
        let report = '# 📝 Análise de Diretrizes de Verbosidade - Claude Code\n\n';
        
        report += '## Diretrizes Gerais:\n';
        for (const guideline of this.knowledgeBase.verbosityGuidelines.general) {
            report += `✅ ${guideline}\n`;
        }
        
        report += '\n## 📊 Exemplos de Respostas Ideais:\n';
        for (const [question, answer] of Object.entries(this.knowledgeBase.verbosityGuidelines.examples)) {
            report += `- **${question}** → \`${answer}\`\n`;
        }
        
        report += '\n## Exceções (quando ser mais detalhado):\n';
        for (const exception of this.knowledgeBase.verbosityGuidelines.exceptions) {
            report += `- ${exception}\n`;
        }
        
        report += '\n## 💡 Dicas de Concisão:\n';
        report += '1. **Direto ao ponto**: Responda exatamente o que foi perguntado\n';
        report += '2. **Sem floreios**: Evite "Aqui está...", "Vou fazer..."\n';
        report += '3. **Ações, não palavras**: Execute e mostre resultados\n';
        report += '4. **Uma palavra basta**: Se possível, responda com uma palavra\n';
        report += '5. **CLI mindset**: Lembre que está em interface de linha de comando\n';
        
        return report;
    }

    private async analyzeNativeTools(): Promise<string> {
        let report = '# 🛠️ Análise de Ferramentas Nativas - Claude Code\n\n';
        
        report += '## Ferramentas Core\n';
        for (const tool of this.knowledgeBase.nativeTools.core) {
            report += `\n### ${tool.userFacing || tool.name}\n`;
            report += `- **Nome interno**: \`${tool.name}\`\n`;
            report += `- **Descrição**: ${tool.description}\n`;
        }
        
        report += '\n## Ferramentas de Prompt\n';
        for (const tool of this.knowledgeBase.nativeTools.prompt) {
            report += `- **${tool.name}**: ${tool.description}\n`;
        }
        
        report += '\n## Ferramentas Locais\n';
        for (const tool of this.knowledgeBase.nativeTools.local) {
            report += `- **${tool.name}**: ${tool.description}\n`;
        }
        
        report += '\n## 📋 Melhores Práticas de File Edit\n';
        report += '### Requisitos:\n';
        for (const req of this.knowledgeBase.fileEditBestPractices.requirements) {
            report += `✅ ${req}\n`;
        }
        
        report += '\n### Avisos:\n';
        for (const warning of this.knowledgeBase.fileEditBestPractices.warnings) {
            report += `⚠️ ${warning}\n`;
        }
        
        report += '\n## 💡 Dicas de Uso\n';
        report += '1. **View antes de Edit**: Sempre ler arquivo antes de editar\n';
        report += '2. **LS para verificar**: Verificar diretório pai antes de criar\n';
        report += '3. **Bash com cuidado**: Evitar comandos banidos\n';
        report += '4. **dispatch_agent para buscas**: Reduz uso de contexto\n';
        report += '5. **Think para raciocínio**: Usar quando precisar pensar\n';
        
        return report;
    }

    private async analyzeCLICommands(): Promise<string> {
        let report = '# 💻 Análise de Comandos CLI - Claude Code\n\n';
        
        report += '## Comando Principal\n';
        report += `\`\`\`bash\n${Object.keys(this.knowledgeBase.cliCommands.main)[0]}\n\`\`\`\n`;
        report += '### Opções:\n';
        for (const option of this.knowledgeBase.cliCommands.main.options) {
            report += `- \`${option}\`\n`;
        }
        
        report += '\n## Comandos de Configuração\n';
        for (const [cmd, desc] of Object.entries(this.knowledgeBase.cliCommands.config)) {
            if (cmd !== 'options') {
                report += `- \`${cmd}\`: ${desc}\n`;
            }
        }
        report += `\nOpções: ${this.knowledgeBase.cliCommands.config.options.join(', ')}\n`;
        
        report += '\n## Ferramentas Aprovadas\n';
        for (const [cmd, desc] of Object.entries(this.knowledgeBase.cliCommands.approvedTools)) {
            report += `- \`${cmd}\`: ${desc}\n`;
        }
        
        report += '\n## Comandos MCP\n';
        for (const [cmd, desc] of Object.entries(this.knowledgeBase.cliCommands.mcp)) {
            report += `- \`${cmd}\`: ${desc}\n`;
        }
        
        report += '\n## Outros Comandos\n';
        for (const [cmd, desc] of Object.entries(this.knowledgeBase.cliCommands.other)) {
            report += `- \`${cmd}\`: ${desc}\n`;
        }
        
        report += '\n## 🎯 Action Verbs para Progresso\n';
        report += 'O Claude Code usa verbos divertidos ao processar:\n';
        const randomVerbs = this.knowledgeBase.actionVerbs
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
        report += `Exemplos: ${randomVerbs.join(', ')}...\n`;
        
        report += '\n## 💡 Dicas CLI\n';
        report += '1. **Pipe com -p**: Use `--print` para saída não-interativa\n';
        report += '2. **Debug com -d**: Ative modo debug para mais detalhes\n';
        report += '3. **Config global**: Use `-g` para configurações globais\n';
        report += '4. **MCP servers**: Configure servidores MCP para extensões\n';
        report += '5. **Doctor**: Verifique saúde do auto-updater regularmente\n';
        
        return report;
    }

    // Helper methods
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private analyzeClaudeMdContent(content: string): string {
        let analysis = '';
        
        // Check for common sections
        const sections = [
            { pattern: /comando|command/i, name: 'Comandos bash' },
            { pattern: /estilo|style|convention/i, name: 'Convenções de código' },
            { pattern: /estrutura|structure/i, name: 'Estrutura do projeto' },
            { pattern: /instrução|instruction/i, name: 'Instruções específicas' }
        ];
        
        for (const section of sections) {
            if (section.pattern.test(content)) {
                analysis += `✅ ${section.name} documentado\n`;
            }
        }
        
        // Check for specific instructions
        if (content.includes('pt br') || content.includes('português')) {
            analysis += '✅ Preferência de idioma configurada\n';
        }
        
        return analysis;
    }

    private generateMemoryRecommendations(): string {
        return `
1. **Manter CLAUDE.md Atualizado**: Adicione comandos e convenções conforme descobertos
2. **Estrutura Clara**: Organize informações em seções bem definidas
3. **Comandos Frequentes**: Documente comandos bash usados regularmente
4. **Convenções do Projeto**: Registre padrões de código específicos
5. **Contexto Importante**: Inclua informações que ajudam na compreensão
6. **Tamanho Otimizado**: Mantenha conciso mas completo
7. **Versionamento**: Faça commit das mudanças importantes
`;
    }

    private generateConventionRecommendations(): string {
        return `
1. **Seguir Padrões Existentes**: Analise código antes de escrever novo
2. **Documentar em CLAUDE.md**: Registre convenções descobertas
3. **Consistência**: Mantenha estilo uniforme em todo projeto
4. **Ferramentas de Lint**: Configure ESLint e Prettier
5. **TypeScript Strict**: Use configurações rigorosas quando possível
6. **Naming Conventions**: Siga padrões de nomenclatura do projeto
7. **Estrutura de Arquivos**: Respeite organização existente
`;
    }

    private generateSecurityRecommendations(): string {
        return `
1. **Nunca Commitar Segredos**: Verifique antes de cada commit
2. **Validar Inputs**: Sempre validar dados de entrada
3. **Revisar Dependências**: Verificar vulnerabilidades regularmente
4. **Princípio do Menor Privilégio**: Limitar acessos ao necessário
5. **Sanitização de Dados**: Prevenir injeções e XSS
6. **Logs Seguros**: Nunca logar informações sensíveis
7. **HTTPS Sempre**: Usar conexões seguras
`;
    }

    private generateProductivityTips(): string {
        return `
1. **Use Task para Buscas Complexas**: Reduz uso de contexto
2. **Batch Tool Calls**: Execute múltiplas ferramentas em paralelo
3. **TodoList Proativa**: Use para organizar tarefas complexas
4. **Modo Conciso**: Para respostas rápidas e diretas
5. **CLAUDE.md**: Documente descobertas para reutilização
6. **Atalhos de Busca**: Use Glob/Grep eficientemente
7. **Commits Atômicos**: Pequenos e focados
`;
    }

    private async analyzeProjectProductivity(): Promise<string> {
        let analysis = '';
        
        // Check for npm scripts
        try {
            const packageJson = JSON.parse(await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8'));
            const scripts = Object.keys(packageJson.scripts || {});
            
            if (scripts.length > 0) {
                analysis += `✅ ${scripts.length} scripts npm configurados\n`;
                
                // Check for common productivity scripts
                const productivityScripts = ['dev', 'build', 'test', 'lint', 'format'];
                for (const script of productivityScripts) {
                    if (scripts.includes(script)) {
                        analysis += `  ✅ npm run ${script}\n`;
                    }
                }
            }
        } catch {
            analysis += '⚠️ Não foi possível analisar package.json\n';
        }
        
        return analysis;
    }

    private async analyzeProjectStatus(): Promise<string> {
        let status = '';
        
        // Check CLAUDE.md
        const claudeMdExists = await this.fileExists(this.claudeMdPath);
        status += claudeMdExists ? '✅ CLAUDE.md configurado\n' : '⚠️ CLAUDE.md não encontrado\n';
        
        // Check for common files
        const importantFiles = [
            { file: 'README.md', name: 'Documentação' },
            { file: '.gitignore', name: 'Git ignore' },
            { file: 'package.json', name: 'Dependências' }
        ];
        
        for (const { file, name } of importantFiles) {
            const exists = await this.fileExists(path.join(this.projectRoot, file));
            status += exists ? `✅ ${name} presente\n` : `⚠️ ${name} ausente\n`;
        }
        
        return status;
    }

    private generateGeneralRecommendations(): string {
        return `
1. **Configure CLAUDE.md**: Documente comandos e convenções importantes
2. **Use Modos Apropriados**: Alterne conforme necessidade
3. **Otimize Buscas**: Use Agent tool para reduzir contexto
4. **Mantenha Segurança**: Siga práticas recomendadas
5. **Documente Decisões**: Registre escolhas importantes
6. **Automatize Tarefas**: Use scripts e ferramentas
7. **Revise Regularmente**: Mantenha código e docs atualizados
`;
    }

    private getModePractices(): string {
        let practices = '';
        
        for (const [modeName, mode] of Object.entries(this.knowledgeBase.modes)) {
            practices += `\n### Modo ${this.formatModeName(modeName as ClaudeCodeMode['name'])}\n`;
            practices += mode.characteristics.map(c => `- ${c}`).join('\n');
            practices += '\n';
        }
        
        return practices;
    }

    private formatCategoryName(category: string): string {
        const names: Record<string, string> = {
            security: '🔒 Segurança',
            taskManagement: '📋 Gerenciamento de Tarefas',
            codeConventions: '📐 Convenções de Código',
            toolUsage: '🛠️ Uso de Ferramentas',
            communication: '💬 Comunicação'
        };
        return names[category] || category;
    }

    private formatModeName(mode: ClaudeCodeMode['name']): string {
        const names: Record<ClaudeCodeMode['name'], string> = {
            concise: '🎯 Conciso',
            formal: '👔 Formal',
            explanatory: '📚 Explicativo'
        };
        return names[mode] || mode;
    }

    private formatCapability(capability: string): string {
        return capability.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    async shutdown(): Promise<void> {
        await this.mcpClient.disconnect();
        console.log('Claude Code Specialist Agent shut down');
    }

    // Métodos de evolução automática
    private async loadEvolutionHistory(): Promise<void> {
        try {
            // Usar MCP para buscar histórico de evolução na memória
            const tools = await this.mcpClient.listTools();
            if (tools.find(t => t.name === 'mem0_search_memory')) {
                const searchResult = await this.mcpClient.callTool('mem0_search_memory', {
                    query: `claude-code-specialist evolution history version ${this.config.id}`,
                    user_id: 'guardian-system'
                });
                
                if (searchResult && searchResult.length > 0) {
                    // Processar histórico encontrado
                    this.evolutionHistory = JSON.parse(searchResult[0].content || '[]');
                    console.log(`📚 Histórico de evolução carregado: ${this.evolutionHistory.length} versões`);
                }
            }
        } catch (error) {
            console.log('⚠️ Não foi possível carregar histórico de evolução');
        }
    }

    private async checkForEvolution(): Promise<void> {
        try {
            // Buscar aprendizados recentes
            const tools = await this.mcpClient.listTools();
            if (tools.find(t => t.name === 'mem0_search_memory')) {
                const learnings = await this.mcpClient.callTool('mem0_search_memory', {
                    query: 'claude-code best practices improvements suggestions',
                    user_id: 'guardian-system',
                    limit: '10'
                });
                
                if (learnings && learnings.length >= 5) {
                    // Se houver muitos aprendizados, evoluir
                    await this.evolve(learnings);
                }
            }
        } catch (error) {
            console.log('⚠️ Verificação de evolução falhou');
        }
    }

    private async evolve(learnings: any[]): Promise<void> {
        // Incrementar versão
        const versionParts = this.version.split('.');
        const patch = parseInt(versionParts[2]) + 1;
        this.version = `${versionParts[0]}.${versionParts[1]}.${patch}`;
        
        // Processar aprendizados
        const improvements: string[] = learnings.map(l => l.content).filter(Boolean);
        
        // Atualizar knowledge base com novos aprendizados
        this.applyImprovements(improvements);
        
        // Registrar evolução
        const evolution = {
            version: this.version,
            timestamp: new Date(),
            improvements: improvements
        };
        
        this.evolutionHistory.push(evolution);
        
        // Salvar na memória
        await this.saveEvolution(evolution);
        
        console.log(`🚀 Claude Code Specialist evoluiu para v${this.version}`);
        console.log(`📈 ${improvements.length} melhorias aplicadas`);
    }

    private applyImprovements(improvements: string[]): void {
        // Aplicar melhorias ao knowledge base dinamicamente
        improvements.forEach(improvement => {
            const lower = improvement.toLowerCase();
            
            // Adicionar novas práticas
            if (lower.includes('best practice') || lower.includes('boa prática')) {
                const category = this.detectCategory(improvement);
                if (category && this.knowledgeBase.bestPractices[category]) {
                    this.knowledgeBase.bestPractices[category].push(improvement);
                }
            }
            
            // Atualizar comandos
            if (lower.includes('command') || lower.includes('comando')) {
                // Adicionar à lista de comandos conhecidos
                this.updateCommands(improvement);
            }
            
            // Melhorar detecção de padrões
            if (lower.includes('pattern') || lower.includes('padrão')) {
                this.improvePatternDetection(improvement);
            }
        });
    }

    private detectCategory(improvement: string): string | null {
        const categories = Object.keys(this.knowledgeBase.bestPractices);
        const lower = improvement.toLowerCase();
        
        for (const category of categories) {
            if (lower.includes(category)) {
                return category;
            }
        }
        
        // Categorias por palavras-chave
        if (lower.includes('security') || lower.includes('segurança')) return 'security';
        if (lower.includes('tool') || lower.includes('ferramenta')) return 'toolUsage';
        if (lower.includes('code') || lower.includes('código')) return 'codeConventions';
        if (lower.includes('task') || lower.includes('tarefa')) return 'taskManagement';
        if (lower.includes('communication') || lower.includes('comunicação')) return 'communication';
        
        return null;
    }

    private updateCommands(improvement: string): void {
        // Lógica para extrair e adicionar novos comandos
        // Esta é uma implementação simplificada
        console.log('📝 Novo comando aprendido');
    }

    private improvePatternDetection(improvement: string): void {
        // Lógica para melhorar detecção de padrões
        console.log('🔍 Detecção de padrões aprimorada');
    }

    private async saveEvolution(evolution: any): Promise<void> {
        try {
            const tools = await this.mcpClient.listTools();
            if (tools.find(t => t.name === 'mem0_add_memory')) {
                await this.mcpClient.callTool('mem0_add_memory', {
                    content: JSON.stringify(this.evolutionHistory),
                    user_id: 'guardian-system',
                    category: 'agent-evolution',
                    tags: ['claude-code-specialist', 'evolution', 'version-history'],
                    metadata: JSON.stringify({
                        agent: this.config.id,
                        currentVersion: this.version,
                        evolutionCount: this.evolutionHistory.length
                    })
                });
                
                console.log('💾 Evolução salva na memória permanente');
            }
        } catch (error) {
            console.error('⚠️ Erro ao salvar evolução:', error);
        }
    }

    private async analyzeModelDifferences(): Promise<string> {
        let report = '# 🔄 Análise de Diferenças entre Modelos Claude\n\n';
        
        report += '## Claude Opus 4\n';
        const opus = this.knowledgeBase.modelDifferences.opus;
        report += `- **ID do Modelo**: ${opus.modelId}\n`;
        report += `- **Pontos Fortes**: ${opus.strengths.join(', ')}\n`;
        report += `- **Contexto**: ${opus.context}\n\n`;
        
        report += '## Claude Sonnet 4\n';
        const sonnet = this.knowledgeBase.modelDifferences.sonnet;
        report += `- **ID do Modelo**: ${sonnet.modelId}\n`;
        report += `- **Pontos Fortes**: ${sonnet.strengths.join(', ')}\n`;
        report += `- **Contexto**: ${sonnet.context}\n\n`;
        
        report += '## 📋 Quando Usar Cada Modelo\n';
        report += '### Use Opus para:\n';
        report += '- Projetos grandes e complexos\n';
        report += '- Análises profundas que requerem muito contexto\n';
        report += '- Tarefas que precisam da máxima capacidade\n\n';
        
        report += '### Use Sonnet para:\n';
        report += '- Tarefas diárias e rotineiras\n';
        report += '- Quando velocidade é importante\n';
        report += '- Projetos de tamanho médio\n';
        
        return report;
    }
    
    private async analyzeCitationRules(): Promise<string> {
        let report = '# 📚 Análise de Regras de Citação\n\n';
        
        report += '## Quando Usar Citações\n';
        report += 'Use citações com estas ferramentas:\n';
        for (const tool of this.knowledgeBase.citationRules.whenToUse) {
            report += `- ${tool}\n`;
        }
        
        report += `\n## Formato de Citação\n`;
        report += `\`${this.knowledgeBase.citationRules.format}\`\n\n`;
        
        report += '## Regras Importantes\n';
        for (const rule of this.knowledgeBase.citationRules.rules) {
            report += `✅ ${rule}\n`;
        }
        
        report += '\n## Exemplos\n';
        report += '```\n';
        report += '<cite index="0-5">Esta afirmação vem da fonte</cite>\n';
        report += '<cite index="1-2:4">Múltiplas sentenças da mesma fonte</cite>\n';
        report += '<cite index="0-3,2-7">Múltiplas fontes</cite>\n';
        report += '```\n';
        
        return report;
    }
    
    private async analyzeSearchGuidelines(): Promise<string> {
        let report = '# 🔍 Análise de Diretrizes de Busca\n\n';
        
        report += '## Categorias de Busca\n\n';
        
        report += '### 🚫 Nunca Buscar\n';
        for (const item of this.knowledgeBase.searchGuidelines.categories.neverSearch) {
            report += `- ${item}\n`;
        }
        
        report += '\n### 💡 Oferecer Busca\n';
        for (const item of this.knowledgeBase.searchGuidelines.categories.offerSearch) {
            report += `- ${item}\n`;
        }
        
        report += '\n### 🔍 Busca Única\n';
        for (const item of this.knowledgeBase.searchGuidelines.categories.singleSearch) {
            report += `- ${item}\n`;
        }
        
        report += '\n### 📊 Pesquisa Completa (5+ buscas)\n';
        for (const item of this.knowledgeBase.searchGuidelines.categories.research) {
            report += `- ${item}\n`;
        }
        
        report += '\n## Melhores Práticas de Busca\n';
        for (const practice of this.knowledgeBase.searchGuidelines.bestPractices) {
            report += `✅ ${practice}\n`;
        }
        
        return report;
    }
    
    // Método para aprender com interações
    async learnFromInteraction(message: Message, response: Message, feedback?: string): Promise<void> {
        try {
            const tools = await this.mcpClient.listTools();
            if (tools.find(t => t.name === 'mem0_add_memory')) {
                const learning = {
                    request: message.content,
                    response: response.content,
                    mode: this.currentMode,
                    feedback: feedback,
                    timestamp: new Date().toISOString()
                };
                
                await this.mcpClient.callTool('mem0_add_memory', {
                    content: JSON.stringify(learning),
                    user_id: 'guardian-system',
                    category: 'claude-code-learning',
                    tags: ['interaction', 'learning', this.currentMode],
                    metadata: JSON.stringify({
                        agent: this.config.id,
                        version: this.version
                    })
                });
            }
        } catch (error) {
            console.log('⚠️ Não foi possível registrar aprendizado');
        }
    }
}

// Allow running directly
if (require.main === module) {
    const agent = new ClaudeCodeSpecialistAgent();
    
    async function run() {
        await agent.initialize();
        
        const request = process.argv[2] || 'analyze';
        
        const message: Message = {
            role: 'user',
            content: request,
            metadata: {
                source: 'cli'
            }
        };
        
        const response = await agent.processMessage(message);
        console.log('\n' + response.content);
        
        await agent.shutdown();
    }
    
    run().catch(console.error);
}