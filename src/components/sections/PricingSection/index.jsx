import * as React from 'react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import ImageBlock from '../../blocks/ImageBlock';
import { Action, Badge } from '../../atoms';
export default function PricingSection(props) {
    var _a, _b, _c, _d;
    const { elementId, colors, backgroundImage, badge, title, subtitle, plans = [], styles = {}, enableAnnotations } = props;
    return (<Section elementId={elementId} className="sb-component-pricing-section" colors={colors} backgroundImage={backgroundImage} styles={styles === null || styles === void 0 ? void 0 : styles.self} {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', 'flex-col', mapStyles({ alignItems: (_b = (_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.justifyContent) !== null && _b !== void 0 ? _b : 'flex-start' }))}>
                {badge && <Badge {...badge} className="w-full max-w-sectionBody" {...(enableAnnotations && { 'data-sb-field-path': '.badge' })}/>}
                {title && (<TitleBlock {...title} className={classNames('w-full', 'max-w-sectionBody', { 'mt-4': badge === null || badge === void 0 ? void 0 : badge.label })} {...(enableAnnotations && { 'data-sb-field-path': '.title' })}/>)}
                {subtitle && (<p className={classNames('w-full', 'max-w-sectionBody', 'text-lg', 'sm:text-2xl', (styles === null || styles === void 0 ? void 0 : styles.subtitle) ? mapStyles(styles === null || styles === void 0 ? void 0 : styles.subtitle) : undefined, {
                'mt-4': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text)
            })} {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                        {subtitle}
                    </p>)}
                {plans.length > 0 && (<div className={classNames('w-full', 'overflow-x-hidden', { 'mt-12': !!((badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle) })}>
                        <div className={classNames('flex', 'flex-wrap', 'items-stretch', mapStyles({ justifyContent: (_d = (_c = styles === null || styles === void 0 ? void 0 : styles.self) === null || _c === void 0 ? void 0 : _c.justifyContent) !== null && _d !== void 0 ? _d : 'flex-start' }), 'gap-y-10', '-mx-5')} {...(enableAnnotations && { 'data-sb-field-path': '.plans' })}>
                            {plans.map((plan, index) => (<div key={index} className="px-5 basis-full max-w-full sm:basis-5/6 sm:max-w-[83.33333%] md:basis-2/3 md:max-w-[66.66667%] lg:basis-1/3 lg:max-w-[33.33333%]">
                                    <PricingPlan {...plan} hasSectionTitle={!!(title === null || title === void 0 ? void 0 : title.text)} {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}/>
                                </div>))}
                        </div>
                    </div>)}
            </div>
        </Section>);
}
function PricingPlan(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    const { elementId, title, price, details, description, features = [], image, actions = [], colors = 'bg-light-fg-dark', styles = {}, hasSectionTitle } = props;
    const fieldPath = props['data-sb-field-path'];
    const TitleTag = hasSectionTitle ? 'h3' : 'h2';
    return (<div id={elementId} className={classNames('sb-card', 'h-full', colors, ((_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.margin) ? mapStyles({ margin: (_b = styles === null || styles === void 0 ? void 0 : styles.self) === null || _b === void 0 ? void 0 : _b.margin }) : undefined, ((_c = styles === null || styles === void 0 ? void 0 : styles.self) === null || _c === void 0 ? void 0 : _c.borderWidth) && ((_d = styles === null || styles === void 0 ? void 0 : styles.self) === null || _d === void 0 ? void 0 : _d.borderWidth) !== 0 && ((_e = styles === null || styles === void 0 ? void 0 : styles.self) === null || _e === void 0 ? void 0 : _e.borderStyle) !== 'none'
            ? mapStyles({
                borderWidth: (_f = styles === null || styles === void 0 ? void 0 : styles.self) === null || _f === void 0 ? void 0 : _f.borderWidth,
                borderStyle: (_g = styles === null || styles === void 0 ? void 0 : styles.self) === null || _g === void 0 ? void 0 : _g.borderStyle,
                borderColor: (_j = (_h = styles === null || styles === void 0 ? void 0 : styles.self) === null || _h === void 0 ? void 0 : _h.borderColor) !== null && _j !== void 0 ? _j : 'border-primary'
            })
            : undefined, ((_k = styles === null || styles === void 0 ? void 0 : styles.self) === null || _k === void 0 ? void 0 : _k.borderRadius) ? mapStyles({ borderRadius: (_l = styles === null || styles === void 0 ? void 0 : styles.self) === null || _l === void 0 ? void 0 : _l.borderRadius }) : undefined, ((_m = styles === null || styles === void 0 ? void 0 : styles.self) === null || _m === void 0 ? void 0 : _m.textAlign) ? mapStyles({ textAlign: (_o = styles === null || styles === void 0 ? void 0 : styles.self) === null || _o === void 0 ? void 0 : _o.textAlign }) : undefined, 'overflow-hidden', 'flex', 'flex-col')} data-sb-field-path={fieldPath}>
            {(image === null || image === void 0 ? void 0 : image.url) && (<ImageBlock {...image} className={classNames('flex', mapStyles({ justifyContent: (_q = (_p = styles === null || styles === void 0 ? void 0 : styles.self) === null || _p === void 0 ? void 0 : _p.justifyContent) !== null && _q !== void 0 ? _q : 'flex-start' }))} {...(fieldPath && { 'data-sb-field-path': '.image' })}/>)}
            {(title || price || details || description || features.length > 0 || actions.length > 0) && (<div id={elementId} className={classNames('grow', 'flex', 'flex-col', ((_r = styles === null || styles === void 0 ? void 0 : styles.self) === null || _r === void 0 ? void 0 : _r.padding) ? mapStyles({ padding: (_s = styles === null || styles === void 0 ? void 0 : styles.self) === null || _s === void 0 ? void 0 : _s.padding }) : undefined)}>
                    {title && (<TitleTag className="text-xl font-normal normal-case tracking-normal no-underline" {...(fieldPath && { 'data-sb-field-path': '.title' })}>
                            {title}
                        </TitleTag>)}
                    {(price || details) && (<div className={classNames({ 'mt-6': title })}>
                            {price && (<div className="text-4xl sm:text-6xl font-medium" {...(fieldPath && { 'data-sb-field-path': '.price' })}>
                                    {price}
                                </div>)}
                            {details && (<div className={classNames('text-sm', 'font-medium', { 'mt-2': title })} {...(fieldPath && { 'data-sb-field-path': '.details' })}>
                                    {details}
                                </div>)}
                        </div>)}
                    {description && (<Markdown options={{ forceBlock: true, forceWrapper: true }} className={classNames('sb-markdown', { 'mt-10': title || price || details })} {...(fieldPath && { 'data-sb-field-path': '.description' })}>
                            {description}
                        </Markdown>)}
                    {features.length > 0 && (<ul className={classNames('list-disc', 'list-inside', 'text-sm', 'space-y-2', {
                    'mt-4': description,
                    'mt-10': !description && (title || price || details)
                })} {...(fieldPath && { 'data-sb-field-path': '.features' })}>
                            {features.map((bullet, index) => (<li key={index} {...(fieldPath && { 'data-sb-field-path': `.${index}` })}>
                                    {bullet}
                                </li>))}
                        </ul>)}
                    {actions.length > 0 && (<div className={classNames('flex', 'flex-wrap', mapStyles({ justifyContent: (_u = (_t = styles === null || styles === void 0 ? void 0 : styles.self) === null || _t === void 0 ? void 0 : _t.justifyContent) !== null && _u !== void 0 ? _u : 'flex-start' }), 'items-center', 'gap-4', {
                    'mt-auto pt-12': title || price || details || description || features.length > 0
                })} {...(fieldPath && { 'data-sb-field-path': '.actions' })}>
                            {actions.map((action, index) => (<Action key={index} {...action} className="lg:whitespace-nowrap" {...(fieldPath && { 'data-sb-field-path': `.${index}` })}/>))}
                        </div>)}
                </div>)}
        </div>);
}
