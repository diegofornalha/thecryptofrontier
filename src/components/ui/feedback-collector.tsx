"use client"

import { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from './dialog';

interface FeedbackCollectorProps {
  componentName: string;
  variant?: 'default' | 'minimal';
  className?: string;
}

export function FeedbackCollector({ 
  componentName, 
  variant = 'default',
  className 
}: FeedbackCollectorProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (rating === null) {
      setError('Por favor, selecione uma classificação');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/design-system/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentName, feedback, rating })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar feedback');
      }
      
      setSubmitted(true);
    } catch (err) {
      setError('Ocorreu um erro ao enviar o feedback. Tente novamente.');
      console.error('Erro ao enviar feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setFeedback('');
    setRating(null);
    setSubmitted(false);
    setError(null);
  };
  
  return (
    <Dialog onOpenChange={(open) => !open && handleReset()}>
      <DialogTrigger asChild>
        {variant === 'minimal' ? (
          <Button variant="ghost" size="sm" className={className}>
            Feedback
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={className}>
            Feedback sobre {componentName}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Feedback sobre {componentName}</DialogTitle>
          <DialogDescription>
            Sua opinião é importante para melhorarmos nossos componentes.
          </DialogDescription>
        </DialogHeader>
        
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mb-4 mx-auto bg-green-50 text-green-700 rounded-full h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Obrigado pelo seu feedback!</p>
            <p className="text-sm text-gray-500">
              Sua contribuição ajuda a melhorar nosso design system.
            </p>
            
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="mt-4"
            >
              Enviar outro feedback
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm mb-2 font-medium">Como você avalia este componente?</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={rating === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRating(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              
              <div>
                <p className="text-sm mb-2 font-medium">Comentários (opcional)</p>
                <Textarea
                  placeholder="Como podemos melhorar este componente?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 