import * as React from 'react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { mapStylesToClassNames as mapStyles } from '../../../../utils/map-styles-to-class-names';
import Action from '../../../atoms/Action';
import ImageBlock from '../../../blocks/ImageBlock';
export default function FeaturedItem(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const { elementId, title, tagline, subtitle, text, image, actions = [], colors = 'bg-light-fg-dark', styles = {}, hasSectionTitle } = props;
    const fieldPath = props['data-sb-field-path'];
    const TitleTag = hasSectionTitle ? 'h3' : 'h2';
    const flexDirection = (_b = (_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.flexDirection) !== null && _b !== void 0 ? _b : 'col';
    const hasTextContent = !!(tagline || title || subtitle || text || actions.length > 0);
    const hasImage = !!(image === null || image === void 0 ? void 0 : image.url);
    return (<div id={elementId} className={classNames('sb-card', colors, ((_c = styles === null || styles === void 0 ? void 0 : styles.self) === null || _c === void 0 ? void 0 : _c.margin) ? mapStyles({ margin: (_d = styles === null || styles === void 0 ? void 0 : styles.self) === null || _d === void 0 ? void 0 : _d.margin }) : undefined, ((_e = styles === null || styles === void 0 ? void 0 : styles.self) === null || _e === void 0 ? void 0 : _e.padding) ? mapStyles({ padding: (_f = styles === null || styles === void 0 ? void 0 : styles.self) === null || _f === void 0 ? void 0 : _f.padding }) : undefined, ((_g = styles === null || styles === void 0 ? void 0 : styles.self) === null || _g === void 0 ? void 0 : _g.borderWidth) && ((_h = styles === null || styles === void 0 ? void 0 : styles.self) === null || _h === void 0 ? void 0 : _h.borderWidth) !== 0 && ((_j = styles === null || styles === void 0 ? void 0 : styles.self) === null || _j === void 0 ? void 0 : _j.borderStyle) !== 'none'
            ? mapStyles({
                borderWidth: (_k = styles === null || styles === void 0 ? void 0 : styles.self) === null || _k === void 0 ? void 0 : _k.borderWidth,
                borderStyle: (_l = styles === null || styles === void 0 ? void 0 : styles.self) === null || _l === void 0 ? void 0 : _l.borderStyle,
                borderColor: (_o = (_m = styles === null || styles === void 0 ? void 0 : styles.self) === null || _m === void 0 ? void 0 : _m.borderColor) !== null && _o !== void 0 ? _o : 'border-primary'
            })
            : undefined, ((_p = styles === null || styles === void 0 ? void 0 : styles.self) === null || _p === void 0 ? void 0 : _p.borderRadius) ? mapStyles({ borderRadius: (_q = styles === null || styles === void 0 ? void 0 : styles.self) === null || _q === void 0 ? void 0 : _q.borderRadius }) : undefined, ((_r = styles === null || styles === void 0 ? void 0 : styles.self) === null || _r === void 0 ? void 0 : _r.textAlign) ? mapStyles({ textAlign: (_s = styles === null || styles === void 0 ? void 0 : styles.self) === null || _s === void 0 ? void 0 : _s.textAlign }) : undefined, 'overflow-hidden')} data-sb-field-path={fieldPath}>
            <div className={classNames('w-full', 'flex', mapFlexDirectionStyles(flexDirection, hasTextContent, hasImage), 'gap-6')}>
                {hasImage && (<ImageBlock {...image} className={classNames('flex', mapStyles({ justifyContent: (_u = (_t = styles === null || styles === void 0 ? void 0 : styles.self) === null || _t === void 0 ? void 0 : _t.justifyContent) !== null && _u !== void 0 ? _u : 'flex-start' }), {
                'xs:w-[28.4%] xs:shrink-0': hasTextContent && (flexDirection === 'row' || flexDirection === 'row-reversed')
            })} {...(fieldPath && { 'data-sb-field-path': '.image' })}/>)}
                {hasTextContent && (<div className={classNames('w-full', {
                'xs:grow': hasImage && (flexDirection === 'row' || flexDirection === 'row-reversed')
            })}>
                        {tagline && (<p className="text-sm" {...(fieldPath && { 'data-sb-field-path': '.tagline' })}>
                                {tagline}
                            </p>)}
                        {title && (<TitleTag className={classNames('h3', {
                    'mt-2': tagline
                })} {...(fieldPath && { 'data-sb-field-path': '.title' })}>
                                {title}
                            </TitleTag>)}
                        {subtitle && (<p className={classNames('text-lg', {
                    'mt-2': tagline || title
                })} {...(fieldPath && { 'data-sb-field-path': '.subtitle' })}>
                                {subtitle}
                            </p>)}
                        {text && (<Markdown options={{ forceBlock: true, forceWrapper: true }} className={classNames('sb-markdown', {
                    'mt-4': tagline || title || subtitle
                })} {...(fieldPath && { 'data-sb-field-path': '.text' })}>
                                {text}
                            </Markdown>)}
                        {actions.length > 0 && (<div className={classNames('flex', 'flex-wrap', mapStyles({ justifyContent: (_w = (_v = styles === null || styles === void 0 ? void 0 : styles.self) === null || _v === void 0 ? void 0 : _v.justifyContent) !== null && _w !== void 0 ? _w : 'flex-start' }), 'items-center', 'gap-4', {
                    'mt-6': tagline || title || subtitle || text
                })} {...(fieldPath && { 'data-sb-field-path': '.actions' })}>
                                {actions.map((action, index) => (<Action key={index} {...action} className="lg:whitespace-nowrap" {...(fieldPath && { 'data-sb-field-path': `.${index}` })}/>))}
                            </div>)}
                    </div>)}
            </div>
        </div>);
}
function mapFlexDirectionStyles(flexDirection, hasTextContent, hasImage) {
    switch (flexDirection) {
        case 'row':
            return hasTextContent && hasImage ? 'flex-col xs:flex-row xs:items-start' : 'flex-col';
        case 'row-reverse':
            return hasTextContent && hasImage ? 'flex-col xs:flex-row-reverse xs:items-start' : 'flex-col';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return null;
    }
}
