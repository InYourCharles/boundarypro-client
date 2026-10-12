import { NavLink } from 'react-router-dom';
import { Brand } from './Brand';
import { navItems } from './navItems';
import { formatLongDay, todayManila } from '../../utils/format';

// The navigation on a desktop. Below the lg breakpoint it disappears and BottomNav takes over.
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 bg-navy text-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
        <Brand className="px-2 text-cream" />

        <nav aria-label="Main" className="mt-8 flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#F5A623]' : 'text-navy-100 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon aria-hidden className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* The dispatcher works by the Manila calendar, so the sidebar says which day that is */}
        <p className="px-2 text-sm text-navy-100">{formatLongDay(todayManila())}</p>
      </div>
    </aside>
  );
}
