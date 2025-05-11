import{j as e}from"./jsx-runtime-BO8uF4Og.js";import{useMDXComponents as o}from"./index-BqIVwv1J.js";import"./index-D4H_InIO.js";function i(s){const n={h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"plano-de-migração-para-shadcnui",children:"Plano de Migração para shadcn/ui"}),`
`,e.jsx(n.h2,{id:"fase-0---concluída",children:"Fase 0 - Concluída"}),`
`,e.jsx(n.p,{children:"Na Fase 0, estabelecemos as bases do nosso design system:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Consolidamos e organizamos variáveis CSS"}),`
`,e.jsx(n.li,{children:"Configuramos tema claro/escuro"}),`
`,e.jsx(n.li,{children:"Definimos padrões de tipografia, cores e espaçamentos"}),`
`,e.jsx(n.li,{children:"Instalamos componentes base do shadcn/ui"}),`
`,e.jsx(n.li,{children:"Criamos uma página de documentação (design system)"}),`
`]}),`
`,e.jsx(n.h2,{id:"fase-1---próximos-passos",children:"Fase 1 - Próximos Passos"}),`
`,e.jsx(n.h3,{id:"componentes-a-serem-migrados",children:"Componentes a serem migrados:"}),`
`,e.jsx(n.h4,{id:"componentes-de-layout",children:"Componentes de Layout"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Header"}),`
`,e.jsx(n.li,{children:"[ ] Footer"}),`
`,e.jsx(n.li,{children:"[ ] Layout principal"}),`
`,e.jsx(n.li,{children:"[ ] Layout de post"}),`
`,e.jsx(n.li,{children:"[ ] Layout de categoria"}),`
`]}),`
`,e.jsx(n.h4,{id:"componentes-de-blocos",children:"Componentes de Blocos"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Bloco de imagem"}),`
`,e.jsx(n.li,{children:"[ ] Bloco de formulário"}),`
`,e.jsx(n.li,{children:"[ ] Bloco de pesquisa"}),`
`,e.jsx(n.li,{children:"[ ] Bloco de título"}),`
`,e.jsx(n.li,{children:"[ ] Bloco de vídeo"}),`
`]}),`
`,e.jsx(n.h4,{id:"componentes-de-ui-básicos",children:"Componentes de UI básicos"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[x] Botões (migrar de sb-component-button para Button do shadcn)"}),`
`,e.jsx(n.li,{children:"[x] Links (migrar de sb-component-link para componente Link personalizado)"}),`
`,e.jsx(n.li,{children:"[x] Inputs de formulário"}),`
`,e.jsx(n.li,{children:"[x] Campos de seleção"}),`
`,e.jsx(n.li,{children:"[x] Badge"}),`
`,e.jsx(n.li,{children:"[x] Avatar"}),`
`,e.jsx(n.li,{children:"[x] Card"}),`
`,e.jsx(n.li,{children:"[ ] Dialog/Modal"}),`
`]}),`
`,e.jsx(n.h3,{id:"priorização",children:"Priorização"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Componentes de UI básicos - são a base para todos os outros"}),`
`,e.jsx(n.li,{children:"Componentes de Layout - definem a estrutura do site"}),`
`,e.jsx(n.li,{children:"Componentes de Blocos - conteúdo específico"}),`
`]}),`
`,e.jsx(n.h3,{id:"abordagem-de-migração",children:"Abordagem de Migração"}),`
`,e.jsx(n.p,{children:"Para cada componente:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Identificar o componente atual e suas variantes"}),`
`,e.jsx(n.li,{children:"Mapear para equivalentes do shadcn/ui"}),`
`,e.jsx(n.li,{children:"Criar versão com shadcn/ui mantendo a mesma API quando possível"}),`
`,e.jsx(n.li,{children:"Testar o componente em isolamento"}),`
`,e.jsx(n.li,{children:"Implementar em uma página de teste"}),`
`,e.jsx(n.li,{children:"Substituir gradualmente no restante do site"}),`
`]}),`
`,e.jsx(n.h3,{id:"considerações",children:"Considerações"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Manter retrocompatibilidade durante a transição"}),`
`,e.jsx(n.li,{children:"Documentar todos os componentes novos na página do design system"}),`
`,e.jsx(n.li,{children:"Criar testes para garantir que a funcionalidade seja mantida"}),`
`,e.jsx(n.li,{children:"Atualizar os estilos globais conforme necessário"}),`
`]}),`
`,e.jsx(n.h2,{id:"fase-2---componentes-avançados",children:"Fase 2 - Componentes Avançados"}),`
`,e.jsx(n.h3,{id:"componentes-a-serem-migrados-1",children:"Componentes a serem migrados:"}),`
`,e.jsx(n.h4,{id:"componentes-de-seções",children:"Componentes de Seções"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] CarouselSection"}),`
`,e.jsx(n.li,{children:"[ ] PricingSection"}),`
`,e.jsx(n.li,{children:"[ ] DividerSection"}),`
`,e.jsx(n.li,{children:"[ ] GenericSection"}),`
`,e.jsx(n.li,{children:"[ ] ImageGallerySection"}),`
`,e.jsx(n.li,{children:"[ ] FeaturedItemsSection"}),`
`,e.jsx(n.li,{children:"[ ] FeaturedPeopleSection"}),`
`,e.jsx(n.li,{children:"[ ] FeaturedPostsSection"}),`
`,e.jsx(n.li,{children:"[ ] PostFeedSection"}),`
`,e.jsx(n.li,{children:"[ ] RecentPostsSection"}),`
`,e.jsx(n.li,{children:"[ ] RelatedPostsSection"}),`
`]}),`
`,e.jsx(n.h4,{id:"componentes-interativos-complexos",children:"Componentes Interativos Complexos"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Tabs"}),`
`,e.jsx(n.li,{children:"[x] Charts"}),`
`,e.jsx(n.li,{children:"[ ] Dropdown menus"}),`
`,e.jsx(n.li,{children:"[ ] Toggle"}),`
`,e.jsx(n.li,{children:"[ ] Switch"}),`
`,e.jsx(n.li,{children:"[ ] Radio Group"}),`
`,e.jsx(n.li,{children:"[ ] Feedback Collector"}),`
`,e.jsx(n.li,{children:"[ ] Toast/Notifications"}),`
`]}),`
`,e.jsx(n.h3,{id:"priorização-1",children:"Priorização"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Seções mais utilizadas (PostFeedSection, FeaturedPostsSection)"}),`
`,e.jsx(n.li,{children:"Componentes interativos por frequência de uso"}),`
`,e.jsx(n.li,{children:"Componentes restantes"}),`
`]}),`
`,e.jsx(n.h2,{id:"fase-3---refinamento-e-polimento",children:"Fase 3 - Refinamento e Polimento"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Auditar consistência visual"}),`
`,e.jsx(n.li,{children:"[ ] Otimizar performance dos componentes"}),`
`,e.jsx(n.li,{children:"[ ] Revisar acessibilidade"}),`
`,e.jsx(n.li,{children:"[ ] Finalizar documentação completa"}),`
`,e.jsx(n.li,{children:"[ ] Depreciar componentes antigos"}),`
`]}),`
`,e.jsx(n.h2,{id:"cronograma-estimado",children:"Cronograma Estimado"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Fase 1:"})," 3-4 semanas"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Semana 1-2: Componentes de UI básicos"}),`
`,e.jsx(n.li,{children:"Semana 3-4: Componentes de Layout e Blocos"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Fase 2:"})," 4-5 semanas"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Semana 1-2: Seções principais"}),`
`,e.jsx(n.li,{children:"Semana 3-5: Componentes interativos complexos"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Fase 3:"})," 2-3 semanas"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Refinamento, testes e documentação final"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"responsáveis",children:"Responsáveis"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Componentes de UI: [Definir responsável]"}),`
`,e.jsx(n.li,{children:"Componentes de Layout: [Definir responsável]"}),`
`,e.jsx(n.li,{children:"Componentes de Seção: [Definir responsável]"}),`
`,e.jsx(n.li,{children:"Documentação: [Definir responsável]"}),`
`,e.jsx(n.li,{children:"Testes: [Definir responsável]"}),`
`]}),`
`,e.jsx(n.h2,{id:"métricas-de-sucesso",children:"Métricas de Sucesso"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Performance:"})," Redução de 20% no tempo de carregamento"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Manutenibilidade:"})," Redução de 30% no tempo de desenvolvimento de novos componentes"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Consistência:"})," 100% dos componentes seguindo os tokens do design system"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Acessibilidade:"})," Conformidade WCAG AA para todos os componentes"]}),`
`]}),`
`,e.jsx(n.h2,{id:"estratégia-de-deprecação",children:"Estratégia de Deprecação"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Marcar componentes antigos como deprecated com aviso no código"}),`
`,e.jsx(n.li,{children:"Fornecer documentação de migração para cada componente"}),`
`,e.jsx(n.li,{children:"Definir prazo para remoção total (3 meses após conclusão da Fase 3)"}),`
`,e.jsx(n.li,{children:"Remover componentes antigos após o prazo"}),`
`]}),`
`,e.jsx(n.h2,{id:"gestão-de-dependências",children:"Gestão de Dependências"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Manter ambos os sistemas de componentes funcionando em paralelo durante a transição"}),`
`,e.jsx(n.li,{children:"Garantir que não haja conflitos de estilos ou comportamentos"}),`
`,e.jsx(n.li,{children:"Assegurar compatibilidade com versões existentes do site"}),`
`]}),`
`,e.jsx(n.h2,{id:"treinamento-da-equipe",children:"Treinamento da Equipe"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Workshop inicial sobre princípios do shadcn/ui"}),`
`,e.jsx(n.li,{children:"Documentação detalhada com exemplos"}),`
`,e.jsx(n.li,{children:"Sessões de pair programming para implementações iniciais"}),`
`,e.jsx(n.li,{children:"Repositório de exemplos e padrões"}),`
`]}),`
`,e.jsx(n.h2,{id:"estratégia-para-componentes-customizados",children:"Estratégia para Componentes Customizados"}),`
`,e.jsx(n.p,{children:"Para componentes sem equivalente direto no shadcn/ui:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Avaliar se podem ser construídos com primitivos do shadcn/ui"}),`
`,e.jsx(n.li,{children:"Desenvolver componentes customizados seguindo os mesmos padrões"}),`
`,e.jsx(n.li,{children:"Documentar esses componentes específicos no design system"}),`
`]})]})}function a(s={}){const{wrapper:n}={...o(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{a as default};
