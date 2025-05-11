import * as React from 'react';
import { iconMap } from '../../svgs';
import { Button } from "@/components/ui/button";
import NextLink from 'next/link';
import { cn } from "@/lib/utils";

export default function Action(props) {
    const { elementId, className, label, altText, url, showIcon, icon, iconPosition = 'right', style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@href`, `${fieldPath}.altText#@aria-label`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};
    const type = props.__metadata?.modelName;

    // Mapear estilos antigos para variantes do shadcn/ui
    const variantMap = {
        primary: 'default',
        secondary: 'secondary',
    };
    
    const variant = variantMap[style] || 'default';
    
    // Renderizar ícone com posicionamento correto
    const renderIcon = () => {
        if (!showIcon || !IconComponent) return null;
        
        return (
            <IconComponent
                className={cn("shrink-0 size-[1.25em]", {
                    'order-first': iconPosition === 'left',
                })}
                {...(fieldPath && { 'data-sb-field-path': '.icon' })}
            />
        );
    };

    // Conteúdo do botão
    const buttonContent = (
        <>
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {renderIcon()}
        </>
    );

    // Se tiver URL, usar como link
    if (url) {
        return (
            <Button
                variant={variant}
                className={className}
                asChild
                id={elementId}
                aria-label={altText}
                {...annotations}
            >
                <NextLink href={url}>
                    {buttonContent}
                </NextLink>
            </Button>
        );
    }
    
    // Caso contrário, renderizar como botão normal
    return (
        <Button
            variant={variant}
            className={className}
            id={elementId}
            aria-label={altText}
            {...annotations}
        >
            {buttonContent}
        </Button>
    );
}
