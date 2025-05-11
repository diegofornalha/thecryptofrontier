# ADR-001: Adoção do Padrão Compound Components

## Status
Aceito

## Data
2024-07-10

## Contexto
Durante a migração para o design system baseado em shadcn/ui, precisamos estabelecer um padrão consistente para componentes complexos que permita flexibilidade, composição e extensibilidade. Os componentes complexos são aqueles que possuem múltiplas partes interagindo entre si, como Tabs, Dialog, Select, etc.

## Decisão
Adotaremos o padrão de Compound Components para componentes complexos do design system. Este padrão permite que os componentes sejam compostos de várias partes que compartilham estado implicitamente, oferecendo uma API mais flexível e intuitiva.

### Implementação
Os componentes seguirão estas diretrizes:

1. O componente principal exportará subcomponentes como propriedades (por exemplo, `Tabs.List`, `Tabs.Tab`, `Tabs.Content`)
2. O estado será gerenciado pelo componente principal e compartilhado com os subcomponentes via Context API
3. Os subcomponentes poderão ser usados em qualquer ordem dentro do componente principal
4. Cada subcomponente será fortemente tipado

Exemplo:

```tsx
// Componente principal
export function Tabs({...props}) {
  const [value, setValue] = useState(props.defaultValue);
  
  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div {...props} />
    </TabsContext.Provider>
  );
}

// Subcomponentes
Tabs.List = function TabsList({...props}) {
  return <div role="tablist" {...props} />;
};

Tabs.Tab = function TabsTab({value, ...props}) {
  const { value: selectedValue, onChange } = useTabsContext();
  return (
    <button 
      role="tab"
      aria-selected={selectedValue === value}
      onClick={() => onChange(value)}
      {...props}
    />
  );
};

Tabs.Content = function TabsContent({value, ...props}) {
  const { value: selectedValue } = useTabsContext();
  if (selectedValue !== value) return null;
  return <div role="tabpanel" {...props} />;
};
```

### Uso pelo Desenvolvedor

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">Guia 1</Tabs.Tab>
    <Tabs.Tab value="tab2">Guia 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Content value="tab1">Conteúdo da guia 1</Tabs.Content>
  <Tabs.Content value="tab2">Conteúdo da guia 2</Tabs.Content>
</Tabs>
```

## Consequências

### Positivas
- Maior flexibilidade para os desenvolvedores na composição e estilização
- Melhor controle sobre a estrutura do componente
- API mais declarativa e intuitiva
- Facilidade de estender a funcionalidade sem quebrar APIs existentes
- Melhor suporte para acessibilidade com controle granular sobre atributos ARIA

### Negativas
- Curva de aprendizado inicial mais alta para novos desenvolvedores
- Mais verboso para casos de uso simples
- Possibilidade de uso incorreto se subcomponentes forem usados fora do componente pai

## Alternativas Consideradas

### 1. Componentes Monolíticos
Componentes que encapsulam toda a funcionalidade em um único componente com props para configuração.

**Exemplo:**
```tsx
<Tabs 
  items={[
    { label: 'Guia 1', content: 'Conteúdo da guia 1', value: 'tab1' },
    { label: 'Guia 2', content: 'Conteúdo da guia 2', value: 'tab2' }
  ]}
  defaultValue="tab1"
/>
```

**Rejeitado porque:** Menos flexível, dificulta personalização e extensibilidade.

### 2. Prop Drilling
Passar props explícitas entre componentes relacionados.

**Exemplo:**
```tsx
<TabsContainer activeTab="tab1" onTabChange={handleTabChange}>
  <TabsList>
    <Tab id="tab1" activeTab="tab1" onTabChange={handleTabChange}>Guia 1</Tab>
    <Tab id="tab2" activeTab="tab1" onTabChange={handleTabChange}>Guia 2</Tab>
  </TabsList>
  <TabContent id="tab1" activeTab="tab1">Conteúdo 1</TabContent>
  <TabContent id="tab2" activeTab="tab1">Conteúdo 2</TabContent>
</TabsContainer>
```

**Rejeitado porque:** Repetitivo, propenso a erros e pior experiência de desenvolvedor.

## Referências
- [Documentação do shadcn/ui](https://ui.shadcn.com/docs)
- [Compound Components Pattern no React](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Chakra UI Implementation](https://chakra-ui.com/) 