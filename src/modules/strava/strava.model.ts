import { z } from 'zod';

export const StravaCredentials = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});
export type StravaCredentials = z.infer<typeof StravaCredentials>;

export const StravaActivity = z.object({
  id: z.coerce.string().min(1),
  name: z.string().min(1),
  start_date: z.string().min(1),
});
export type StravaActivity = z.infer<typeof StravaActivity>;

export const streamTypes = ['latlng', 'time', 'altitude', 'heartrate', 'cadence', 'watts', 'temp'] as const;
export type StreamType = (typeof streamTypes)[number];

export interface StravaStream {
  type: StreamType;
  data: any[];
}
