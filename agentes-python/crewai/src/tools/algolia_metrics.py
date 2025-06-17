#!/usr/bin/env python3
"""
Script para calcular métricas de redução de código após unificação
dos serviços Algolia
"""

import os

def calculate_metrics():
    # Dados dos arquivos originais (linhas de código)
    original_files = {
        "algolia_tools.py": 179,
        "delete_algolia_duplicates.py": 239,
        "direct_sync_sanity_to_algolia.py": 170,
        "import_to_algolia.py": 268,
        "index_to_algolia.py": 240,
        "sync_algolia_tool.py": 311,
        "sync_direct_algolia.py": 150,
        "sync_sanity_to_algolia.py": 320,
        "update_algolia_tools.py": 148
    }
    
    # Contar linhas do arquivo unificado
    unified_file = "algolia_sync_service.py"
    unified_lines = 0
    
    if os.path.exists(unified_file):
        with open(unified_file, 'r') as f:
            unified_lines = len(f.readlines())
    
    total_original_lines = sum(original_files.values())
    reduction = total_original_lines - unified_lines
    reduction_percentage = (reduction / total_original_lines) * 100
    
    print(f"""
╔═══════════════════════════════════════════════════════════════╗
║         MÉTRICAS DE REDUÇÃO - SERVIÇO ALGOLIA UNIFICADO      ║
╚═══════════════════════════════════════════════════════════════╝

📊 ESTATÍSTICAS DE CONSOLIDAÇÃO:

Arquivos originais: {len(original_files)}
├── algolia_tools.py: {original_files['algolia_tools.py']} linhas
├── delete_algolia_duplicates.py: {original_files['delete_algolia_duplicates.py']} linhas
├── direct_sync_sanity_to_algolia.py: {original_files['direct_sync_sanity_to_algolia.py']} linhas
├── import_to_algolia.py: {original_files['import_to_algolia.py']} linhas
├── index_to_algolia.py: {original_files['index_to_algolia.py']} linhas
├── sync_algolia_tool.py: {original_files['sync_algolia_tool.py']} linhas
├── sync_direct_algolia.py: {original_files['sync_direct_algolia.py']} linhas
├── sync_sanity_to_algolia.py: {original_files['sync_sanity_to_algolia.py']} linhas
└── update_algolia_tools.py: {original_files['update_algolia_tools.py']} linhas

📈 RESULTADOS:
Total de linhas originais: {total_original_lines}
Linhas no serviço unificado: {unified_lines}
Redução: {reduction} linhas ({reduction_percentage:.1f}%)

✅ BENEFÍCIOS ALCANÇADOS:

1. 🔧 Configuração Centralizada
   - Um único ponto de configuração para Sanity e Algolia
   - Validação automática de credenciais
   - Gerenciamento de ambiente simplificado

2. 🚀 Performance Otimizada
   - Cliente Algolia singleton (lazy loading)
   - Reutilização de conexões
   - Batch processing otimizado

3. 🛡️ Manutenção Simplificada
   - Código DRY (Don't Repeat Yourself)
   - Tratamento de erros padronizado
   - Logging consistente

4. 🔄 Funcionalidades Unificadas
   - sync_from_sanity() - Sincronização completa ou incremental
   - update_record() - Atualização individual
   - delete_record() - Remoção de registros
   - bulk_import() - Importação em lote
   - find_and_remove_duplicates() - Limpeza automatizada

5. 🧩 API Consistente
   - Classe AlgoliaSyncService como interface única
   - Ferramentas @tool mantidas para compatibilidade CrewAI
   - Métodos auxiliares privados bem organizados

6. 📊 Detecção de Duplicatas Aprimorada
   - Verificação por ID, slug e URL
   - Prevenção proativa de duplicatas
   - Relatórios detalhados de operações

═══════════════════════════════════════════════════════════════
""")
    
    # Análise de complexidade
    print("""
🔍 ANÁLISE DE COMPLEXIDADE:

ANTES (9 arquivos):
- Configurações repetidas em cada arquivo
- Múltiplas implementações de cliente Algolia
- Lógica de transformação duplicada
- Tratamento de erros inconsistente
- Difícil rastreamento de bugs

DEPOIS (1 arquivo):
- Configuração única no __init__
- Cliente singleton com lazy loading
- Transformação centralizada (transform_post_to_algolia)
- Tratamento de erros padronizado
- Debug e manutenção facilitados

📝 RECOMENDAÇÕES:

1. Migrar gradualmente os scripts existentes para usar o serviço
2. Adicionar testes unitários para o AlgoliaSyncService
3. Implementar cache para operações de leitura frequentes
4. Adicionar métricas de performance (tempo de sync, etc)
5. Considerar implementação assíncrona para grandes volumes
""")

if __name__ == "__main__":
    calculate_metrics()