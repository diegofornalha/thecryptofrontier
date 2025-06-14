# Recomendações de Limpeza

## 🧹 Arquivos para Consolidar

### Scripts de Publicação (7 arquivos em publish/)
Recomendo consolidar em 2-3 scripts principais:

1. **publish_main.py** - Script principal de publicação
   - Consolidar: publish_direct.py, publish_via_strapi_client.py
   
2. **publish_batch.py** - Publicação em lote
   - Consolidar: publish_all_with_images.py, publish_pipeline_posts.py
   
3. **publish_test.py** - Para testes
   - Manter: publish_test_post.py

Scripts específicos para remover/arquivar:
- publish_to_new_studio.py (provavelmente obsoleto)
- publish_with_deploy_token.py (pode ser parâmetro)

### Scripts de Atualização (6 arquivos em update/)
Recomendo consolidar em 2 scripts:

1. **update_posts.py** - Script principal
   - Parâmetros: --with-images, --compressed, --direct-upload
   - Consolidar todos os update_posts_*.py

2. **update_single.py** - Atualizar post único
   - Consolidar: update_existing_post.py, update_post_content.py


## 📁 Estrutura de Logs Configurada

✅ **Criado `utils/log_config.py`** com:
- Logs centralizados em `logs/`
- Suporte a rotação de arquivos
- Logs diários para monitoramento

## 🔧 Próximas Ações Recomendadas

### 1. Consolidar Scripts Similares
```bash
# Criar script unificado de publicação
python scripts/consolidate_publish.py

# Criar script unificado de atualização  
python scripts/consolidate_update.py
```

### 2. Atualizar Imports de Logging
Todos os scripts devem usar:
```python
from utils.log_config import setup_logger
logger = setup_logger("nome_do_modulo")
```

### 3. Remover Backups Antigos (após confirmação)
```bash
# Depois de validar que tudo funciona
rm -rf backup/requirements
rm -rf backup/testes_legados
```

### 4. Criar Scripts de Manutenção
```bash
# Script para limpar logs antigos
scripts/maintenance/clean_old_logs.py

# Script para arquivar posts processados
scripts/maintenance/archive_old_posts.py
```

## 📊 Estatísticas da Limpeza

- **Requirements**: 4 arquivos → 3 arquivos (25% redução)
- **Estrutura**: Diretório plano → Organizado em 15+ subdiretórios
- **Documentação**: 0 → 3 arquivos (PROJECT_STRUCTURE.md, REQUIREMENTS_GUIDE.md, este arquivo)
- **Testes**: Movidos testes legados para backup

## ✅ Status da Limpeza

- [x] Consolidar requirements
- [x] Organizar estrutura de diretórios
- [x] Mover arquivos para locais apropriados
- [x] Configurar logs centralizados
- [x] Criar documentação
- [ ] Consolidar scripts de publish (7 → 3)
- [ ] Consolidar scripts de update (6 → 2)
- [ ] Atualizar todos os scripts para usar log_config
- [ ] Remover backups após validação