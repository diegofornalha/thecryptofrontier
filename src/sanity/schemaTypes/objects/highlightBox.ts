import {defineField, defineType} from 'sanity'
import {FiInfo} from 'react-icons/fi'

export default defineType({
  name: 'highlightBox',
  title: 'Caixa de Destaque',
  type: 'object',
  icon: FiInfo,
  fields: [
    defineField({
      name: 'type',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          {title: 'Informação', value: 'info'},
          {title: 'Dica', value: 'tip'},
          {title: 'Aviso', value: 'warning'},
          {title: 'Erro', value: 'error'},
          {title: 'Sucesso', value: 'success'},
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Título (opcional)',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        },
      ],
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
    },
    prepare({title, type}) {
      const typeLabels = {
        info: 'Info',
        tip: 'Dica',
        warning: 'Aviso',
        error: 'Erro',
        success: 'Sucesso',
      }
      return {
        title: title || `Caixa de ${typeLabels[type] || 'Destaque'}`,
        subtitle: typeLabels[type] || 'Destaque',
      }
    },
  },
})