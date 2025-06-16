import React from 'react';
import { useAuthors } from '../utils/hooks/useAuthors';
export default function AuthorSelector({ onSelect, selectedAuthorId, className = '' }) {
    const { authors, isLoading, error } = useAuthors();
    if (isLoading) {
        return <div className="p-4 text-center">Carregando autores...</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-600">Erro ao carregar autores: {error.message}</div>;
    }
    if (!authors || authors.length === 0) {
        return <div className="p-4 text-center">Nenhum autor encontrado.</div>;
    }
    return (<div className={`author-selector ${className}`}>
      <h3 className="text-lg font-medium mb-2">Selecione um autor</h3>
      <div className="space-y-2">
        {authors.map((author) => (<div key={author._id} className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 flex items-center
              ${selectedAuthorId === author._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => onSelect(author)}>
            {author.imageUrl && (<div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img src={author.imageUrl} alt={author.name} className="w-full h-full object-cover"/>
              </div>)}
            <div>
              <div className="font-medium">{author.name}</div>
              {author.role && <div className="text-sm text-gray-500">{author.role}</div>}
            </div>
          </div>))}
      </div>
    </div>);
}
