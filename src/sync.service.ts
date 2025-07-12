import { Config } from './config';
import { StravaService } from './modules/strava/strava.service';
import { GeoveloService } from './modules/geovelo/geovelo.service';
import { StravaActivity } from './modules/strava/strava.model';

export class SyncService {
  private readonly stravaService: StravaService;
  private readonly geoveloService: GeoveloService;

  constructor(config: Config) {
    this.stravaService = new StravaService(config);
    this.geoveloService = new GeoveloService(config);
  }

  async syncActivityFromId(id: string) {
    const activity = await this.stravaService.getActivity(id);

    await this.syncActivity(activity);
  }

  async syncActivity(activity: StravaActivity) {
    const gpx = await this.stravaService.getActivityGpx(activity);

    await this.geoveloService.pushGpx(gpx);
  }
}
