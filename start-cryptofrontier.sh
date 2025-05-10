#!/bin/bash

# Navegue até o diretório do projeto
cd /home/sanity/thecryptofrontier

# Matar qualquer processo que esteja usando a porta 3200
fuser -k 3200/tcp 2>/dev/null

# Aguardar um momento
sleep 2

# Configuração do ambiente
export PORT=3200

# Executar o servidor Next.js diretamente
nohup npx next dev -p 3200 > /var/log/cryptofrontier.log 2>&1 &

# Salvar o PID para referência futura
echo $! > /var/run/cryptofrontier.pid

# Adicionar ao log
echo "$(date) - Servidor The Crypto Frontier iniciado na porta 3200" >> /var/log/cryptofrontier-startup.log

echo "Servidor The Crypto Frontier iniciado na porta 3200" 