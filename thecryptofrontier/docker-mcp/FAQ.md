# ❓ Docker MCP - Perguntas Frequentes

## Instalação e Configuração

### P: Preciso do Docker Desktop instalado?
**R:** Sim, o Docker Desktop (ou Docker Engine no Linux) precisa estar instalado e rodando.

### P: Funciona no Windows?
**R:** Sim! Funciona com Docker Desktop no Windows. Recomendamos usar com WSL2 para melhor performance.

### P: Como sei se está funcionando?
**R:** Execute `claude mcp list` e procure por "docker-mcp" na lista.

### P: Posso usar com Podman em vez de Docker?
**R:** Atualmente não. Suporte para Podman está no roadmap.

## Uso Geral

### P: Qual a diferença entre create-container e deploy-compose?
**R:** 
- `create-container`: Para containers únicos e simples
- `deploy-compose`: Para aplicações multi-container com docker-compose.yml

### P: Posso criar imagens Docker?
**R:** Não diretamente. O MCP foca em executar containers. Para criar imagens, use o terminal.

### P: Como passo variáveis de ambiente?
**R:** Diga ao Claude, por exemplo: "Crie um container com NODE_ENV=production"

### P: Posso montar volumes?
**R:** Sim! Exemplo: "Crie um nginx montando ./html em /usr/share/nginx/html"

## Problemas Comuns

### P: "Docker daemon não está rodando"
**R:** 
1. Inicie o Docker Desktop
2. No Linux: `sudo systemctl start docker`
3. Verifique com: `docker ps`

### P: "Permissão negada ao conectar ao Docker"
**R:** No Linux:
```bash
sudo usermod -aG docker $USER
# Faça logout e login novamente
```

### P: "Porta já está em uso"
**R:** 
1. Liste quem usa a porta: `lsof -i :PORTA`
2. Use outra porta
3. Ou pare o serviço: `docker stop [container]`

### P: "Container fica reiniciando"
**R:** Peça ao Claude: "O container X está reiniciando, mostre os logs"

## Segurança

### P: É seguro usar em produção?
**R:** O Docker MCP é para desenvolvimento local. Para produção, use ferramentas apropriadas.

### P: Os containers têm acesso à minha rede?
**R:** Sim, por padrão. Configure redes isoladas se necessário.

### P: Onde ficam os dados dos containers?
**R:** Em volumes Docker. Liste com: `docker volume ls`

## Performance

### P: Por que demora para criar containers?
**R:** Na primeira vez, o Docker precisa baixar as imagens. Depois fica em cache.

### P: Quanto de memória usa?
**R:** Depende dos containers. O MCP em si usa menos de 50MB.

### P: Posso limitar recursos dos containers?
**R:** Sim! Exemplo: "Crie um container com limite de 512MB de RAM"

## Recursos Avançados

### P: Suporta Docker Swarm?
**R:** Ainda não. Está planejado para versões futuras.

### P: Posso usar com Kubernetes?
**R:** Não diretamente. Use o MCP para desenvolvimento local com Docker.

### P: Como faço backup dos dados?
**R:** 
1. Liste volumes: `docker volume ls`
2. Faça backup: `docker run --rm -v [volume]:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data`

### P: Posso executar comandos dentro dos containers?
**R:** Não através do MCP. Use o terminal: `docker exec -it [container] bash`

## Integração com Claude

### P: O Claude pode criar Dockerfiles?
**R:** Sim, mas não através do MCP. Peça ao Claude para criar e salvar o arquivo.

### P: Posso usar em conjunto com outros MCPs?
**R:** Sim! Funciona bem com filesystem, git, etc.

### P: O histórico de comandos é salvo?
**R:** Não no MCP, mas o Claude mantém o contexto da conversa.

## Desenvolvimento

### P: Como adiciono novas funcionalidades?
**R:** Veja a seção "Desenvolvimento" em [DOCKER-MCP-DOCS.md](./DOCKER-MCP-DOCS.md)

### P: Onde reporto bugs?
**R:** Abra uma issue no GitHub ou mencione ao desenvolver com Claude.

### P: Posso contribuir?
**R:** Sim! Pull requests são bem-vindos.

## Diversos

### P: Quanto custa?
**R:** É gratuito e open source.

### P: Preciso de conhecimento em Docker?
**R:** Não! O Claude pode gerar as configurações para você.

### P: Funciona offline?
**R:** O MCP sim, mas você precisa ter as imagens Docker baixadas.

### P: Posso usar para ensinar Docker?
**R:** Perfeito para isso! O Claude pode explicar cada comando.

---

🤔 **Não encontrou sua pergunta?** 
- Pergunte ao Claude: "Como faço para..."
- Consulte [DOCKER-MCP-DOCS.md](./DOCKER-MCP-DOCS.md)
- Veja exemplos em [EXEMPLOS.md](./EXEMPLOS.md)