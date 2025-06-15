# Scripts de Backup Automatizados para Strapi

Este conjunto de scripts fornece uma solução completa de backup e restauração para o projeto Strapi.

## 📋 Scripts Disponíveis

### 1. `strapi-backup.sh`
Script principal que realiza backup completo do Strapi.

**O que é incluído no backup:**
- ✅ Banco de dados PostgreSQL (dump completo)
- ✅ Arquivos de upload (`/strapi/app/public/uploads`)
- ✅ Configurações (`.env`, `database.js`, `server.js`, etc.)
- ✅ Tipos de conteúdo (diretório `/api`)
- ✅ Componentes (diretório `/components`)
- ✅ Metadados do backup

**Como usar:**
```bash
cd /home/strapi/thecryptofrontier/scripts
./strapi-backup.sh
```

**Onde os backups são salvos:**
- Local: `/home/strapi/thecryptofrontier/backups/`
- Formato: `strapi_backup_YYYYMMDD_HHMMSS.zip`
- Retenção: Mantém os últimos 7 backups automaticamente

### 2. `strapi-restore.sh`
Script para restaurar backups do Strapi.

**Funcionalidades:**
- Lista todos os backups disponíveis
- Permite seleção interativa do backup
- Restauração seletiva de componentes
- Validações de segurança antes da restauração

**Como usar:**
```bash
cd /home/strapi/thecryptofrontier/scripts
./strapi-restore.sh
```

**Processo de restauração:**
1. Lista backups disponíveis
2. Solicita seleção do backup
3. Mostra componentes disponíveis
4. Confirma restauração (⚠️ sobrescreve dados atuais!)
5. Para containers Docker
6. Restaura componentes selecionados
7. Reinicia containers

### 3. `strapi-validate-backup.sh`
Script para validar a integridade dos backups.

**O que é verificado:**
- ✅ Integridade do arquivo ZIP
- ✅ Estrutura correta do backup
- ✅ Validade dos arquivos comprimidos
- ✅ Formato correto dos dumps SQL
- ✅ Metadados do backup

**Como usar:**
```bash
cd /home/strapi/thecryptofrontier/scripts
./strapi-validate-backup.sh
```

**Opções:**
- Validar um backup específico
- Validar todos os backups (opção 'A')

### 4. `strapi-backup-cron.sh`
Script wrapper para execução automatizada via cron.

**Características:**
- Gera logs detalhados
- Rotação automática de logs (30 dias)
- Preparado para notificações por email

**Configurar backup automático:**

1. Editar crontab:
```bash
crontab -e
```

2. Adicionar uma das seguintes linhas:

```bash
# Backup diário às 2:00 AM
0 2 * * * /home/strapi/thecryptofrontier/scripts/strapi-backup-cron.sh

# Backup a cada 6 horas
0 */6 * * * /home/strapi/thecryptofrontier/scripts/strapi-backup-cron.sh

# Backup 3x por semana (segunda, quarta, sexta) às 3:00 AM
0 3 * * 1,3,5 /home/strapi/thecryptofrontier/scripts/strapi-backup-cron.sh
```

**Logs do cron:**
- Local: `/home/strapi/thecryptofrontier/backups/logs/`
- Formato: `backup_cron_YYYYMMDD.log`

## 🐳 Compatibilidade com Docker

Todos os scripts são totalmente compatíveis com a configuração Docker do projeto:

- ✅ Detectam automaticamente containers em execução
- ✅ Usam `docker exec` para comandos no banco
- ✅ Gerenciam containers durante restauração
- ✅ Verificam saúde dos containers

## 🔧 Requisitos

- Docker e Docker Compose instalados
- Permissões de execução nos scripts
- Espaço em disco suficiente para backups
- Containers Strapi rodando (para backup)

## 📊 Estrutura do Backup

Cada backup contém:
```
strapi_backup_YYYYMMDD_HHMMSS.zip
├── metadata.json          # Informações sobre o backup
├── database.sql.gz        # Dump do PostgreSQL
├── uploads.tar.gz         # Arquivos de upload
├── configs.tar.gz         # Configurações
├── api.tar.gz            # Tipos de conteúdo
└── components.tar.gz      # Componentes
```

## ⚠️ Avisos Importantes

1. **Backup Regular**: Configure backups automáticos para evitar perda de dados
2. **Teste de Restauração**: Teste periodicamente o processo de restauração
3. **Espaço em Disco**: Monitore o espaço usado pelos backups
4. **Segurança**: Proteja os backups, eles contêm dados sensíveis

## 🚨 Troubleshooting

### Container não encontrado
```bash
# Verificar containers rodando
docker ps

# Iniciar containers se necessário
cd /home/strapi/thecryptofrontier/strapi
docker-compose -f docker-compose-v4.yml up -d
```

### Permissão negada
```bash
# Dar permissão de execução
chmod +x /home/strapi/thecryptofrontier/scripts/strapi-*.sh
```

### Espaço em disco insuficiente
```bash
# Verificar espaço disponível
df -h

# Limpar backups antigos manualmente
rm /home/strapi/thecryptofrontier/backups/strapi_backup_*.zip
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs em `/home/strapi/thecryptofrontier/backups/logs/`
2. Execute o script de validação para verificar integridade
3. Consulte a documentação do Strapi

---

*Scripts criados por Guardian - Sistema de Backup Automatizado*