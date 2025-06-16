import * as React from 'react';
import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
export default function BackgroundImage(props) {
    const { url, className, backgroundSize, backgroundPosition, backgroundRepeat, opacity } = props;
    if (!url) {
        return null;
    }
    return (<div className={classNames(mapStyles({
            backgroundSize: backgroundSize !== null && backgroundSize !== void 0 ? backgroundSize : 'auto',
            backgroundPosition: backgroundPosition !== null && backgroundPosition !== void 0 ? backgroundPosition : 'center',
            backgroundRepeat: backgroundRepeat !== null && backgroundRepeat !== void 0 ? backgroundRepeat : 'no-repeat'
        }), className)} style={{
            backgroundImage: `url('${url}')`,
            opacity: (opacity !== null && opacity !== void 0 ? opacity : 100) * 0.01
        }}/>);
}
