import * as React from 'react';
import classNames from 'classnames';
import Header from '../../sections/Header';
import ModernFooter from '../../sections/ModernFooter';

export default function DefaultBaseLayout(props) {
    const { page, site } = props;
    const { enableAnnotations = true } = site;
    const pageMeta = page?.__metadata || {};

    return (
        <div className={classNames('sb-page', pageMeta.pageCssClasses)} {...(enableAnnotations && { 'data-sb-object-id': pageMeta.id })}>
            <div className="sb-base sb-default-base-layout">
                {site.header && <Header {...site.header} enableAnnotations={enableAnnotations} />}
                {props.children}
                {site.footer && (
                    <ModernFooter 
                        title={site.footer.title}
                        description={site.footer.text}
                        primaryLinks={site.footer.primaryLinks}
                        secondaryLinks={site.footer.secondaryLinks}
                        socialLinks={site.footer.socialLinks}
                        legalLinks={site.footer.legalLinks}
                        copyrightText={site.footer.copyrightText}
                    />
                )}
            </div>
        </div>
    );
}
