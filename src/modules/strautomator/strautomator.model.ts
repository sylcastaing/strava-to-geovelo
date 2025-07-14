import { z } from 'zod';

export const StrautomatorActivity = z.object({
  id: z.coerce.string().min(1),
  name: z.string().min(1),
  dateStart: z.string().min(1),
});
export type StrautomatorActivity = z.infer<typeof StrautomatorActivity>;
