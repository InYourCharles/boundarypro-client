import { BusFront, Motorbike } from 'lucide-react';
import type { VehicleType } from '../../types';

const looks = {
  tricycle: { label: 'Tricycle', icon: Motorbike },
  jeepney: { label: 'Jeepney', icon: BusFront },
};

// "Tricycle" or "Jeepney" with a small picture, so the two kinds of unit are told apart without reading
export function VehicleTypeLabel({ type }: { type: VehicleType }) {
  const { label, icon: Icon } = looks[type];
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden className="h-4 w-4 text-navy-500" />
      {label}
    </span>
  );
}
