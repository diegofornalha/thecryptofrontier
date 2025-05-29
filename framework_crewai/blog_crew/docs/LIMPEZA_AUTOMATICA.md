# 🧹 Sistema de Limpeza Automática de Arquivos JSON

## 📋 Visão Geral

O sistema agora possui limpeza automática dos arquivos JSON temporários gerados durante o processamento dos artigos.

## 🔄 Limpeza Automática (no Monitor)

### 1. **Limpeza Imediata após Publicação**
- Após publicar com sucesso, remove arquivos das últimas 2 horas
- Limpa todos os diretórios:
  - `posts_para_traduzir/`
  - `posts_traduzidos/`
  - `posts_formatados/`
  - `posts_publicados/`

### 2. **Limpeza Periódica Diária**
- Executa 1x por dia automaticamente
- Remove arquivos com mais de 7 dias
- Aplica-se a todos os diretórios temporários
- Registra no log quantos arquivos foram removidos

## 🛠️ Limpeza Manual

### Script: `clean_json_files.sh`

```bash
./clean_json_files.sh
```

### Opções disponíveis:
1. **Limpar arquivos > 7 dias** (padrão seguro)
2. **Limpar arquivos > 1 dia** (mais agressivo)
3. **Limpar TODOS** (incluindo posts_publicados)
4. **Limpar diretórios específicos**
5. **Cancelar**

### Exemplo de uso:
```bash
# Execução interativa
./clean_json_files.sh

# Output esperado:
📊 Estado atual dos diretórios:
posts_para_traduzir: 15 arquivos, 120K
posts_traduzidos: 15 arquivos, 450K
posts_formatados: 15 arquivos, 380K
posts_publicados: 45 arquivos, 1.2M
```

## 📁 Estrutura de Diretórios

```
blog_crew/
├── posts_para_traduzir/    # JSONs dos feeds RSS
├── posts_traduzidos/       # JSONs traduzidos
├── posts_formatados/       # JSONs formatados para Sanity
└── posts_publicados/       # Backup dos publicados
```

## ⚙️ Configurações

No arquivo `rss_monitor.py`:
```python
# Limpeza automática
self.cleanup_after_days = 7     # Dias para manter arquivos
self.cleanup_interval = 86400   # Intervalo de limpeza (24h)

# Diretórios monitorados
self.temp_dirs = [
    Path("posts_para_traduzir"),
    Path("posts_traduzidos"), 
    Path("posts_formatados"),
    Path("posts_publicados")
]
```

## 📊 Logs de Limpeza

Verificar atividade de limpeza:
```bash
# Ver limpezas realizadas
grep "Limpeza" rss_monitor.log

# Ver arquivos removidos
grep "Removendo arquivo" rss_monitor.log
```

## 🔍 Monitoramento

### Ver estatísticas atuais:
```bash
# Contar arquivos por diretório
for dir in posts_*; do
    echo "$dir: $(find $dir -name "*.json" | wc -l) arquivos"
done

# Ver espaço usado
du -sh posts_*
```

## ⚠️ Notas Importantes

1. **Limpeza Completa**: Todos os diretórios são limpos automaticamente
2. **Segurança**: Limpeza manual sempre pede confirmação
3. **Performance**: Limpeza automática não afeta o processamento
4. **Recuperação**: Arquivos deletados não podem ser recuperados

## 🚀 Benefícios

- ✅ Economia de espaço em disco
- ✅ Melhor organização
- ✅ Evita acúmulo de arquivos antigos
- ✅ Processo totalmente automatizado
- ✅ Opções manuais para casos especiais

## 🛡️ Troubleshooting

### Se a limpeza automática não funcionar:
```bash
# Verificar logs
grep "Erro ao limpar" rss_monitor.log

# Executar limpeza manual
./clean_json_files.sh

# Verificar permissões
ls -la posts_*/
```

### Para desabilitar temporariamente:
```python
# Em rss_monitor.py, comentar a linha:
# self.cleanup_old_json_files()
```