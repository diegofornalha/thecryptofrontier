# 🛠️ Scripts de Manutenção

Esta pasta contém scripts utilitários para manutenção manual do sistema de blog.

## 📋 Scripts Disponíveis

### Gestão de Posts

#### `delete_by_title.py`
Remove posts do Strapi por título específico.
```bash
python delete_by_title.py "Título do Post"
```

#### `edit_post.py`
Edita posts existentes no Strapi CMS.
```bash
python edit_post.py
```

#### `list_strapi_documents.py`
Lista todos os documentos no Strapi para verificação.
```bash
python list_strapi_documents.py
```

### Sincronização

#### `sync_last_10_articles.py`
Sincroniza apenas os últimos 10 artigos do Strapi para o Algolia.
Útil para testes rápidos sem sincronizar toda a base.
```bash
python sync_last_10_articles.py
```

### Limpeza U.Today

#### `delete_utoday_posts.py`
Remove posts do U.Today do Strapi CMS.
```bash
python delete_utoday_posts.py
```

#### `delete_utoday_algolia.py`
Remove posts do U.Today do índice Algolia.
```bash
python delete_utoday_algolia.py
```

## ⚠️ Cuidados

- Sempre faça backup antes de executar scripts de deleção
- Use o modo `--dry-run` quando disponível para simular
- Verifique as variáveis de ambiente necessárias:
  - `strapi_API_TOKEN`
  - `STRAPI_PROJECT_ID`
  - `ALGOLIA_APP_ID`
  - `ALGOLIA_ADMIN_API_KEY`

## 🔧 Quando Usar

- **Correções pontuais**: Editar ou remover posts específicos
- **Debug**: Listar documentos para investigar problemas
- **Testes**: Sincronizar pequenos batches para testar mudanças
- **Limpeza**: Remover conteúdo indesejado de fontes específicas