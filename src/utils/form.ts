import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { fieldProblems } from '../api/client';

// A number input hands over text. This turns it into a number, and an empty box into undefined,
// so the Zod schema can tell "left empty" (required message) from "typed a number".
// Use it as register('boundaryRate', { setValueAs: numberOrBlank }).
export function numberOrBlank(value: string | number | undefined): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

// Puts the server's field messages (a 400 or 409 answer) under the matching inputs.
// Returns false when the answer had no field messages, so the caller can show the general message instead.
export function showServerErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): boolean {
  const problems = fieldProblems(err);
  for (const { field, message } of problems) {
    setError(field as Path<T>, { type: 'server', message });
  }
  return problems.length > 0;
}
