import { ButtonLink } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// Shown for any address the app does not know (the last route in App.tsx)
export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
      {/* A road sign: this page is off the route */}
      <p aria-hidden className="rounded-2xl border-b-8 border-amber bg-navy px-8 py-3 font-display text-7xl font-extrabold text-cream">
        404
      </p>
      <h1 className="mt-8 text-3xl font-bold">This page is not on the route</h1>
      <p className="mt-2 text-navy-500">The address may be mistyped, or the page may have moved. You can pick up from the dashboard or go back to the home page.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/dashboard" variant="accent">
          Go to the dashboard
        </ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Back to the home page
        </ButtonLink>
      </div>
    </div>
  );
}
