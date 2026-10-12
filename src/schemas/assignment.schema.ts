import { z } from 'zod';
import { todayManila } from '../utils/format';

// The form that books a shift. The names driverId and vehicleId are the ones the API expects.
export const assignmentSchema = z.object({
  driverId: z.string().min(1, 'Choose a driver'),
  vehicleId: z.string().min(1, 'Choose a vehicle'),
  date: z
    .string()
    .min(1, 'Choose a date')
    .refine((day) => day >= todayManila(), 'Date cannot be before today'),
  shift: z.enum(['morning', 'afternoon', 'night'], { errorMap: () => ({ message: 'Choose a shift' }) }),
  notes: z.string().trim().max(200, 'Notes must be at most 200 characters'),
});

// The form that finishes a started shift: the driver brings the unit back and the odometer is read
export const completeSchema = z.object({
  endOdometerKm: z
    .number({ required_error: 'Enter the end reading', invalid_type_error: 'The end reading must be a number' })
    .int('The end reading must be a whole number')
    .min(0, 'Odometer cannot be negative'),
});
