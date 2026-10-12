import { CalendarCheck, Coins, Wrench } from 'lucide-react';
import { getCollectionStats } from '../api/stats';
import { listVehicles } from '../api/vehicles';
import { Brand } from '../components/layout/Brand';
import { ButtonLink } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Skeleton } from '../components/ui/Skeleton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { formatDay, peso, todayManila } from '../utils/format';

const features = [
  {
    icon: CalendarCheck,
    title: 'Shifts that never collide',
    text: 'Booking a unit checks the driver, the vehicle and the shift together, and tells you why when the answer is no.',
  },
  {
    icon: Coins,
    title: 'Balances that add up',
    text: 'Every boundary and no-show penalty is a charge. Payments clear the oldest charge first, so overdue amounts are never a guess.',
  },
  {
    icon: Wrench,
    title: 'Service before the breakdown',
    text: 'Units are flagged by kilometres and by days since their last service, while they are still earning.',
  },
];

// The two numbers come from two endpoints, so they are requested together and shown together
async function loadCounts() {
  const today = todayManila();
  const [vehicles, stats] = await Promise.all([listVehicles({}), getCollectionStats({ from: today, to: today })]);
  return { vehicles, stats };
}

export default function Landing() {
  useDocumentTitle('Fleet and boundary management');
  const { data, loading, error, refetch } = useFetch(loadCounts, []);

  // Worked out while rendering from the response, never stored
  const fleet = data?.vehicles.filter((vehicle) => vehicle.status !== 'retired') ?? [];
  const available = fleet.filter((vehicle) => vehicle.status === 'available');
  const boardRows = [
    { label: 'Units in the fleet', value: String(fleet.length) },
    { label: 'Available to book', value: String(available.length) },
    { label: 'Collected today', value: peso(data?.stats.collected ?? 0) },
    { label: 'Overdue in total', value: peso(data?.stats.overdueTotal ?? 0) },
  ];

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <Brand className="text-navy" />
        <ButtonLink to="/dashboard" size="sm">
          Open dashboard
        </ButtonLink>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14 lg:px-10 lg:pt-14">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">Know who owes, who is booked, and which unit needs a mechanic before the day starts.</h1>
            <p className="mt-6 max-w-xl text-lg text-navy-500">
              BoundaryPro replaces the notebook for tricycle and jeepney operators. Drivers pay a boundary per shift; the system keeps their balances, blocks double bookings and watches the service calendar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/dashboard" variant="accent">
                Open the dashboard
              </ButtonLink>
              <ButtonLink to="/assignments" variant="secondary">
                Book a shift
              </ButtonLink>
            </div>
          </div>

          {/* The one bold element of the page: today's numbers on a departure board */}
          <div className="rounded-2xl bg-navy p-5 text-white shadow-modal sm:p-6">
            <div className="flex items-baseline justify-between gap-3 border-b border-white/15 pb-3">
              <h2 className="font-display text-lg font-semibold text-white">Today's board</h2>
              <p className="text-sm text-navy-100">{formatDay(todayManila())}</p>
            </div>
            {error ? (
              <div className="pt-4">
                <ErrorBanner title="Could not load today's numbers" message={error} onRetry={refetch} />
              </div>
            ) : (
              <dl className="divide-y divide-white/10">
                {boardRows.map((row, index) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 py-4">
                    <dt className="text-navy-100">{row.label}</dt>
                    <dd className="tabular">
                      {loading ? (
                        <Skeleton className="h-9 w-20 bg-white/15" />
                      ) : (
                        // Each number flips into place once, one after the other, like a departure board
                        <span className="inline-block origin-bottom animate-flap font-display text-3xl font-bold sm:text-4xl" style={{ animationDelay: `${index * 120}ms` }}>
                          {row.value}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        <section className="bg-cream-deep">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-10">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-amber">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-navy-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-navy-500 sm:px-6 lg:px-10">BoundaryPro · Advanced Web Programming capstone, NU Clark</footer>
    </div>
  );
}
