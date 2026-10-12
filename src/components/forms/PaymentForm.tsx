import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { errorMessage } from '../../api/client';
import { createPayment } from '../../api/payments';
import { useToast } from '../../hooks/useToast';
import { paymentSchema } from '../../schemas/payment.schema';
import type { PaymentFormValues } from '../../types';
import { peso } from '../../utils/format';
import { numberOrBlank, showServerErrors } from '../../utils/form';
import { METHOD_LABELS } from '../../utils/labels';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

// A driver who can be paid for: the form needs the name and what the driver still owes
export interface PayableDriver {
  _id: string;
  fullName: string;
  balance: number;
}

interface PaymentFormProps {
  drivers: PayableDriver[];
  fixedDriverId?: string; // when set (driver page), the payment is for this driver and there is nothing to pick
  onPaid: () => void; // called after the server accepted the payment, so the page can reload its numbers
}

const emptyForm = { method: 'cash', referenceNo: '', remarks: '' } as const;

export function PaymentForm({ drivers, fixedDriverId, onPaid }: PaymentFormProps) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { driver: fixedDriverId ?? '', ...emptyForm },
  });

  // Derived while rendering, not stored: who is chosen, what they owe, and what is left after the amount typed
  const driver = drivers.find((item) => item._id === watch('driver'));
  const balance = driver?.balance ?? 0;
  const typed = (watch('amountPaid') as number | undefined) ?? 0;
  const limitMessage = driver && typed > balance ? `${driver.fullName} owes ${peso(balance)}. The amount cannot be higher.` : undefined;
  const overLimit = limitMessage !== undefined;

  async function onSubmit(values: PaymentFormValues) {
    if (overLimit) return; // the message under the amount box already says why
    try {
      await createPayment(values);
      toast.success(`Recorded ${peso(values.amountPaid)} from ${driver?.fullName ?? 'the driver'}`);
      reset(); // back to the starting values: the amount and reference are emptied for the next payment
      onPaid();
    } catch (err) {
      // The server checks the same limit (BR6), so a 400 about the amount lands under the amount box too
      if (!showServerErrors(err, setError)) toast.error(errorMessage(err));
    }
  }

  if (fixedDriverId && driver && balance === 0) {
    return <p className="text-navy-500">{driver.fullName} has nothing to pay. New charges appear after the next completed or missed shift.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {fixedDriverId ? (
        <input type="hidden" {...register('driver')} />
      ) : (
        <Select label="Driver" error={errors.driver?.message} {...register('driver')}>
          <option value="">Choose a driver</option>
          {drivers.map((item) => (
            <option key={item._id} value={item._id}>
              {item.fullName} (owes {peso(item.balance)})
            </option>
          ))}
        </Select>
      )}

      {driver && (
        <dl className="rounded-lg bg-navy-50 p-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Balance owed</dt>
            <dd className="tabular font-semibold">{peso(balance)}</dd>
          </div>
          {typed > 0 && !overLimit && (
            <div className="mt-1 flex justify-between gap-4">
              <dt>Left after this payment</dt>
              <dd className="tabular font-semibold">{peso(balance - typed)}</dd>
            </div>
          )}
        </dl>
      )}

      <div>
        <Input
          label="Amount (pesos)"
          type="number"
          inputMode="numeric"
          min={1}
          max={driver ? balance : undefined}
          step={1}
          error={errors.amountPaid?.message ?? limitMessage}
          hint={driver ? undefined : 'Choose a driver to see how much is owed'}
          {...register('amountPaid', { setValueAs: numberOrBlank })}
        />
        {driver && balance > 0 && (
          <Button variant="ghost" size="sm" className="mt-1" onClick={() => setValue('amountPaid', balance, { shouldValidate: true })}>
            Pay the full {peso(balance)}
          </Button>
        )}
      </div>

      <Select label="Method" error={errors.method?.message} {...register('method')}>
        {Object.entries(METHOD_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input label="Reference number (optional)" hint="The GCash or bank reference, if there is one" autoComplete="off" error={errors.referenceNo?.message} {...register('referenceNo')} />
      <Input label="Remarks (optional)" autoComplete="off" error={errors.remarks?.message} {...register('remarks')} />

      <Button type="submit" variant="accent" busy={isSubmitting} className="w-full sm:w-auto">
        Record payment
      </Button>
    </form>
  );
}
