// The grey shapes a screen shows while its data loads. They sit where the real content will land,
// so nothing jumps when the answer arrives.

// Placeholders are not data, so they have no _id; each one gets a fixed name as its key instead of a position number
const PLACEHOLDER_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// One grey bar; the page shapes it with className, for example "h-6 w-40"
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-navy-100 ${className}`} />;
}

// Stand-in for a table or a list
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true" className="space-y-3 rounded-xl bg-white p-5 shadow-card">
      <span className="sr-only">Loading…</span>
      {PLACEHOLDER_KEYS.slice(0, rows).map((key) => (
        <Skeleton key={key} className="h-12" />
      ))}
    </div>
  );
}

// Stand-in for a grid of cards
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Loading…</span>
      {PLACEHOLDER_KEYS.slice(0, count).map((key) => (
        <Skeleton key={key} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}
