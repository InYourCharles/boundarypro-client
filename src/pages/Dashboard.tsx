import { Link } from 'react-router-dom';
import { CalendarPlus, CircleCheck, Wallet } from 'lucide-react';
import { listAssignments } from '../api/assignments';
import { listDrivers } from '../api/drivers';
import { getCollectionStats } from '../api/stats';
import { getMaintenanceDue } from '../api/vehicles';
import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { PageHeader } from '../components/ui/PageHeader';
import { PlateChip } from '../components/ui/PlateChip';
import { Skeleton } from '../components/ui/Skeleton';
import { Stat, StatStrip } from '../components/ui/Stat';
import { AssignmentStatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { SHIFTS } from '../utils/labels';
import { formatLongDay, peso, plural, todayManila } from '../utils/format';

// Everything the page shows comes from four requests, made together
async function loadDashboard() {
  const today = todayManila();
  const [assignments, stats, due, drivers] = await Promise.all([
    listAssignments({ from: today, to: today, sort: 'date' }),
    getCollectionStats({ from: today, to: today }),
    getMaintenanceDue(),
    listDrivers({}),
  ]);
  return { assignments, stats, due, drivers };
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { data, loading, error, refetch } = useFetch(loadDashboard, []);

  function renderContent() {
    if (error) return <ErrorBanner title="Could not load the dashboard" message={error} onRetry={refetch} />;
    if (loading || !data) return <DashboardSkeleton />;

    const { assignments, stats, due, drivers } = data;

    // Derived while rendering: counts, totals and the overdue ranking are never kept in state
    const booked = assignments.filter((assignment) => assignment.status !== 'cancelled');
    const onTheRoad = booked.filter((assignment) => assignment.status === 'active').length;
    const finished = booked.filter((assignment) => assignment.status === 'completed' || assignment.status === 'no-show').length;
    const overdueDrivers = drivers.filter((driver) => driver.overdueAmount > 0).sort((a, b) => b.overdueAmount - a.overdueAmount);
    const overdueUnits = due.vehicles.filter((vehicle) => vehicle.severity === 'overdue').length;

    return (
      <div className="space-y-6">
        <StatStrip className="grid-cols-2 lg:grid-cols-4">
          <Stat label="Shifts today" value={String(booked.length)} note={`${onTheRoad} on the road, ${finished} finished`} />
          <Stat label="Collected today" value={peso(stats.collected)} note="Payments received since midnight" valueClass="text-teal-dark" />
          <Stat
            label="Overdue in total"
            value={peso(stats.overdueTotal)}
            note={`${plural(overdueDrivers.length, 'driver')} behind`}
            valueClass={stats.overdueTotal > 0 ? 'text-danger-dark' : ''}
          />
          <Stat label="Units due for service" value={String(due.count)} note={`${overdueUnits} overdue, ${due.count - overdueUnits} due soon`} />
        </StatStrip>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {booked.length === 0 ? (
            <EmptyState
              icon={CalendarPlus}
              title="Nothing is booked today"
              description="No driver has a shift today. Book one and it appears here, grouped by shift."
              action={
                <ButtonLink to="/assignments" variant="accent">
                  Book a shift
                </ButtonLink>
              }
            />
          ) : (
            <Card title="Today's schedule" action={<Link to="/assignments" className="text-sm font-semibold text-navy underline underline-offset-2">Open assignments</Link>}>
              <div className="space-y-5">
                {SHIFTS.map((shift) => {
                  const inShift = booked.filter((assignment) => assignment.shift === shift.value);
                  return (
                    <section key={shift.value} aria-label={`${shift.label} shift`}>
                      <h3 className="flex items-baseline justify-between text-base font-semibold">
                        {shift.label}
                        <span className="text-sm font-normal text-navy-500">{shift.hours}</span>
                      </h3>
                      {inShift.length === 0 ? (
                        <p className="mt-2 text-sm text-navy-500">No one booked for this shift.</p>
                      ) : (
                        <ul className="mt-2 divide-y divide-navy-100">
                          {inShift.map((assignment) => (
                            <li key={assignment._id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
                              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                                <Link to={`/drivers/${assignment.driver._id}`} className="font-medium underline-offset-2 hover:underline">
                                  {assignment.driver.fullName}
                                </Link>
                                <PlateChip plate={assignment.vehicle.plateNumber} />
                              </div>
                              <AssignmentStatusBadge status={assignment.status} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>
            </Card>
          )}

          <Card title="Top overdue drivers" action={<Link to="/payments" className="text-sm font-semibold text-navy underline underline-offset-2">Record payment</Link>}>
            {overdueDrivers.length === 0 ? (
              <p className="flex items-start gap-2 text-navy-500">
                <CircleCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark" />
                No one is overdue. Every balance is up to date.
              </p>
            ) : (
              <ul className="divide-y divide-navy-100">
                {overdueDrivers.slice(0, 5).map((driver) => (
                  <li key={driver._id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link to={`/drivers/${driver._id}`} className="min-w-0 truncate font-medium underline-offset-2 hover:underline">
                      {driver.fullName}
                    </Link>
                    <span className="tabular shrink-0 font-semibold text-danger-dark">{peso(driver.overdueAmount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={formatLongDay(todayManila())}
        actions={
          <>
            <ButtonLink to="/assignments" variant="accent">
              <CalendarPlus aria-hidden className="h-4 w-4" />
              Book a shift
            </ButtonLink>
            <ButtonLink to="/payments" variant="secondary">
              <Wallet aria-hidden className="h-4 w-4" />
              Record payment
            </ButtonLink>
          </>
        }
      />
      {renderContent()}
    </>
  );
}
