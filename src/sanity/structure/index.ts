import { StructureBuilder } from 'sanity/structure';

// Definição da estrutura customizada para o Sanity Studio
export const structure = (S: StructureBuilder) => 
  S.list()
    .title('Conteúdo')
    .items([
      // Seção para Posts de Blog
      S.listItem()
        .title('Posts do Blog')
        .child(
          S.documentTypeList('post')
            .title('Posts do Blog')
        ),
      
      // Seção para Páginas
      S.listItem()
        .title('Páginas')
        .child(
          S.documentTypeList('page')
            .title('Páginas')
        ),
      
      // Seção de Configurações
      S.listItem()
        .title('Configurações')
        .child(
          S.list()
            .title('Configurações')
            .items([
              // Configuração Global do Site
              S.listItem()
                .title('Configuração do Site')
                .child(
                  S.document()
                    .schemaType('siteConfig')
                    .documentId('siteConfig')
                ),
              
              // Cabeçalho
              S.listItem()
                .title('Cabeçalho')
                .child(
                  S.document()
                    .schemaType('header')
                    .documentId('header')
                ),
              
              // Rodapé
              S.listItem()
                .title('Rodapé')
                .child(
                  S.document()
                    .schemaType('footer')
                    .documentId('footer')
                ),
            ])
        ),
    ]); 