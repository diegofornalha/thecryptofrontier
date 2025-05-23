# The Crypto Frontier - Arquitetura

## 🏗️ Infraestrutura

### Serviços Ativos
```
┌─────────────────────────────────────────┐
│            SERVIDOR LINUX               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────┐                    │
│  │    Caddy        │  ◄── HTTPS Proxy   │
│  │   Port 443      │                    │
│  └─────────┬───────┘                    │
│            │                            │
│  ┌─────────▼───────┐                    │
│  │ Next.js PROD    │                    │
│  │ Port 3200 ✅    │                    │
│  │ (The Crypto     │                    │
│  │  Frontier)      │                    │
│  └─────────────────┘                    │
└─────────────────────────────────────────┘
```

### Domínios
- **Produção**: https://thecryptofrontier.agentesintegrados.com → Port 3200
- **Local**: http://localhost:3200

## 🚀 Como Rodar

### Desenvolvimento
```bash
npm run dev:3200    # Porta 3200 (mesma do Caddy)
```

### Produção
```bash
./start-production.sh
```

## 📂 Estrutura

### App Router (Next.js 13+)
```
src/
├── app/
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx          # Página principal
│   └── search-section.tsx # Client Component
├── components/
└── pages_backup/         # Migração do Pages Router
```

### Scripts Úteis
- `npm run dev:3200` - Desenvolvimento na porta correta
- `npm run start:3200` - Produção na porta correta
- `./start-production.sh` - Script completo de produção

## ⚠️ Notas Importantes

1. **Porta 3200**: Configurada no Caddy, NÃO alterar
2. **App Router**: Migração do Pages Router em andamento
3. **Client Components**: Usar "use client" para hooks
4. **Caddy**: Gerencia HTTPS automaticamente

## 🔧 Troubleshooting

### Erro 502 Bad Gateway
```bash
# Verificar se o Next.js está rodando
lsof -i :3200

# Reiniciar se necessário
./start-production.sh
```

### Conflito Pages/App Router
```bash
# Pages Router foi renomeado para:
src/pages_backup/
```

## 📊 Monitoramento

### Logs
```bash
# Caddy
tail -f /var/log/caddy/thecryptofrontier.log

# Next.js (dev)
tail -f /tmp/next-3200.log
```

### Status
```bash
# Processos ativos
ps aux | grep next

# Portas ocupadas
ss -tlnp | grep 3200
```