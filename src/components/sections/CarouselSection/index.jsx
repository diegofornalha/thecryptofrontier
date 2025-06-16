import * as React from 'react';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import { getComponent } from '../../components-registry';
import Section from '../Section';
import Badge from '../../atoms/Badge';
import TitleBlock from '../../blocks/TitleBlock';
import ChevronBigLeftIcon from '../../svgs/chevron-big-left';
import ChevronBigRightIcon from '../../svgs/chevron-big-right';
export default function CarouselSection(props) {
    var _a, _b;
    const { elementId, colors, backgroundImage, badge, title, subtitle, items = [], variant, styles = {}, enableAnnotations } = props;
    return (<Section elementId={elementId} className="sb-component-carousel-section" colors={colors} backgroundImage={backgroundImage} styles={styles === null || styles === void 0 ? void 0 : styles.self} {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', 'flex-col', mapStyles({ alignItems: (_b = (_a = styles === null || styles === void 0 ? void 0 : styles.self) === null || _a === void 0 ? void 0 : _a.justifyContent) !== null && _b !== void 0 ? _b : 'flex-start' }))}>
                {badge && <Badge {...badge} className="w-full max-w-sectionBody" {...(enableAnnotations && { 'data-sb-field-path': '.badge' })}/>}
                {title && (<TitleBlock {...title} className={classNames('w-full', 'max-w-sectionBody', { 'mt-4': badge === null || badge === void 0 ? void 0 : badge.label })} {...(enableAnnotations && { 'data-sb-field-path': '.title' })}/>)}
                {subtitle && (<p className={classNames('w-full', 'max-w-sectionBody', 'text-lg', 'sm:text-2xl', (styles === null || styles === void 0 ? void 0 : styles.subtitle) ? mapStyles(styles === null || styles === void 0 ? void 0 : styles.subtitle) : undefined, {
                'mt-4': (badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text)
            })} {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                        {subtitle}
                    </p>)}
                {items.length > 0 && (<CarouselVariants variant={variant} items={items} hasTopMargin={!!((badge === null || badge === void 0 ? void 0 : badge.label) || (title === null || title === void 0 ? void 0 : title.text) || subtitle)} hasSectionTitle={!!(title === null || title === void 0 ? void 0 : title.text)} hasAnnotations={enableAnnotations}/>)}
            </div>
        </Section>);
}
function CarouselVariants(props) {
    const { variant = 'next-prev-nav', ...rest } = props;
    switch (variant) {
        case 'dots-nav':
            return <CarouselWithPagination {...rest}/>;
        case 'tabs-nav':
            return <CarouselWithTabs {...rest}/>;
        case 'next-prev-nav-multiple':
            return <CarouselMultipleWithNavigation {...rest}/>;
        default:
            return <CarouselWithNavigation {...rest}/>;
    }
}
function CarouselWithNavigation({ items = [], hasTopMargin, hasSectionTitle, hasAnnotations }) {
    const FeaturedItem = getComponent('FeaturedItem');
    const [swiperRef, setSwiperRef] = React.useState();
    return (<div className={classNames('w-full', 'relative', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            <Swiper effect={'fade'} fadeEffect={{ crossFade: true }} speed={500} loop={true} autoHeight={true} modules={[EffectFade]} onSwiper={setSwiperRef}>
                {items.map((item, index) => (<SwiperSlide key={index}>
                        <div className="w-full max-w-5xl mx-auto">
                            <FeaturedItem {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations ? { 'data-sb-field-path': `.${index}` } : {})}/>
                        </div>
                    </SwiperSlide>))}
            </Swiper>
            <div className={classNames('sb-carousel-nav', items.length > 1 ? 'flex justify-center mt-8 xl:mt-0' : 'hidden')}>
                <button className="inline-flex items-center justify-center w-10 h-10 mx-2 rounded-full cursor-pointer sb-carousel-prev xl:absolute xl:left-0 xl:top-1/2 xl:-translate-y-1/2 xl:z-50" aria-label="Previous" onClick={() => {
            swiperRef === null || swiperRef === void 0 ? void 0 : swiperRef.slidePrev();
        }}>
                    <ChevronBigLeftIcon className="w-6 h-6 fill-current"/>
                </button>
                <button className="inline-flex items-center justify-center w-10 h-10 mx-2 rounded-full cursor-pointer sb-carousel-next xl:absolute xl:right-0 xl:top-1/2 xl:-translate-y-1/2 xl:z-50" aria-label="Next" onClick={() => {
            swiperRef === null || swiperRef === void 0 ? void 0 : swiperRef.slideNext();
        }}>
                    <ChevronBigRightIcon className="w-6 h-6 fill-current"/>
                </button>
            </div>
        </div>);
}
function CarouselMultipleWithNavigation({ items = [], hasTopMargin, hasSectionTitle, hasAnnotations }) {
    const FeaturedItem = getComponent('FeaturedItem');
    const [swiperRef, setSwiperRef] = React.useState();
    const itemsTotal = items.length;
    const itemsPerView = Math.floor(itemsTotal / 2);
    return (<div className={classNames('w-full', 'relative', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            <Swiper spaceBetween={40} slidesPerView={1} speed={500} loop={true} breakpoints={{
            640: { slidesPerView: itemsPerView > 1 ? 2 : 1 },
            768: { slidesPerView: itemsPerView > 1 ? itemsPerView : 1 }
        }} onSwiper={setSwiperRef}>
                {items.map((item, index) => (<SwiperSlide key={index}>
                        <div className="w-full">
                            <FeaturedItem {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations ? { 'data-sb-field-path': `.${index}` } : {})}/>
                        </div>
                    </SwiperSlide>))}
            </Swiper>
            <div className={classNames('sb-carousel-nav', itemsTotal > 1 ? 'flex justify-center gap-4 mt-8' : 'hidden')}>
                <button className="inline-flex items-center justify-center w-10 h-10 rounded-full cursor-pointer sb-carousel-prev" aria-label="Previous" onClick={() => {
            swiperRef === null || swiperRef === void 0 ? void 0 : swiperRef.slidePrev();
        }}>
                    <ChevronBigLeftIcon className="w-6 h-6 fill-current"/>
                </button>
                <button className="inline-flex items-center justify-center w-10 h-10 rounded-full cursor-pointer sb-carousel-next" aria-label="Next" onClick={() => {
            swiperRef === null || swiperRef === void 0 ? void 0 : swiperRef.slideNext();
        }}>
                    <ChevronBigRightIcon className="w-6 h-6 fill-current"/>
                </button>
            </div>
        </div>);
}
function CarouselWithPagination({ items = [], hasTopMargin, hasSectionTitle, hasAnnotations }) {
    const FeaturedItem = getComponent('FeaturedItem');
    const [swiperRef, setSwiperRef] = React.useState();
    const [activeDot, setActiveDot] = React.useState(0);
    return (<div className={classNames('w-full', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            <Swiper effect={'fade'} fadeEffect={{ crossFade: true }} speed={500} autoHeight={true} modules={[EffectFade]} onSwiper={setSwiperRef}>
                {items.map((item, index) => (<SwiperSlide key={index}>
                        <div className="w-full max-w-5xl mx-auto">
                            <FeaturedItem {...item} hasSectionTitle={hasSectionTitle} {...(hasAnnotations ? { 'data-sb-field-path': `.${index}` } : {})}/>
                        </div>
                    </SwiperSlide>))}
            </Swiper>
            <div className={classNames('sb-carousel-dots', items.length > 1 ? 'flex justify-center gap-3 mt-8' : 'hidden')}>
                {items.map((item, index) => (<span key={index} className={classNames('sb-carousel-dot', activeDot === index ? 'sb-carousel-dot-active' : undefined)} onClick={() => {
                swiperRef === null || swiperRef === void 0 ? void 0 : swiperRef.slideTo(index);
                setActiveDot(index);
            }}/>))}
            </div>
        </div>);
}
function CarouselWithTabs({ items = [], hasTopMargin, hasSectionTitle, hasAnnotations }) {
    const FeaturedItem = getComponent('FeaturedItem');
    const [swiperRef, setSwiperRef] = React.useState();
    const [activeTab, setActiveTab] = React.useState(0);
    return (<div className={classNames('w-full', { 'mt-12': hasTopMargin })} {...(hasAnnotations && { 'data-sb-field-path': '.items' })}>
            <div className={classNames('sb-carousel-tabs-nav', items.length > 1 ? 'flex justify-center gap-5 mb-10' : 'hidden')}>
                {items.map((item, index) => (<div key={index} {...(hasAnnotations && { 'data-sb-field-path': `.${index}` })}>
                        <div className={classNames('sb-carousel-tab-title', '', activeTab === index ? 'sb-carousel-tab-title-active' : undefined)} {...(hasAnnotations && { 'data-sb-field-path': '.tagline' })} onClick={() => {
                swiperRef === null || swiperRef === void 0 ? void 0 : swiperRef.slideTo(index);
                setActiveTab(index);
            }}>
                            {item.tagline}
                        </div>
                    </div>))}
            </div>
            <Swiper effect={'fade'} fadeEffect={{ crossFade: true }} speed={500} autoHeight={true} modules={[EffectFade]} onSwiper={setSwiperRef}>
                {items.map((item, index) => {
            const tabItem = { ...item, tagline: undefined };
            return (<SwiperSlide key={index}>
                            <div className="w-full max-w-5xl mx-auto">
                                <FeaturedItem {...tabItem} hasSectionTitle={hasSectionTitle} {...(hasAnnotations ? { 'data-sb-field-path': `.${index}` } : {})}/>
                            </div>
                        </SwiperSlide>);
        })}
            </Swiper>
        </div>);
}
