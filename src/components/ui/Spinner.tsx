import { LoaderCircle } from 'lucide-react';

// A turning ring for short waits (a button that is saving, a check that is running).
// Whole screens use a skeleton instead, so the layout does not jump when the data arrives.
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <LoaderCircle aria-hidden className={`animate-spin ${className}`} />;
}
