import { useId } from 'react';
import { Search } from 'lucide-react';
import { controlClasses } from './Field';

interface SearchBoxProps {
  label: string; // read by screen readers; sighted users see the placeholder
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// The search field above a list. The page keeps the text in state and waits (useDebounce) before asking the server.
export function SearchBox({ label, value, onChange, placeholder }: SearchBoxProps) {
  const id = useId();
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${controlClasses} border-navy-500/75 pl-9`}
      />
    </div>
  );
}
