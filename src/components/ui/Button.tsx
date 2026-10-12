import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost' | 'ghostDanger';
type Size = 'md' | 'sm';

// "accent" (amber) is the one key action of a screen. "danger" uses the dark red because white text on the
// brighter red only reaches a contrast of 4.4:1 and needs 4.5:1.
const variantClasses: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-700',
  accent: 'bg-amber text-navy hover:brightness-95',
  secondary: 'bg-white text-navy ring-1 ring-inset ring-navy-500/60 hover:bg-navy-50',
  danger: 'bg-danger-dark text-white hover:brightness-110',
  ghost: 'text-navy hover:bg-navy-100',
  ghostDanger: 'text-danger-dark hover:bg-danger-light', // the quiet Delete button inside a table row
};

// md is at least 44px tall, the size a thumb can hit reliably; sm is for actions inside table rows
const sizeClasses: Record<Size, string> = {
  md: 'min-h-11 px-4',
  sm: 'min-h-9 px-3 text-sm',
};

// Buttons and links that look like buttons share these classes, so they always match
function buttonClasses(variant: Variant = 'primary', size: Size = 'md') {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  busy?: boolean; // true while a request runs: shows the spinner and blocks a second click
}

export function Button({ variant, size, busy = false, disabled, type = 'button', className = '', children, ...rest }: ButtonProps) {
  return (
    // type defaults to "button" so a button inside a form never submits it by accident; forms pass type="submit"
    <button type={type} disabled={disabled || busy} aria-busy={busy || undefined} className={`${buttonClasses(variant, size)} ${className}`} {...rest}>
      {busy && <Spinner />}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

// A link to another page, styled as a button
export function ButtonLink({ to, variant, size, className = '', children }: ButtonLinkProps) {
  return (
    <Link to={to} className={`${buttonClasses(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}
