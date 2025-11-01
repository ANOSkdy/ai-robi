'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const baseClass =
  'inline-flex items-center justify-center font-medium transition-[transform,opacity] focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 rounded-2xl min-h-11 px-4';

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-soft hover:opacity-95',
  secondary: 'bg-secondary text-black shadow-soft hover:opacity-95',
  ghost: 'bg-transparent text-primary hover:bg-black/5',
  danger: 'bg-accent2 text-white hover:opacity-95',
};

const sizeClass: Record<Size, string> = {
  sm: 'min-h-10 rounded-xl px-3 text-sm',
  md: 'min-h-11 px-4 text-base',
  lg: 'min-h-12 px-5 text-base',
};

const mergeClassName = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...rest }, ref) => {
    const composed = mergeClassName(baseClass, variantClass[variant], sizeClass[size], className);
    return <button ref={ref} type={type} className={composed} {...rest} />;
  }
);

Button.displayName = 'Button';

export default Button;
