import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import { checkAvailability, createAssignment } from '../../api/assignments';
import { errorMessage } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { assignmentSchema } from '../../schemas/assignment.schema';
import type { Availability, AssignmentFormValues, Driver, Shift, Vehicle } from '../../types';
import { formatDay, peso, todayManila } from '../../utils/format';
import { showServerErrors } from '../../utils/form';
import { SHIFTS, shiftLabel } from '../../utils/labels';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Spinner } from '../ui/Spinner';

interface AssignmentFormProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  defaultDate: string;
  defaultShift?: Shift;
  onBooked: (date: string) => void; // gives the booked day back, so the page can show it
}

// Drivers and vehicles that cannot be booked stay in the lists with the reason in brackets. Choosing one makes the
// server explain the rule (BR7) in the message below, instead of the option silently being missing.
function driverLabel(driver: Driver) {
  return driver.status === 'active' ? driver.fullName : `${driver.fullName} (${driver.status})`;
}

function vehicleLabel(vehicle: Vehicle) {
  const note = vehicle.status === 'available' ? '' : vehicle.status === 'under-maintenance' ? ' (in the shop)' : ' (retired)';
  return `${vehicle.plateNumber} · ${vehicle.type} · ${peso(vehicle.boundaryRate)}${note}`;
}

interface AvailabilityMessageProps {
  ready: boolean; // are all four choices made?
  checking: boolean;
  error: string | null;
  verdict: Availability | null;
}

// The live answer under the form. It is always on the page (aria-live), so a screen reader announces each change.
function AvailabilityMessage({ ready, checking, error, verdict }: AvailabilityMessageProps) {
  function content() {
    if (!ready) return <p className="text-navy-500">Choose a driver, a vehicle, a day and a shift to see whether the booking is possible.</p>;
    if (checking) {
      return (
        <p className="flex items-center gap-2 text-navy-500">
          <Spinner />
          Checking availability…
        </p>
      );
    }
    if (error) return <p className="font-medium text-danger-dark">Could not check availability: {error}</p>;
    if (!verdict) return null;

    return (
      <div className={`rounded-lg p-3 ${verdict.available ? 'bg-teal-light text-teal-dark' : 'bg-danger-light text-danger-dark'}`}>
        <p className="flex items-center gap-2 font-semibold">
          {verdict.available ? <CircleCheck aria-hidden className="h-5 w-5 shrink-0" /> : <CircleX aria-hidden className="h-5 w-5 shrink-0" />}
          {verdict.available ? 'Available. This shift can be booked.' : 'This shift cannot be booked'}
        </p>
        {verdict.reasons.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-9">
            {verdict.reasons.map((reason) => (
              <li key={reason.code}>{reason.message}</li>
            ))}
          </ul>
        )}
        {verdict.warnings.length > 0 && (
          <ul className="mt-2 space-y-1">
            {verdict.warnings.map((warning) => (
              <li key={warning.code} className="flex items-start gap-2 text-amber-dark">
                <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {warning.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div aria-live="polite" className="min-h-14">
      {content()}
    </div>
  );
}

export function AssignmentForm({ drivers, vehicles, defaultDate, defaultShift = 'morning', onBooked }: AssignmentFormProps) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { driverId: '', vehicleId: '', date: defaultDate, shift: defaultShift, notes: '' },
  });

  // The four choices that decide availability. Whenever one changes, the check runs again.
  const [driverId, vehicleId, date, shift] = watch(['driverId', 'vehicleId', 'date', 'shift']);
  const ready = Boolean(driverId && vehicleId && date && shift) && date >= todayManila(); // a past day is explained by the schema
  const check = useFetch(async () => (ready ? await checkAvailability({ driverId, vehicleId, date, shift }) : null), [ready, driverId, vehicleId, date, shift]);

  // Derived while rendering: the verdict counts only while it matches the current choices
  const verdict = ready && !check.loading ? check.data : null;
  const blocked = verdict !== null && !verdict.available;

  async function onSubmit(values: AssignmentFormValues) {
    try {
      await createAssignment(values);
      const driver = drivers.find((item) => item._id === values.driverId);
      const vehicle = vehicles.find((item) => item._id === values.vehicleId);
      toast.success(`Booked ${driver?.fullName ?? 'the driver'} on ${vehicle?.plateNumber ?? 'the vehicle'}, ${shiftLabel(values.shift)} shift, ${formatDay(values.date)}`);
      onBooked(values.date);
    } catch (err) {
      // The server runs the same rules as the live check. If the situation changed meanwhile it says so here.
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Select label="Driver" error={errors.driverId?.message} {...register('driverId')}>
        <option value="">Choose a driver</option>
        {drivers.map((driver) => (
          <option key={driver._id} value={driver._id}>
            {driverLabel(driver)}
          </option>
        ))}
      </Select>
      <Select label="Vehicle" error={errors.vehicleId?.message} {...register('vehicleId')}>
        <option value="">Choose a vehicle</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle._id} value={vehicle._id}>
            {vehicleLabel(vehicle)}
          </option>
        ))}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Day" type="date" min={todayManila()} error={errors.date?.message} {...register('date')} />
        <Select label="Shift" error={errors.shift?.message} {...register('shift')}>
          {SHIFTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} ({item.hours})
            </option>
          ))}
        </Select>
      </div>
      <Input label="Notes (optional)" autoComplete="off" error={errors.notes?.message} {...register('notes')} />

      <AvailabilityMessage ready={ready} checking={ready && check.loading} error={check.error} verdict={verdict} />

      <Button type="submit" variant="accent" busy={isSubmitting} disabled={blocked} className="w-full sm:w-auto">
        Book shift
      </Button>
    </form>
  );
}
