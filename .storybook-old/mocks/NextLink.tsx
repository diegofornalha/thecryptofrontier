import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

// Um componente simples que substitui o Next/Link
const NextLink = ({
  href,
  children,
  className,
  ...props
}: LinkProps) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default NextLink; 