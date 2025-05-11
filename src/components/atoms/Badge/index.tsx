import * as React from 'react';
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';

export default function Badge(props) {
    const { label, color = 'text-primary', styles, className } = props;
    const fieldPath = props['data-sb-field-path'];
    if (!label) {
        return null;
    }

    // Mapear cores personalizadas
    const getColorClass = () => {
        if (color.startsWith('text-')) {
            return color;
        }
        return '';
    };

    return (
        <ShadcnBadge
            className={cn(
                'sb-component sb-component-block sb-component-badge tracking-wider uppercase',
                getColorClass(),
                className,
                styles?.self ? mapStyles(styles?.self) : undefined
            )}
            data-sb-field-path={fieldPath}
        >
            <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>
                {label}
            </span>
        </ShadcnBadge>
    );
}
