import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Pencil } from 'lucide-react';
import { listAssignments } from '../api/assignments';
import { getBalance, getDriver } from '../api/drivers';
import { listPayments } from '../api/payments';
import { PaymentForm } from '../components/forms/PaymentForm';
import { Badge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { PageHeader } from '../components/ui/PageHeader';
import { PlateChip } from '../components/ui/PlateChip';
import { Skeleton } from '../components/ui/Skeleton';
import { Stat, StatStrip } from '../components/ui/Stat';
import { AssignmentStatusBadge, BalanceBadge, DriverStatusBadge } from '../components/ui/StatusBadge';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import type { Charge } from '../types';
import { chargeOf } from '../utils/assignments';
import { formatDate, formatDateTime, formatDay, manilaDay, peso, plural } from '../utils/format';
import { METHOD_LABELS, shiftLabel } from '../utils/labels';

const LATEST = 8; // history lists show the newest few; the full record stays on the Assignments and Payments pages

// Four requests make one page, so they are made together
async function loadDriverPage(id: string) {
  const [driver, balance, assignments, payments] = await Promise.all([getDriver(id), getBalance(id), listAssignments({ driver: id, sort: '-date' }), listPayments({ driver: id })]);
  return { driver, balance, assignments, payments };
}

function ChargeStatus({ charge }: { charge: Charge }) {
  if (charge.outstanding === 0) return <Badge tone="success">Paid</Badge>;
  if (charge.overdue) return <Badge tone="danger">Overdue</Badge>;
  return <Badge tone="warning">Due {formatDay(charge.dueDate)}</Badge>;
}

export default function DriverDetail() {
  const id = useParams().id ?? '';
  const { data, error, refetch } = useFetch(() => loadDriverPage(id), [id]);
  // After a payment the numbers reload while the old ones stay on screen. Moving to another driver must not show the
  // previous driver's data, so data counts only when it belongs to the driver in the address.
  const page = data?.driver._id === id ? data : null;
  useDocumentTitle(page ? page.driver.fullName : 'Driver');

  function renderBody() {
    if (error) return <ErrorBanner title="Could not load this driver" message={error} onRetry={refetch} />;
    if (!page) {
      return (
        <div role="status" aria-busy="true" className="space-y-6">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      );
    }

    const { driver, balance, assignments, payments } = page;
    const recentAssignments = assignments.slice(0, LATEST);
    const recentPayments = payments.slice(0, LATEST);

    return (
      <div className="space-y-6">
        <StatStrip className="grid-cols-1 sm:grid-cols-3">
          <Stat label="Total charged" value={peso(balance.totalCharged)} note="Boundaries and no-show penalties" />
          <Stat label="Total paid" value={peso(balance.totalPaid)} note={`${plural(payments.length, 'payment')}`} valueClass="text-teal-dark" />
          <Stat
            label="Balance owed"
            value={peso(balance.balance)}
            note={balance.overdueAmount > 0 ? `${peso(balance.overdueAmount)} of it is overdue` : 'Nothing is overdue'}
            valueClass={balance.overdueAmount > 0 ? 'text-danger-dark' : ''}
          />
        </StatStrip>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Profile">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5">
              <dt className="text-navy-500">Status</dt>
              <dd>
                <DriverStatusBadge status={driver.status} />
              </dd>
              <dt className="text-navy-500">License</dt>
              <dd className="font-medium">{driver.licenseNumber}</dd>
              <dt className="text-navy-500">Contact</dt>
              <dd className="font-medium">{driver.contactNumber}</dd>
              <dt className="text-navy-500">Address</dt>
              <dd className="min-w-0 break-words font-medium">{driver.address || 'Not given'}</dd>
              <dt className="text-navy-500">Hired</dt>
              <dd className="font-medium">{formatDate(driver.dateHired)}</dd>
            </dl>
          </Card>

          <Card title="Record a payment">
            <PaymentForm drivers={[{ _id: driver._id, fullName: driver.fullName, balance: balance.balance }]} fixedDriverId={driver._id} onPaid={refetch} />
          </Card>
        </div>

        <section aria-labelledby="charges-heading">
          <h2 id="charges-heading" className="mb-3 text-xl font-semibold">
            Charges and what is left on each
          </h2>
          {balance.charges.length === 0 ? (
            <Card>
              <p className="text-navy-500">No charges yet. A charge appears after this driver completes or misses a shift.</p>
            </Card>
          ) : (
            <Table>
              <THead>
                <Tr>
                  <Th>Charge</Th>
                  <Th align="right">Amount</Th>
                  <Th align="right">Paid</Th>
                  <Th align="right">Outstanding</Th>
                  <Th>Status</Th>
                </Tr>
              </THead>
              <TBody>
                {balance.charges.map((charge) => (
                  <Tr key={charge.assignmentId}>
                    <Td>
                      <div>
                        <p className="font-semibold">{formatDay(charge.date)}</p>
                        <p className="text-sm text-navy-500">
                          {shiftLabel(charge.shift)} shift, {charge.type}
                        </p>
                      </div>
                    </Td>
                    <Td label="Amount" align="right">
                      {peso(charge.amount)}
                    </Td>
                    <Td label="Paid" align="right">
                      {peso(charge.paid)}
                    </Td>
                    <Td label="Outstanding" align="right">
                      <span className="font-semibold">{peso(charge.outstanding)}</span>
                    </Td>
                    <Td label="Status">
                      <ChargeStatus charge={charge} />
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
          <p className="mt-2 text-sm text-navy-500">Payments clear the oldest charge first.</p>
        </section>

        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="mb-3 text-xl font-semibold">
            Assignment history
          </h2>
          {assignments.length === 0 ? (
            <Card>
              <p className="flex items-center gap-2 text-navy-500">
                <ClipboardList aria-hidden className="h-5 w-5" />
                This driver has not been booked yet.
              </p>
            </Card>
          ) : (
            <>
              <Table>
                <THead>
                  <Tr>
                    <Th>Shift</Th>
                    <Th>Vehicle</Th>
                    <Th>Status</Th>
                    <Th align="right">Charged</Th>
                  </Tr>
                </THead>
                <TBody>
                  {recentAssignments.map((assignment) => (
                    <Tr key={assignment._id}>
                      <Td>
                        <div>
                          <p className="font-semibold">{formatDay(manilaDay(assignment.date))}</p>
                          <p className="text-sm text-navy-500">{shiftLabel(assignment.shift)}</p>
                        </div>
                      </Td>
                      <Td label="Vehicle">
                        <PlateChip plate={assignment.vehicle.plateNumber} />
                      </Td>
                      <Td label="Status">
                        <AssignmentStatusBadge status={assignment.status} />
                      </Td>
                      <Td label="Charged" align="right">
                        {peso(chargeOf(assignment))}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
              <p className="mt-2 text-sm text-navy-500">
                Showing the latest {recentAssignments.length} of {assignments.length}.
              </p>
            </>
          )}
        </section>

        <section aria-labelledby="payments-heading">
          <h2 id="payments-heading" className="mb-3 text-xl font-semibold">
            Payments
          </h2>
          {payments.length === 0 ? (
            <Card>
              <p className="text-navy-500">No payments recorded for this driver yet.</p>
            </Card>
          ) : (
            <Table>
              <THead>
                <Tr>
                  <Th>Paid on</Th>
                  <Th>Method</Th>
                  <Th>Reference</Th>
                  <Th align="right">Amount</Th>
                </Tr>
              </THead>
              <TBody>
                {recentPayments.map((payment) => (
                  <Tr key={payment._id}>
                    <Td>
                      <span className="font-semibold">{formatDateTime(payment.paidAt)}</span>
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
          )}
        </section>
      </div>
    );
  }

  return (
    <>
      <Link to="/drivers" className="mb-4 inline-flex items-center gap-1.5 font-medium text-navy-500 hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All drivers
      </Link>
      <PageHeader
        title={page ? page.driver.fullName : 'Driver'}
        description={page ? undefined : 'Profile, balance and history'}
        actions={
          page && (
            <>
              <BalanceBadge balance={page.balance.balance} overdueAmount={page.balance.overdueAmount} />
              <ButtonLink to={`/drivers/${id}/edit`} variant="secondary">
                <Pencil aria-hidden className="h-4 w-4" />
                Edit driver
              </ButtonLink>
            </>
          )
        }
      />
      {renderBody()}
    </>
  );
}
