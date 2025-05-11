import { Button } from "@/components/ui/button"
import NextLink from "next/link"
import { iconMap } from '../../../../components/svgs'
import { cn } from "@/lib/utils"

export default function Action(props) {
    const { 
        elementId, 
        className, 
        label, 
        altText, 
        url, 
        showIcon, 
        icon, 
        iconPosition = 'right', 
        style = 'primary' 
    } = props;
    
    const IconComponent = icon ? iconMap[icon] : null;
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@href`, `${fieldPath}.altText#@aria-label`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};
    
    const type = props.__metadata?.modelName;
    
    // Mapear estilos antigos para variantes do shadcn/ui Button
    const getVariant = () => {
        if (type === 'Button') {
            return style === 'primary' ? 'default' : 'secondary';
        }
        return style === 'primary' ? 'link' : 'ghost';
    };
    
    const variant = getVariant();
    
    // Se for um link
    if (url) {
        return (
            <Button
                variant={variant}
                className={className}
                asChild
            >
                <NextLink 
                    href={url}
                    aria-label={altText}
                    id={elementId}
                    {...annotations}
                >
                    {iconPosition === 'left' && showIcon && IconComponent && (
                        <IconComponent className={cn("mr-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
                    )}
                    {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
                    {iconPosition === 'right' && showIcon && IconComponent && (
                        <IconComponent className={cn("ml-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
                    )}
                </NextLink>
            </Button>
        );
    }
    
    // Se for um botão
    return (
        <Button
            variant={variant}
            className={className}
            id={elementId}
            {...annotations}
        >
            {iconPosition === 'left' && showIcon && IconComponent && (
                <IconComponent className={cn("mr-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
            )}
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {iconPosition === 'right' && showIcon && IconComponent && (
                <IconComponent className={cn("ml-2")} {...(fieldPath && { 'data-sb-field-path': '.icon' })} />
            )}
        </Button>
    );
} 