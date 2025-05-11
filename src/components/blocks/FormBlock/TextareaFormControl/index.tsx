import * as React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function TextareaFormControl(props) {
    const { name, label, hideLabel, isRequired, placeholder, width = 'full' } = props;
    const fieldPath = props['data-sb-field-path'];
    const labelId = `${name}-label`;
    const attr: React.TextareaHTMLAttributes<HTMLTextAreaElement> = {};
    if (label) {
        attr['aria-labelledby'] = labelId;
    }
    if (isRequired) {
        attr.required = true;
    }
    if (placeholder) {
        attr.placeholder = placeholder;
    }

    return (
        <div
            className={cn('sb-form-control w-full', {
                'sm:w-formField': width === '1/2'
            })}
            data-sb-field-path={fieldPath}
        >
            {label && (
                <Label
                    id={labelId}
                    className={cn('sb-label inline-block sm:mb-1.5', { 'sr-only': hideLabel })}
                    htmlFor={name}
                    {...(fieldPath && { 'data-sb-field-path': '.label .name#@for' })}
                >
                    {label}
                </Label>
            )}
            <Textarea
                id={props.name}
                className="sb-textarea"
                name={name}
                rows={5}
                {...attr}
                {...(fieldPath && { 'data-sb-field-path': '.name#@id .name#@name' })}
            />
        </div>
    );
}
