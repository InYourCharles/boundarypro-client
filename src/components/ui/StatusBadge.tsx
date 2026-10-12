import { Badge } from './Badge';
import type { Tone } from './Badge';
import { peso } from '../../utils/format';
import type { AssignmentStatus, DriverStatus, VehicleStatus } from '../../types';

// Badge colours are decided here from the data, never stored: the status in the record is the single truth.

type Look = { tone: Tone; label: string };

const driverLooks: Record<DriverStatus, Look> = {
  active: { tone: 'success', label: 'Active' },
  suspended: { tone: 'warning', label: 'Suspended' },
  inactive: { tone: 'neutral', label: 'Inactive' },
};

const vehicleLooks: Record<VehicleStatus, Look> = {
  available: { tone: 'success', label: 'Available' },
  'under-maintenance': { tone: 'warning', label: 'In the shop' },
  retired: { tone: 'neutral', label: 'Retired' },
};

const assignmentLooks: Record<AssignmentStatus, Look> = {
  scheduled: { tone: 'info', label: 'Scheduled' },
  active: { tone: 'warning', label: 'On the road' },
  completed: { tone: 'success', label: 'Completed' },
  'no-show': { tone: 'danger', label: 'No-show' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
};

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  const { tone, label } = driverLooks[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const { tone, label } = vehicleLooks[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const { tone, label } = assignmentLooks[status];
  return <Badge tone={tone}>{label}</Badge>;
}

// Where a vehicle stands against its service plan. No severity means it is not due.
export function ServiceBadge({ severity }: { severity?: 'overdue' | 'due-soon' }) {
  if (severity === 'overdue') return <Badge tone="danger">Service overdue</Badge>;
  if (severity === 'due-soon') return <Badge tone="warning">Service due soon</Badge>;
  return <Badge tone="success">Service on track</Badge>;
}

// What a driver owes: overdue is the loudest, then owed-but-not-yet-due, then settled
export function BalanceBadge({ balance, overdueAmount }: { balance: number; overdueAmount: number }) {
  if (overdueAmount > 0) return <Badge tone="danger">{peso(overdueAmount)} overdue</Badge>;
  if (balance > 0) return <Badge tone="warning">{peso(balance)} owed</Badge>;
  return <Badge tone="success">Settled</Badge>;
}
