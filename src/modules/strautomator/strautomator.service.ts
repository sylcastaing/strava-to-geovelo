import { StravaActivity } from '../strava/strava.model';
import { StrautomatorActivity } from './strautomator.model';

export class StrautomatorService {
  parseWebhookPayload(body: string): StravaActivity {
    const activity = StrautomatorActivity.parse(JSON.parse(body));

    return {
      id: activity.id,
      name: activity.name,
      start_date: activity.dateStart,
    };
  }
}
