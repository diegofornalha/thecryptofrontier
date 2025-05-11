import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mapStylesToClassNames as mapStyles } from '../../../../utils/map-styles-to-class-names';

// Função para mapear cores antigas para variantes do shadcn/ui
const mapColorToVariant = (color) => {
    switch (color) {
        case 'text-primary':
            return 'default';
        case 'text-secondary':
            return 'secondary';
        case 'text-danger':
        case 'text-error':
            return 'destructive';
        default:
            return 'default';
    }
};

export default function CustomBadge(props) {
    const { label, color = 'text-primary', styles, className } = props;
    const fieldPath = props['data-sb-field-path'];
    
    if (!label) {
        return null;
    }

    const variant = mapColorToVariant(color);

    return (
        <Badge
            variant={variant}
            className={cn(
                "uppercase tracking-wider",
                className,
                // Manter compatibilidade com estilos personalizados
                styles?.self ? mapStyles(styles?.self) : undefined
            )}
            data-sb-field-path={fieldPath}
        >
            <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>
                {label}
            </span>
        </Badge>
    );
} 