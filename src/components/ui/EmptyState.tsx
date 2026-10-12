import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string; // says why it is empty and what to do next
  action?: ReactNode; // the button that fixes the emptiness
}

// What a list shows when there is nothing to list: never a blank space, always a next step
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-navy-100 bg-white px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-light text-amber-dark">
        <Icon aria-hidden className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-navy-500">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
