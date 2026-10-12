import { api } from './client';
import type { MaintenanceDue, Vehicle, VehicleFormValues } from '../types';

export interface VehicleQuery {
  q?: string;
  type?: string;
  status?: string;
  sort?: string; // "plateNumber", "type", "status", "boundaryRate" or "odometerKm"; "-" in front means descending
}

export async function listVehicles(params: VehicleQuery) {
  const res = await api.get<Vehicle[]>('/vehicles', { params });
  return res.data;
}

export async function getVehicle(id: string) {
  const res = await api.get<Vehicle>(`/vehicles/${id}`);
  return res.data;
}

// The vehicles that are overdue or due soon for service, most urgent first
export async function getMaintenanceDue() {
  const res = await api.get<MaintenanceDue>('/vehicles/maintenance-due');
  return res.data;
}

export async function createVehicle(values: VehicleFormValues) {
  const res = await api.post<Vehicle>('/vehicles', values);
  return res.data;
}

export async function updateVehicle(id: string, values: VehicleFormValues) {
  const res = await api.put<Vehicle>(`/vehicles/${id}`, values);
  return res.data;
}

export async function deleteVehicle(id: string) {
  const res = await api.delete<{ message: string }>(`/vehicles/${id}`);
  return res.data;
}
