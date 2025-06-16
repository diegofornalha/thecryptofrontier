import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import classNames from 'classnames';
import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Action, Badge } from '../../atoms';
export default function GenericSection(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const { elementId, colors, backgroundImage, badge, title, subtitle, text, actions = [], media, styles = {}, enableAnnotations } = props;
    const flexDirection = (_b = (_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.flexDirection) !== null && _b !== void 0 ? _b : 'row';
    const alignItems = (_d = (_c = styles === null || styles === void 0 ? void 0 : styles.self) === null || _c === void 0 ? void 0 : _c.alignItems) !== null && _d !== void 0 ? _d : 'flex-start';
    const hasTextContent = !!((badge === null || badge === void 0 ? void 0 : badge.url) || (title === null || title === void 0 ? void 0 : title.text) || subtitle || text || actions.length > 0);
    const hasMedia = !!(media && ((media === null || media === void 0 ? void 0 : media.url) || ((_e = media === null || media === void 0 ? void 0 : media.fields) !== null && _e !== void 0 ? _e : []).length > 0));
    const hasXDirection = flexDirection === 'row' || flexDirection === 'row-reverse';
    return (<Section elementId={elementId} className="sb-component-generic-section" colors={colors} backgroundImage={backgroundImage} styles={styles === null || styles === void 0 ? void 0 : styles.self} {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', mapFlexDirectionStyles(flexDirection, hasTextContent, hasMedia), 
        /* handle horizontal positioning of content on small screens or when direction is col or col-reverse, mapping justifyContent to alignItems instead since it's a flex column */
        mapStyles({ alignItems: (_g = (_f = styles === null || styles === void 0 ? void 0 : styles.self) === null || _f === void 0 ? void 0 : _f.justifyContent) !== null && _g !== void 0 ? _g : 'flex-start' }), 
        /* handle vertical positioning of content on large screens if it's a two col layout */
        hasMedia && hasTextContent && hasXDirection ? mapAlignItemsStyles(alignItems) : undefined, 'gap-x-12', 'gap-y-16')}>
                {hasTextContent && (<div className={classNames('w-full', 'max-w-sectionBody', {
                'lg:max-w-[27.5rem]': hasMedia && hasXDirection
            })}>
                        {badge && <Badge {...badge} {...(enableAnnotations && { 'data-sb-field-path': '.badge' })}/>}
                        {title && (<TitleBlock {...title} className={classNames({ 'mt-4': badge === null || badge === void 0 ? void 0 : badge.label })} {...(enableAnnotations && { 'data-sb-field-path': '.title' })}/>)}
                        {subtitle && (<p className={classNames('text-lg', 'sm:text-2xl', (styles === null || styles === void 0 ? void 0 : styles.subtitle) ? mapStyles(styles === null || styles === void 0 ? void 0 : styles.subtitle) : undefined, {
                    'mt-4': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text)
                })} {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                                {subtitle}
                            </p>)}
                        {text && (<Markdown options={{ forceBlock: true, forceWrapper: true }} className={classNames('sb-markdown', 'sm:text-lg', (styles === null || styles === void 0 ? void 0 : styles.text) ? mapStyles(styles === null || styles === void 0 ? void 0 : styles.text) : undefined, {
                    'mt-6': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle
                })} {...(enableAnnotations && { 'data-sb-field-path': '.text' })}>
                                {text}
                            </Markdown>)}
                        {actions.length > 0 && (<div className={classNames('flex', 'flex-wrap', mapStyles({ justifyContent: (_j = (_h = styles === null || styles === void 0 ? void 0 : styles.self) === null || _h === void 0 ? void 0 : _h.justifyContent) !== null && _j !== void 0 ? _j : 'flex-start' }), 'items-center', 'gap-4', {
                    'mt-8': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle || text
                })} {...(enableAnnotations && { 'data-sb-field-path': '.actions' })}>
                                {actions.map((action, index) => (<Action key={index} {...action} className="lg:whitespace-nowrap" {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
                            </div>)}
                    </div>)}
                {hasMedia && (<div className={classNames('w-full', 'flex', mapStyles({ justifyContent: (_l = (_k = styles === null || styles === void 0 ? void 0 : styles.self) === null || _k === void 0 ? void 0 : _k.justifyContent) !== null && _l !== void 0 ? _l : 'flex-start' }), {
                'max-w-sectionBody': media.__metadata.modelName === 'FormBlock',
                'lg:w-[57.5%] lg:shrink-0': hasTextContent && hasXDirection,
                'lg:mt-10': (badge === null || badge === void 0 ? void 0 : badge.label) && media.__metadata.modelName === 'FormBlock' && hasXDirection
            })}>
                        <Media media={media} hasAnnotations={enableAnnotations}/>
                    </div>)}
            </div>
        </Section>);
}
function Media({ media, hasAnnotations }) {
    const modelName = media.__metadata.modelName;
    if (!modelName) {
        throw new Error(`generic section media does not have the 'modelName' property`);
    }
    const MediaComponent = getComponent(modelName);
    if (!MediaComponent) {
        throw new Error(`no component matching the hero section media model name: ${modelName}`);
    }
    return <MediaComponent {...media} {...(hasAnnotations && { 'data-sb-field-path': '.media' })}/>;
}
function mapFlexDirectionStyles(flexDirection, hasTextContent, hasMedia) {
    switch (flexDirection) {
        case 'row':
            return hasTextContent && hasMedia ? 'flex-col lg:flex-row lg:justify-between' : 'flex-col';
        case 'row-reverse':
            return hasTextContent && hasMedia ? 'flex-col lg:flex-row-reverse lg:justify-between' : 'flex-col';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return null;
    }
}
function mapAlignItemsStyles(alignItems) {
    switch (alignItems) {
        case 'flex-start':
            return 'lg:items-start';
        case 'flex-end':
            return 'lg:items-end';
        case 'center':
            return 'lg:items-center';
        default:
            return null;
    }
}
