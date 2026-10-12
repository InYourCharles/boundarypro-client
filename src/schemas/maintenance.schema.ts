import { z } from 'zod';
import { todayManila } from '../utils/format';

const kilometres = (label: string) => z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` }).int(`${label} must be a whole number`).min(0, `${label} cannot be negative`);

// The fields of a service record. The two rules that compare fields are added below, because
// they need the whole form to be read first.
const serviceFields = {
  type: z.enum(['oil-change', 'tires', 'brakes', 'engine', 'electrical', 'general-service', 'other'], { errorMap: () => ({ message: 'Choose the kind of service' }) }),
  description: z.string().trim().max(200, 'Description must be at most 200 characters'),
  cost: z.number({ required_error: 'Cost is required', invalid_type_error: 'Cost must be a number' }).min(0, 'Cost cannot be negative'),
  odometerKm: kilometres('Odometer reading'),
  nextDueDate: z.string(), // "" when the shop did not set one
  nextDueOdometerKm: z.number({ invalid_type_error: 'Next due odometer must be a number' }).int('Next due odometer must be a whole number').optional(),
};

type NextDueFields = { odometerKm: number; nextDueOdometerKm?: number };

// The next service must come after this one: a later odometer reading (and a later date, checked in maintenanceSchema)
function checkNextOdometer(values: NextDueFields, ctx: z.RefinementCtx) {
  if (values.nextDueOdometerKm !== undefined && values.nextDueOdometerKm <= values.odometerKm) {
    ctx.addIssue({ code: 'custom', path: ['nextDueOdometerKm'], message: 'Next due odometer must be greater than the odometer at service' });
  }
}

// Logging a service (a new record, in progress or already done)
export const maintenanceSchema = z
  .object({
    vehicle: z.string().min(1, 'Choose a vehicle'),
    status: z.enum(['in-progress', 'completed']),
    serviceDate: z.string(), // "" means today
    ...serviceFields,
  })
  .superRefine((values, ctx) => {
    checkNextOdometer(values, ctx);
    const serviceDay = values.serviceDate || todayManila();
    if (values.nextDueDate && values.nextDueDate <= serviceDay) {
      ctx.addIssue({ code: 'custom', path: ['nextDueDate'], message: 'Next due date must be after the service date' });
    }
  });

// Completing a service that is in the shop: the final bill, the reading and the next sticker.
// The kind of service is fixed when the service starts, so it is not part of this form (the server ignores it here too).
// The next due date is checked by the server, which knows the service date.
export const completeServiceSchema = z.object(serviceFields).omit({ type: true }).superRefine(checkNextOdometer);
