import { useCallback, useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { errorMessage } from '../api/client';

// Loads the data of a screen and says what to show:
//   loading -> the skeleton, error -> the banner with Retry, data -> the real content.
// The request runs again when something in `deps` changes (a filter, an id), and `refetch` runs it
// again on demand (after a delete, or when the user presses Retry).
export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    // When a newer request starts, or the screen closes, an old answer must not overwrite the screen
    let ignore = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(errorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [...deps, reloads]);

  const refetch = useCallback(() => setReloads((count) => count + 1), []);

  return { data, loading, error, refetch };
}
