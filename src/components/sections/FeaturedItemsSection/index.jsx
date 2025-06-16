import * as React from 'react';
import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getComponent } from '../../components-registry';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import { Action, Badge } from '../../atoms';
import TitleBlock from '../../blocks/TitleBlock';
export default function FeaturedItemsSection(props) {
    var _a, _b;
    const { elementId, colors, backgroundImage, badge, title, subtitle, items = [], actions = [], variant, styles = {}, enableAnnotations } = props;
    return (<Section elementId={elementId} className="sb-component-featured-items-section" colors={colors} backgroundImage={backgroundImage} styles={styles === null || styles === void 0 ? void 0 : styles.self} {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', 'flex-col', mapStyles({ alignItems: (_b = (_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.justifyContent) !== null && _b !== void 0 ? _b : 'flex-start' }))}>
                {badge && <Badge {...badge} className="w-full max-w-sectionBody" {...(enableAnnotations && { 'data-sb-field-path': '.badge' })}/>}
                {title && (<TitleBlock {...title} className={classNames('w-full', 'max-w-sectionBody', { 'mt-4': badge === null || badge === void 0 ? void 0 : badge.label })} {...(enableAnnotations && { 'data-sb-field-path': '.title' })}/>)}
                {subtitle && (<p className={classNames('w-full', 'max-w-sectionBody', 'text-lg', 'sm:text-2xl', (styles === null || styles === void 0 ? void 0 : styles.subtitle) ? mapStyles(styles === null || styles === void 0 ? void 0 : styles.subtitle) : undefined, {
                'mt-4': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text)
            })} {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                        {subtitle}
                    </p>)}
                <FeaturedItemVariants variant={variant} items={items} hasTopMargin={!!((badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle)} hasSectionTitle={!!(title === null || title === void 0 ? void 0 : title.text)} hasAnnotations={enableAnnotations}/>
                {actions.length > 0 && (<div className={classNames('flex', 'flex-wrap', 'items-center', 'gap-4', {
                'mt-12': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle || items.length > 0
            })} {...(enableAnnotations && { 'data-sb-field-path': '.actions' })}>
                        {actions.map((action, index) => (<Action key={index} {...action} className="lg:whitespace-nowrap" {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
                    </div>)}
            </div>
        </Section>);
}
function FeaturedItemVariants(props) {
    const { variant = 'three-col-grid', ...rest } = props;
    switch (variant) {
        case 'two-col-grid':
            return <FeaturedItemsTwoColGrid {...rest}/>;
        case 'small-list':
            return <FeaturedItemsSmallList {...rest}/>;
        case 'big-list':
            return <FeaturedItemsBigList {...rest}/>;
        case 'toggle-list':
            return <FeaturedItemsToggleList {...rest}/>;
        default:
            return <FeaturedItemsThreeColGrid {...rest}/>;
    }
}
function FeaturedItemsThreeColGrid(props) {
    const { items = [], hasTopMargin, hasSectionTitle, hasAnnotations } = props;
    if (items.length === 0) {
        return null;
    }
    const FeaturedItem = getComponent('FeaturedItem');
    return (<div className={classNames('w-full', 'grid', 'gap-10', 'sm:grid-cols-2', 'lg:grid-cols-3', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            {items.map((item, index) => (<FeaturedItem key={index} {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
        </div>);
}
function FeaturedItemsTwoColGrid(props) {
    const { items = [], hasTopMargin, hasSectionTitle, hasAnnotations } = props;
    if (items.length === 0) {
        return null;
    }
    const FeaturedItem = getComponent('FeaturedItem');
    return (<div className={classNames('w-full', 'grid', 'gap-10', 'sm:grid-cols-2', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            {items.map((item, index) => (<FeaturedItem key={index} {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
        </div>);
}
function FeaturedItemsSmallList(props) {
    const { items = [], hasTopMargin, hasSectionTitle, hasAnnotations } = props;
    if (items.length === 0) {
        return null;
    }
    const FeaturedItem = getComponent('FeaturedItem');
    return (<div className={classNames('w-full', 'max-w-3xl', 'grid', 'gap-10', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            {items.map((item, index) => (<FeaturedItem key={index} {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
        </div>);
}
function FeaturedItemsBigList(props) {
    const { items = [], hasTopMargin, hasSectionTitle, hasAnnotations } = props;
    if (items.length === 0) {
        return null;
    }
    const FeaturedItem = getComponent('FeaturedItem');
    return (<div className={classNames('w-full', 'grid', 'gap-10', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            {items.map((item, index) => (<FeaturedItem key={index} {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
        </div>);
}
function FeaturedItemsToggleList(props) {
    const { items = [], hasTopMargin, hasSectionTitle, hasAnnotations } = props;
    if (items.length === 0) {
        return null;
    }
    const FeaturedItemToggle = getComponent('FeaturedItemToggle');
    return (<div className={classNames('w-full', 'max-w-3xl', 'grid', 'gap-6', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            {items.map((item, index) => (<FeaturedItemToggle key={index} {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
        </div>);
}
