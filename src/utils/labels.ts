import type { PaymentMethod, ServiceType, Shift } from '../types';

// The words the screens use for the codes the API stores. One place, so a dropdown and a table never disagree.

// The three daily shifts and their hours (business rule BR2). The order here is the order screens list them in.
export const SHIFTS: { value: Shift; label: string; hours: string }[] = [
  { value: 'morning', label: 'Morning', hours: '5 AM – 1 PM' },
  { value: 'afternoon', label: 'Afternoon', hours: '1 PM – 9 PM' },
  { value: 'night', label: 'Night', hours: '9 PM – 5 AM' },
];

export function shiftLabel(shift: Shift): string {
  return SHIFTS.find((item) => item.value === shift)?.label ?? shift;
}

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  'bank-transfer': 'Bank transfer',
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  'oil-change': 'Oil change',
  tires: 'Tires',
  brakes: 'Brakes',
  engine: 'Engine',
  electrical: 'Electrical',
  'general-service': 'General service',
  other: 'Other',
};
