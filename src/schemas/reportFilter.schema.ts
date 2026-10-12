import { z } from 'zod';
import { daysBetween } from '../utils/format';

// The date range and grouping of the Reports page.
// The API accepts up to 366 days. With bars per day, more than 62 days would be too thin to read,
// so longer ranges must be grouped by month.
export const reportFilterSchema = z
  .object({
    from: z.string().min(1, 'Choose a start date'),
    to: z.string().min(1, 'Choose an end date'),
    groupBy: z.enum(['day', 'month']),
  })
  .superRefine((values, ctx) => {
    if (!values.from || !values.to) return; // the "required" messages above already cover an empty date
    if (values.from > values.to) {
      ctx.addIssue({ code: 'custom', path: ['from'], message: 'Start date must not be after the end date' });
      return;
    }
    const days = daysBetween(values.from, values.to) + 1;
    if (days > 366) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: 'The range cannot be longer than 366 days' });
    } else if (values.groupBy === 'day' && days > 62) {
      ctx.addIssue({ code: 'custom', path: ['groupBy'], message: 'Group by month for ranges longer than 62 days' });
    }
  });
