import { api } from './client';
import type { BalanceReport, Driver, DriverFormValues, DriverWithBalance, Ranking } from '../types';

export interface DriverQuery {
  q?: string;
  status?: string;
  sort?: string; // "fullName", "dateHired" or "status"; a "-" in front means descending
}

export async function listDrivers(params: DriverQuery) {
  const res = await api.get<DriverWithBalance[]>('/drivers', { params });
  return res.data;
}

export async function getDriver(id: string) {
  const res = await api.get<Driver>(`/drivers/${id}`);
  return res.data;
}

// Running balance and the charge-by-charge breakdown (first in, first out)
export async function getBalance(id: string) {
  const res = await api.get<BalanceReport>(`/drivers/${id}/balance`);
  return res.data;
}

export async function getRanking(params: { includeInactive?: boolean; limit?: number } = {}) {
  const res = await api.get<Ranking>('/drivers/ranking', { params });
  return res.data;
}

// An empty date means "today" for the server, so it is left out of the request
function toBody(values: DriverFormValues) {
  return { ...values, dateHired: values.dateHired || undefined };
}

export async function createDriver(values: DriverFormValues) {
  const res = await api.post<Driver>('/drivers', toBody(values));
  return res.data;
}

export async function updateDriver(id: string, values: DriverFormValues) {
  const res = await api.put<Driver>(`/drivers/${id}`, toBody(values));
  return res.data;
}

export async function deleteDriver(id: string) {
  const res = await api.delete<{ message: string }>(`/drivers/${id}`);
  return res.data;
}
