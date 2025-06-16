import * as React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
export default function CheckboxFormControl(props) {
    const { label, name, isRequired, width = 'full' } = props;
    const fieldPath = props['data-sb-field-path'];
    const labelId = `${name}-label`;
    const attr = {};
    if (label) {
        attr['aria-labelledby'] = labelId;
    }
    if (isRequired) {
        attr.required = true;
    }
    return (<div className={cn('sb-form-control', {
            'sm:col-span-2': width === 'full'
        })} data-sb-field-path={fieldPath}>
            <div className="flex items-center gap-2">
                <Checkbox id={name} name={name} {...(fieldPath && { 'data-sb-field-path': '.name#@id .name#@name' })}/>
                {label && (<Label id={labelId} className="sb-label cursor-pointer" htmlFor={name} {...(fieldPath && { 'data-sb-field-path': '.label .name#@for' })}>
                        {label}
                    </Label>)}
            </div>
        </div>);
}
