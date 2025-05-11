# Configuração do Chromatic para Testes Visuais

Este documento descreve como o Chromatic foi configurado para testes visuais automatizados no projeto thecryptofrontier.

## O que é o Chromatic?

[Chromatic](https://www.chromatic.com/) é uma ferramenta para testes visuais e revisão de componentes de UI que se integra ao Storybook. Ele permite:

- Capturar snapshots visuais de cada componente
- Detectar alterações visuais de maneira automatizada
- Revisar e aprovar alterações de UI
- Documentar componentes publicamente

## Configuração Realizada

Realizamos as seguintes configurações:

1. **Instalação do pacote Chromatic**:
   ```bash
   npm install --save-dev chromatic
   ```

2. **Configuração do PostCSS para o Storybook**:
   Criamos um arquivo `.storybook/postcss.config.js` específico para o Storybook, para evitar problemas com o PurgeCSS.

3. **Script Bash Personalizado**:
   Criamos um script em `scripts/chromatic.sh` que facilita a publicação com diferentes opções.

4. **Configuração de CI/CD**:
   Configuramos um workflow GitHub Actions em `.github/workflows/chromatic.yml` para publicação automática.

## Como Usar o Chromatic

### Localmente

Temos os seguintes comandos disponíveis no `package.json`:

```bash
# Publicação básica
npm run chromatic

# Usando o script personalizado
npm run chromatic:script

# Construir e publicar
npm run chromatic:build

# Publicar aceitando alterações automaticamente
npm run chromatic:accept

# Modo CI (sai com 0 e finaliza após upload)
npm run chromatic:ci
```

Para mais opções, execute:
```bash
./scripts/chromatic.sh --help
```

### Automação via GitHub Actions

O workflow do GitHub Actions foi configurado para:

1. Executar automaticamente quando:
   - Há um push para a branch `main`
   - Um pull request é aberto para a branch `main`
   - Manualmente através da aba Actions no GitHub

2. Publicar no Chromatic com as seguintes configurações:
   - Não falha o build em caso de alterações visuais (`exitZeroOnChanges`)
   - Finaliza após o upload para agilizar o CI (`exitOnceUploaded`)
   - Testa apenas histórias que foram alteradas (`onlyChanged`)
   - Adiciona um comentário em PRs com o link para o Storybook publicado

## Segurança

O token do projeto está configurado como um segredo no GitHub Actions (`CHROMATIC_PROJECT_TOKEN`).

## Processo de Revisão

Para revisar alterações visuais:

1. Acesse o link do build no Chromatic fornecido nos comentários do PR ou nos logs do CI
2. Compare as versões antes/depois de cada componente
3. Aceite ou rejeite as alterações
4. Adicione comentários específicos se necessário

## URL do Storybook Publicado

Nosso Storybook está disponível publicamente em:
https://682112af9250108fa51bec2a-gspkzoejsm.chromatic.com/

## Melhores Práticas

1. **Sempre revise as alterações visuais** - Não deixe alterações pendentes por muito tempo
2. **Documente mudanças intencionais** - Use descrições claras em commits e PRs
3. **Mantenha histórias atualizadas** - Crie ou atualize histórias para novos componentes e variantes
4. **Use em conjunto com PR Reviews** - Refira-se aos builds do Chromatic durante as revisões de código 