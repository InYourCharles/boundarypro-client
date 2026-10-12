import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { errorMessage } from '../api/client';
import { createVehicle, getVehicle, updateVehicle } from '../api/vehicles';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { VehicleStatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { vehicleSchema } from '../schemas/vehicle.schema';
import type { Vehicle, VehicleFormValues } from '../types';
import { numberOrBlank, showServerErrors } from '../utils/form';

// The form itself. It only exists once the vehicle (when editing) has loaded, so useForm starts with the right values.
function VehicleFields({ vehicle }: { vehicle: Vehicle | null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const inShop = vehicle?.status === 'under-maintenance';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle
      ? {
          plateNumber: vehicle.plateNumber,
          type: vehicle.type,
          model: vehicle.model ?? '',
          boundaryRate: vehicle.boundaryRate,
          odometerKm: vehicle.odometerKm,
          serviceIntervalKm: vehicle.serviceIntervalKm,
          serviceIntervalDays: vehicle.serviceIntervalDays,
          status: vehicle.status,
        }
      : { plateNumber: '', type: 'tricycle', model: '', serviceIntervalKm: 5000, serviceIntervalDays: 90, status: 'available' }, // the common service plan is pre-filled
  });

  async function onSubmit(values: VehicleFormValues) {
    try {
      if (vehicle) {
        await updateVehicle(vehicle._id, values);
        toast.success(`Saved changes to ${values.plateNumber}`);
      } else {
        await createVehicle(values);
        toast.success(`Added ${values.plateNumber}`);
      }
      navigate('/vehicles');
    } catch (err) {
      // Field messages from the server (a plate that already exists, for example) go under their input
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <Input label="Plate number" placeholder="NEA 4521" hint="3 letters, then 3 or 4 digits" autoComplete="off" error={errors.plateNumber?.message} {...register('plateNumber')} />
        <Select label="Type" error={errors.type?.message} {...register('type')}>
          <option value="tricycle">Tricycle</option>
          <option value="jeepney">Jeepney</option>
        </Select>
        <div className="sm:col-span-2">
          <Input label="Model (optional)" placeholder="Honda TMX 155 + sidecar" autoComplete="off" error={errors.model?.message} {...register('model')} />
        </div>
        <Input
          label="Boundary rate (pesos per shift)"
          type="number"
          inputMode="numeric"
          min={100}
          max={2000}
          hint="Between 100 and 2000"
          error={errors.boundaryRate?.message}
          {...register('boundaryRate', { setValueAs: numberOrBlank })}
        />
        <Input label="Odometer (km)" type="number" inputMode="numeric" min={0} hint="The reading on the dashboard today" error={errors.odometerKm?.message} {...register('odometerKm', { setValueAs: numberOrBlank })} />
        <Input
          label="Service every (km)"
          type="number"
          inputMode="numeric"
          min={500}
          max={20000}
          hint="A service is due after this many kilometres"
          error={errors.serviceIntervalKm?.message}
          {...register('serviceIntervalKm', { setValueAs: numberOrBlank })}
        />
        <Input
          label="Service every (days)"
          type="number"
          inputMode="numeric"
          min={7}
          max={365}
          hint="…or after this many days, whichever comes first"
          error={errors.serviceIntervalDays?.message}
          {...register('serviceIntervalDays', { setValueAs: numberOrBlank })}
        />

        {inShop ? (
          // A unit in the shop leaves it by completing the service (Maintenance page), never from this form (BR8)
          <div>
            <p className="mb-1.5 text-sm font-semibold">Status</p>
            <VehicleStatusBadge status="under-maintenance" />
            <p className="mt-1.5 text-sm text-navy-500">Complete the service on the Maintenance page to put this unit back on the road.</p>
            <input type="hidden" {...register('status')} />
          </div>
        ) : (
          <Select label="Status" hint="Retire a unit that is no longer leased out" error={errors.status?.message} {...register('status')}>
            <option value="available">Available</option>
            <option value="retired">Retired</option>
          </Select>
        )}

        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <ButtonLink to="/vehicles" variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" variant="accent" busy={isSubmitting}>
            {vehicle ? 'Save changes' : 'Add vehicle'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// /vehicles/new creates, /vehicles/:id/edit edits. Both routes use this page.
export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit vehicle' : 'Add vehicle');

  const { data: vehicle, loading, error, refetch } = useFetch(async () => (id ? await getVehicle(id) : null), [id]);

  function renderBody() {
    if (error) return <ErrorBanner title="Could not load this vehicle" message={error} onRetry={refetch} />;
    if (isEdit && loading) {
      return (
        <div role="status" aria-busy="true" className="space-y-4 rounded-xl bg-white p-5 shadow-card">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      );
    }
    return <VehicleFields key={vehicle?._id ?? 'new'} vehicle={vehicle} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/vehicles" className="mb-4 inline-flex items-center gap-1.5 font-medium text-navy-500 hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All vehicles
      </Link>
      <PageHeader title={isEdit ? 'Edit vehicle' : 'Add vehicle'} description={isEdit ? 'Change the details below and save.' : 'Every field except the model is required.'} />
      {renderBody()}
    </div>
  );
}
