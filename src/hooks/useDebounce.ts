import { useEffect, useState } from 'react';

// Returns `value` only after it has stopped changing for `delayMs`.
// The search box uses it so typing "juan" sends one request instead of four.
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer); // typing again cancels the update that was waiting
  }, [value, delayMs]);

  return debounced;
}
