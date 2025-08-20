# Stories dos Componentes

Esta pasta contém as stories para visualização dos componentes no Storybook.

## Estrutura de Arquivos

- `migracao-intro.mdx` - Introdução à seção de componentes migrados
- `*.stories.tsx` - Arquivos de stories para cada componente
- `assets/` - Pasta com imagens e outros recursos para o Storybook

## Componentes Migrados

Os componentes migrados para o shadcn/ui estão organizados com o seguinte padrão:

- `ButtonMigration.stories.tsx` - Stories para o componente Button migrado
- `LinkMigration.stories.tsx` - Stories para o componente Link migrado
- etc.

Cada story demonstra a versão original e a versão migrada do componente, assim como suas variações.

## Como Adicionar Novas Stories

1. Crie um arquivo `[NomeDoComponente]Migration.stories.tsx`
2. Importe o componente de `@/app/design-system/migracao/components/[NomeDoComponente]Migration`
3. Configure o meta com título, componente e parâmetros
4. Adicione as variações necessárias

## Boas Práticas

- Use o padrão de nomenclatura consistente: `[NomeDoComponente]Migration`
- Agrupe componentes relacionados na mesma categoria
- Documente as props e variações do componente
- Adicione exemplos de uso para facilitar o entendimento
- Teste as stories em diferentes tamanhos de tela 