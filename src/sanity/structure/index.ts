import { StructureBuilder } from 'sanity/structure';
import { BiEdit, BiCog, BiBookContent, BiUser } from 'react-icons/bi';
import { PostPreview } from '../components/PostPreview';

// Definição da estrutura customizada para o Sanity Studio
export const structure = (S: StructureBuilder) => 
  S.list()
    .title('Conteúdo')
    .items([
      
      // Seção para Posts de Blog (Completo)
      S.listItem()
        .title('Posts do Blog (Completo)')
        .icon(BiBookContent)
        .child(
          S.documentTypeList('post')
            .title('Posts do Blog')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
            .child(documentId =>
              S.document()
                .documentId(documentId)
                .schemaType('post')
                .views([
                  S.view.form(),
                  S.view
                    .component(PostPreview)
                    .title('Preview')
                ])
            )
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
            .child(documentId =>
              S.document()
                .documentId(documentId)
                .schemaType('page')
                .views([
                  S.view.form(),
                  S.view
                    .component(PostPreview)
                    .title('Preview')
                ])
            )
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