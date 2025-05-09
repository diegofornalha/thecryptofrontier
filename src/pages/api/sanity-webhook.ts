import { NextApiRequest, NextApiResponse } from 'next';

export default async function sanityWebhook(req: NextApiRequest, res: NextApiResponse) {
  // Verifique se a solicitação é um POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Verifique o token secreto do webhook (se configurado)
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET;
  if (webhookSecret && req.headers['x-sanity-webhook-secret'] !== webhookSecret) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  try {
    // Aqui você pode implementar a lógica para atualizar o cache, 
    // revalidar páginas, ou acionar uma nova build
    
    // Exemplo: revalidação de caminhos específicos
    // const paths = req.body.paths || [];
    // for (const path of paths) {
    //   await res.revalidate(path);
    // }

    // Ou acionar uma nova build em plataformas como Netlify ou Vercel
    // await fetch('https://api.netlify.com/build_hooks/seu-hook-id', { method: 'POST' });

    return res.status(200).json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ message: 'Erro interno ao processar webhook' });
  }
} 