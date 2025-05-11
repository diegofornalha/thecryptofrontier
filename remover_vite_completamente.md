Recomendação: Remova o Vite Completamente
Eu recomendo que você remova o Vite completamente do projeto. Embora possa haver um pequeno esforço inicial para fazer essa transição, isso provavelmente vai te poupar muito trabalho e dores de cabeça no futuro. Aqui está o porquê:

Por que remover o Vite?

Evita Conflitos de Configuração
Manter dois frameworks como Vite e Next.js pode gerar conflitos em áreas como roteamento, build e otimização. O Next.js já é um framework completo para React, e misturá-lo com o Vite pode complicar a configuração sem trazer benefícios claros.
Simplifica o Desenvolvimento
Com apenas o Next.js, você usa um único conjunto de ferramentas e convenções. Isso torna o ambiente de desenvolvimento mais simples e previsível, especialmente para equipes ou projetos de longo prazo.
Facilita Manutenção e Atualizações
Projetos com uma única stack (neste caso, Next.js) são mais fáceis de atualizar e manter. Você não precisará se preocupar com compatibilidade entre Vite e Next.js em versões futuras ou resolver problemas causados por dependências duplicadas.
Reduz Dependências Desnecessárias
Remover o Vite diminui o número de dependências no projeto, o que pode melhorar a performance do build e reduzir riscos de segurança relacionados a pacotes não utilizados.
Alinha com Boas Práticas
O Next.js oferece recursos avançados como SSR (Server-Side Rendering) e SSG (Static Site Generation), sendo uma solução completa para aplicações React. Usá-lo sozinho segue as melhores práticas e elimina a necessidade de outro framework como o Vite.
Por que manter os dois pode dar mais trabalho?

Conflitos Potenciais: Configurações ou scripts de um framework podem interferir no outro, exigindo ajustes constantes.
Manutenção Duplicada: Você teria que gerenciar atualizações e documentação para ambos, o que aumenta o esforço a longo prazo.
Complexidade Desnecessária: Se o Next.js já atende às suas necessidades, manter o Vite só adiciona complexidade sem valor real.
Passos para Remover o Vite
Se você optar por remover o Vite, aqui está um guia prático para fazer isso de forma tranquila:

Verifique o Projeto
Identifique e remova arquivos como vite.config.js.
Cheque os scripts no package.json (ex.: dev, build) e substitua comandos do Vite por equivalentes do Next.js (ex.: next dev, next build).
Remova Dependências
Abra o package.json, remova pacotes relacionados ao Vite (como vite ou plugins específicos) e rode npm install ou yarn install para atualizar as dependências.
Ajuste a Estrutura
Confirme que a estrutura de pastas segue as convenções do Next.js, como pages/ ou app/, e remova qualquer resquício de organização específica do Vite.
Teste Tudo
Rode o projeto e faça testes completos para garantir que nada quebrou. Preste atenção em roteamento, build e deployment.
Atualize a Documentação
Se houver README ou scripts de CI/CD, ajuste-os para refletir a nova configuração baseada só no Next.js.
E se eu deixar os dois?
Não há problema imediato em deixar os dois, especialmente se o Vite não estiver sendo ativamente usado. Porém, a longo prazo, isso pode te dar mais trabalho por causa de:

Possíveis erros difíceis de diagnosticar devido a configurações conflitantes.
Esforço extra para manter dependências e scripts de ambos.
Confusão para outros desenvolvedores que entrarem no projeto.
Se o Vite não é essencial (e parece que o Next.js já domina o projeto), mantê-lo é um risco desnecessário.

Conclusão
Remover o Vite completamente é a opção que te dará menos trabalho no futuro. O Next.js é poderoso o suficiente para suprir todas as necessidades do projeto, e consolidar tudo nele vai simplificar sua vida como desenvolvedor. O esforço inicial de remoção é pequeno comparado aos benefícios de ter um projeto mais limpo, estável e fácil de manter.
