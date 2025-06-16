import * as React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { iconMap } from '../../../svgs';
export default function SubmitButtonFormControl(props) {
    const { elementId, className, label, showIcon, icon, iconPosition = 'right', style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.elementId#@id`].join(' ').trim() } : {};
    // Mapear estilos antigos para variantes do shadcn/ui
    const variantMap = {
        primary: 'default',
        secondary: 'secondary',
    };
    const variant = variantMap[style] || 'default';
    // Renderizar ícone com posicionamento correto
    const renderIcon = () => {
        if (!showIcon || !IconComponent)
            return null;
        return (<IconComponent className={cn("shrink-0 size-[1.25em]", {
                'order-first': iconPosition === 'left',
            })} {...(fieldPath && { 'data-sb-field-path': '.icon' })}/>);
    };
    return (<Button type="submit" id={elementId} variant={variant} className={className} {...annotations}>
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {renderIcon()}
        </Button>);
}
