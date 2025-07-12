import axios from 'axios';
import { Config } from '../config';

export interface GpxData {
  name: string;
  content: string;
}

export class GeoveloService {
  private accessToken = '';

  constructor(private readonly config: Config) {}

  async pushGpx(gpx: GpxData) {
    await this.authenticate();

    const formData = new FormData();

    formData.append('gpx', new Blob([gpx.content]), `${gpx.name}.gpx`);
    formData.append('title', gpx.name);

    await axios.post(`https://backend.geovelo.fr/api/v2/user_trace_from_gpx`, formData, {
      headers: {
        Authorization: this.accessToken,
        'Api-key': this.config.geovelo.apiKey,
        Source: this.config.geovelo.source,
        'Content-Type': `multipart/form-data`,
      },
    });
  }

  private async authenticate() {
    /*
        Authentication creation
        const data = `${this.login};${this.password}`
        const buff = Buffer.from(data)
        const base64 = buff.toString('base64')
    */

    const response = await axios.post(`https://backend.geovelo.fr/api/v1/authentication/geovelo`, '', {
      headers: {
        Authentication: this.config.geovelo.authentification,
        'Api-key': this.config.geovelo.apiKey,
        Source: this.config.geovelo.source,
      },
    });

    this.accessToken = response.headers['authorization'];
  }
}
