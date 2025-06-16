import * as React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { mapStylesToClassNames as mapStyles } from '../../../../utils/map-styles-to-class-names';
import { getPageUrl } from '../../../../utils/page-utils';
import Link from '../../../atoms/Link';
import ImageBlock from '../../../blocks/ImageBlock';
export default function PostFeedItem(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    const { post, showThumbnail, showExcerpt, showDate, showAuthor, hasSectionTitle, hasBigThumbnail, hoverEffect = 'move-up', sectionColors, hasAnnotations } = props;
    const TitleTag = hasSectionTitle ? 'h3' : 'h2';
    const flexDirection = (_c = (_b = (_a = post.styles) === null || _a === void 0 ? void 0 : _a.self) === null || _b === void 0 ? void 0 : _b.flexDirection) !== null && _c !== void 0 ? _c : 'col';
    const hasThumbnail = !!(showThumbnail && ((_d = post.featuredImage) === null || _d === void 0 ? void 0 : _d.url));
    return (<Link href={getPageUrl(post)} className={classNames('sb-card', 'block', (_e = post.colors) !== null && _e !== void 0 ? _e : 'bg-light-fg-dark', ((_g = (_f = post.styles) === null || _f === void 0 ? void 0 : _f.self) === null || _g === void 0 ? void 0 : _g.margin) ? mapStyles({ margin: (_j = (_h = post.styles) === null || _h === void 0 ? void 0 : _h.self) === null || _j === void 0 ? void 0 : _j.margin }) : undefined, ((_l = (_k = post.styles) === null || _k === void 0 ? void 0 : _k.self) === null || _l === void 0 ? void 0 : _l.padding) ? mapStyles({ padding: (_o = (_m = post.styles) === null || _m === void 0 ? void 0 : _m.self) === null || _o === void 0 ? void 0 : _o.padding }) : undefined, ((_q = (_p = post.styles) === null || _p === void 0 ? void 0 : _p.self) === null || _q === void 0 ? void 0 : _q.borderWidth) && ((_s = (_r = post.styles) === null || _r === void 0 ? void 0 : _r.self) === null || _s === void 0 ? void 0 : _s.borderWidth) !== 0 && ((_u = (_t = post.styles) === null || _t === void 0 ? void 0 : _t.self) === null || _u === void 0 ? void 0 : _u.borderStyle) !== 'none'
            ? mapStyles({
                borderWidth: (_w = (_v = post.styles) === null || _v === void 0 ? void 0 : _v.self) === null || _w === void 0 ? void 0 : _w.borderWidth,
                borderStyle: (_y = (_x = post.styles) === null || _x === void 0 ? void 0 : _x.self) === null || _y === void 0 ? void 0 : _y.borderStyle,
                borderColor: (_1 = (_0 = (_z = post.styles) === null || _z === void 0 ? void 0 : _z.self) === null || _0 === void 0 ? void 0 : _0.borderColor) !== null && _1 !== void 0 ? _1 : 'border-primary'
            })
            : undefined, ((_3 = (_2 = post.styles) === null || _2 === void 0 ? void 0 : _2.self) === null || _3 === void 0 ? void 0 : _3.borderRadius) ? mapStyles({ borderRadius: (_5 = (_4 = post.styles) === null || _4 === void 0 ? void 0 : _4.self) === null || _5 === void 0 ? void 0 : _5.borderRadius }) : undefined, ((_7 = (_6 = post.styles) === null || _6 === void 0 ? void 0 : _6.self) === null || _7 === void 0 ? void 0 : _7.textAlign) ? mapStyles({ textAlign: (_9 = (_8 = post.styles) === null || _8 === void 0 ? void 0 : _8.self) === null || _9 === void 0 ? void 0 : _9.textAlign }) : undefined, 'overflow-hidden', mapCardHoverStyles(hoverEffect, sectionColors))} {...(hasAnnotations && { 'data-sb-object-id': (_10 = post.__metadata) === null || _10 === void 0 ? void 0 : _10.id })}>
            <div className={classNames('w-full', 'flex', mapFlexDirectionStyles(flexDirection, hasThumbnail), 'gap-6')}>
                {hasThumbnail && (<ImageBlock {...post.featuredImage} className={classNames({
                'xs:w-[50%] xs:shrink-0': hasBigThumbnail && (flexDirection === 'row' || flexDirection === 'row-reversed'),
                'xs:w-[28.4%] xs:shrink-0': !hasBigThumbnail && (flexDirection === 'row' || flexDirection === 'row-reversed')
            })} imageClassName="w-full h-full object-cover" {...(hasAnnotations && { 'data-sb-field-path': 'featuredImage' })}/>)}
                <div className={classNames('w-full', {
            'xs:grow': hasThumbnail && (flexDirection === 'row' || flexDirection === 'row-reversed')
        })}>
                    <TitleTag className="h3">
                        <span className={classNames(mapCardTitleHoverStyles(hoverEffect, post.colors))} {...(hasAnnotations && { 'data-sb-field-path': 'title' })}>
                            {post.title}
                        </span>
                    </TitleTag>
                    <PostAttribution showAuthor={showAuthor} showDate={showDate} date={post.date} author={post.author} className="mt-3" hasAnnotations={hasAnnotations}/>
                    {showExcerpt && post.excerpt && (<p className="mt-3" {...(hasAnnotations && { 'data-sb-field-path': 'excerpt' })}>
                            {post.excerpt}
                        </p>)}
                </div>
            </div>
        </Link>);
}
function PostAttribution({ showDate, showAuthor, date, author, className = '', hasAnnotations }) {
    if (!showDate && !(showAuthor && author)) {
        return null;
    }
    return (<div className={classNames('text-sm', 'uppercase', className)}>
            {showAuthor && author && (<>
                    <span {...(hasAnnotations && { 'data-sb-field-path': 'author' })}>
                        <span {...(hasAnnotations && { 'data-sb-field-path': '.name' })}>{author.name}</span>
                    </span>
                    {showDate && <span className="mx-2">|</span>}
                </>)}
            {showDate && (<time dateTime={dayjs(date).format('YYYY-MM-DD HH:mm:ss')} {...(hasAnnotations && { 'data-sb-field-path': 'date' })}>
                    {dayjs(date).format('YYYY-MM-DD')}
                </time>)}
        </div>);
}
function mapFlexDirectionStyles(flexDirection, hasThumbnail) {
    switch (flexDirection) {
        case 'row':
            return hasThumbnail ? 'flex-col xs:flex-row xs:items-stretch' : 'flex-col';
        case 'row-reverse':
            return hasThumbnail ? 'flex-col xs:flex-row-reverse xs:items-stretch' : 'flex-col';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return null;
    }
}
function mapCardHoverStyles(hoverEffect, colors) {
    switch (hoverEffect) {
        case 'thin-underline':
        case 'thick-underline':
            return 'group';
        case 'move-up':
            return 'transition duration-200 ease-in hover:-translate-y-1.5';
        case 'shadow':
            return colors === 'bg-dark-fg-light'
                ? 'transition duration-200 ease-in hover:shadow-2xl hover:shadow-black/60'
                : 'transition duration-200 ease-in hover:shadow-2xl';
        case 'shadow-plus-move-up':
            return colors === 'bg-dark-fg-light'
                ? 'transition duration-200 ease-in hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1.5'
                : 'transition duration-200 ease-in hover:shadow-2xl hover:-translate-y-1.5';
        default:
            return null;
    }
}
function mapCardTitleHoverStyles(hoverEffect, colors) {
    switch (hoverEffect) {
        case 'thin-underline':
            return colors === 'bg-dark-fg-light'
                ? 'bg-left-bottom bg-[length:0_1px] bg-no-repeat bg-gradient-to-r from-light to-light transition-[background-size] duration-300 ease-in-out group-hover:bg-[length:100%_1px]'
                : 'bg-left-bottom bg-[length:0_1px] bg-no-repeat bg-gradient-to-r from-dark to-dark transition-[background-size] duration-300 ease-in-out group-hover:bg-[length:100%_1px]';
        case 'thick-underline':
            return colors === 'bg-dark-fg-light'
                ? 'bg-left-bottom bg-[length:0_50%] bg-no-repeat bg-gradient-to-r from-light/30 to-light/30 transition-[background-size] duration-300 ease-in-out group-hover:bg-[length:100%_50%]'
                : 'bg-left-bottom bg-[length:0_50%] bg-no-repeat bg-gradient-to-r from-dark/20 to-dark/20 transition-[background-size] duration-300 ease-in-out group-hover:bg-[length:100%_50%]';
        default:
            return null;
    }
}
