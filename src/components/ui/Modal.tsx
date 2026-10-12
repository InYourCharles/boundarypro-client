import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// A window on top of the page, built on the browser's own <dialog> element. The browser then does the parts that
// are easy to get wrong by hand: the page behind becomes unreachable, Tab stays inside the window, and Esc closes it.
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // `open` (from the page) decides; this keeps the <dialog> element in step with it
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose} // fires after Esc and after dialog.close()
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose(); // a click on the dark area around the window
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg animate-toast-in rounded-2xl bg-white p-0 text-navy shadow-modal backdrop:bg-navy/60"
    >
      {/* The content is only mounted while open, so every opening starts with a fresh, empty form */}
      {open && (
        <div className="relative p-5 sm:p-6">
          <h2 id={titleId} className="pr-10 text-xl font-semibold">
            {title}
          </h2>
          <div className="mt-4">{children}</div>
          {/* Last in the page order on purpose: Tab starts on the first field, not on the close button */}
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg text-navy-500 hover:bg-navy-50">
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
      )}
    </dialog>
  );
}
