export default {
  name: 'codeBlock',
  title: 'Bloco de Código',
  type: 'object',
  fields: [
    {
      name: 'language',
      title: 'Linguagem',
      type: 'string',
      options: {
        list: [
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'Python', value: 'python' },
          { title: 'PHP', value: 'php' },
          { title: 'Java', value: 'java' },
          { title: 'C#', value: 'csharp' },
          { title: 'Shell', value: 'bash' },
          { title: 'JSON', value: 'json' },
          { title: 'Markdown', value: 'markdown' },
          { title: 'SQL', value: 'sql' },
          { title: 'YAML', value: 'yaml' },
          { title: 'GraphQL', value: 'graphql' },
        ],
      },
    },
    {
      name: 'code',
      title: 'Código',
      type: 'text',
    },
    {
      name: 'filename',
      title: 'Nome do arquivo (opcional)',
      type: 'string',
    },
    {
      name: 'highlightedLines',
      title: 'Linhas destacadas (ex: 1,3-5)',
      type: 'string',
    },
  ],
} 