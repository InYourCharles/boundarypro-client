import { z } from 'zod';

// Money is whole pesos. The upper limit (the driver's balance) depends on the chosen driver,
// so the form checks it while rendering and the server enforces it again (BR6).
export const paymentSchema = z.object({
  driver: z.string().min(1, 'Choose a driver'),
  amountPaid: z
    .number({ required_error: 'Enter the amount', invalid_type_error: 'The amount must be a number' })
    .int('The amount must be whole pesos')
    .min(1, 'Amount paid must be at least 1 peso')
    .max(100000, 'Amount paid must be at most 100000 pesos'),
  method: z.enum(['cash', 'gcash', 'bank-transfer']),
  referenceNo: z.string().trim().max(40, 'Reference number must be at most 40 characters'),
  remarks: z.string().trim().max(200, 'Remarks must be at most 200 characters'),
});
