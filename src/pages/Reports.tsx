import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChartColumn } from 'lucide-react';
import { getRanking } from '../api/drivers';
import { getCollectionStats } from '../api/stats';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { PlateChip } from '../components/ui/PlateChip';
import { Select } from '../components/ui/Select';
import { Skeleton, SkeletonRows } from '../components/ui/Skeleton';
import { Stat, StatStrip } from '../components/ui/Stat';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { reportFilterSchema } from '../schemas/reportFilter.schema';
import type { CollectionStats, ReportFilterValues } from '../types';
import { formatDay, formatMonth, peso, plural, todayManila } from '../utils/format';

// One bar pair per period: what was expected (navy) and what was collected (teal), both on the same scale
function CollectionChart({ stats }: { stats: CollectionStats }) {
  const { series, range } = stats;
  const isMonthly = range.groupBy === 'month';
  const periodLabel = (period: string) => (isMonthly ? formatMonth(period) : formatDay(period));
  const tallest = Math.max(1, ...series.map((point) => Math.max(point.expected, point.collected))); // 1 avoids dividing by zero

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-sm bg-navy" />
          Expected
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-sm bg-teal" />
          Collected
        </span>
      </div>

      <div className="flex gap-3">
        <div aria-hidden className="flex w-16 shrink-0 flex-col justify-between pb-px text-right text-xs text-navy-500 tabular">
          <span>{peso(tallest)}</span>
          <span>{peso(Math.round(tallest / 2))}</span>
          <span>₱0</span>
        </div>
        <div className="min-w-0 flex-1">
          {/* The heights are percentages of the tallest value, so the chart needs no chart library */}
          <div role="group" aria-label="Expected and collected per period" className="flex h-56 items-end gap-px border-b border-l border-navy-500/60 sm:gap-1">
            {series.map((point) => (
              <div
                key={point.period}
                role="img"
                aria-label={`${periodLabel(point.period)}: collected ${peso(point.collected)} of ${peso(point.expected)} expected`}
                title={`${periodLabel(point.period)}: collected ${peso(point.collected)} of ${peso(point.expected)} expected`}
                className="flex h-full min-w-0 flex-1 items-end gap-px"
              >
                <div className="min-w-0 flex-1 rounded-t-sm bg-navy" style={{ height: `${(point.expected / tallest) * 100}%` }} />
                <div className="min-w-0 flex-1 rounded-t-sm bg-teal" style={{ height: `${(point.collected / tallest) * 100}%` }} />
              </div>
            ))}
          </div>
          <div aria-hidden className="mt-1.5 flex justify-between text-xs text-navy-500">
            <span>{periodLabel(series[0].period)}</span>
            <span>{periodLabel(series[series.length - 1].period)}</span>
          </div>
        </div>
      </div>

      {/* The same numbers as text, for anyone who cannot read the bars */}
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold underline-offset-2 hover:underline">Show the numbers</summary>
        <div className="mt-3">
          <Table>
            <THead>
              <Tr>
                <Th>{isMonthly ? 'Month' : 'Day'}</Th>
                <Th align="right">Expected</Th>
                <Th align="right">Collected</Th>
              </Tr>
            </THead>
            <TBody>
              {series.map((point) => (
                <Tr key={point.period}>
                  <Td>
                    <span className="font-semibold">{periodLabel(point.period)}</span>
                  </Td>
                  <Td label="Expected" align="right">
                    {peso(point.expected)}
                  </Td>
                  <Td label="Collected" align="right">
                    {peso(point.collected)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      </details>
    </div>
  );
}

function RankingSection() {
  const ranking = useFetch(() => getRanking(), []);

  function renderRanking() {
    if (ranking.error) return <ErrorBanner title="Could not load the ranking" message={ranking.error} onRetry={ranking.refetch} />;
    if (!ranking.data) return <SkeletonRows rows={5} />;

    const { ranked, unranked } = ranking.data;
    return (
      <>
        {ranked.length === 0 ? (
          <EmptyState icon={ChartColumn} title="No driver can be ranked yet" description="A driver needs at least 3 completed or missed shifts before a fair score is possible." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Rank</Th>
                <Th>Driver</Th>
                <Th align="right">Score</Th>
                <Th align="right">Paid on time</Th>
                <Th align="right">Attendance</Th>
                <Th align="right">Cleared</Th>
                <Th align="right">Outstanding</Th>
              </Tr>
            </THead>
            <TBody>
              {ranked.map((driver) => (
                <Tr key={driver.driverId}>
                  <Td>
                    <span className="font-display text-xl font-bold">#{driver.rank}</span>
                  </Td>
                  <Td label="Driver">
                    <Link to={`/drivers/${driver.driverId}`} className="font-semibold underline-offset-2 hover:underline">
                      {driver.fullName}
                    </Link>
                  </Td>
                  <Td label="Score" align="right">
                    <span className="font-semibold">{driver.score}</span>
                    <span className="text-navy-500"> / 100</span>
                  </Td>
                  <Td label="Paid on time" align="right">
                    {Math.round(driver.onTimeRate * 100)}%
                  </Td>
                  <Td label="Attendance" align="right">
                    {Math.round(driver.attendanceRate * 100)}%
                  </Td>
                  <Td label="Cleared" align="right">
                    {Math.round(driver.clearanceRate * 100)}%
                  </Td>
                  <Td label="Outstanding" align="right">
                    <span className={driver.outstanding > 0 ? 'font-semibold text-danger-dark' : ''}>{peso(driver.outstanding)}</span>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}

        {unranked.length > 0 && (
          <Card title="Not ranked yet" className="mt-4">
            <ul className="divide-y divide-navy-100">
              {unranked.map((driver) => (
                <li key={driver.driverId} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                  <Link to={`/drivers/${driver.driverId}`} className="font-medium underline-offset-2 hover:underline">
                    {driver.fullName}
                  </Link>
                  <span className="text-navy-500">{driver.reason}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </>
    );
  }

  return (
    <section aria-labelledby="ranking-heading" className="mt-10">
      <h2 id="ranking-heading" className="text-2xl font-semibold">
        Driver ranking
      </h2>
      <p className="mb-4 mt-1 max-w-2xl text-navy-500">The score is 60% paying on time, 25% showing up for booked shifts and 15% how much of what was charged is cleared. Active drivers only.</p>
      {renderRanking()}
    </section>
  );
}

export default function Reports() {
  useDocumentTitle('Reports');

  // The range the report shows. It starts as the 1st of this month up to today, the same default the server uses.
  const today = todayManila();
  const [applied, setApplied] = useState<ReportFilterValues>({ from: `${today.slice(0, 8)}01`, to: today, groupBy: 'day' });
  const stats = useFetch(() => getCollectionStats(applied), [applied]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFilterValues>({ resolver: zodResolver(reportFilterSchema), defaultValues: applied });

  // The Zod schema has already checked the range, so the values are safe to send
  function onSubmit(values: ReportFilterValues) {
    setApplied(values);
  }

  function renderReport() {
    if (stats.error) return <ErrorBanner title="Could not load the report" message={stats.error} onRetry={stats.refetch} />;
    if (!stats.data) {
      return (
        <div role="status" aria-busy="true" className="space-y-6">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      );
    }

    const data = stats.data;
    return (
      <div className={`space-y-6 ${stats.loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={stats.loading}>
        <StatStrip className="grid-cols-2 lg:grid-cols-3">
          <Stat label="Expected" value={peso(data.expected)} note="Boundaries and penalties of finished shifts" />
          <Stat label="Collected" value={peso(data.collected)} note="Payments received in the range" valueClass="text-teal-dark" />
          <Stat label="Collection rate" value={`${data.collectionRate}%`} note="Share of expected that came in, capped at 100%" />
          <Stat label="Maintenance cost" value={peso(data.maintenanceCost)} note="Services done in the range" />
          <Stat label="Net cash" value={peso(data.netCash)} note="Collected minus maintenance" valueClass={data.netCash < 0 ? 'text-danger-dark' : ''} />
          <Stat label="Overdue today" value={peso(data.overdueTotal)} note="Unpaid and past due, all drivers" valueClass={data.overdueTotal > 0 ? 'text-danger-dark' : ''} />
        </StatStrip>

        <Card title={data.range.groupBy === 'month' ? 'Collections by month' : 'Collections by day'}>
          {data.series.length === 0 ? <p className="text-navy-500">There is nothing to chart for this range.</p> : <CollectionChart stats={data} />}
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Best earner">
            {data.topVehicle ? (
              <>
                <PlateChip plate={data.topVehicle.plateNumber} size="lg" />
                <p className="mt-2 font-display text-2xl font-bold">{peso(data.topVehicle.revenue)}</p>
              </>
            ) : (
              <p className="text-navy-500">No finished shifts in this range.</p>
            )}
          </Card>
          <Card title="Lowest earner">
            {data.lowestVehicle ? (
              <>
                <PlateChip plate={data.lowestVehicle.plateNumber} size="lg" />
                <p className="mt-2 font-display text-2xl font-bold">{peso(data.lowestVehicle.revenue)}</p>
              </>
            ) : (
              <p className="text-navy-500">No finished shifts in this range.</p>
            )}
          </Card>
          <Card title="Idle units">
            {data.idleVehicles.length === 0 ? (
              <p className="text-navy-500">Every available unit earned something in this range.</p>
            ) : (
              <>
                <p className="mb-2 text-navy-500">{plural(data.idleVehicles.length, 'available unit')} with no finished shift:</p>
                <ul className="flex flex-wrap gap-2">
                  {data.idleVehicles.map((vehicle) => (
                    <li key={vehicle._id}>
                      <PlateChip plate={vehicle.plateNumber} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Reports" description="What was owed, what came in, what the shop cost, and how each driver and unit performed." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <Input label="From" type="date" max={today} error={errors.from?.message} {...register('from')} />
          <Input label="To" type="date" max={today} error={errors.to?.message} {...register('to')} />
          <Select label="Group by" error={errors.groupBy?.message} {...register('groupBy')}>
            <option value="day">Day (up to 62 days)</option>
            <option value="month">Month (up to 366 days)</option>
          </Select>
          <Button type="submit" variant="accent" busy={stats.loading} className="w-full sm:col-span-2 lg:col-span-1 lg:mt-[1.65rem]">
            Show report
          </Button>
        </form>
      </Card>

      {renderReport()}
      <RankingSection />
    </>
  );
}
