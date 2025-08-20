# Tokens do Strapi v5

## API Token (já configurado)
- **Nome**: Full Access
- **Uso**: Acesso à API REST para CRUD de conteúdo
- **Token**: Configurado no .env do CrewAI

## Transfer Token (novo)
- **Nome**: crewai-content-transfer  
- **Token**: 985a3fecbe5c0381ba81e1319e0b41d2b37a2b68dcd53c05e34a9dbfb6c1c8a87499e09a09dbc0af26b2ea18acabb39e68c0cf2ab03b6f5c9a86a05026f8a3306e8f7a6f42060c830755e0b8c86c8782e02c13c41dac4b4d869c8e8de5b1e28140a6e44f2fa4a6dce158ce8e262dcca001348d9c76b5ffcaa1abec6b264ce9d2
- **Uso**: Transferir dados entre ambientes Strapi

## Uso do Transfer Token

### Exportar dados (do Strapi atual):
```bash
npx strapi transfer --to-token=985a3fecbe5c0381ba81e1319e0b41d2b37a2b68dcd53c05e34a9dbfb6c1c8a87499e09a09dbc0af26b2ea18acabb39e68c0cf2ab03b6f5c9a86a05026f8a3306e8f7a6f42060c830755e0b8c86c8782e02c13c41dac4b4d869c8e8de5b1e28140a6e44f2fa4a6dce158ce8e262dcca001348d9c76b5ffcaa1abec6b264ce9d2 --to-url=https://outro-strapi.com/admin
```

### Importar dados (para outro Strapi):
```bash
npx strapi transfer --from-token=985a3fecbe5c0381ba81e1319e0b41d2b37a2b68dcd53c05e34a9dbfb6c1c8a87499e09a09dbc0af26b2ea18acabb39e68c0cf2ab03b6f5c9a86a05026f8a3306e8f7a6f42060c830755e0b8c86c8782e02c13c41dac4b4d869c8e8de5b1e28140a6e44f2fa4a6dce158ce8e262dcca001348d9c76b5ffcaa1abec6b264ce9d2 --from-url=https://ale-blog.agentesintegrados.com/admin
```

## Quando usar cada token:

- **API Token**: Para operações normais (criar posts, ler dados, etc)
- **Transfer Token**: Para migrar/copiar todo o conteúdo entre Strapis