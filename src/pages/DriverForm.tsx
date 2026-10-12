import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { errorMessage } from '../api/client';
import { createDriver, getDriver, updateDriver } from '../api/drivers';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { Textarea } from '../components/ui/Textarea';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { driverSchema } from '../schemas/driver.schema';
import type { Driver, DriverFormValues } from '../types';
import { manilaDay, todayManila } from '../utils/format';
import { showServerErrors } from '../utils/form';

// The form itself. It only exists once the driver (when editing) has loaded, so useForm starts with the right values.
function DriverFields({ driver }: { driver: Driver | null }) {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: driver
      ? {
          fullName: driver.fullName,
          licenseNumber: driver.licenseNumber,
          contactNumber: driver.contactNumber,
          address: driver.address ?? '',
          status: driver.status,
          dateHired: manilaDay(driver.dateHired),
        }
      : { fullName: '', licenseNumber: '', contactNumber: '', address: '', status: 'active', dateHired: todayManila() },
  });

  // Runs only when every Zod rule passed. handleSubmit keeps isSubmitting true until this promise ends.
  async function onSubmit(values: DriverFormValues) {
    try {
      if (driver) {
        await updateDriver(driver._id, values);
        toast.success(`Saved changes to ${values.fullName}`);
      } else {
        await createDriver(values);
        toast.success(`Added ${values.fullName}`);
      }
      navigate('/drivers');
    } catch (err) {
      // A 400 or 409 with field messages (for example a license that is already used) goes under its input.
      // Anything else (server down, 500) becomes a message at the bottom of the screen.
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Full name" autoComplete="off" error={errors.fullName?.message} {...register('fullName')} />
        </div>
        <Input label="License number" placeholder="N01-21-482913" hint="Letter, 2 digits, 2 digits, 6 digits" autoComplete="off" error={errors.licenseNumber?.message} {...register('licenseNumber')} />
        <Input label="Contact number" type="tel" inputMode="numeric" placeholder="09171234567" hint="11 digits, starting with 09" error={errors.contactNumber?.message} {...register('contactNumber')} />
        <Select label="Status" error={errors.status?.message} {...register('status')}>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Input label="Date hired" type="date" max={todayManila()} error={errors.dateHired?.message} {...register('dateHired')} />
        <div className="sm:col-span-2">
          <Textarea label="Address (optional)" error={errors.address?.message} {...register('address')} />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <ButtonLink to="/drivers" variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" variant="accent" busy={isSubmitting}>
            {driver ? 'Save changes' : 'Add driver'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// /drivers/new creates, /drivers/:id/edit edits. Both routes use this page.
export default function DriverForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit driver' : 'Add driver');

  // Creating needs nothing from the server, so the "fetch" answers null at once
  const { data: driver, loading, error, refetch } = useFetch(async () => (id ? await getDriver(id) : null), [id]);

  function renderBody() {
    if (error) return <ErrorBanner title="Could not load this driver" message={error} onRetry={refetch} />;
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
    // key makes React build a fresh form when you move between two drivers
    return <DriverFields key={driver?._id ?? 'new'} driver={driver} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/drivers" className="mb-4 inline-flex items-center gap-1.5 font-medium text-navy-500 hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All drivers
      </Link>
      <PageHeader title={isEdit ? 'Edit driver' : 'Add driver'} description={isEdit ? 'Change the details below and save.' : 'Every field except the address is required.'} />
      {renderBody()}
    </div>
  );
}
