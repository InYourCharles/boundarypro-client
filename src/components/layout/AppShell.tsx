import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Brand } from './Brand';
import { Sidebar } from './Sidebar';

// The frame around every page except the landing page: sidebar on a desktop, bottom bar on a phone.
// The page itself is drawn where <Outlet /> stands.
export function AppShell() {
  const { pathname } = useLocation();

  // A new page starts at the top, as it does in a normal website
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-amber focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">
        Skip to content
      </a>
      <Sidebar />
      {/* min-w-0 lets this column shrink below the width of its content. Without it a wide child pushes the page sideways. */}
      <div className="min-w-0 flex-1">
        <header className="px-4 pt-4 sm:px-6 lg:hidden">
          <Brand className="text-navy" />
        </header>
        {/* tabIndex -1 lets the skip link move the keyboard focus here, without adding the area to the Tab order */}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 focus:outline-none sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
