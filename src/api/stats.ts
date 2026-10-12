import { api } from './client';
import type { CollectionStats } from '../types';

export interface StatsQuery {
  from?: string; // "YYYY-MM-DD"; the server's default is the 1st of this month
  to?: string; // the server's default is today
  groupBy?: 'day' | 'month';
}

// What was owed, what came in, what the shop cost, and the best and worst vehicles for a range of days
export async function getCollectionStats(params: StatsQuery = {}) {
  const res = await api.get<CollectionStats>('/stats/collections', { params });
  return res.data;
}
