import { Config } from '../config';
import aws4 from 'aws4';
import axios, { AxiosHeaders } from 'axios';
import { buildGPX, StravaBuilder } from 'gpx-builder';
import { GpxData } from './geovelo.service';

const streamTypes = ['latlng', 'time', 'altitude', 'heartrate', 'cadence', 'watts', 'temp'] as const;
type StreamType = (typeof streamTypes)[number];

interface StravaCredentials {
  token_type: 'Bearer';
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface StravaActivity {
  id: string;
  name: string;
  start_date: string;
}

type StravaStream = {
  type: StreamType;
  data: any[];
};

export class StravaService {
  constructor(private readonly config: Config) {}

  async getActivity(id: string) {
    const credentials = await this.getCredentials();

    const response = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${id}`, {
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
      },
    });

    return response.data;
  }

  async getActivityGpx(id: string): Promise<GpxData> {
    const activity = await this.getActivity(id);

    const credentials = await this.getCredentials();

    const response = await axios.get<StravaStream[]>(
      `https://www.strava.com/api/v3/activities/${id}/streams?keys=${streamTypes.join(',')}`,
      {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      },
    );

    const streams = response.data;

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
        const time = times?.[index];

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

    return {
      name: activity.name,
      content: buildGPX(gpxData.toObject()),
    };
  }

  private getBucketHeaders(method: 'GET' | 'PUT'): AxiosHeaders {
    return aws4.sign(
      {
        service: 's3',
        region: this.config.storage.region,
        method,
        host: this.config.storage.bucket,
        path: this.config.storage.credentialPath,
      },
      {
        accessKeyId: this.config.storage.accessKeyId,
        secretAccessKey: this.config.storage.secretAccessKey,
      },
    ).headers as AxiosHeaders;
  }

  private async getCredentials(): Promise<StravaCredentials> {
    const response = await axios.get<StravaCredentials>(
      `https://${this.config.storage.bucket}${this.config.storage.credentialPath}`,
      {
        headers: this.getBucketHeaders('GET'),
      },
    );

    const credentials = response.data;

    // epoc second to millisecond + add 100 seconds to be sure not expired
    const expiredAt = new Date((credentials.expires_at - 100) * 1000);

    if (expiredAt < new Date()) {
      return await this.refreshCredentials(credentials);
    }

    return credentials;
  }

  private async saveCredentials(credentials: StravaCredentials) {
    await axios.put(`https://${this.config.storage.bucket}${this.config.storage.credentialPath}`, credentials, {
      headers: this.getBucketHeaders('PUT'),
    });
  }

  getCodeLink() {
    return `https://www.strava.com/oauth/authorize?client_id=${this.config.strava.clientId}&redirect_uri=http://localhost:3000&response_type=code&approval_prompt=auto&scope=activity:read_all`;
  }

  async createCredentials(code: string) {
    const response = await axios.post<StravaCredentials>('https://www.strava.com/oauth/token', {
      client_id: this.config.strava.clientId,
      client_secret: this.config.strava.clientSecret,
      grant_type: 'authorization_code',
      code,
    });

    await this.saveCredentials(response.data);
  }

  private async refreshCredentials(credentials: StravaCredentials) {
    const response = await axios.post<StravaCredentials>('https://www.strava.com/oauth/token', {
      client_id: this.config.strava.clientId,
      client_secret: this.config.strava.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token,
    });

    const newCredentials = response.data;

    await this.saveCredentials(newCredentials);

    return newCredentials;
  }
}
