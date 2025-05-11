# Testes Visuais com Chromatic no The Crypto Frontier

Este documento descreve como utilizar o Chromatic para testes visuais em nosso projeto, conforme a Fase 5 do plano de migração para shadcn/ui.

## Configuração Rápida

Para começar a usar o Chromatic:

1. Obtenha um token de projeto no [site do Chromatic](https://www.chromatic.com/start)

2. Configure o token:
   ```bash
   # Método 1: Variável de ambiente
   CHROMATIC_PROJECT_TOKEN=seu_token_aqui npx chromatic
   
   # Método 2: Usando nosso script
   ./scripts/setup-chromatic.sh seu_token_aqui
   ./scripts/run-chromatic.sh
   ```

3. Verifique a pasta `docs/chromatic-setup.md` para instruções detalhadas

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npx chromatic` | Executa o Chromatic com o token configurado |
| `npx chromatic --dry-run` | Verifica a configuração sem publicar |
| `npx chromatic --skip` | Pula os testes visuais, mas marca o commit |
| `npx chromatic --auto-accept-changes` | Aceita automaticamente todas as alterações |

## Integração com GitHub Actions

Um workflow está configurado em `.github/workflows/chromatic.yml` para executar automaticamente o Chromatic quando:

- Houver pushes para a branch main
- Forem abertos pull requests para a branch main
- For acionado manualmente na aba Actions

## Relação com a Fase 5 do Plano de Migração

Como detalhado na Fase 5 de nossa migração para shadcn/ui, os testes visuais automatizados são parte essencial da estratégia de manutenção e evolução contínua do design system. Eles nos ajudam a:

1. Detectar regressões visuais de forma proativa
2. Garantir consistência visual entre diferentes componentes
3. Facilitar revisões por equipes multidisciplinares
4. Documentar a evolução dos componentes ao longo do tempo

## Dúvidas e Suporte

Para mais informações sobre a integração do Chromatic em nosso processo de desenvolvimento, consulte:

- `docs/chromatic-setup.md` - Guia detalhado de configuração
- `fase_05.md` - Documentação completa da Fase 5 do plano de migração
- Documentação oficial do [Chromatic](https://www.chromatic.com/docs/) 