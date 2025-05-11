# Configuração do Chromatic para Testes Visuais

Este documento descreve como configurar o Chromatic para testes visuais em nosso design system, conforme recomendado na Fase 5 do plano de migração para shadcn/ui.

## O que é o Chromatic?

O Chromatic é uma ferramenta para testes visuais automatizados integrada ao Storybook. Ele permite:

- Capturar snapshots visuais de cada componente
- Detectar automaticamente alterações visuais
- Revisar e aprovar mudanças através de uma interface web
- Documentar e versionar componentes

## Requisitos

- Conta no [Chromatic](https://www.chromatic.com/)
- Projeto configurado com Storybook
- Token de acesso ao projeto Chromatic

## Obtendo um Token do Projeto

1. Acesse [https://www.chromatic.com/start](https://www.chromatic.com/start)
2. Faça login ou crie uma conta
3. Crie um projeto (ou selecione um existente)
4. Na página "Manage", encontre o token do projeto
5. Copie o token para uso nos passos seguintes

## Configuração Local

### Método 1: Variável de Ambiente

Execute o Chromatic fornecendo o token como variável de ambiente:

```bash
CHROMATIC_PROJECT_TOKEN=seu_token_aqui npx chromatic
```

### Método 2: Script de Execução

1. Edite o arquivo `scripts/run-chromatic.sh` e substitua o token pelo seu:

```bash
#!/bin/bash
CHROMATIC_PROJECT_TOKEN=seu_token_aqui npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
```

2. Execute o script:

```bash
./scripts/run-chromatic.sh
```

## Configuração no GitHub Actions

Para integrar o Chromatic ao seu CI/CD:

1. Adicione o token como segredo no GitHub:
   - Vá para seu repositório > Settings > Secrets
   - Adicione um novo segredo chamado `CHROMATIC_PROJECT_TOKEN`
   - Cole o valor do token

2. Use o script de configuração (opcional):

```bash
./scripts/setup-chromatic.sh seu_token_aqui
```

3. Verifique se o workflow `.github/workflows/chromatic.yml` está configurado corretamente:

```yaml
# Trecho relevante do arquivo
- name: Publicar no Chromatic
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    exitZeroOnChanges: true
    exitOnceUploaded: true
    onlyChanged: true
```

## Verificação da Configuração

Para verificar se a configuração está correta:

```bash
npx chromatic --project-token=seu_token_aqui --dry-run
```

## Solução de Problemas

### Erro: "Missing project token"

Este erro ocorre quando o token do projeto não está configurado corretamente.

**Solução:**
- Verifique se o token está correto
- Certifique-se de que a variável de ambiente está sendo lida corretamente
- Tente fornecer o token diretamente via linha de comando

### Erro: "No app with code found"

Este erro indica que o token fornecido é inválido.

**Solução:**
- Verifique se o token foi copiado corretamente
- Gere um novo token no site do Chromatic

## Integração com a Fase 5 do Plano de Migração

Os testes visuais são parte fundamental da estratégia de evolução e manutenção do design system, conforme detalhado na Fase 5. Eles garantem:

1. **Consistência visual** ao longo do tempo
2. **Detecção precoce** de regressões visuais
3. **Documentação viva** dos componentes
4. **Facilitação da revisão** de mudanças por equipes multidisciplinares

## Recursos Adicionais

- [Documentação oficial do Chromatic](https://www.chromatic.com/docs/)
- [Integrando Chromatic e Storybook](https://storybook.js.org/docs/writing-tests/visual-testing)
- [Melhores práticas para testes visuais](https://www.chromatic.com/docs/best-practices) 