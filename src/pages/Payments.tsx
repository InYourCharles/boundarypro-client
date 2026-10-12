import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { listDrivers } from '../api/drivers';
import { listPayments } from '../api/payments';
import { PaymentForm } from '../components/forms/PaymentForm';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';
import { Skeleton, SkeletonRows } from '../components/ui/Skeleton';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { formatDateTime, peso, plural } from '../utils/format';
import { METHOD_LABELS } from '../utils/labels';

export default function Payments() {
  useDocumentTitle('Payments');

  const [driver, setDriver] = useState('');
  const [method, setMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('-paidAt');
  const [recording, setRecording] = useState(false);

  // A start date after the end date can match nothing (the server refuses it too), so no request is sent and the To box says why
  const badRange = from !== '' && to !== '' && from > to;
  const payments = useFetch(
    () => (badRange ? Promise.resolve([]) : listPayments({ driver: driver || undefined, method: method || undefined, from: from || undefined, to: to || undefined, sort })),
    [driver, method, from, to, sort],
  );
  const drivers = useFetch(() => listDrivers({}), []); // fills the filter and, with their balances, the payment form

  const isFiltered = Boolean(driver || method || from || to);
  const error = payments.error ?? drivers.error;

  function retry() {
    payments.refetch();
    drivers.refetch();
  }

  function clearFilters() {
    setDriver('');
    setMethod('');
    setFrom('');
    setTo('');
  }

  function afterPaid() {
    setRecording(false);
    retry(); // the ledger has a new row and the balances changed
  }

  function renderPaymentForm() {
    if (!drivers.data) return <Skeleton className="h-64" />;
    // Only drivers who owe something can be paid for: the server refuses a payment above the balance (BR6)
    const payable = drivers.data.filter((item) => item.balance > 0);
    if (payable.length === 0) return <p className="text-navy-500">No driver owes anything right now, so there is nothing to record.</p>;
    return <PaymentForm drivers={payable} onPaid={afterPaid} />;
  }

  function renderLedger() {
    if (error) return <ErrorBanner title="Could not load payments" message={error} onRetry={retry} />;
    if (!payments.data) return <SkeletonRows rows={6} />;

    const list = payments.data;
    if (list.length === 0) {
      return isFiltered ? (
        <EmptyState
          icon={Wallet}
          title="No payments match"
          description="Nothing was paid for this driver, method and period. Widen the filters to see more."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Wallet}
          title="No payments yet"
          description="Every boundary a driver pays is recorded here. Payments are never edited or deleted, so this list is a trustworthy ledger."
          action={
            <Button variant="accent" onClick={() => setRecording(true)}>
              Record the first payment
            </Button>
          }
        />
      );
    }

    // Derived while rendering: the total always matches the rows in view
    const total = list.reduce((sum, payment) => sum + payment.amountPaid, 0);

    return (
      <>
        <p className="mb-3 text-navy-500" aria-live="polite">
          {plural(list.length, 'payment')} · <span className="font-semibold text-teal-dark">{peso(total)}</span> in total
        </p>
        <div className={payments.loading ? 'opacity-60 transition-opacity' : ''} aria-busy={payments.loading}>
          <Table>
            <THead>
              <Tr>
                <Th>Paid on</Th>
                <Th>Driver</Th>
                <Th>Method</Th>
                <Th>Reference</Th>
                <Th align="right">Amount</Th>
              </Tr>
            </THead>
            <TBody>
              {list.map((payment) => (
                <Tr key={payment._id}>
                  <Td>
                    <span className="font-semibold">{formatDateTime(payment.paidAt)}</span>
                  </Td>
                  <Td label="Driver">
                    <Link to={`/drivers/${payment.driver._id}`} className="underline-offset-2 hover:underline">
                      {payment.driver.fullName}
                    </Link>
                  </Td>
                  <Td label="Method">{METHOD_LABELS[payment.method]}</Td>
                  <Td label="Reference">{payment.referenceNo || 'None'}</Td>
                  <Td label="Amount" align="right">
                    <span className="font-semibold text-teal-dark">{peso(payment.amountPaid)}</span>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every boundary paid, newest first."
        actions={
          <Button variant="accent" onClick={() => setRecording(true)}>
            <Wallet aria-hidden className="h-4 w-4" />
            Record payment
          </Button>
        }
      />

      <div className="mb-4 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select label="Filter by driver" hideLabel value={driver} onChange={(event) => setDriver(event.target.value)}>
          <option value="">All drivers</option>
          {drivers.data?.map((item) => (
            <option key={item._id} value={item._id}>
              {item.fullName}
            </option>
          ))}
        </Select>
        <Select label="Filter by method" hideLabel value={method} onChange={(event) => setMethod(event.target.value)}>
          <option value="">All methods</option>
          {Object.entries(METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input label="From" type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} />
        <Input label="To" type="date" value={to} min={from || undefined} error={badRange ? 'The end date must not be before the start date' : undefined} onChange={(event) => setTo(event.target.value)} />
        <Select label="Sort payments" hideLabel value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="-paidAt">Newest first</option>
          <option value="paidAt">Oldest first</option>
          <option value="-amountPaid">Largest first</option>
          <option value="amountPaid">Smallest first</option>
        </Select>
      </div>

      {renderLedger()}

      <Modal open={recording} title="Record a payment" onClose={() => setRecording(false)}>
        {renderPaymentForm()}
      </Modal>
    </>
  );
}
