#!/bin/bash

# Criar diretório de logs se não existir
mkdir -p logs

# Definir permissões corretas
chmod 755 logs

# Criar arquivo de log inicial se não existir
touch logs/guardian.log
chmod 644 logs/guardian.log

# Garantir que o diretório logs tenha o grupo correto
chown -R 1001:1001 logs

echo "✅ Configuração de logs concluída com sucesso!"
echo "📁 Diretório de logs: $(pwd)/logs"
echo "📝 Arquivo de log: $(pwd)/logs/guardian.log" 