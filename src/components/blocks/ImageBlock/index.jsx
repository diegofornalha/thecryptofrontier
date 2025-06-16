import * as React from 'react';
import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
export default function ImageBlock(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const { elementId, className, imageClassName, url, altText = '', styles = {} } = props;
    if (!url) {
        return null;
    }
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@src`, `${fieldPath}.altText#@alt`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};
    return (<div className={classNames('sb-component', 'sb-component-block', 'sb-component-image-block', className, ((_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.margin) ? mapStyles({ margin: (_b = styles === null || styles === void 0 ? void 0 : styles.self) === null || _b === void 0 ? void 0 : _b.margin }) : undefined)} {...annotations}>
            <img id={elementId} className={classNames(imageClassName, ((_c = styles === null || styles === void 0 ? void 0 : styles.self) === null || _c === void 0 ? void 0 : _c.padding) ? mapStyles({ padding: (_d = styles === null || styles === void 0 ? void 0 : styles.self) === null || _d === void 0 ? void 0 : _d.padding }) : undefined, ((_e = styles === null || styles === void 0 ? void 0 : styles.self) === null || _e === void 0 ? void 0 : _e.borderWidth) && ((_f = styles === null || styles === void 0 ? void 0 : styles.self) === null || _f === void 0 ? void 0 : _f.borderWidth) !== 0 && ((_g = styles === null || styles === void 0 ? void 0 : styles.self) === null || _g === void 0 ? void 0 : _g.borderStyle) !== 'none'
            ? mapStyles({
                borderWidth: (_h = styles === null || styles === void 0 ? void 0 : styles.self) === null || _h === void 0 ? void 0 : _h.borderWidth,
                borderStyle: (_j = styles === null || styles === void 0 ? void 0 : styles.self) === null || _j === void 0 ? void 0 : _j.borderStyle,
                borderColor: (_l = (_k = styles === null || styles === void 0 ? void 0 : styles.self) === null || _k === void 0 ? void 0 : _k.borderColor) !== null && _l !== void 0 ? _l : 'border-primary'
            })
            : undefined, ((_m = styles === null || styles === void 0 ? void 0 : styles.self) === null || _m === void 0 ? void 0 : _m.borderRadius) ? mapStyles({ borderRadius: (_o = styles === null || styles === void 0 ? void 0 : styles.self) === null || _o === void 0 ? void 0 : _o.borderRadius }) : undefined)} src={url} alt={altText}/>
        </div>);
}
