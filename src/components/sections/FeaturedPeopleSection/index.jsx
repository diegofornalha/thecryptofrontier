import * as React from 'react';
import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Action, Badge } from '../../atoms';
import { getComponent } from '../../components-registry';
export default function FeaturedPeopleSection(props) {
    var _a, _b;
    const { type, elementId, colors, backgroundImage, badge, title, subtitle, actions = [], people = [], variant, columns = 4, enableAnimation, styles = {}, enableAnnotations } = props;
    const hasSectionTitle = !!((badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle);
    const hasSectionActions = actions && actions.length > 0;
    return (<Section type={type} elementId={elementId} className="sb-component-featured-people-section" colors={colors} backgroundImage={backgroundImage} styles={styles === null || styles === void 0 ? void 0 : styles.self} {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', 'flex-col', mapStyles({ alignItems: (_b = (_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.justifyContent) !== null && _b !== void 0 ? _b : 'flex-start' }))}>
                {badge && <Badge {...badge} className="w-full max-w-sectionBody" {...(enableAnnotations && { 'data-sb-field-path': '.badge' })}/>}
                {title && (<TitleBlock {...title} className={classNames('w-full', 'max-w-sectionBody', { 'mt-4': badge === null || badge === void 0 ? void 0 : badge.label })} {...(enableAnnotations && { 'data-sb-field-path': '.title' })}/>)}
                {subtitle && (<p className={classNames('w-full', 'max-w-sectionBody', 'text-lg', 'sm:text-2xl', (styles === null || styles === void 0 ? void 0 : styles.subtitle) ? mapStyles(styles === null || styles === void 0 ? void 0 : styles.subtitle) : undefined, {
                'mt-4': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text)
            })} {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                        {subtitle}
                    </p>)}
                <FeaturedPeopleVariants variant={variant} people={people} columns={columns} hasTopMargin={!!((badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle)} hasSectionTitle={hasSectionTitle} hasSectionActions={hasSectionActions} hasAnnotations={enableAnnotations} animationData={variant !== 'project-grid' ? enableAnimation : null}/>
                {actions.length > 0 && (<div className={classNames('flex', 'flex-wrap', 'items-center', 'gap-4', {
                'mt-12': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle || people.length > 0
            })} {...(enableAnnotations && { 'data-sb-field-path': '.actions' })}>
                        {actions.map((action, index) => (<Action key={index} {...action} className="lg:whitespace-nowrap" {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}/>))}
                    </div>)}
            </div>
        </Section>);
}
function FeaturedPeopleVariants(props) {
    const { variant = 'variant-a', ...rest } = props;
    switch (variant) {
        case 'project-grid':
            return <FeaturedPeopleProjectGrid {...rest}/>;
        default:
            return <FeaturedPeopleDefaultGrid {...rest}/>;
    }
}
function FeaturedPeopleDefaultGrid({ people = [], columns, hasTopMargin, hasSectionTitle, hasSectionActions, hasAnnotations, animationData }) {
    if (people.length === 0) {
        return null;
    }
    const FeaturedPerson = getComponent('FeaturedPerson');
    return (<div className={classNames('w-full', 'gap-y-16', 'sm:gap-y-20', {
            'mt-12': hasTopMargin,
            'grid md:grid-cols-2 lg:grid-cols-3': columns === 3,
            'grid md:grid-cols-2 lg:grid-cols-4': columns === 4,
            'grid md:grid-cols-3': columns === 2
        })} {...(hasAnnotations && { 'data-sb-field-path': '.people' })}>
            {people.map((person, index) => (<FeaturedPerson key={index} {...person} hasSectionTitle={hasSectionTitle} {...(hasAnnotations ? { 'data-sb-field-path': `.${index}` } : {})}/>))}
        </div>);
}
function FeaturedPeopleProjectGrid({ people = [], hasTopMargin, hasSectionTitle, hasAnnotations }) {
    if (people.length === 0) {
        return null;
    }
    const FeaturedPerson = getComponent('FeaturedPerson');
    return (<div className={classNames('grid', 'gap-x-8', 'gap-y-10', 'sm:grid-cols-2', 'lg:grid-cols-3', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.people' })}>
            {people.map((person, index) => (<FeaturedPerson key={index} {...person} hasSectionTitle={hasSectionTitle} {...(hasAnnotations ? { 'data-sb-field-path': `.${index}` } : {})}/>))}
        </div>);
}
