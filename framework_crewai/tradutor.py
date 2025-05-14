#!/usr/bin/env python
import os
import sys
import json
from src.blog_automacao import BlogAutomacaoCrew

# Verifica se foi fornecido um arquivo para tradução
if len(sys.argv) > 1:
    arquivo_para_traduzir = sys.argv[1]
else:
    # Caso contrário, usa um arquivo fixo para teste
    arquivo_para_traduzir = 'posts_processados_original/para_traduzir_1747160344_0_analyst_reveals_xrp_ultimate_selling_strategy_towa.json'

# Verifica se o arquivo existe
if not os.path.exists(arquivo_para_traduzir):
    print(f"Erro: Arquivo {arquivo_para_traduzir} não encontrado!")
    sys.exit(1)

print(f"Iniciando tradução do arquivo: {arquivo_para_traduzir}")

# Inicializa a crew
crew = BlogAutomacaoCrew()

# Lê os dados do arquivo
with open(arquivo_para_traduzir, 'r', encoding='utf-8') as f:
    dados = json.load(f)

# Executa a tradução
print("Executando crew de tradução...")
resposta = crew.traducao_crew().kickoff(inputs={
    'artigo': dados,
    'arquivo_json': arquivo_para_traduzir
})

print("\nResultado da tradução:")
print(resposta.raw)
print("\nTraduções concluídas! Verifique a pasta posts_traduzidos.") 