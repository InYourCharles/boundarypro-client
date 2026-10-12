import { api } from './client';
import type { Assignment, AssignmentFormValues, AssignmentStatus, Availability } from '../types';

export interface AssignmentQuery {
  from?: string; // "YYYY-MM-DD", both days included
  to?: string;
  shift?: string;
  status?: string;
  driver?: string; // a driver id
  vehicle?: string; // a vehicle id
  sort?: string; // "date" or "-date"
}

export async function listAssignments(params: AssignmentQuery) {
  const res = await api.get<Assignment[]>('/assignments', { params });
  return res.data;
}

// The live check behind the booking form: nothing is saved
export async function checkAvailability(booking: Pick<AssignmentFormValues, 'driverId' | 'vehicleId' | 'date' | 'shift'>) {
  const res = await api.post<Availability>('/assignments/check-availability', booking);
  return res.data;
}

// Empty notes are left out of the request
export async function createAssignment(values: AssignmentFormValues) {
  const res = await api.post<Assignment>('/assignments', { ...values, notes: values.notes || undefined });
  return res.data;
}

// One step of the lifecycle: start, complete (with the end reading), no-show or cancel.
// The answer carries a sentence to show the dispatcher, such as the penalty that was charged.
export async function changeStatus(id: string, body: { status: AssignmentStatus; startOdometerKm?: number; endOdometerKm?: number }) {
  const res = await api.patch<{ message: string; assignment: Assignment }>(`/assignments/${id}/status`, body);
  return res.data;
}
