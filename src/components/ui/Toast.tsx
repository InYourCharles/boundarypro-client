import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { ToastContext } from '../../hooks/useToast';
import type { ToastApi } from '../../hooks/useToast';

interface ToastItem {
  id: number;
  tone: 'success' | 'error';
  message: string;
}

const SHOW_FOR_MS = 5000;

// Wraps the whole app (main.tsx). Any screen calls useToast().success('...') and the message appears here.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone: ToastItem['tone'], message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, tone, message }]);
      setTimeout(() => dismiss(id), SHOW_FOR_MS); // old messages leave by themselves
    },
    [dismiss],
  );

  // useMemo keeps the same object between renders, so screens that read useToast() do not re-render for nothing
  const api = useMemo<ToastApi>(() => ({ success: (message) => show('success', message), error: (message) => show('error', message) }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Above the bottom navigation on a phone, in the corner on a desktop. pointer-events-none lets clicks pass through the empty area. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl px-4 py-3 text-white shadow-modal ${toast.tone === 'error' ? 'bg-danger-dark' : 'bg-navy'}`}
          >
            {toast.tone === 'error' ? <CircleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0" /> : <CircleCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-teal" />}
            <p className="min-w-0 flex-1">{toast.message}</p>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss message" className="-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded hover:bg-white/15">
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
