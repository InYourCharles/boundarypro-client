import type { Assignment } from '../types';

// What an assignment costs the driver: the boundary, the no-show penalty (the boundary is then waived), or nothing when cancelled
export function chargeOf(assignment: Assignment): number {
  if (assignment.status === 'no-show') return assignment.penaltyFee;
  if (assignment.status === 'cancelled') return 0;
  return assignment.boundaryDue;
}
