import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { navItems } from './navItems';

// Four places a thumb reaches all day, and "More" for the three that are used less often
const mainItems = navItems.slice(0, 4);
const moreItems = navItems.slice(4);

function tabClasses(active: boolean) {
  return `flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 text-xs font-medium ${active ? 'text-navy shadow-[inset_0_3px_0_#F5A623]' : 'text-navy-500'}`;
}

// The navigation on a phone: a bar fixed to the bottom of the screen. From the lg breakpoint up the Sidebar is used instead.
export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  // "More" lights up when the open page is one of the pages inside it. Worked out here, not kept in state.
  const onMorePage = moreItems.some((item) => pathname.startsWith(item.to));

  return (
    <>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {mainItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => tabClasses(isActive)}>
                <Icon aria-hidden className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" className={tabClasses(onMorePage)}>
              <Ellipsis aria-hidden className="h-5 w-5" />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Modal open={moreOpen} title="More" onClose={() => setMoreOpen(false)}>
        <ul className="space-y-1">
          {moreItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} onClick={() => setMoreOpen(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium hover:bg-navy-50">
                <Icon aria-hidden className="h-5 w-5 text-navy-500" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
