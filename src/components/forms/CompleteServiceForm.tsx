import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { errorMessage } from '../../api/client';
import { completeMaintenance } from '../../api/maintenance';
import { useToast } from '../../hooks/useToast';
import { completeServiceSchema } from '../../schemas/maintenance.schema';
import type { CompleteServiceFormValues, MaintenanceRecord } from '../../types';
import { manilaDay } from '../../utils/format';
import { numberOrBlank, showServerErrors } from '../../utils/form';
import { SERVICE_LABELS } from '../../utils/labels';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CompleteServiceFormProps {
  record: MaintenanceRecord;
  onDone: () => void;
}

// Finishing a service that is in the shop: the final bill, the reading, and when the next service is due.
// Saving it puts the unit back on the road and makes this its last service (BR8).
export function CompleteServiceForm({ record, onDone }: CompleteServiceFormProps) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompleteServiceFormValues>({
    resolver: zodResolver(completeServiceSchema),
    defaultValues: {
      description: record.description ?? '',
      cost: record.cost,
      odometerKm: record.odometerKm,
      nextDueDate: record.nextDueDate ? manilaDay(record.nextDueDate) : '',
      nextDueOdometerKm: record.nextDueOdometerKm,
    },
  });

  async function onSubmit(values: CompleteServiceFormValues) {
    try {
      await completeMaintenance(record._id, values);
      toast.success(`${record.vehicle.plateNumber} is back on the road`);
      onDone();
    } catch (err) {
      // For example "Next due date must be after the service date" arrives as a field message
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-navy-500">
        {record.vehicle.plateNumber} is in the shop for {SERVICE_LABELS[record.type].toLowerCase()}. Check the final bill and reading, then complete the service.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Final cost (pesos)" type="number" inputMode="numeric" min={0} error={errors.cost?.message} {...register('cost', { setValueAs: numberOrBlank })} />
        <Input label="Odometer (km)" type="number" inputMode="numeric" min={0} error={errors.odometerKm?.message} {...register('odometerKm', { setValueAs: numberOrBlank })} />
      </div>
      <Input label="What was done (optional)" autoComplete="off" error={errors.description?.message} {...register('description')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Next service on (optional)" type="date" error={errors.nextDueDate?.message} {...register('nextDueDate')} />
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
        Complete service
      </Button>
    </form>
  );
}
