import { api } from './client';
import type { Payment, PaymentFormValues } from '../types';

export interface PaymentQuery {
  driver?: string; // a driver id
  method?: string;
  from?: string; // "YYYY-MM-DD", both days included
  to?: string;
  sort?: string; // "-paidAt" (default), "paidAt" or "amountPaid"
}

export async function listPayments(params: PaymentQuery) {
  const res = await api.get<Payment[]>('/payments', { params });
  return res.data;
}

// Payments are append-only (BR6): there is no update or delete
export async function createPayment(values: PaymentFormValues) {
  const res = await api.post<Payment>('/payments', {
    ...values,
    referenceNo: values.referenceNo || undefined,
    remarks: values.remarks || undefined,
  });
  return res.data;
}
