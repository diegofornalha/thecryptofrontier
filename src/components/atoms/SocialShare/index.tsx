import * as React from 'react';
import classNames from 'classnames';
import Social from '../Social';

export default function SocialShare(props) {
    const { className, title, url, enableAnnotations } = props;
    
    // Codificar título e URL para compartilhamento
    const encodedTitle = encodeURIComponent(title || '');
    const encodedUrl = encodeURIComponent(url || '');
    
    // Links para compartilhamento em diferentes plataformas
    const socialLinks = [
        {
            icon: 'facebook',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            altText: 'Compartilhar no Facebook'
        },
        {
            icon: 'twitter',
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            altText: 'Compartilhar no Twitter'
        },
        {
            icon: 'linkedin',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            altText: 'Compartilhar no LinkedIn'
        },
        {
            icon: 'whatsapp',
            url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            altText: 'Compartilhar no WhatsApp'
        },
        {
            icon: 'mail',
            url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
            altText: 'Compartilhar por Email'
        },
        {
            icon: 'reddit',
            url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            altText: 'Compartilhar no Reddit'
        }
    ];

    return (
        <div className={classNames('flex flex-wrap items-center', className)} {...(enableAnnotations && { 'data-sb-field-path': 'socialShare' })}>
            <ul className="flex flex-wrap items-center justify-center w-full">
                {socialLinks.map((link, index) => (
                    <li key={index} className="m-2">
                        <Social 
                            {...link} 
                            className="text-2xl bg-white hover:bg-gray-200 p-3 rounded-full shadow-md transform transition-transform duration-200 hover:scale-110"
                            {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })} 
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
} 