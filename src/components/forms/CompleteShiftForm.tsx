import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeStatus } from '../../api/assignments';
import { errorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { completeSchema } from '../../schemas/assignment.schema';
import type { Assignment, CompleteFormValues } from '../../types';
import { km, peso } from '../../utils/format';
import { numberOrBlank, showServerErrors } from '../../utils/form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CompleteShiftFormProps {
  assignment: Assignment;
  onDone: () => void;
}

// Finishing a shift needs one thing: the odometer reading when the unit comes back
export function CompleteShiftForm({ assignment, onDone }: CompleteShiftFormProps) {
  const toast = useToast();
  const start = assignment.startOdometerKm;
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { endOdometerKm: start }, // starts at the opening reading; the dispatcher only has to raise it
  });

  // Derived while rendering: the distance driven, once the reading typed is at least the opening one
  const end = watch('endOdometerKm') as number | undefined;
  const driven = start !== undefined && end !== undefined && end >= start ? end - start : null;

  async function onSubmit(values: CompleteFormValues) {
    try {
      const result = await changeStatus(assignment._id, { status: 'completed', endOdometerKm: values.endOdometerKm });
      toast.success(result.message);
      onDone();
    } catch (err) {
      // "End odometer cannot be lower than the start odometer" arrives as a field message and lands under the input
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-navy-500">
        {assignment.driver.fullName} on {assignment.vehicle.plateNumber}.{start !== undefined && ` The shift started at ${km(start)}.`} Completing it makes the boundary of {peso(assignment.boundaryDue)} due.
      </p>
      <Input
        label="Odometer when the unit came back (km)"
        type="number"
        inputMode="numeric"
        min={start ?? 0}
        error={errors.endOdometerKm?.message}
        hint={driven !== null ? `${km(driven)} driven on this shift` : undefined}
        {...register('endOdometerKm', { setValueAs: numberOrBlank })}
      />
      <Button type="submit" variant="accent" busy={isSubmitting} className="w-full sm:w-auto">
        Complete shift
      </Button>
    </form>
  );
}
