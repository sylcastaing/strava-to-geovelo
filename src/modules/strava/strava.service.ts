import { Config } from '../../config';
import axios from 'axios';
import { buildGPX, StravaBuilder } from 'gpx-builder';
import { GpxData } from '../geovelo/geovelo.model';
import { StravaActivity, StravaStream, StreamType, streamTypes } from './strava.model';
import { StravaAuthentificationService } from './strava-authentification.service';

export class StravaService {
  private readonly authService: StravaAuthentificationService;

  constructor(config: Config) {
    this.authService = new StravaAuthentificationService(config);
  }

  async getActivity(id: string) {
    const response = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${id}`, {
      headers: await this.authService.getAuthorizationHeaders(),
    });

    return response.data;
  }

  async getActivityGpx(activity: StravaActivity): Promise<GpxData> {
    const streams = await this.getActivityStream(activity);

    return {
      name: activity.name,
      content: this.createGpxFromStream(activity, streams),
    };
  }

  private async getActivityStream(activity: StravaActivity) {
    const response = await axios.get<StravaStream[]>(
      `https://www.strava.com/api/v3/activities/${activity.id}/streams?keys=${streamTypes.join(',')}`,
      {
        headers: await this.authService.getAuthorizationHeaders(),
      },
    );

    return response.data;
  }

  private createGpxFromStream(activity: StravaActivity, streams: StravaStream[]): string {
    const { Point, Track, Metadata, Segment } = StravaBuilder.MODELS;

    const gpxData = new StravaBuilder();

    const startTime = new Date(activity.start_date);

    gpxData.setMetadata(new Metadata({ time: startTime }));

    const getStream = (field: StreamType) => streams.find(stream => stream.type === field)?.data;

    const latlngs = getStream('latlng');

    if (latlngs) {
      const times = getStream('time');
      const altitude = getStream('altitude');
      const heartrate = getStream('heartrate');
      const cadence = getStream('cadence');
      const watts = getStream('watts');
      const temp = getStream('temp');

      const points = latlngs.map(([lat, lng], index) => {
        const time = times?.[index] ?? 0;

        return new Point(lat, lng, {
          ele: altitude?.[index],
          time: new Date(startTime.getTime() + time * 1000),
          hr: heartrate?.[index],
          cad: cadence?.[index],
          power: watts?.[index],
          atemp: temp?.[index],
        });
      });

      gpxData.setTracks([new Track([new Segment(points)], { name: activity.name, type: 'cycling' })]);
    }

    return buildGPX(gpxData.toObject());
  }
}
