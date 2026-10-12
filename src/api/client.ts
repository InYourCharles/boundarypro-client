import axios, { isAxiosError } from 'axios';

// The one axios instance of the app. Every API module imports `api` from here, and no other file imports axios.
// The fallback address is the server's default, so the app also works before a .env file exists.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000, // without a limit, a server that never answers would leave a screen loading forever
});

// One entry of the `errors` list the server sends with a 400 or 409: which field, and what is wrong with it
export interface FieldProblem {
  field: string;
  message: string;
}

// The sentence to show for a failed request: the server's own message when it sent one
export function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === 'string') return message;
    if (!err.response) return 'Cannot reach the server. Check that the API is running, then try again.';
    return `Something went wrong (error ${err.response.status}). Try again.`;
  }
  return 'Something went wrong. Try again.';
}

// The per-field messages of a rejected form, so each one can be shown under its own input
export function fieldProblems(err: unknown): FieldProblem[] {
  if (isAxiosError(err) && Array.isArray(err.response?.data?.errors)) return err.response.data.errors;
  return [];
}
