import { NextApiRequest, NextApiResponse } from 'next';

export default function exitPreview(_req: NextApiRequest, res: NextApiResponse) {
  // Limpar os dados de preview
  res.clearPreviewData();

  // Redirecionar para a página inicial
  res.redirect('/');
} 