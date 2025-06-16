import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
export default function SelectFormControl(props) {
    const { name, label, hideLabel, isRequired, options = [], defaultValue, width = 'full' } = props;
    const fieldPath = props['data-sb-field-path'];
    const labelId = `${name}-label`;
    return (<div className={cn('sb-form-control w-full', {
            'sm:w-formField': width === '1/2'
        })} data-sb-field-path={fieldPath}>
            {label && (<Label id={labelId} className={cn('sb-label inline-block sm:mb-1.5', { 'sr-only': hideLabel })} htmlFor={name} {...(fieldPath && { 'data-sb-field-path': '.label .name#@for' })}>
                    {label}
                </Label>)}
            <Select name={name} required={isRequired} defaultValue="">
                <SelectTrigger id={name} className="sb-select" {...(fieldPath && { 'data-sb-field-path': '.name#@id .name#@name' })}>
                    <SelectValue placeholder={defaultValue || "Selecione uma opção..."}/>
                </SelectTrigger>
                <SelectContent {...(fieldPath && { 'data-sb-field-path': '.options' })}>
                    {options.length > 0 &&
            options.map((option, index) => (<SelectItem key={index} value={option}>
                                {option}
                            </SelectItem>))}
                </SelectContent>
            </Select>
        </div>);
}
