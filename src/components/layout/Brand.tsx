import { Link } from 'react-router-dom';

// Two chevrons pointing forward: a shift handed from one driver to the next. The second one takes the text colour.
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <path d="M7 8l8 8-8 8" stroke="#F5A623" />
      <path d="M17 8l8 8-8 8" stroke="currentColor" />
    </svg>
  );
}

// The logo and name, linking to the landing page. Used in the sidebar, the phone's top bar and the landing page.
export function Brand({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 rounded-lg font-display text-xl font-bold tracking-tight ${className}`}>
      <LogoMark />
      BoundaryPro
    </Link>
  );
}
