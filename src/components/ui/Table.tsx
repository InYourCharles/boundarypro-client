import type { ReactNode } from 'react';

// Tables that turn into stacked cards on a phone, so nothing ever scrolls sideways.
//   md and wider: a normal table with a header row.
//   below md:     the header is hidden, each row becomes a card, and each cell prints its own column name (the `label`).

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-card md:overflow-hidden">
      <table className="block w-full text-left md:table">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="hidden bg-navy-50 md:table-header-group">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="block divide-y divide-navy-100 md:table-row-group">{children}</tbody>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="block px-4 py-3 md:table-row md:p-0">{children}</tr>;
}

export function Th({ children, align = 'left' }: { children?: ReactNode; align?: 'left' | 'right' }) {
  return (
    <th scope="col" className={`px-4 py-3 text-sm font-semibold ${align === 'right' ? 'text-right' : ''}`}>
      {children}
    </th>
  );
}

interface TdProps {
  label?: string; // the column name, shown beside the value on a phone
  align?: 'left' | 'right';
  actions?: boolean; // a cell of buttons: kept to the right
  children: ReactNode;
}

export function Td({ label, align = 'left', actions = false, children }: TdProps) {
  // Cells with a label put the name on the left and the value on the right. Cells without one (the name, the buttons) just flow.
  const labelled = label ? 'justify-between before:font-medium before:text-navy-500 before:content-[attr(data-label)] md:before:hidden' : '';
  const place = actions ? 'justify-end gap-2' : '';
  return (
    <td data-label={label} className={`flex items-center gap-4 py-1.5 md:table-cell md:px-4 md:py-3 md:align-middle ${labelled} ${place} ${align === 'right' ? 'md:text-right' : ''}`}>
      {/* One wrapper keeps a cell with several parts (a score and its "/ 100") together beside the label on a phone.
          A cell of buttons is left as it is, so each button stays a separate item in the row. */}
      {actions ? children : <div className="min-w-0">{children}</div>}
    </td>
  );
}
