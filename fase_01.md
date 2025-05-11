# Plano de Migração para shadcn/ui

### 1. Introdução e Objetivos

A Fase 1 é dedicada à completa análise do código existente, mapeamento de componentes e preparação para a migração efetiva. Esta fase é crucial para garantir uma migração sistemática e sem surpresas.

**Objetivos:**
- Realizar uma auditoria completa dos componentes existentes
- Mapear componentes para equivalentes do shadcn/ui
- Identificar gaps e necessidades de componentes personalizados
- Priorizar componentes para migração
- Preparar o ambiente para a implementação


### 2. Análise do Estado Atual

#### 2.1. Estrutura de Componentes

A base de código atual segue uma arquitetura de design atômico com a seguinte estrutura:

```
src/components/
├── atoms/         # Componentes básicos e indivisíveis
├── blocks/        # Componentes compostos de múltiplos átomos
├── layouts/       # Estruturas de página
├── sections/      # Seções maiores de conteúdo
├── svgs/          # Componentes de ícones SVG
├── ui/            # Componentes shadcn/ui já existentes
└── components-registry.ts  # Registro de componentes dinâmicos
```

Já existem alguns componentes shadcn/ui implementados:
- Button
- Card
- Avatar
- Badge

#### 2.2. Análise Inicial

A análise inicial mostrou:

- Componentes atômicos usam classes CSS com prefixo `sb-`
- Vários componentes podem ser substituídos diretamente por equivalentes do shadcn/ui
- Componentes mais complexos precisarão de uma abordagem personalizada

### 3. Processo de Auditoria

#### 3.1. Criação do Inventário de Componentes

**Ferramenta:** Planilha ou Documento Colaborativo

**Campos para cada componente:**
- **Nome:** Nome do componente
- **Tipo:** Atômico / Bloco / Layout / Seção
- **Localização:** Caminho do arquivo
- **Descrição:** Funcionalidade do componente
- **Props:** Lista de propriedades aceitas
- **Uso:** Onde é utilizado no projeto
- **Componente shadcn/ui equivalente:** Nome do componente equivalente ou "Personalizado"
- **Gaps:** Funcionalidades não cobertas pelo equivalente
- **Esforço de migração:** Baixo / Médio / Alto
- **Prioridade:** Baixa / Média / Alta
- **Observações:** Notas adicionais

**Exemplo preenchido:**

```
Nome: Action
Tipo: Atômico
Localização: src/components/atoms/Action/index.tsx
Descrição: Botão ou link com ícone opcional
Props: elementId, className, label, altText, url, showIcon, icon, iconPosition, style
Uso: Botões de ação em todo o site
Componente shadcn/ui equivalente: Button
Gaps: Suporte a ícones e posicionamento
Esforço: Baixo
Prioridade: Alta
Observações: Substituir classes sb-component-button por variantes do Button
```

#### 3.2. Script de Análise de Uso

Criar um script para analisar automaticamente o uso de componentes:

```bash
#!/bin/bash
# analyze-component-usage.sh
# Uso: ./analyze-component-usage.sh ComponentName

COMPONENT=$1
echo "Analisando uso do componente: $COMPONENT"
echo "----------------------------------------"
echo "Importações diretas:"
grep -r "import.*$COMPONENT" --include="*.tsx" --include="*.jsx" src/
echo "----------------------------------------"
echo "Uso como tag JSX:"
grep -r "<$COMPONENT" --include="*.tsx" --include="*.jsx" src/
echo "----------------------------------------"
echo "Uso em components-registry.ts:"
grep -r "$COMPONENT" --include="components-registry.ts" src/
```

### 4. Mapeamento para shadcn/ui

#### 4.1. Componentes Atômicos

| Componente Atual | Equivalente shadcn/ui | Observações |
|------------------|------------------------|-------------|
| Action (Button)  | Button                 | Adaptar para suportar ícones |
| Action (Link)    | Button variant="link"  | Adaptar para href |
| BackgroundImage  | Personalizado          | Usar Image do Next.js com estilos do shadcn |
| Badge            | Badge                  | Migração direta |
| Link             | Link                   | Integrar com Next.js Link |
| Social           | Button                 | Personalizar com ícones |
| SocialShare      | ButtonGroup            | Criar variante específica |

#### 4.2. Componentes de Bloco

| Componente Atual       | Equivalente shadcn/ui     | Observações |
|------------------------|-----------------------------|-------------|
| FormBlock              | Form                        | Usar FormProvider e useForm do react-hook-form |
| CheckboxFormControl    | Checkbox                    | Usar com Form.Field |
| EmailFormControl       | Input                       | Tipo email com validação |
| SelectFormControl      | Select                      | Migrar opções |
| TextareaFormControl    | Textarea                    | Migração direta |
| TextFormControl        | Input                       | Migração direta |
| ImageBlock             | Personalizado               | Usar com AspectRatio |
| SearchBlock            | Command + Input             | Implementar autocompletar |
| VideoBlock             | AspectRatio + Personalizado | Wrapper para iframe |

#### 4.3. Layouts e Seções

Para layouts e seções, a abordagem será:
1. Migrar primeiro os componentes atômicos usados dentro deles
2. Substituir gradualmente as classes CSS personalizadas
3. Manter a API externa consistente para minimizar mudanças em outros lugares

### 5. Análise de Gaps

#### 5.1. Criação de Componentes Personalizados

Para cada gap identificado, documentar a abordagem:

**Exemplo: Componente de Ícone no Botão**

```tsx
// Abordagem atual
<IconComponent className={classNames('shrink-0', 'fill-current', 'w-[1.25em]', 'h-[1.25em]', {
    'order-first': iconPosition === 'left',
    'mr-[0.5em]': label && iconPosition === 'left',
    'ml-[0.5em]': label && iconPosition === 'right'
})} />

// Abordagem com shadcn/ui
<Button>
  {iconPosition === 'left' && <IconComponent className="mr-2" />}
  {label}
  {iconPosition === 'right' && <IconComponent className="ml-2" />}
</Button>
```

#### 5.2. Extensões de Componentes shadcn/ui

Para funcionalidades não presentes no shadcn/ui, documentar extensões:

```tsx
// src/components/ui/button-with-icon.tsx
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface ButtonWithIconProps extends ButtonProps {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function ButtonWithIcon({
  children,
  icon,
  iconPosition = 'right',
  className,
  ...props
}: ButtonWithIconProps) {
  return (
    <Button 
      className={cn("flex items-center gap-2", className)} 
      {...props}
    >
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </Button>
  )
}
```

### 6. Priorização de Componentes

#### 6.1. Critérios de Priorização

Estabelecer sistema de pontuação (1-5) para cada critério:
- **Frequência de uso:** Quanto mais usado, maior prioridade
- **Visibilidade:** Componentes mais visíveis ao usuário têm prioridade
- **Complexidade:** Componentes simples são priorizados para vitórias rápidas
- **Dependências:** Componentes com menos dependências são priorizados
- **Impacto visual:** Componentes com maior impacto visual são priorizados

#### 6.2. Matriz de Priorização

| Componente          | Frequência | Visibilidade | Complexidade | Dependências | Impacto | Total | Prioridade |
|---------------------|------------|--------------|--------------|--------------|---------|-------|------------|
| Button (Action)     | 5          | 5            | 1            | 1            | 4       | 16    | ALTA       |
| Badge               | 4          | 3            | 1            | 1            | 3       | 12    | ALTA       |
| Input (Form)        | 4          | 4            | 1            | 2            | 3       | 14    | ALTA       |
| Select              | 3          | 3            | 2            | 2            | 3       | 13    | ALTA       |
| Card                | 4          | 5            | 2            | 2            | 5       | 18    | ALTA       |
| Link                | 5          | 4            | 1            | 1            | 2       | 13    | ALTA       |
| Textarea            | 3          | 3            | 1            | 1            | 2       | 10    | MÉDIA      |
| Checkbox            | 3          | 3            | 1            | 1            | 2       | 10    | MÉDIA      |
| Avatar              | 2          | 4            | 1            | 1            | 3       | 11    | MÉDIA      |
| FeaturedItemSection | 2          | 5            | 4            | 4            | 5       | 20    | BAIXA      |

### 7. Planejamento de Migração

#### 7.1. Componentes a serem instalados

Lista de componentes shadcn/ui a serem instalados (além dos já existentes):

```bash
# Componentes principais (prioridade alta)
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add label

# Componentes navegacionais (prioridade média)
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add tabs

# Componentes de layout (prioridade média)
npx shadcn-ui@latest add aspect-ratio
npx shadcn-ui@latest add separator

# Componentes de feedback (prioridade média)
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert

# Componentes avançados (prioridade baixa)
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add command
```

#### 7.2. Abordagem por Grupo de Componentes

**Grupo 1 - Componentes Base (Semana 1)**
- Button (Action)
- Badge
- Link
- Input
- Textarea
- Select
- Checkbox

**Grupo 2 - Componentes Interativos (Semana 2)**
- Form
- Dropdown
- Navigation
- Dialog
- Toast

**Grupo 3 - Componentes de Layout (Semana 3)**
- Card
- AspectRatio
- Sheet
- Separator

**Grupo 4 - Componentes Complexos (Semana 4+)**
- SearchBlock
- FeaturedItemsSection
- PostFeedSection
- Outros componentes de seção

### 8. Preparação para Implementação

#### 8.1. Ambiente de Testes

**Setup de testes visuais:**

```bash
# Configurar Storybook (opcional)
npx storybook init

# Ou configurar uma página de testes simples
mkdir -p src/app/component-test
touch src/app/component-test/page.tsx
```

Exemplo de página de testes:

```tsx
// src/app/component-test/page.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ComponentTestPage() {
  return (
    <div className="container py-10 space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-4">Componentes Migrados</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Botões</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Badges</h3>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 8.2. Processo de Revisão

**Checklist de revisão para cada componente migrado:**

- [ ] Mantém API existente (props, nomes, comportamentos)
- [ ] Segue o design system (cores, espaçamentos, tipografia)
- [ ] É responsivo em todos os breakpoints
- [ ] Suporta tema claro e escuro
- [ ] É acessível (contraste, ARIA, navegação por teclado)
- [ ] Documentado com exemplos de uso
- [ ] Testado em diferentes contextos

#### 8.3. Fluxo de Trabalho

Para cada componente a ser migrado:

1. Criar branch específica: `feature/shadcn-migration/[component-name]`
2. Implementar versão shadcn/ui do componente
3. Testar em isolamento na página de testes
4. Testar no contexto real de uso
5. Submeter para revisão
6. Mesclar e passar para o próximo componente

### 9. Exemplos de Implementação

#### 9.1. Migração do Action para Button

**Componente original:**
```tsx
// src/components/atoms/Action/index.tsx
export default function Action(props) {
    const { elementId, className, label, altText, url, showIcon, icon, iconPosition = 'right', style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    
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
        >
            {label && <span>{label}</span>}
            {showIcon && IconComponent && (
                <IconComponent
                    className={classNames('shrink-0', 'fill-current', 'w-[1.25em]', 'h-[1.25em]', {
                        'order-first': iconPosition === 'left',
                        'mr-[0.5em]': label && iconPosition === 'left',
                        'ml-[0.5em]': label && iconPosition === 'right'
                    })}
                />
            )}
        </Link>
    );
}
```

**Componente migrado:**
```tsx
// src/components/atoms/Action/index.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { iconMap } from '../../svgs'

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
                <Link 
                    href={url}
                    aria-label={altText}
                    id={elementId}
                    {...annotations}
                >
                    {iconPosition === 'left' && showIcon && IconComponent && (
                        <IconComponent {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
                    )}
                    {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
                    {iconPosition === 'right' && showIcon && IconComponent && (
                        <IconComponent {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
                    )}
                </Link>
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
                <IconComponent {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
            )}
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {iconPosition === 'right' && showIcon && IconComponent && (
                <IconComponent {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
            )}
        </Button>
    );
}
```

### 10. Métricas de Sucesso

#### 10.1. Critérios de Conclusão da Fase 1

- [ ] Inventário completo de componentes criado
- [ ] Todos os componentes mapeados para equivalentes do shadcn/ui
- [ ] Gaps e necessidades de componentes personalizados documentados
- [ ] Plano de priorização estabelecido
- [ ] Ambiente de testes configurado
- [ ] Processo de revisão definido
- [ ] Documentação inicial criada
- [ ] Primeira release de teste pronta para migração

#### 10.2. KPIs

- Número de componentes auditados: Meta 100%
- Tempo médio de auditoria por componente: < 30 minutos
- Porcentagem de componentes com equivalentes diretos no shadcn/ui: > 60%
- Qualidade da documentação (revisão por pares): > 8/10