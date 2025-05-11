# Documentação de Componentes Migrados para shadcn/ui

Este documento registra os detalhes da migração de componentes do sistema antigo para o shadcn/ui, conforme o plano da Fase 2.

## Componentes Atômicos

### Action (Botão)

**Implementação**

O componente `Action` foi migrado para usar o componente `Button` do shadcn/ui.

**Adaptações**

- Mapeamento de estilos:
  - `primary` → `default`
  - `secondary` → `secondary`

- Suporte a ícones:
  - Adicionada lógica para posicionar ícones (esquerda/direita)
  - Mantida compatibilidade com `iconMap`

**Uso**

```tsx
// Como botão
<Action 
  label="Clique aqui" 
  style="primary" 
  showIcon 
  icon="arrowRight" 
/>

// Como link
<Action 
  label="Saiba mais" 
  url="/sobre" 
  style="secondary" 
/>
```

**Notas**

- O componente mantém total compatibilidade com a API anterior
- Novos recursos disponíveis através de props adicionais

### Badge

**Implementação**

O componente `Badge` foi migrado para usar o componente `Badge` do shadcn/ui.

**Adaptações**

- Preservado o suporte a cores personalizadas via propriedade `color`
- Utilizado o padrão de variantes do shadcn/ui

**Uso**

```tsx
<Badge label="Novo" />
<Badge label="Promoção" color="text-red-500" />
```

**Notas**

- É possível usar classes personalizadas via `className`
- Suporte completo às cores do tema

### Link

**Implementação**

O componente `Link` foi atualizado para manter compatibilidade com o shadcn/ui.

**Adaptações**

- Adicionado suporte para uso com o componente `Button` do shadcn/ui
- Mantido o comportamento de detecção de links internos/externos

**Uso**

```tsx
<Link href="/pagina">Link interno</Link>
<Link href="https://example.com">Link externo</Link>

// Como botão-link
<Button variant="link" asChild>
  <Link href="/pagina">Link via botão</Link>
</Button>
```

## Componentes de Formulário

### TextFormControl

**Implementação**

O componente `TextFormControl` foi migrado para usar os componentes `Input` e `Label` do shadcn/ui.

**Adaptações**

- Mantidas todas as props existentes
- Removido CSS personalizado em favor dos estilos do shadcn/ui

**Uso**

```tsx
<TextFormControl 
  name="nome" 
  label="Nome Completo" 
  isRequired 
  placeholder="Digite seu nome" 
/>
```

### EmailFormControl

**Implementação**

O componente `EmailFormControl` foi migrado para usar os componentes `Input` e `Label` do shadcn/ui.

**Adaptações**

- Mesmo padrão do TextFormControl, apenas mudando o tipo para "email"
- Mantidas todas as props existentes

**Uso**

```tsx
<EmailFormControl 
  name="email" 
  label="E-mail" 
  isRequired 
  placeholder="seu@email.com" 
/>
```

### TextareaFormControl

**Implementação**

O componente `TextareaFormControl` foi migrado para usar os componentes `Textarea` e `Label` do shadcn/ui.

**Adaptações**

- Mantidas todas as props existentes, incluindo `rows`
- Removido CSS personalizado em favor dos estilos do shadcn/ui

**Uso**

```tsx
<TextareaFormControl 
  name="mensagem" 
  label="Mensagem" 
  isRequired 
  placeholder="Digite sua mensagem..." 
/>
```

### CheckboxFormControl

**Implementação**

O componente `CheckboxFormControl` foi migrado para usar os componentes `Checkbox` e `Label` do shadcn/ui.

**Adaptações**

- Simplificada a estrutura HTML
- Melhorado o alinhamento entre checkbox e label

**Uso**

```tsx
<CheckboxFormControl 
  name="aceito" 
  label="Aceito os termos e condições" 
  isRequired 
/>
```

### SelectFormControl

**Implementação**

O componente `SelectFormControl` foi migrado para usar os componentes `Select` do shadcn/ui.

**Adaptações**

- Usada a estrutura de componentes do shadcn/ui (Trigger, Content, Item)
- Mantido o suporte para opções dinâmicas

**Uso**

```tsx
<SelectFormControl 
  name="assunto" 
  label="Assunto" 
  isRequired 
  defaultValue="Selecione um assunto"
  options={["Suporte", "Vendas", "Informações", "Outros"]} 
/>
```

### SubmitButtonFormControl

**Implementação**

O componente `SubmitButtonFormControl` foi migrado para usar o componente `Button` do shadcn/ui.

**Adaptações**

- Mesmo padrão de adaptação do componente Action
- Mantido o tipo "submit" para o formulário

**Uso**

```tsx
<SubmitButtonFormControl 
  label="Enviar Formulário" 
  style="primary" 
  showIcon 
  icon="arrowRight" 
/>
```

### FormBlock

**Implementação**

O componente `FormBlock` foi atualizado para integrar todos os controles de formulário migrados.

**Adaptações**

- Mantida a estrutura básica do formulário
- Substituído classNames por cn
- Mantida compatibilidade com os estilos e o sistema de anotações

**Uso**

```tsx
<FormBlock
  fields={[
    {
      __metadata: { modelName: 'TextFormControl' },
      name: 'nome',
      label: 'Nome',
      isRequired: true
    },
    {
      __metadata: { modelName: 'EmailFormControl' },
      name: 'email',
      label: 'Email',
      isRequired: true
    }
  ]}
  submitButton={{
    label: 'Enviar',
    style: 'primary'
  }}
/>
```

## Próximos Passos

- Migrar componentes do Grupo 3 (Card, AspectRatio, Sheet, Separator, Tabs)
- Migrar componentes do Grupo 4 (componentes complexos)
- Implementar testes automatizados para os componentes migrados
- Melhorar a documentação com exemplos interativos 