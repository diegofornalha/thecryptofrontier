/**
 * Configurações para o sistema de publicação de posts
 */
module.exports = {
  // Configuração do autor padrão
  autor: {
    id: 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c', // ID do Alexandre Bianchi
    nome: 'Alexandre Bianchi'
  },
  
  // Diretórios de trabalho
  diretorios: {
    postsParaTraduzir: './posts_para_traduzir',
    postsTraduzidos: './posts_traduzidos',
    postsPadronizados: './posts_padronizados',
    postsPublicados: './posts_publicados'
  },
  
  // Categorias padrão para criptomoedas
  categorias: {
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum', 
    altcoins: 'Altcoins',
    defi: 'DeFi',
    nft: 'NFTs',
    metaverso: 'Metaverso',
    regulacao: 'Regulação',
    blockchain: 'Blockchain',
    mercado: 'Mercado',
    tecnologia: 'Tecnologia'
  }
}; 