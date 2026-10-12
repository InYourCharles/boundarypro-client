import { Bus, CalendarDays, ChartColumn, LayoutDashboard, Users, Wallet, Wrench } from 'lucide-react';

// The pages of the app, in one list. The sidebar shows all of them; the phone's bottom bar shows the first four
// and puts the rest behind "More".
export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/vehicles', label: 'Vehicles', icon: Bus },
  { to: '/assignments', label: 'Assignments', icon: CalendarDays },
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: ChartColumn },
];
