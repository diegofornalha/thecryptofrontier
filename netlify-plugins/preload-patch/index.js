module.exports = {
  onPreBuild: ({ utils }) => {
    console.log('Executando plugin para resolver problema do preloadModule');
    
    // Define a variável de ambiente para informar sobre o patch
    process.env.USE_PRELOAD_PATCH = 'true';
  },
  
  onBuild: ({ utils }) => {
    console.log('Aplicando patch para preloadModule');
    
    // Se você precisar fazer alguma modificação nos arquivos após o build
    // utils.run.command('node ./apply-preload-patch.js');
  }
}; 