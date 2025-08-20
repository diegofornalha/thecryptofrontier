# Guia Completo: Validação de Dados no Strapi

## 🎯 Como o Strapi Valida Dados

O Strapi valida TODOS os dados contra o `schema.json` do Content-Type antes de processar qualquer requisição POST/PUT.

## ❌ Cenários de Erro e Como Resolver

### 1. Campo Obrigatório Ausente

**Erro:**
```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "title is a required field",
    "details": {
      "errors": [{
        "path": ["title"],
        "message": "title is a required field",
        "name": "ValidationError"
      }]
    }
  }
}
```

**Solução TypeScript:**
```typescript
interface PostData {
  title: string; // required
  content: string; // required
  excerpt?: string; // optional
}

// Validar antes de enviar
function validatePost(/var/lib/docker/volumes/thecryptofrontier-data: Partial<PostData>): PostData {
  if (!/var/lib/docker/volumes/thecryptofrontier-data.title?.trim()) {
    throw new Error('Título é obrigatório');
  }
  if (!/var/lib/docker/volumes/thecryptofrontier-data.content?.trim()) {
    throw new Error('Conteúdo é obrigatório');
  }
  
  return {
    title: /var/lib/docker/volumes/thecryptofrontier-data.title.trim(),
    content: /var/lib/docker/volumes/thecryptofrontier-data.content.trim(),
    excerpt: /var/lib/docker/volumes/thecryptofrontier-data.excerpt?.trim() || ''
  };
}
```

### 2. Tipo de Dado Incorreto

**Erro:**
```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "views must be a number"
  }
}
```

**Solução:**
```typescript
// Garantir tipos corretos
const postData = {
  title: "Meu Post",
  views: Number(formData.views) || 0, // Converter para número
  price: parseFloat(formData.price) || 0.0,
  published: Boolean(formData.published)
};
```

### 3. Validações de Tamanho/Limite

**Schema:**
```json
{
  "title": {
    "type": "string",
    "required": true,
    "minLength": 5,
    "maxLength": 100
  }
}
```

**Validação Frontend:**
```typescript
function validateTitle(title: string): string {
  if (title.length < 5) {
    throw new Error('Título deve ter no mínimo 5 caracteres');
  }
  if (title.length > 100) {
    throw new Error('Título deve ter no máximo 100 caracteres');
  }
  return title;
}
```

### 4. Relações Inválidas

**Erro:**
```json
{
  "error": {
    "status": 400,
    "message": "author with id 999 does not exist"
  }
}
```

**Solução:**
```typescript
// Verificar se autor existe antes de enviar
async function validateAuthor(authorId: number): Promise<boolean> {
  try {
    const response = await strapiClient.fetch(`/api/authors/${authorId}`);
    return !!response./var/lib/docker/volumes/thecryptofrontier-data;
  } catch {
    return false;
  }
}

// Uso
if (!(await validateAuthor(formData.authorId))) {
  throw new Error('Autor selecionado não existe');
}
```

### 5. Campos Extras (Ignorados por Padrão)

```typescript
// Strapi ignora campos não definidos
const /var/lib/docker/volumes/thecryptofrontier-data = {
  title: "Post",
  content: "Conteúdo",
  campoNaoExiste: "Será ignorado" // ✅ Não causa erro
};
```

## 🛡️ Estratégia Completa de Validação

### 1. Criar Tipos TypeScript do Schema

```typescript
// types/strapi-post.ts
export interface StrapiPostAttributes {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt?: string | null;
  views?: number;
  author?: {
    /var/lib/docker/volumes/thecryptofrontier-data: {
      id: number;
    };
  };
  category?: {
    /var/lib/docker/volumes/thecryptofrontier-data: {
      id: number;
    };
  };
  featuredImage?: {
    /var/lib/docker/volumes/thecryptofrontier-data: {
      id: number;
    };
  };
}

export interface CreatePostData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  publishedAt?: string | null;
  views?: number;
  authorId?: number;
  categoryId?: number;
  featuredImageId?: number;
}
```

### 2. Validador Completo

```typescript
// validators/post-validator.ts
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras, números e hífens')
    .optional(),
  
  content: z.string()
    .min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  
  excerpt: z.string()
    .max(500, 'Resumo deve ter no máximo 500 caracteres')
    .optional(),
  
  views: z.number()
    .int()
    .min(0)
    .optional(),
  
  authorId: z.number()
    .int()
    .positive()
    .optional(),
  
  categoryId: z.number()
    .int()
    .positive()
    .optional()
});

export function validatePost(/var/lib/docker/volumes/thecryptofrontier-data: unknown): CreatePostData {
  return PostSchema.parse(/var/lib/docker/volumes/thecryptofrontier-data);
}
```

### 3. Tratamento de Erros Amigável

```typescript
// utils/error-handler.ts
export function handleStrapiError(error: any): string {
  // Erro de validação do Strapi
  if (error.response?./var/lib/docker/volumes/thecryptofrontier-data?.error) {
    const strapiError = error.response./var/lib/docker/volumes/thecryptofrontier-data.error;
    
    // Mapear mensagens técnicas para amigáveis
    const errorMap: Record<string, string> = {
      'title is a required field': 'Por favor, insira um título',
      'content is a required field': 'Por favor, insira o conteúdo',
      'title must be at least 5 characters': 'O título deve ter no mínimo 5 caracteres',
      'ValidationError': 'Verifique os dados e tente novamente'
    };
    
    // Verificar detalhes específicos
    if (strapiError.details?.errors?.[0]) {
      const detail = strapiError.details.errors[0];
      return errorMap[detail.message] || detail.message;
    }
    
    return errorMap[strapiError.message] || strapiError.message;
  }
  
  // Erro de rede
  if (!error.response) {
    return 'Erro de conexão. Verifique sua internet.';
  }
  
  // Erro genérico
  return 'Ocorreu um erro. Tente novamente.';
}
```

### 4. Componente React com Validação

```tsx
// components/PostForm.tsx
import { useState } from 'react';
import { validatePost } from '@/validators/post-validator';
import { handleStrapiError } from '@/utils/error-handler';
import strapiClient from '@/lib/strapiClient';

export function PostForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(formData: FormData) {
    setErrors({});
    setLoading(true);
    
    try {
      // Validar dados
      const validatedData = validatePost({
        title: formData.get('title'),
        content: formData.get('content'),
        excerpt: formData.get('excerpt'),
        views: Number(formData.get('views')) || 0,
        authorId: Number(formData.get('authorId')) || undefined
      });
      
      // Enviar para Strapi
      const result = await strapiClient.createPost(validatedData);
      
      // Sucesso!
      alert('Post criado com sucesso!');
      
    } catch (error: any) {
      // Erro de validação Zod
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } 
      // Erro do Strapi
      else {
        const message = handleStrapiError(error);
        setErrors({ general: message });
      }
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div className="error">{errors.general}</div>
      )}
      
      <input
        name="title"
        placeholder="Título"
        className={errors.title ? 'error' : ''}
      />
      {errors.title && <span>{errors.title}</span>}
      
      <textarea
        name="content"
        placeholder="Conteúdo"
        className={errors.content ? 'error' : ''}
      />
      {errors.content && <span>{errors.content}</span>}
      
      <button disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

## 🔍 Debugando Erros de Validação

### 1. Ativar Logs Detalhados

```bash
# No Strapi
NODE_ENV=development npm run develop
```

### 2. Interceptar Requisições

```typescript
// lib/strapi-debug.ts
strapiClient.interceptors.request.use(request => {
  console.log('📤 Strapi Request:', {
    url: request.url,
    method: request.method,
    /var/lib/docker/volumes/thecryptofrontier-data: request./var/lib/docker/volumes/thecryptofrontier-data
  });
  return request;
});

strapiClient.interceptors.response.use(
  response => {
    console.log('✅ Strapi Response:', response./var/lib/docker/volumes/thecryptofrontier-data);
    return response;
  },
  error => {
    console.error('❌ Strapi Error:', {
      status: error.response?.status,
      /var/lib/docker/volumes/thecryptofrontier-data: error.response?./var/lib/docker/volumes/thecryptofrontier-data,
      config: error.config
    });
    return Promise.reject(error);
  }
);
```

### 3. Validar Schema Localmente

```typescript
// scripts/validate-schema.ts
import schema from '@/api/post/content-types/post/schema.json';

function validateAgainstSchema(/var/lib/docker/volumes/thecryptofrontier-data: any) {
  const errors = [];
  
  // Verificar campos obrigatórios
  Object.entries(schema.attributes).forEach(([key, config]: [string, any]) => {
    if (config.required && !/var/lib/docker/volumes/thecryptofrontier-data[key]) {
      errors.push(`${key} é obrigatório`);
    }
    
    // Verificar tipos
    if (/var/lib/docker/volumes/thecryptofrontier-data[key] !== undefined) {
      const expectedType = config.type;
      const actualType = typeof /var/lib/docker/volumes/thecryptofrontier-data[key];
      
      if (expectedType === 'number' && actualType !== 'number') {
        errors.push(`${key} deve ser número`);
      }
      // ... mais verificações
    }
  });
  
  return errors;
}
```

## 📚 Resumo de Melhores Práticas

1. **Sempre valide no frontend** antes de enviar ao Strapi
2. **Use TypeScript** para garantir tipos corretos
3. **Implemente tratamento de erros** amigável ao usuário
4. **Teste com dados inválidos** durante desenvolvimento
5. **Documente validações customizadas** no schema
6. **Use bibliotecas de validação** (Zod, Yup, Joi)
7. **Crie testes automatizados** para validações críticas

## 🚨 Checklist Pré-Deploy

- [ ] Todos os campos required têm validação frontend
- [ ] Tipos de dados são convertidos corretamente
- [ ] Mensagens de erro são amigáveis
- [ ] Relações são validadas antes de enviar
- [ ] Limites de caracteres respeitados
- [ ] Testes cobrem casos de erro
- [ ] Logs de erro são informativos