import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { borderClasses, controlClasses, describedBy, FieldShell } from './Field';
import type { FieldProps } from './Field';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, hideLabel, className = '', ...rest }, ref) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} hideLabel={hideLabel}>
      <textarea
        ref={ref}
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${controlClasses} ${borderClasses(error)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
});
