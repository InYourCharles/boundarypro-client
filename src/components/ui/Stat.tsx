import type { ReactNode } from 'react';

// A strip of key figures in one card. gap-px over a navy-100 background draws the thin lines between the figures,
// whatever the number of columns. The page chooses the columns through className, for example "grid-cols-2 lg:grid-cols-4".
export function StatStrip({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`grid gap-px overflow-hidden rounded-xl bg-navy-100 shadow-card ${className}`}>{children}</div>;
}

interface StatProps {
  label: string;
  value: string;
  note?: string;
  valueClass?: string; // a colour for the number when it means something (red for overdue)
}

export function Stat({ label, value, note, valueClass = '' }: StatProps) {
  return (
    <div className="min-w-0 bg-white p-5">
      <p className="text-sm font-medium text-navy-500">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold tabular ${valueClass}`}>{value}</p>
      {note && <p className="mt-1 text-sm text-navy-500">{note}</p>}
    </div>
  );
}
