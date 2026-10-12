import { z } from 'zod';
import { todayManila } from '../utils/format';

// Defined once, outside any component. The messages match the server's own, so a message looks the same
// whether the browser or the API catches the mistake.
export const driverSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be at most 80 characters'),
  licenseNumber: z
    .string()
    .trim()
    .toUpperCase() // the server stores licenses in capitals, so "n01-21-482913" is accepted
    .regex(/^[A-Z]\d{2}-\d{2}-\d{6}$/, 'License number must look like N01-21-482913'),
  contactNumber: z.string().trim().regex(/^09\d{9}$/, 'Contact number must be 09 followed by 9 digits'),
  address: z.string().trim().max(150, 'Address must be at most 150 characters'),
  status: z.enum(['active', 'suspended', 'inactive']),
  // A date input gives "YYYY-MM-DD", or "" when left empty (the server then uses today)
  dateHired: z.string().refine((day) => day <= todayManila(), 'Date hired cannot be in the future'),
});
