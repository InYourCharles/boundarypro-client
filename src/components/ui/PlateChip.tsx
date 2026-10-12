// A plate number drawn like the plate on the vehicle, so a unit is recognised at a glance.
// "lg" is the title of a vehicle card; "sm" sits inside rows and lists.
export function PlateChip({ plate, size = 'sm' }: { plate: string; size?: 'sm' | 'lg' }) {
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-xl' : 'px-2 py-0.5 text-sm';
  return <span className={`inline-block whitespace-nowrap rounded-md border-2 border-navy bg-white font-display font-bold tracking-widest text-navy ${sizeClasses}`}>{plate}</span>;
}
