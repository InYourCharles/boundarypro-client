import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { errorMessage } from '../api/client';
import { deleteDriver, listDrivers } from '../api/drivers';
import { Button, ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBox } from '../components/ui/SearchBox';
import { Select } from '../components/ui/Select';
import { SkeletonRows } from '../components/ui/Skeleton';
import { BalanceBadge, DriverStatusBadge } from '../components/ui/StatusBadge';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import type { DriverWithBalance } from '../types';
import { formatDate, peso, plural } from '../utils/format';

export default function Drivers() {
  useDocumentTitle('Drivers');
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('fullName');
  const [toDelete, setToDelete] = useState<DriverWithBalance | null>(null); // the driver the dialog is asking about
  const [deleting, setDeleting] = useState(false);

  // The server is asked 300 ms after the last keystroke, so typing "juan" sends one request instead of four
  const query = useDebounce(search.trim());
  const { data: drivers, loading, error, refetch } = useFetch(() => listDrivers({ q: query || undefined, status: status || undefined, sort }), [query, status, sort]);

  const isFiltered = Boolean(query || status);

  function clearFilters() {
    setSearch('');
    setStatus('');
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteDriver(toDelete._id);
      toast.success(`Deleted ${toDelete.fullName}`);
      refetch();
    } catch (err) {
      // The server refuses with 409 when the driver has assignments or payments, and says what to do instead
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  function renderList() {
    if (error) return <ErrorBanner title="Could not load drivers" message={error} onRetry={refetch} />;
    if (!drivers) return <SkeletonRows rows={6} />; // first load only; later loads keep the old list on screen

    if (drivers.length === 0) {
      return isFiltered ? (
        <EmptyState
          icon={Users}
          title="No drivers match"
          description="Nothing fits this search and filter. Try a different name or license number, or show every driver."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear search and filter
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No drivers yet"
          description="Add the drivers who lease your units. Each one gets a license record, a status and a running balance."
          action={
            <ButtonLink to="/drivers/new" variant="accent">
              <Plus aria-hidden className="h-4 w-4" />
              Add your first driver
            </ButtonLink>
          }
        />
      );
    }

    // Derived while rendering, so it always matches the rows below
    const overdueTotal = drivers.reduce((sum, driver) => sum + driver.overdueAmount, 0);

    return (
      <>
        <p className="mb-3 text-navy-500" aria-live="polite">
          {plural(drivers.length, 'driver')}
          {isFiltered ? ' found' : ''} · {peso(overdueTotal)} overdue in total
        </p>
        <div className={loading ? 'opacity-60 transition-opacity' : ''} aria-busy={loading}>
          <Table>
            <THead>
              <Tr>
                <Th>Driver</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th>Balance</Th>
                <Th>Hired</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </Tr>
            </THead>
            <TBody>
              {drivers.map((driver) => (
                <Tr key={driver._id}>
                  <Td>
                    <div className="min-w-0">
                      <Link to={`/drivers/${driver._id}`} className="font-semibold underline-offset-2 hover:underline">
                        {driver.fullName}
                      </Link>
                      <p className="text-sm text-navy-500">{driver.licenseNumber}</p>
                    </div>
                  </Td>
                  <Td label="Contact">{driver.contactNumber}</Td>
                  <Td label="Status">
                    <DriverStatusBadge status={driver.status} />
                  </Td>
                  <Td label="Balance">
                    <BalanceBadge balance={driver.balance} overdueAmount={driver.overdueAmount} />
                  </Td>
                  <Td label="Hired">{formatDate(driver.dateHired)}</Td>
                  <Td actions>
                    <ButtonLink to={`/drivers/${driver._id}/edit`} variant="secondary" size="sm" className="shrink-0">
                      <Pencil aria-hidden className="h-4 w-4" />
                      <span>
                        Edit<span className="sr-only"> {driver.fullName}</span>
                      </span>
                    </ButtonLink>
                    <Button variant="ghostDanger" size="sm" onClick={() => setToDelete(driver)} className="shrink-0">
                      <Trash2 aria-hidden className="h-4 w-4" />
                      <span>
                        Delete<span className="sr-only"> {driver.fullName}</span>
                      </span>
                    </Button>
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
        title="Drivers"
        description="Who drives your units, and what each one owes."
        actions={
          <ButtonLink to="/drivers/new" variant="accent">
            <Plus aria-hidden className="h-4 w-4" />
            Add driver
          </ButtonLink>
        }
      />

      {/* The filter bar is outside renderList(), so the search box keeps focus while the list reloads */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_14rem]">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchBox label="Search drivers" value={search} onChange={setSearch} placeholder="Search by name or license number" />
        </div>
        <Select label="Filter by status" hideLabel value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select label="Sort drivers" hideLabel value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="fullName">Name, A to Z</option>
          <option value="-fullName">Name, Z to A</option>
          <option value="-dateHired">Newest hires first</option>
          <option value="dateHired">Longest serving first</option>
          <option value="status">Status</option>
        </Select>
      </div>

      {renderList()}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this driver?"
        message={
          <>
            <p>
              <strong>{toDelete?.fullName}</strong> will be removed for good.
            </p>
            <p className="text-navy-500">A driver with assignments or payments cannot be deleted. Set that driver to inactive instead.</p>
          </>
        }
        confirmLabel="Delete driver"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
