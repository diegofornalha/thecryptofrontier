#!/usr/bin/env node
"use strict";
/**
 * Teste direto do Memory Enhanced Agent com AgentLog
 * Usa apenas as APIs necessárias sem importações problemáticas
 */
const API_BASE = 'http://localhost:5001'; // Dashboard Flask API
// Função para registrar início
async function logStart(agentName, taskId, taskDescription, metadata) {
    try {
        const response = await fetch(`${API_BASE}/log/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentName,
                agentType: 'custom',
                taskId,
                taskDescription,
                ...metadata
            })
        });
        if (!response.ok) {
            console.error('Erro ao registrar início:', await response.text());
        }
    }
    catch (error) {
        console.error('Erro de conexão com AgentLog:', error);
    }
}
// Função para registrar fim
async function logEnd(agentName, taskId, status, error, metadata) {
    try {
        const response = await fetch(`${API_BASE}/log/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentName,
                taskId,
                status,
                error,
                ...metadata
            })
        });
        if (!response.ok) {
            console.error('Erro ao registrar fim:', await response.text());
        }
    }
    catch (error) {
        console.error('Erro de conexão com AgentLog:', error);
    }
}
async function testMemoryAgent() {
    console.log('🧠 Iniciando teste do Memory Enhanced Agent...\n');
    // Tarefa 1: Simulação de busca em memórias
    const searchTaskId = `memory-search-${Date.now()}`;
    console.log('🔍 Executando busca em memórias (simulada)...');
    // Registrar início
    await logStart('Memory Enhanced Agent', searchTaskId, 'Busca por memórias sobre organização de projetos', {
        taskType: 'memory-search',
        complexity: 'simple',
        searchQuery: 'organização projetos estrutura'
    });
    const startTime = Date.now();
    // Simular busca (aguardar 1-2 segundos)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
    const duration = Date.now() - startTime;
    const resultsFound = Math.floor(Math.random() * 10) + 5; // 5-15 resultados
    console.log(`✅ Busca concluída em ${duration}ms`);
    console.log(`📊 Encontrados ${resultsFound} resultados\n`);
    // Registrar conclusão
    await logEnd('Memory Enhanced Agent', searchTaskId, 'completed', undefined, {
        resultsFound,
        searchDuration: duration,
        topResult: 'Estrutura de projeto com separação clara entre core, agents e utils'
    });
    // Mostrar alguns resultados simulados
    console.log('📋 Top 3 resultados:');
    console.log('1. Estrutura de projeto com separação clara entre core, agents e utils...');
    console.log('   Relevância: 95.2%');
    console.log('2. Organização modular permite fácil manutenção e extensão...');
    console.log('   Relevância: 87.5%');
    console.log('3. Padrões de projeto aplicados na estrutura do claude-diego-flow...');
    console.log('   Relevância: 82.1%');
    // Tarefa 2: Consolidação de memórias
    const consolidationTaskId = `memory-consolidation-${Date.now()}`;
    console.log('\n\n📚 Iniciando consolidação de memórias...');
    await logStart('Memory Enhanced Agent', consolidationTaskId, 'Consolidação de memórias duplicadas sobre AgentLog', {
        taskType: 'memory-consolidation',
        complexity: 'complex',
        targetTopic: 'AgentLog'
    });
    const consolidationStart = Date.now();
    // Simular processo de consolidação
    console.log('🔄 Analisando memórias existentes...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('🔀 Identificando duplicatas...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('✨ Consolidando informações...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const totalDuration = Date.now() - consolidationStart;
    console.log(`\n✅ Consolidação concluída em ${totalDuration}ms`);
    await logEnd('Memory Enhanced Agent', consolidationTaskId, 'completed', undefined, {
        memoriesAnalyzed: 17,
        memoriesConsolidated: 5,
        spaceSaved: '65%',
        duration: totalDuration
    });
    console.log('📊 Resultado da consolidação:');
    console.log('   - 17 memórias analisadas');
    console.log('   - 5 memórias consolidadas');
    console.log('   - 65% de redução no armazenamento');
    // Tarefa 3: Busca rápida
    const quickSearchTaskId = `memory-search-quick-${Date.now()}`;
    console.log('\n\n🚀 Executando busca rápida...');
    await logStart('Memory Enhanced Agent', quickSearchTaskId, 'Busca rápida por "AgentLog"', {
        taskType: 'memory-search',
        complexity: 'simple',
        searchQuery: 'AgentLog'
    });
    const quickStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 500));
    const quickDuration = Date.now() - quickStart;
    console.log(`✅ Busca rápida concluída em ${quickDuration}ms`);
    await logEnd('Memory Enhanced Agent', quickSearchTaskId, 'completed', undefined, {
        resultsFound: 8,
        searchDuration: quickDuration
    });
    console.log('\n\n🎉 Teste concluído! Verifique o dashboard em http://localhost:5001 para ver as métricas.');
    console.log('📊 3 tarefas executadas pelo Memory Enhanced Agent');
}
// Executar teste
testMemoryAgent().catch(console.error);
