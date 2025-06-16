'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
export default function PublishButton({ className = '', variant = 'default', size = 'default' }) {
    return (<Link href="/admin/publish">
      <Button variant={variant} size={size} className={className}>
        <PlusCircle className="w-4 h-4 mr-2"/>
        Publicar Post
      </Button>
    </Link>);
}
