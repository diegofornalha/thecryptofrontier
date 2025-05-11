# Configuração de Secrets no GitHub para o Chromatic

Para que o workflow de GitHub Actions funcione corretamente, você precisa configurar o token do projeto Chromatic como um secret no GitHub. Siga os passos abaixo:

## Passo 1: Obter o Token do Projeto

O token do seu projeto Chromatic é:
```
chpt_10e25f8014659d3
```

Este token já está configurado no script local, mas para o GitHub Actions você precisa configurá-lo como um secret.

## Passo 2: Adicionar o Secret no GitHub

1. Acesse o repositório do projeto no GitHub
2. Clique na aba **Settings** (Configurações)
3. No menu lateral, selecione **Secrets and variables** > **Actions**
4. Clique no botão **New repository secret**
5. Preencha os campos:
   - **Name**: `CHROMATIC_PROJECT_TOKEN`
   - **Value**: `chpt_10e25f8014659d3`
6. Clique em **Add secret**

![Configuração de Secrets](https://docs.github.com/assets/cb-19887/images/help/repository/actions-secrets.png)

## Passo 3: Verificar a Configuração

Depois de configurar o secret, você pode:

1. Criar um Pull Request no GitHub para testar o workflow
2. Ou acionar manualmente o workflow na aba **Actions** do GitHub:
   - Vá para a aba **Actions**
   - Selecione o workflow **Chromatic - Testes Visuais**
   - Clique em **Run workflow**

## Observações de Segurança

- Nunca compartilhe o token do projeto publicamente
- O token já configurado nos scripts locais deve ser mantido apenas em repositórios privados
- Considere usar variáveis de ambiente locais para desenvolvimento, em vez de hardcoded nos scripts

## Atualização do Token

Caso você precise gerar um novo token do Chromatic:

1. Acesse sua conta no [Chromatic](https://www.chromatic.com)
2. Vá para as configurações do projeto
3. Gere um novo token
4. Atualize o token no GitHub e nos scripts locais 