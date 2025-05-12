import { StructureBuilder } from 'sanity/structure';
import { BiEdit, BiCog, BiCategory, BiBookContent, BiUser, BiTag } from 'react-icons/bi';

// Definição da estrutura customizada para o Sanity Studio
export const structure = (S: StructureBuilder) => 
  S.list()
    .title('Conteúdo')
    .items([
      // Seção para Posts de Blog
      S.listItem()
        .title('Posts do Blog')
        .icon(BiBookContent)
        .child(
          S.documentTypeList('post')
            .title('Posts do Blog')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      
      // Seção para Categorias
      S.listItem()
        .title('Categorias')
        .icon(BiCategory)
        .child(
          S.documentTypeList('category')
            .title('Categorias')
            .defaultOrdering([{field: 'order', direction: 'asc'}])
        ),
      
      // Seção para Tags
      S.listItem()
        .title('Tags')
        .icon(BiTag)
        .child(
          S.documentTypeList('tag')
            .title('Tags')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),
      
      // Seção para Autores
      S.listItem()
        .title('Autores')
        .icon(BiUser)
        .child(
          S.documentTypeList('author')
            .title('Autores')
            .defaultOrdering([{field: 'name', direction: 'asc'}])
        ),
      
      // Seção para Páginas
      S.listItem()
        .title('Páginas')
        .icon(BiEdit)
        .child(
          S.documentTypeList('page')
            .title('Páginas')
        ),
      
      // Divider
      S.divider(),
      
      // Seção de Configurações
      S.listItem()
        .title('Configurações')
        .icon(BiCog)
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