# Contribuindo para o Design System

## Tipos de Contribuição

1. **Correção de bugs**
2. **Melhorias em componentes existentes**
3. **Novos componentes**
4. **Melhorias na documentação**

## Processo

1. Abra uma issue descrevendo a contribuição
2. Discuta a abordagem com o time
3. Implemente a mudança em uma branch separada
4. Adicione/atualize testes e documentação
5. Submeta um PR para revisão
6. Após aprovação, será mesclado na branch principal

## Diretrizes

- Mantenha a consistência com o design system existente
- Garanta acessibilidade (WCAG AA no mínimo)
- Escreva testes para todas as funcionalidades
- Documente APIs e exemplos de uso

## Ciclo de Lançamentos

Nosso design system segue o seguinte ciclo de lançamentos:

1. **Releases Menores**: Correções e melhorias incrementais (mensal)
2. **Releases Médias**: Novos componentes e recursos (trimestral)
3. **Releases Maiores**: Mudanças significativas e atualizações do shadcn/ui (semestral)

## Padrões de Código

- Siga os padrões de estilo definidos no projeto
- Utilize componentes compostos para interfaces complexas
- Mantenha os componentes focados em uma única responsabilidade
- Evite dependências externas desnecessárias

## Testes

Antes de submeter sua contribuição, certifique-se de executar:

```bash
# Testes unitários
npm run test

# Testes de acessibilidade
npm run test:a11y

# Verificação de tipo
npm run type-check
```

## Documentação

Para cada componente novo ou modificação significativa:

1. Atualize ou crie a documentação do componente
2. Adicione exemplos de uso básico e avançado
3. Documente props, variantes e comportamentos
4. Atualize o Storybook com histórias que demonstrem o componente 