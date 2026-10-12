import { useEffect } from 'react';

// Puts the page name in the browser tab, for example "Drivers | BoundaryPro"
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | BoundaryPro`;
  }, [title]);
}
