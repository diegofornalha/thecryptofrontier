import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se a requisição é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Verificar se há um token de webhook configurado como variável de ambiente
    const webhookSecret = process.env.SANITY_WEBHOOK_SECRET;
    
    // Obter o token fornecido no cabeçalho da requisição
    const providedToken = req.headers['sanity-webhook-secret'];

    // Verificar se o token é válido (se configurado)
    if (webhookSecret && webhookSecret !== providedToken) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Extrair informações do corpo da requisição
    const { _id, _type } = req.body;
    
    if (!_id || !_type) {
      return res.status(400).json({ message: 'Corpo da requisição inválido' });
    }

    // Se necessário, você pode acionar uma reconstrução do site no Netlify
    // através da API deles ou simplesmente registrar a alteração
    console.log(`[Webhook] Documento atualizado: ${_type} (${_id})`);

    // Para acionar um rebuild no Netlify via API:
    if (process.env.NETLIFY_BUILD_HOOK) {
      console.log('Acionando rebuil do Netlify...');
      try {
        const response = await fetch(process.env.NETLIFY_BUILD_HOOK, {
          method: 'POST',
          body: JSON.stringify({ trigger_title: `Atualização de conteúdo Sanity: ${_type}` }),
        });
        
        if (response.ok) {
          console.log('Rebuild do Netlify acionado com sucesso');
        } else {
          console.error('Falha ao acionar rebuild do Netlify:', await response.text());
        }
      } catch (error) {
        console.error('Erro ao acionar rebuild do Netlify:', error);
      }
    }

    // Retornar uma resposta de sucesso
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
} 