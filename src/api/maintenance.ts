import { api } from './client';
import type { CompleteServiceFormValues, MaintenanceFormValues, MaintenanceRecord } from '../types';

export interface MaintenanceQuery {
  vehicle?: string; // a vehicle id
  status?: string; // "in-progress" or "completed"
  type?: string;
  sort?: string; // "-serviceDate" (default), "serviceDate" or "cost"
}

export async function listMaintenance(params: MaintenanceQuery) {
  const res = await api.get<MaintenanceRecord[]>('/maintenance', { params });
  return res.data;
}

// Empty optional dates are left out, so the server uses its defaults
export async function createMaintenance(values: MaintenanceFormValues) {
  const res = await api.post<MaintenanceRecord>('/maintenance', {
    ...values,
    serviceDate: values.serviceDate || undefined,
    nextDueDate: values.nextDueDate || undefined,
  });
  return res.data;
}

// Finishing a service puts the vehicle back on the road and records it as the last service
export async function completeMaintenance(id: string, values: CompleteServiceFormValues) {
  const res = await api.patch<MaintenanceRecord>(`/maintenance/${id}/complete`, {
    ...values,
    nextDueDate: values.nextDueDate || undefined,
  });
  return res.data;
}
