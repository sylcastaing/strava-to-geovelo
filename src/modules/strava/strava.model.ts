import { z } from 'zod';

export const StravaCredentials = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});
export type StravaCredentials = z.infer<typeof StravaCredentials>;

export interface StravaActivity {
  id: string;
  name: string;
  start_date: string;
}

export const streamTypes = ['latlng', 'time', 'altitude', 'heartrate', 'cadence', 'watts', 'temp'] as const;
export type StreamType = (typeof streamTypes)[number];

export interface StravaStream {
  type: StreamType;
  data: any[];
}
