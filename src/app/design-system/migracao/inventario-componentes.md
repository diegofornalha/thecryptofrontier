# Inventário de Componentes e Plano de Migração

Este documento faz parte da Fase 1 do plano de migração para shadcn/ui, conforme definido em `fase_01.md`.

## Componentes Já Instalados (shadcn/ui)

Identificamos os seguintes componentes shadcn/ui já instalados no projeto:

- Button
- Card
- Avatar
- Badge
- Form
- Input
- Select
- Textarea
- Checkbox
- RadioGroup
- Switch
- Dialog
- DropdownMenu
- Toast
- Separator
- Toggle

## Inventário de Componentes

### Componentes Atômicos

| Nome | Tipo | Localização | Descrição | Props | Uso | Componente shadcn/ui equivalente | Gaps | Esforço | Prioridade | Observações |
|------|------|-------------|-----------|-------|-----|----------------------------------|------|---------|------------|------------|
| Action | Atômico | src/components/atoms/Action/index.tsx | Botão ou link com ícone opcional | elementId, className, label, altText, url, showIcon, icon, iconPosition, style | Botões de ação em todo o site | Button | Suporte a ícones e posicionamento | Baixo | Alta | Substituir classes sb-component-button por variantes do Button |
| Badge | Atômico | src/components/atoms/Badge/index.tsx | Elemento visual para destacar informações | label, color, styles, className | Indicadores de status | Badge | Mapeamento de cores personalizado | Baixo | Alta | Criar mapeamento entre cores atuais e variantes do Badge |
| Link | Atômico | src/components/atoms/Link/index.tsx | Componente de link | href, children, ...props | Links em todo o site | Button com variant="link" | Integração com Next.js Link | Baixo | Alta | Adaptar para usar o Button com asChild para links internos |
| BackgroundImage | Atômico | src/components/atoms/BackgroundImage | Imagem de fundo | - | Fundos de seções | Personalizado | - | Médio | Média | Usar Image do Next.js com estilos do shadcn |
| Social | Atômico | src/components/atoms/Social | Ícones para redes sociais | - | Links para redes sociais | Button | - | Médio | Média | Personalizar com ícones |
| SocialShare | Atômico | src/components/atoms/SocialShare | Botões de compartilhamento | - | Compartilhamento de conteúdo | ButtonGroup | - | Médio | Média | Criar variante específica |

## Plano de Migração

### Prioridade Alta

1. **Action → Button**
   - Criar uma versão migrada do Action usando o Button do shadcn/ui
   - Manter a API atual (props, comportamentos)
   - Adaptar para suportar ícones e posicionamento

2. **Badge → Badge**
   - Migrar diretamente para o Badge do shadcn/ui
   - Criar mapeamento de cores personalizadas para variantes
   - Manter a API atual

3. **Link → Button(variant="link")**
   - Adaptar o componente Link para usar o Button com variant="link"
   - Integrar com Next.js Link usando o padrão asChild
   - Preservar a lógica de links internos/externos

### Prioridade Média

1. **BackgroundImage → Componente Personalizado**
   - Criar um componente personalizado que utilize o Image do Next.js
   - Aplicar estilos compatíveis com shadcn/ui

2. **Social → Button com ícones**
   - Adaptar para usar o Button com ícones
   - Manter a API atual

3. **SocialShare → ButtonGroup**
   - Criar um ButtonGroup personalizado
   - Manter a API atual

## Exemplos de Migração

### Action → Button

#### Componente Original:
```tsx
export default function Action(props) {
    const { elementId, className, label, altText, url, showIcon, icon, iconPosition = 'right', style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@href`, `${fieldPath}.altText#@aria-label`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};
    const type = props.__metadata?.modelName;

    return (
        <Link
            href={url}
            aria-label={altText}
            id={elementId}
            className={classNames(
                'sb-component',
                'sb-component-block',
                type === 'Button' ? 'sb-component-button' : 'sb-component-link',
                {
                    'sb-component-button-primary': type === 'Button' && style === 'primary',
                    'sb-component-button-secondary': type === 'Button' && style === 'secondary',
                    'sb-component-link-primary': type === 'Link' && style === 'primary',
                    'sb-component-link-secondary': type === 'Link' && style === 'secondary'
                },
                className
            )}
            {...annotations}
        >
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {showIcon && IconComponent && (
                <IconComponent
                    className={classNames('shrink-0', 'fill-current', 'w-[1.25em]', 'h-[1.25em]', {
                        'order-first': iconPosition === 'left',
                        'mr-[0.5em]': label && iconPosition === 'left',
                        'ml-[0.5em]': label && iconPosition === 'right'
                    })}
                    {...(fieldPath && { 'data-sb-field-path': '.icon' })}
                />
            )}
        </Link>
    );
}
```

#### Componente Migrado (proposta):
```tsx
import { Button } from "@/components/ui/button"
import NextLink from "next/link"
import { iconMap } from '../../svgs'
import { cn } from "@/lib/utils"

export default function Action(props) {
    const { 
        elementId, 
        className, 
        label, 
        altText, 
        url, 
        showIcon, 
        icon, 
        iconPosition = 'right', 
        style = 'primary' 
    } = props;
    
    const IconComponent = icon ? iconMap[icon] : null;
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@href`, `${fieldPath}.altText#@aria-label`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};
    
    const type = props.__metadata?.modelName;
    
    // Mapear estilos antigos para variantes do shadcn/ui Button
    const getVariant = () => {
        if (type === 'Button') {
            return style === 'primary' ? 'default' : 'secondary';
        }
        return style === 'primary' ? 'link' : 'ghost';
    };
    
    const variant = getVariant();
    
    // Se for um link
    if (url) {
        return (
            <Button
                variant={variant}
                className={className}
                asChild
            >
                <NextLink 
                    href={url}
                    aria-label={altText}
                    id={elementId}
                    {...annotations}
                >
                    {iconPosition === 'left' && showIcon && IconComponent && (
                        <IconComponent className={cn("mr-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
                    )}
                    {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
                    {iconPosition === 'right' && showIcon && IconComponent && (
                        <IconComponent className={cn("ml-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
                    )}
                </NextLink>
            </Button>
        );
    }
    
    // Se for um botão
    return (
        <Button
            variant={variant}
            className={className}
            id={elementId}
            {...annotations}
        >
            {iconPosition === 'left' && showIcon && IconComponent && (
                <IconComponent className={cn("mr-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
            )}
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {iconPosition === 'right' && showIcon && IconComponent && (
                <IconComponent className={cn("ml-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
            )}
        </Button>
    );
}
```

### Badge → Badge

#### Componente Original:
```tsx
export default function Badge(props) {
    const { label, color = 'text-primary', styles, className } = props;
    const fieldPath = props['data-sb-field-path'];
    if (!label) {
        return null;
    }

    return (
        <div
            className={classNames(
                'sb-component',
                'sb-component-block',
                'sb-component-badge',
                color,
                className,
                styles?.self ? mapStyles(styles?.self) : undefined
            )}
            data-sb-field-path={fieldPath}
        >
            <span className="tracking-wider uppercase" {...(fieldPath && { 'data-sb-field-path': '.label' })}>
                {label}
            </span>
        </div>
    );
}
```

#### Componente Migrado (proposta):
```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Função para mapear cores antigas para variantes do shadcn/ui
const mapColorToVariant = (color) => {
    switch (color) {
        case 'text-primary':
            return 'default';
        case 'text-secondary':
            return 'secondary';
        case 'text-danger':
        case 'text-error':
            return 'destructive';
        default:
            return 'default';
    }
};

export default function CustomBadge(props) {
    const { label, color = 'text-primary', styles, className } = props;
    const fieldPath = props['data-sb-field-path'];
    
    if (!label) {
        return null;
    }

    const variant = mapColorToVariant(color);

    return (
        <Badge
            variant={variant}
            className={cn(
                "uppercase tracking-wider",
                className,
                // Manter compatibilidade com estilos personalizados
                styles?.self ? mapStyles(styles?.self) : undefined
            )}
            data-sb-field-path={fieldPath}
        >
            <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>
                {label}
            </span>
        </Badge>
    );
}
```

### Link → Button(variant="link")

#### Componente Original:
```tsx
export default function Link({ children, href, ...other }) {
    // Pass Any internal link to Next.js Link, for anything else, use <a> tag
    const internal = /^\/(?!\/)/.test(href);
    if (internal) {
        return (
            <NextLink href={href} {...other}>
                {children}
            </NextLink>
        );
    }

    return (
        <a href={href} {...other}>
            {children}
        </a>
    );
}
```

#### Componente Migrado (proposta):
```tsx
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

export default function Link({ children, href, className, ...other }) {
    // Verificar se é um link interno
    const internal = /^\/(?!\/)/.test(href);
    
    return (
        <Button
            variant="link"
            className={cn("p-0 h-auto", className)}
            asChild
            {...other}
        >
            {internal ? (
                <NextLink href={href}>
                    {children}
                </NextLink>
            ) : (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            )}
        </Button>
    );
}
``` 