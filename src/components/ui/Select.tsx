import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { borderClasses, controlClasses, describedBy, FieldShell } from './Field';
import type { FieldProps } from './Field';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldProps;

// The browser's own list of choices (so it works well with touch and keyboard), with the arrow drawn by us
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, hint, hideLabel, className = '', children, ...rest }, ref) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} hideLabel={hideLabel}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClasses} ${borderClasses(error)} appearance-none pr-10 ${className}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
      </div>
    </FieldShell>
  );
});
