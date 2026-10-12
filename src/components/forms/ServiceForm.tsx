import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { errorMessage } from '../../api/client';
import { createMaintenance } from '../../api/maintenance';
import { useToast } from '../../hooks/useToast';
import { maintenanceSchema } from '../../schemas/maintenance.schema';
import type { MaintenanceFormValues, Vehicle } from '../../types';
import { todayManila } from '../../utils/format';
import { numberOrBlank, showServerErrors } from '../../utils/form';
import { SERVICE_LABELS } from '../../utils/labels';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ServiceFormProps {
  vehicles: Vehicle[];
  defaultVehicleId?: string; // set when the form is opened from a vehicle that is due
  onLogged: () => void;
}

function vehicleLabel(vehicle: Vehicle) {
  const note = vehicle.status === 'available' ? '' : vehicle.status === 'under-maintenance' ? ' (already in the shop)' : ' (retired)';
  return `${vehicle.plateNumber} · ${vehicle.model || vehicle.type}${note}`;
}

// Logs a service: either a unit going to the shop now, or a service that already happened
export function ServiceForm({ vehicles, defaultVehicleId, onLogged }: ServiceFormProps) {
  const toast = useToast();
  const startingVehicle = vehicles.find((item) => item._id === defaultVehicleId);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicle: defaultVehicleId ?? '',
      status: 'in-progress',
      serviceDate: todayManila(),
      type: 'oil-change',
      description: '',
      odometerKm: startingVehicle?.odometerKm,
      nextDueDate: '',
    },
  });

  async function onSubmit(values: MaintenanceFormValues) {
    try {
      const record = await createMaintenance(values);
      const plate = record.vehicle.plateNumber;
      toast.success(values.status === 'in-progress' ? `${plate} is now in the shop for ${SERVICE_LABELS[values.type].toLowerCase()}` : `Logged ${SERVICE_LABELS[values.type].toLowerCase()} for ${plate}`);
      onLogged();
    } catch (err) {
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Select
        label="Vehicle"
        error={errors.vehicle?.message}
        // Choosing a vehicle fills in its current odometer reading, which is almost always the reading of the service
        {...register('vehicle', {
          onChange: (event) => {
            const chosen = vehicles.find((item) => item._id === event.target.value);
            if (chosen) setValue('odometerKm', chosen.odometerKm, { shouldValidate: false });
          },
        })}
      >
        <option value="">Choose a vehicle</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle._id} value={vehicle._id}>
            {vehicleLabel(vehicle)}
          </option>
        ))}
      </Select>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">What is happening?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-lg border border-navy-500/75 bg-white p-3 has-[:checked]:border-navy has-[:checked]:bg-navy-50 has-[:checked]:ring-2 has-[:checked]:ring-navy">
            <input type="radio" value="in-progress" className="mt-1 h-4 w-4 accent-navy" {...register('status')} />
            <span>
              <span className="block font-semibold">Send to the shop</span>
              <span className="block text-sm text-navy-500">The unit leaves the road until you complete the service.</span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-lg border border-navy-500/75 bg-white p-3 has-[:checked]:border-navy has-[:checked]:bg-navy-50 has-[:checked]:ring-2 has-[:checked]:ring-navy">
            <input type="radio" value="completed" className="mt-1 h-4 w-4 accent-navy" {...register('status')} />
            <span>
              <span className="block font-semibold">Record a finished service</span>
              <span className="block text-sm text-navy-500">It already happened. It becomes the unit's last service.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Kind of service" error={errors.type?.message} {...register('type')}>
          {Object.entries(SERVICE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input label="Service date" type="date" max={todayManila()} error={errors.serviceDate?.message} {...register('serviceDate')} />
        <Input label="Cost (pesos)" type="number" inputMode="numeric" min={0} hint="An estimate is fine while the unit is in the shop" error={errors.cost?.message} {...register('cost', { setValueAs: numberOrBlank })} />
        <Input label="Odometer (km)" type="number" inputMode="numeric" min={0} error={errors.odometerKm?.message} {...register('odometerKm', { setValueAs: numberOrBlank })} />
      </div>
      <Input label="What was done (optional)" autoComplete="off" error={errors.description?.message} {...register('description')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Next service on (optional)" type="date" min={todayManila()} error={errors.nextDueDate?.message} {...register('nextDueDate')} />
        <Input
          label="Next service at (km, optional)"
          type="number"
          inputMode="numeric"
          min={0}
          error={errors.nextDueOdometerKm?.message}
          {...register('nextDueOdometerKm', { setValueAs: numberOrBlank })}
        />
      </div>

      <Button type="submit" variant="accent" busy={isSubmitting} className="w-full sm:w-auto">
        Log service
      </Button>
    </form>
  );
}
