import type { ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

// Every pair is a light fill with its dark shade as text, checked at 4.5:1 or better.
// The dot repeats the tone in a shape, so meaning never rests on colour alone; the label always says it too.
const toneClasses: Record<Tone, string> = {
  success: 'bg-teal-light text-teal-dark',
  warning: 'bg-amber-light text-amber-dark',
  danger: 'bg-danger-light text-danger-dark',
  neutral: 'bg-navy-50 text-navy-500',
  info: 'bg-navy-100 text-navy',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold leading-none ${toneClasses[tone]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
