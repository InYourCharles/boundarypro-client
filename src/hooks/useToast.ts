import { createContext, useContext } from 'react';

export interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

// ToastProvider (components/ui/Toast.tsx) fills this in; any screen reads it with useToast()
export const ToastContext = createContext<ToastApi | null>(null);

// Usage: const toast = useToast(); toast.success('Driver added');
export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used inside <ToastProvider>');
  return toast;
}
