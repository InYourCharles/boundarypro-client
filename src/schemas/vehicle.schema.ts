import { z } from 'zod';

// A number input that is left empty gives undefined (see numberOrBlank in utils/form.ts), so
// "required_error" is the message for an empty box and "invalid_type_error" for anything else.
const wholeNumber = (label: string) => z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` }).int(`${label} must be a whole number`);

export const vehicleSchema = z.object({
  plateNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}\s?\d{3,4}$/, 'Plate number must be 3 letters then 3 or 4 digits, like NEA 4521'),
  type: z.enum(['tricycle', 'jeepney'], { errorMap: () => ({ message: 'Choose tricycle or jeepney' }) }),
  model: z.string().trim().max(60, 'Model must be at most 60 characters'),
  boundaryRate: wholeNumber('Boundary rate').min(100, 'Boundary rate must be at least 100 pesos').max(2000, 'Boundary rate must be at most 2000 pesos'),
  odometerKm: wholeNumber('Odometer').min(0, 'Odometer cannot be negative'),
  serviceIntervalKm: wholeNumber('Service interval (km)').min(500, 'Service interval must be at least 500 km').max(20000, 'Service interval must be at most 20000 km'),
  serviceIntervalDays: wholeNumber('Service interval (days)').min(7, 'Service interval must be at least 7 days').max(365, 'Service interval must be at most 365 days'),
  // The form only offers "available" and "retired". "under-maintenance" is here so an edit of a vehicle that is in the
  // shop can send its status back unchanged: the shop status is set by logging a service, never by hand (BR8).
  status: z.enum(['available', 'under-maintenance', 'retired']),
});
