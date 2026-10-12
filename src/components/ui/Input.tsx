import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { borderClasses, controlClasses, describedBy, FieldShell } from './Field';
import type { FieldProps } from './Field';

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

// forwardRef lets React Hook Form's register() reach the real <input>:  <Input label="Name" {...register('fullName')} />
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, hideLabel, className = '', ...rest }, ref) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} hideLabel={hideLabel}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${controlClasses} ${borderClasses(error)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
});
