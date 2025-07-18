import { afterAll, beforeAll, describe } from 'vitest';
import { parseConfig } from '../src/config';
import { StravaService } from '../src/modules/strava/strava.service';
import { GeoveloService } from '../src/modules/geovelo/geovelo.service';
import { StravaAuthentificationService } from '../src/modules/strava/strava-authentification.service';
import { parse } from 'dotenv';
import fs from 'node:fs';
import { StravaCredentialS3StorageService } from '../src/modules/strava/strava-credential-s3-storage.service';

describe('e2e tests', () => {
  beforeAll(() => {
    const testEnv = parse(fs.readFileSync('./.env', 'utf-8'));

    for (const key in testEnv) {
      vi.stubEnv(key, testEnv[key]);
    }

    console.log(testEnv);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it.skip('get strava activity', async () => {
    const ID = '123456789';

    const config = parseConfig();

    const stravaService = new StravaService(config);

    const activity = await stravaService.getActivity(ID);

    console.log(activity);
  });

  it.skip('get strava activity gpx', async () => {
    const ID = '123456789';

    const config = parseConfig();

    const stravaService = new StravaService(config);

    const activity = await stravaService.getActivity(ID);

    const gpx = await stravaService.getActivityGpx(activity);

    console.log(gpx);
  });

  it.skip('push gpx to geovelo', async () => {
    const ID = '123456789';

    const config = parseConfig();

    const stravaService = new StravaService(config);
    const geoveloService = new GeoveloService(config);

    const activity = await stravaService.getActivity(ID);

    const gpx = await stravaService.getActivityGpx(activity);

    await geoveloService.pushGpx(gpx);
  });

  it.skip('print strava auth link', () => {
    const config = parseConfig();

    const service = new StravaAuthentificationService(config);

    console.log(service.getCodeLink());
  });

  it.skip('create strava credentials', async () => {
    const CODE = '1e264ab2d844b1af025a0ae89488fb3a290259c8';

    const config = parseConfig();

    const service = new StravaAuthentificationService(config);

    await service.createCredentials(CODE);
  });

  it.skip('get geovelo authentication code', async () => {
    const config = parseConfig();

    const service = new GeoveloService(config);

    console.log(service.getAuthentication('test', 'test'));
  });
});
