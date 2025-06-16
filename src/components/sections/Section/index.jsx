import * as React from 'react';
import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import BackgroundImage from '../../atoms/BackgroundImage';
export default function Section(props) {
    const { elementId, className, colors = 'bg-light-fg-dark', backgroundImage, styles = {}, children } = props;
    return (<div id={elementId} className={classNames('sb-component', 'sb-component-section', className, colors, 'relative', (styles === null || styles === void 0 ? void 0 : styles.margin) ? mapStyles({ margin: styles === null || styles === void 0 ? void 0 : styles.margin }) : undefined, (styles === null || styles === void 0 ? void 0 : styles.padding) ? mapStyles({ padding: styles === null || styles === void 0 ? void 0 : styles.padding }) : 'px-4 py-28')} {...getDataAttrs(props)}>
            {backgroundImage && <BackgroundImage {...backgroundImage} className="absolute inset-0"/>}
            <div className="w-full max-w-7xl mx-auto relative">{children}</div>
        </div>);
}
