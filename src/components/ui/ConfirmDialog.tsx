import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string; // says what will happen: "Delete driver", never just "OK"
  tone?: 'danger' | 'primary';
  busy?: boolean; // true while the request behind the confirm button is running
  onConfirm: () => void;
  onCancel: () => void;
}

// Asked before every delete, and before steps that cannot be taken back (no-show, cancel)
export function ConfirmDialog({ open, title, message, confirmLabel, tone = 'danger', busy = false, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-2">{message}</div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {/* Cancel comes first in the page order, so the keyboard starts on the safe choice */}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={tone} busy={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
