import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  const v =
    variant === 'secondary'
      ? 'btn btn-secondary'
      : variant === 'ghost'
      ? 'btn bg-transparent hover:bg-neutral-100 text-neutral-700'
      : 'btn btn-primary';
  const s = size === 'lg' ? 'h-12 px-6 text-base' : size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4';
  return <button className={`${v} ${s} ${className}`} {...props} />;
}

