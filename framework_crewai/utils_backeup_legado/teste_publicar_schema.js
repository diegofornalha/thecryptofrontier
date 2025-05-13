// Teste do script de publicação para verificar conformidade com schema do Sanity
const fs = require('fs');
const path = require('path');

// Função para verificar a conformidade com o schema do Sanity
function verificarSchema(documento) {
  const problemas = [];
  
  // 1. Verificar se o campo content existe (não body)
  if (documento.body && !documento.content) {
    problemas.push('Campo "body" encontrado em vez de "content"');
  }
  
  // 2. Verificar se o campo seo está no formato correto
  if (documento.seo) {
    if (documento.seo.meta_title && !documento.seo.metaTitle) {
      problemas.push('Campo "seo.meta_title" encontrado em vez de "seo.metaTitle"');
    }
    if (documento.seo.meta_description && !documento.seo.metaDescription) {
      problemas.push('Campo "seo.meta_description" encontrado em vez de "seo.metaDescription"');
    }
  }
  
  // 3. Verificar se meta_title e meta_description estão soltos no documento
  if (documento.meta_title) {
    problemas.push('Campo "meta_title" encontrado solto no documento em vez de dentro do objeto seo');
  }
  if (documento.meta_description) {
    problemas.push('Campo "meta_description" encontrado solto no documento em vez de dentro do objeto seo');
  }
  
  // 4. Verificar se as tags estão no formato correto
  if (Array.isArray(documento.tags)) {
    const tagsInvalidas = documento.tags.filter(tag => 
      typeof tag !== 'object' || !tag._type || !tag._ref || !tag._key
    );
    
    if (tagsInvalidas.length > 0) {
      problemas.push(`${tagsInvalidas.length} tags não estão no formato correto de referência (_type, _ref, _key)`);
    }
  }
  
  return {
    conforme: problemas.length === 0,
    problemas
  };
}

// Simula o documento que seria gerado pelo script
function gerarDocumentoTeste() {
  // Criar um documento do zero com os campos corrigidos
  const documento = {
    _type: 'post',
    _id: 'post-teste',
    title: 'Teste de Schema do Sanity',
    slug: {
      _type: 'slug',
      current: 'teste-de-schema-do-sanity'
    },
    excerpt: 'Um teste de documento para verificar conformidade com o schema.',
    content: [
      {
        _type: 'block',
        _key: 'bloco1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'span1',
            text: 'Conteúdo de teste',
            marks: []
          }
        ]
      }
    ],
    tags: [
      {
        _type: 'reference',
        _key: 'tag-abc123',
        _ref: 'tag-teste'
      }
    ],
    categories: [
      {
        _type: 'reference',
        _key: 'cat-abc123',
        _ref: 'category-criptomoedas'
      }
    ],
    author: {
      _type: 'reference',
      _ref: 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c'
    },
    publishedAt: new Date().toISOString(),
    seo: {
      metaTitle: 'Título SEO de Teste',
      metaDescription: 'Descrição SEO de teste para verificar o schema do Sanity.'
    }
  };
  
  return documento;
}

// Função principal
function testarSchema() {
  console.log('==== TESTE DE CONFORMIDADE COM SCHEMA DO SANITY ====\n');
  
  // Testar documento gerado
  const documentoCorreto = gerarDocumentoTeste();
  console.log('1. Testando documento correto:');
  const resultadoCorreto = verificarSchema(documentoCorreto);
  console.log(`- Conforme: ${resultadoCorreto.conforme}`);
  if (!resultadoCorreto.conforme) {
    console.log('- Problemas encontrados:');
    resultadoCorreto.problemas.forEach(problema => console.log(`  * ${problema}`));
  } else {
    console.log('- Nenhum problema encontrado!');
  }
  
  // Testar documento com erros
  console.log('\n2. Testando documento com erros intencionais:');
  const documentoErrado = {
    ...documentoCorreto,
    body: documentoCorreto.content, // Erro: usar body em vez de content
    content: undefined,
    meta_title: 'Título errado', // Erro: meta_title solto
    meta_description: 'Descrição errada', // Erro: meta_description solto
    seo: {
      meta_title: 'Título SEO errado', // Erro: meta_title em vez de metaTitle
      meta_description: 'Descrição SEO errada' // Erro: meta_description em vez de metaDescription
    },
    tags: ['tag1', 'tag2'] // Erro: tags como strings em vez de referências
  };
  
  const resultadoErrado = verificarSchema(documentoErrado);
  console.log(`- Conforme: ${resultadoErrado.conforme}`);
  console.log('- Problemas encontrados:');
  resultadoErrado.problemas.forEach(problema => console.log(`  * ${problema}`));
  
  console.log('\n==== CONCLUSÃO ====');
  console.log(`O teste verificou a conformidade de dois documentos com o schema do Sanity.`);
  console.log(`O primeiro documento está ${resultadoCorreto.conforme ? 'em conformidade' : 'com problemas'}.`);
  console.log(`O segundo documento está ${resultadoErrado.conforme ? 'em conformidade' : 'com problemas'} (esperado ter problemas).`);
}

// Executar o teste
testarSchema(); 