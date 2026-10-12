import { useState } from 'react';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { errorMessage } from '../api/client';
import { deleteVehicle, getMaintenanceDue, listVehicles } from '../api/vehicles';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { PageHeader } from '../components/ui/PageHeader';
import { PlateChip } from '../components/ui/PlateChip';
import { SearchBox } from '../components/ui/SearchBox';
import { Select } from '../components/ui/Select';
import { SkeletonCards } from '../components/ui/Skeleton';
import { ServiceBadge, VehicleStatusBadge } from '../components/ui/StatusBadge';
import { VehicleTypeLabel } from '../components/ui/VehicleTypeLabel';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import type { Vehicle } from '../types';
import { formatDate, km, peso, plural } from '../utils/format';

export default function Vehicles() {
  useDocumentTitle('Vehicles');
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('plateNumber');
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const query = useDebounce(search.trim());
  const vehicles = useFetch(() => listVehicles({ q: query || undefined, type: type || undefined, status: status || undefined, sort }), [query, type, status, sort]);
  // The service badge on each card comes from the maintenance-due list, matched to the vehicle by _id
  const due = useFetch(getMaintenanceDue, []);

  const isFiltered = Boolean(query || type || status);
  const error = vehicles.error ?? due.error;

  function retry() {
    vehicles.refetch();
    due.refetch();
  }

  function clearFilters() {
    setSearch('');
    setType('');
    setStatus('');
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteVehicle(toDelete._id);
      toast.success(`Deleted ${toDelete.plateNumber}`);
      retry();
    } catch (err) {
      // 409 when the unit has assignments or service records: the message says to retire it instead
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  function renderGrid() {
    if (error) return <ErrorBanner title="Could not load vehicles" message={error} onRetry={retry} />;
    if (!vehicles.data || !due.data) return <SkeletonCards count={6} />;

    const list = vehicles.data;
    if (list.length === 0) {
      return isFiltered ? (
        <EmptyState
          icon={Truck}
          title="No vehicles match"
          description="Nothing fits this search and filter. Try a different plate or model, or show the whole fleet."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear search and filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Truck}
          title="No vehicles yet"
          description="Add the tricycles and jeepneys you lease out. Each unit gets a boundary rate and a service plan."
          action={
            <ButtonLink to="/vehicles/new" variant="accent">
              <Plus aria-hidden className="h-4 w-4" />
              Add your first vehicle
            </ButtonLink>
          }
        />
      );
    }

    // Derived while rendering, so the summary and the badges always match the cards below
    const dueById = new Map(due.data.vehicles.map((item) => [item._id, item] as const));
    const availableCount = list.filter((vehicle) => vehicle.status === 'available').length;
    const inShopCount = list.filter((vehicle) => vehicle.status === 'under-maintenance').length;

    return (
      <>
        <p className="mb-3 text-navy-500" aria-live="polite">
          {plural(list.length, 'unit')}
          {isFiltered ? ' found' : ''} · {availableCount} available · {inShopCount} in the shop
        </p>
        <ul className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${vehicles.loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={vehicles.loading}>
          {list.map((vehicle) => (
            <li key={vehicle._id} className="min-w-0">
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <PlateChip plate={vehicle.plateNumber} size="lg" />
                  <VehicleStatusBadge status={vehicle.status} />
                </div>
                <div className="mt-3">
                  <p className="font-medium">
                    <VehicleTypeLabel type={vehicle.type} />
                  </p>
                  <p className="text-navy-500">{vehicle.model || 'No model on record'}</p>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-sm text-navy-500">Boundary per shift</dt>
                    <dd className="font-display text-xl font-bold">{peso(vehicle.boundaryRate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-navy-500">Odometer</dt>
                    <dd className="tabular font-medium">{km(vehicle.odometerKm)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-navy-500">Last service</dt>
                    <dd className="font-medium">{vehicle.lastServiceDate ? formatDate(vehicle.lastServiceDate) : 'No record'}</dd>
                  </div>
                  <div>
                    <dt className="mb-0.5 text-sm text-navy-500">Service plan</dt>
                    <dd>{vehicle.status === 'retired' ? <span className="text-navy-500">Not applicable</span> : <ServiceBadge severity={dueById.get(vehicle._id)?.severity} />}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <ButtonLink to={`/vehicles/${vehicle._id}/edit`} variant="secondary" size="sm">
                    <Pencil aria-hidden className="h-4 w-4" />
                    <span>
                      Edit<span className="sr-only"> {vehicle.plateNumber}</span>
                    </span>
                  </ButtonLink>
                  <Button variant="ghostDanger" size="sm" onClick={() => setToDelete(vehicle)}>
                    <Trash2 aria-hidden className="h-4 w-4" />
                    <span>
                      Delete<span className="sr-only"> {vehicle.plateNumber}</span>
                    </span>
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Your fleet, with the boundary each unit earns and when it is due at the mechanic."
        actions={
          <ButtonLink to="/vehicles/new" variant="accent">
            <Plus aria-hidden className="h-4 w-4" />
            Add vehicle
          </ButtonLink>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_10rem_11rem_13rem]">
        <div className="sm:col-span-3 lg:col-span-1">
          <SearchBox label="Search vehicles" value={search} onChange={setSearch} placeholder="Search by plate or model" />
        </div>
        <Select label="Filter by type" hideLabel value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option>
          <option value="tricycle">Tricycle</option>
          <option value="jeepney">Jeepney</option>
        </Select>
        <Select label="Filter by status" hideLabel value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="under-maintenance">In the shop</option>
          <option value="retired">Retired</option>
        </Select>
        <Select label="Sort vehicles" hideLabel value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="plateNumber">Plate, A to Z</option>
          <option value="-boundaryRate">Highest boundary</option>
          <option value="boundaryRate">Lowest boundary</option>
          <option value="-odometerKm">Most kilometres</option>
          <option value="odometerKm">Fewest kilometres</option>
        </Select>
      </div>

      {renderGrid()}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this vehicle?"
        message={
          <>
            <p>
              <strong>{toDelete?.plateNumber}</strong> will be removed for good.
            </p>
            <p className="text-navy-500">A vehicle with assignments or service records cannot be deleted. Retire it instead.</p>
          </>
        }
        confirmLabel="Delete vehicle"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
