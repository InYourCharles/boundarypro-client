import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { changeStatus, listAssignments } from '../api/assignments';
import { errorMessage } from '../api/client';
import { listDrivers } from '../api/drivers';
import { listVehicles } from '../api/vehicles';
import { AssignmentForm } from '../components/forms/AssignmentForm';
import { CompleteShiftForm } from '../components/forms/CompleteShiftForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { PlateChip } from '../components/ui/PlateChip';
import { Skeleton } from '../components/ui/Skeleton';
import { AssignmentStatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import type { Assignment, Shift } from '../types';
import { chargeOf } from '../utils/assignments';
import { addDays, formatLongDay, peso, plural, todayManila } from '../utils/format';
import { SHIFTS } from '../utils/labels';

// The two steps that cannot be undone ask first
type Confirmation = { assignment: Assignment; status: 'no-show' | 'cancelled' };

// The drivers and vehicles the booking form chooses from
async function loadChoices() {
  const [drivers, vehicles] = await Promise.all([listDrivers({}), listVehicles({})]);
  return { drivers, vehicles };
}

// What the row says about money, in words
function chargeText(assignment: Assignment) {
  if (assignment.status === 'cancelled') return 'No charge';
  if (assignment.status === 'no-show') return `${peso(assignment.penaltyFee)} penalty`;
  return `${peso(assignment.boundaryDue)} boundary`;
}

interface ShiftRowProps {
  assignment: Assignment;
  isFutureDay: boolean; // starting or marking a no-show is only possible once the day has come (the server enforces it too)
  starting: boolean;
  onStart: () => void;
  onComplete: () => void;
  onNoShow: () => void;
  onCancel: () => void;
}

function ShiftRow({ assignment, isFutureDay, starting, onStart, onComplete, onNoShow, onCancel }: ShiftRowProps) {
  const { driver, vehicle, status } = assignment;
  return (
    <li className="py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Link to={`/drivers/${driver._id}`} className="font-semibold underline-offset-2 hover:underline">
            {driver.fullName}
          </Link>
          <PlateChip plate={vehicle.plateNumber} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="tabular text-navy-500">{chargeText(assignment)}</span>
          <AssignmentStatusBadge status={status} />
        </div>
      </div>
      {assignment.notes && <p className="mt-1 text-sm text-navy-500">Note: {assignment.notes}</p>}

      {(status === 'scheduled' || status === 'active') && (
        <div className="mt-3 flex flex-wrap gap-2">
          {status === 'scheduled' && !isFutureDay && (
            <Button variant="primary" size="sm" busy={starting} onClick={onStart}>
              <Play aria-hidden className="h-4 w-4" />
              Start shift
            </Button>
          )}
          {status === 'active' && (
            <Button variant="accent" size="sm" onClick={onComplete}>
              Complete shift
            </Button>
          )}
          {status === 'scheduled' && !isFutureDay && (
            <Button variant="ghostDanger" size="sm" onClick={onNoShow}>
              Mark no-show
            </Button>
          )}
          {status === 'scheduled' && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel booking
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export default function Assignments() {
  useDocumentTitle('Assignments');
  const toast = useToast();

  const today = todayManila();
  const [day, setDay] = useState(today);
  const [booking, setBooking] = useState<{ shift?: Shift } | null>(null); // null = the booking window is closed
  const [completing, setCompleting] = useState<Assignment | null>(null);
  const [confirming, setConfirming] = useState<Confirmation | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);

  const schedule = useFetch(() => listAssignments({ from: day, to: day, sort: 'date' }), [day]);
  const choices = useFetch(loadChoices, []);

  // Derived while rendering
  const assignments = schedule.data ?? [];
  const isFutureDay = day > today;
  const chargesOfTheDay = assignments.reduce((sum, assignment) => sum + chargeOf(assignment), 0);
  const bookedCount = assignments.filter((assignment) => assignment.status !== 'cancelled').length;

  async function start(assignment: Assignment) {
    setStartingId(assignment._id);
    try {
      const result = await changeStatus(assignment._id, { status: 'active' });
      toast.success(result.message);
      schedule.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setStartingId(null);
    }
  }

  async function confirmChange() {
    if (!confirming) return;
    setConfirmBusy(true);
    try {
      const result = await changeStatus(confirming.assignment._id, { status: confirming.status });
      toast.success(result.message); // for example "Marked as no-show. Penalty of 60 pesos charged; boundary waived."
      schedule.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setConfirmBusy(false);
      setConfirming(null);
    }
  }

  function afterBooked(bookedDay: string) {
    setBooking(null);
    setDay(bookedDay); // show the day that was just booked
    schedule.refetch();
    choices.refetch(); // balances and statuses may have changed
  }

  function afterCompleted() {
    setCompleting(null);
    schedule.refetch();
  }

  function renderSchedule() {
    if (schedule.error) return <ErrorBanner title="Could not load this day's schedule" message={schedule.error} onRetry={schedule.refetch} />;
    if (!schedule.data) {
      return (
        <div role="status" aria-busy="true" className="space-y-4">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <EmptyState
          icon={CalendarDays}
          title="Nothing is booked for this day"
          description={isFutureDay || day === today ? 'Book a driver on a vehicle and the shift appears here.' : 'No shifts were booked on this day.'}
          action={
            <Button variant="accent" onClick={() => setBooking({})}>
              <CalendarPlus aria-hidden className="h-4 w-4" />
              Book a shift
            </Button>
          }
        />
      );
    }

    return (
      <>
        <p className="mb-4 text-navy-500" aria-live="polite">
          {plural(bookedCount, 'shift')} booked · {peso(chargesOfTheDay)} in charges for this day
        </p>
        {isFutureDay && <p className="mb-4 rounded-lg bg-navy-100 p-3 text-navy">Starting a shift or marking a no-show becomes possible on the day itself. Until then a booking can be cancelled.</p>}
        <div className={`space-y-4 ${schedule.loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={schedule.loading}>
          {SHIFTS.map((shift) => {
            const inShift = assignments.filter((assignment) => assignment.shift === shift.value);
            return (
              <Card key={shift.value} title={`${shift.label} shift`} action={<span className="text-sm text-navy-500">{shift.hours}</span>}>
                {inShift.length === 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-navy-500">No one is booked for this shift.</p>
                    <Button variant="secondary" size="sm" onClick={() => setBooking({ shift: shift.value })}>
                      Book this shift
                    </Button>
                  </div>
                ) : (
                  <ul className="-my-1 divide-y divide-navy-100">
                    {inShift.map((assignment) => (
                      <ShiftRow
                        key={assignment._id}
                        assignment={assignment}
                        isFutureDay={isFutureDay}
                        starting={startingId === assignment._id}
                        onStart={() => start(assignment)}
                        onComplete={() => setCompleting(assignment)}
                        onNoShow={() => setConfirming({ assignment, status: 'no-show' })}
                        onCancel={() => setConfirming({ assignment, status: 'cancelled' })}
                      />
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  function renderBookingForm() {
    if (choices.error) return <ErrorBanner title="Could not load drivers and vehicles" message={choices.error} onRetry={choices.refetch} />;
    if (!choices.data) return <Skeleton className="h-64" />;
    return <AssignmentForm drivers={choices.data.drivers} vehicles={choices.data.vehicles} defaultDate={day < today ? today : day} defaultShift={booking?.shift} onBooked={afterBooked} />;
  }

  const isNoShow = confirming?.status === 'no-show';

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Who drives which unit, shift by shift."
        actions={
          <Button variant="accent" onClick={() => setBooking({})}>
            <CalendarPlus aria-hidden className="h-4 w-4" />
            Book a shift
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" aria-label="Previous day" onClick={() => setDay(addDays(day, -1))}>
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </Button>
        <div className="w-44">
          <Input label="Day" hideLabel type="date" value={day} onChange={(event) => event.target.value && setDay(event.target.value)} />
        </div>
        <Button variant="secondary" size="sm" aria-label="Next day" onClick={() => setDay(addDays(day, 1))}>
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Button>
        {day !== today && (
          <Button variant="ghost" size="sm" onClick={() => setDay(today)}>
            Back to today
          </Button>
        )}
        <h2 className="w-full text-xl font-semibold sm:ml-2 sm:w-auto">{formatLongDay(day)}</h2>
      </div>

      {renderSchedule()}

      <Modal open={booking !== null} title="Book a shift" onClose={() => setBooking(null)}>
        {renderBookingForm()}
      </Modal>

      <Modal open={completing !== null} title="Complete this shift" onClose={() => setCompleting(null)}>
        {completing && <CompleteShiftForm assignment={completing} onDone={afterCompleted} />}
      </Modal>

      <ConfirmDialog
        open={confirming !== null}
        title={isNoShow ? 'Mark this driver as a no-show?' : 'Cancel this booking?'}
        message={
          confirming && (
            <>
              <p>
                <strong>{confirming.assignment.driver.fullName}</strong> on <strong>{confirming.assignment.vehicle.plateNumber}</strong>.
              </p>
              <p className="text-navy-500">
                {isNoShow
                  ? 'A penalty is charged to the driver and the boundary for this shift is waived. This cannot be undone.'
                  : 'No charge is made, and the driver and the unit become free for this shift. This cannot be undone.'}
              </p>
            </>
          )
        }
        confirmLabel={isNoShow ? 'Mark no-show' : 'Cancel booking'}
        busy={confirmBusy}
        onConfirm={confirmChange}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
