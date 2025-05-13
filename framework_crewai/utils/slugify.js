/**
 * Função para converter títulos em slugs URL-friendly
 * 
 * @param {string} texto - O texto a ser convertido em slug
 * @returns {string} - O slug resultante
 */
function slugify(texto) {
  if (!texto) return '';
  
  // Normaliza acentos e caracteres especiais
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove caracteres não-alfanuméricos exceto espaços e hífens
    .replace(/[\s_-]+/g, '-')  // Substitui espaços, underscores e múltiplos hífens por um único hífen
    .replace(/^-+|-+$/g, '');  // Remove hífens do início e fim
}

module.exports = slugify; 