import * as React from 'react';
import { cn } from "@/lib/utils";
import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import SubmitButtonFormControl from './SubmitButtonFormControl';
export default function FormBlock(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const formRef = React.useRef(null);
    const { fields = [], elementId, submitButton, className, styles = {}, 'data-sb-field-path': fieldPath } = props;
    if (fields.length === 0) {
        return null;
    }
    function handleSubmit(event) {
        event.preventDefault();
        if (formRef.current) {
            const data = new FormData(formRef.current);
            const value = Object.fromEntries(data.entries());
            alert(`Form data: ${JSON.stringify(value)}`);
        }
    }
    return (<form className={cn('sb-component sb-component-block sb-component-form-block', className, ((_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.margin) ? mapStyles({ margin: (_b = styles === null || styles === void 0 ? void 0 : styles.self) === null || _b === void 0 ? void 0 : _b.margin }) : undefined, ((_c = styles === null || styles === void 0 ? void 0 : styles.self) === null || _c === void 0 ? void 0 : _c.padding) ? mapStyles({ padding: (_d = styles === null || styles === void 0 ? void 0 : styles.self) === null || _d === void 0 ? void 0 : _d.padding }) : undefined, ((_e = styles === null || styles === void 0 ? void 0 : styles.self) === null || _e === void 0 ? void 0 : _e.borderWidth) && ((_f = styles === null || styles === void 0 ? void 0 : styles.self) === null || _f === void 0 ? void 0 : _f.borderWidth) !== 0 && ((_g = styles === null || styles === void 0 ? void 0 : styles.self) === null || _g === void 0 ? void 0 : _g.borderStyle) !== 'none'
            ? mapStyles({
                borderWidth: (_h = styles === null || styles === void 0 ? void 0 : styles.self) === null || _h === void 0 ? void 0 : _h.borderWidth,
                borderStyle: (_j = styles === null || styles === void 0 ? void 0 : styles.self) === null || _j === void 0 ? void 0 : _j.borderStyle,
                borderColor: (_l = (_k = styles === null || styles === void 0 ? void 0 : styles.self) === null || _k === void 0 ? void 0 : _k.borderColor) !== null && _l !== void 0 ? _l : 'border-primary'
            })
            : undefined, ((_m = styles === null || styles === void 0 ? void 0 : styles.self) === null || _m === void 0 ? void 0 : _m.borderRadius) ? mapStyles({ borderRadius: (_o = styles === null || styles === void 0 ? void 0 : styles.self) === null || _o === void 0 ? void 0 : _o.borderRadius }) : undefined)} name={elementId} id={elementId} onSubmit={handleSubmit} ref={formRef} data-sb-field-path={fieldPath}>
            <div className={cn('w-full flex flex-wrap gap-8', mapStyles({ justifyContent: (_q = (_p = styles === null || styles === void 0 ? void 0 : styles.self) === null || _p === void 0 ? void 0 : _p.justifyContent) !== null && _q !== void 0 ? _q : 'flex-start' }))} {...(fieldPath && { 'data-sb-field-path': '.fields' })}>
                <input type="hidden" name="form-name" value={elementId}/>
                {fields.map((field, index) => {
            const modelName = field.__metadata.modelName;
            if (!modelName) {
                throw new Error(`form field does not have the 'modelName' property`);
            }
            const FormControl = getComponent(modelName);
            if (!FormControl) {
                throw new Error(`no component matching the form field model name: ${modelName}`);
            }
            return <FormControl key={index} {...field} {...(fieldPath && { 'data-sb-field-path': `.${index}` })}/>;
        })}
            </div>
            {submitButton && (<div className={cn('mt-8 flex', mapStyles({ justifyContent: (_s = (_r = styles === null || styles === void 0 ? void 0 : styles.self) === null || _r === void 0 ? void 0 : _r.justifyContent) !== null && _s !== void 0 ? _s : 'flex-start' }))}>
                    <SubmitButtonFormControl {...submitButton} {...(fieldPath && { 'data-sb-field-path': '.submitButton' })}/>
                </div>)}
        </form>);
}
