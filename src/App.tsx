import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import Assignments from './pages/Assignments';
import Dashboard from './pages/Dashboard';
import DriverDetail from './pages/DriverDetail';
import DriverForm from './pages/DriverForm';
import Drivers from './pages/Drivers';
import Landing from './pages/Landing';
import Maintenance from './pages/Maintenance';
import NotFound from './pages/NotFound';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import VehicleForm from './pages/VehicleForm';
import Vehicles from './pages/Vehicles';

// The landing page stands alone. Every other page is drawn inside the AppShell (sidebar or bottom bar).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="drivers/new" element={<DriverForm />} />
        <Route path="drivers/:id" element={<DriverDetail />} />
        <Route path="drivers/:id/edit" element={<DriverForm />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/new" element={<VehicleForm />} />
        <Route path="vehicles/:id/edit" element={<VehicleForm />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="payments" element={<Payments />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
