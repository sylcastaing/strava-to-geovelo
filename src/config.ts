import { z } from 'zod';

export const config = z.object({
  strava: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
  }),
  geovelo: z.object({
    authentification: z.string(),
    apiKey: z.string(),
    source: z.string(),
  }),
  storage: z.object({
    endpoint: z.url(),
    region: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    credentialPath: z.string(),
  }),
});
export type Config = z.infer<typeof config>;

export function parseConfig(): Config {
  return config.parse({
    strava: {
      clientId: process.env['STRAVA_CLIENT_ID'],
      clientSecret: process.env['STRAVA_CLIENT_SECRET'],
    },
    geovelo: {
      authentification: process.env['GEOVELO_AUTHENTIFICATION'],
      apiKey: process.env['GEOVELO_API_KEY'],
      source: process.env['GEOVELO_SOURCE'],
    },
    storage: {
      endpoint: process.env['STORAGE_ENDPOINT'],
      region: process.env['STORAGE_REGION'],
      accessKeyId: process.env['STORAGE_ACCESS_KEY_ID'],
      secretAccessKey: process.env['STORAGE_SECRET_ACCESS_KEY'],
      credentialPath: process.env['STORAGE_CREDENTIAL_PATH'],
    },
  });
}
