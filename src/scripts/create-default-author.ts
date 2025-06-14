import { client } from '../src/strapi/lib/client';

const createDefaultAuthor = async () => {
  const authorData = {
    _type: 'author',
    name: 'Alexandre Bianchi',
    slug: {
      _type: 'slug',
      current: 'alexandre-bianchi'
    },
    bio: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Trader e investidor profissional, com mais de 10 anos de experiência no mercado financeiro, especializado em criptomoedas. Ele é o criador de treinamentos como "Trader Crypto Expert", que ensina desde iniciantes até investidores avançados a operar no mercado de criptoativos de forma segura e lucrativa.',
            marks: []
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ],
    role: 'CEO The Crypto Frontier',
    // Adicione aqui a referência da imagem se você tiver uma
    // image: {
    //   _type: 'image',
    //   asset: {
    //     _type: 'reference',
    //     _ref: 'ID_DA_IMAGEM_NO_strapi'
    //   }
    // }
  };

  try {
    const result = await client.create(authorData);
    console.log('Autor criado com sucesso:', result);
    console.log('ID do autor:', result._id);
    console.log('\nUse este ID como referência padrão nos posts do agente!');
  } catch (error) {
    console.error('Erro ao criar autor:', error);
  }
};

// Executar
createDefaultAuthor();