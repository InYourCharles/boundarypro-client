import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  action?: ReactNode; // a button or link shown at the right of the title
  className?: string;
  children: ReactNode;
}

// The one container of the app: rounded-xl corners and the one soft shadow (both set in the Tailwind theme)
export function Card({ title, action, className = '', children }: CardProps) {
  return (
    <div className={`rounded-xl bg-white p-5 shadow-card ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
