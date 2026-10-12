import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

// Shared by Input, Select and Textarea: the label above the box, a hint below it, or the error message instead.

export interface FieldProps {
  label: string;
  error?: string; // the message from Zod or from the server
  hint?: string;
  hideLabel?: boolean; // for filter boxes: screen readers still get the label, sighted users get the placeholder
}

// 44px tall. The border is dark enough to see (3:1 against white) and turns red with an error.
export const controlClasses = 'min-h-11 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-base text-navy placeholder:text-navy-500 disabled:bg-navy-50 disabled:text-navy-500';

export function borderClasses(error?: string) {
  return error ? 'border-danger-dark ring-1 ring-danger-dark' : 'border-navy-500/75';
}

// The id of the message under the box, so the input can point to it with aria-describedby
export function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface FieldShellProps extends FieldProps {
  id: string;
  children: ReactNode;
}

export function FieldShell({ id, label, error, hint, hideLabel, children }: FieldShellProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-semibold'}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger-dark">
          <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-navy-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
