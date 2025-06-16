# 🚀 Strapi v5 Docker Setup

## Configuração de Portas

Para evitar conflitos entre múltiplas instâncias do Strapi, usamos as seguintes portas:

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Strapi v4 | 1337 | Instância antiga/produção |
| Strapi v5 | 1339 | Nova instância para desenvolvimento |
| PostgreSQL (v5) | 5433 | Banco de dados do Strapi v5 |

## URLs de Acesso

- **Admin Panel**: http://localhost:1339/admin
- **API Base**: http://localhost:1339

## Scripts Disponíveis

### Iniciar Strapi v5
```bash
./scripts/docker/start-strapi-v5.sh
```

### Parar Strapi v5
```bash
./scripts/docker/stop-strapi-v5.sh
```

### Ver logs
```bash
docker logs -f strapi-v5
```

## Estrutura Docker

```yaml
Container: strapi-v5
Imagem: strapi:v5
Porta: 1339:1337
Rede: strapi
Volumes:
  - ./config:/opt/app/config
  - ./src:/opt/app/src
  - ./public/uploads:/opt/app/public/uploads
```

## Newsletter Plugin

⚠️ **Nota**: O plugin `@strapi-newsletter/strapi` não é compatível com Strapi v5.

### Alternativas:

1. **Email Service Nativo**
   ```javascript
   await strapi.plugins['email'].services.email.send({
     to: 'user@example.com',
     subject: 'Newsletter',
     html: '<h1>Conteúdo</h1>'
   });
   ```

2. **Content Type Customizado**
   - Criar tipo "Newsletter"
   - Implementar API de envio
   - Integrar com Mailchimp

3. **Webhook Integration**
   - Usar lifecycle hooks
   - Enviar para serviço externo

## Comandos Úteis

```bash
# Reconstruir imagem
docker build -t strapi:v5 .

# Executar comandos no container
docker exec -it strapi-v5 npm run strapi ...

# Limpar e reiniciar
docker rm -f strapi-v5
./scripts/docker/start-strapi-v5.sh
```