import { NextApiRequest, NextApiResponse } from 'next';

export default function preview(req: NextApiRequest, res: NextApiResponse) {
  const { secret, slug } = req.query;

  // Verifique se o token secreto de preview está correto
  if (secret !== process.env.SANITY_PREVIEW_SECRET || !slug) {
    return res.status(401).json({ message: 'Token inválido ou slug não fornecido' });
  }

  // Ativar o modo de preview
  res.setPreviewData({});

  // Redirecionar para o slug
  res.redirect(`/${slug}`);
} 