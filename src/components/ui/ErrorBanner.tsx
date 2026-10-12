import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

interface ErrorBannerProps {
  title: string; // what failed: "Could not load drivers"
  message: string; // why, in the server's own words when it sent some
  onRetry: () => void; // runs the request again
}

// Shown where the data should be when a request fails. It always offers Retry.
export function ErrorBanner({ title, message, onRetry }: ErrorBannerProps) {
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-xl border border-danger-dark/30 bg-danger-light p-4 text-danger-dark sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <TriangleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p>{message}</p>
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={onRetry} className="shrink-0 self-start sm:self-center">
        <RefreshCw aria-hidden className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
