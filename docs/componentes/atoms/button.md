# Button

O componente `Button` representa um botão interativo ou link que pode ser usado para ações, navegação ou envio de formulários.

## Importação

```tsx
import { Button } from "@/components/ui/button";
```

## Uso Básico

```tsx
<Button>Clique aqui</Button>
```

## Variantes

O componente `Button` suporta as seguintes variantes:

- `default` - botão primário (padrão)
- `destructive` - para ações destrutivas
- `outline` - botão com contorno
- `secondary` - botão secundário
- `ghost` - botão sem fundo
- `link` - botão que parece um link

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Tamanhos

O componente `Button` suporta os seguintes tamanhos:

- `default` - tamanho padrão
- `sm` - pequeno
- `lg` - grande
- `icon` - para botões que contêm apenas ícones

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconSearch /></Button>
```

## Como Usar com Ícones

```tsx
import { IconSearch } from "@/components/icons";

<Button>
  <IconSearch className="mr-2 h-4 w-4" />
  Pesquisar
</Button>

<Button>
  Próximo
  <IconArrowRight className="ml-2 h-4 w-4" />
</Button>
```

## Como Link

Use a prop `asChild` junto com um elemento `<Link>` para criar um botão que funciona como link:

```tsx
import Link from "next/link";

<Button asChild>
  <Link href="/about">Sobre nós</Link>
</Button>
```

## Props

| Prop     | Tipo                                                     | Padrão    | Descrição                                     |
|----------|---------------------------------------------------------|-----------|-----------------------------------------------|
| variant  | `default` \| `destructive` \| `outline` \| `secondary` \| `ghost` \| `link` | `default` | Estilo visual do botão                       |
| size     | `default` \| `sm` \| `lg` \| `icon`                     | `default` | Tamanho do botão                              |
| asChild  | `boolean`                                               | `false`   | Passar props para elemento filho              |
| disabled | `boolean`                                               | `false`   | Desabilita o botão                            |

## Acessibilidade

O componente Button é totalmente acessível:

- Mantém o foco visível para navegação por teclado
- Possui contraste adequado em todas as variantes
- Preserva comportamentos nativos de botão para interação por teclado
- Mantém aria-labels e propriedades ARIA apropriadas quando usado como elemento de link

## Migração do Componente Antigo

Se você estiver migrando do componente anterior, aqui está um guia rápido:

**Antes:**

```tsx
import { Button } from "@/components/atoms/Button";

<Button variant="primary">Clique aqui</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="outline">Opções</Button>
<Button variant="danger">Excluir</Button>
<Button variant="link">Saiba mais</Button>
<Button size="small">Pequeno</Button>
<Button size="medium">Médio</Button>
<Button size="large">Grande</Button>
```

**Depois:**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Clique aqui</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="outline">Opções</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="link">Saiba mais</Button>
<Button size="sm">Pequeno</Button>
<Button size="default">Médio</Button>
<Button size="lg">Grande</Button>
``` 