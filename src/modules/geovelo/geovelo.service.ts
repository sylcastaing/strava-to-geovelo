import axios, { AxiosHeaders } from 'axios';
import { Config } from '../../config';
import { GpxData } from './geovelo.model';

export class GeoveloService {
  private accessToken: string | null = null;

  constructor(private readonly config: Config) {}

  async pushGpx(gpx: GpxData) {
    await this.authenticate();

    const formData = new FormData();

    formData.append('gpx', new Blob([gpx.content]), `${gpx.name}.gpx`);
    formData.append('title', gpx.name);

    await axios.post(`https://backend.geovelo.fr/api/v2/user_trace_from_gpx`, formData, {
      headers: this.getGeoveloHeaders(),
    });
  }

  private async authenticate() {
    /*
        Authentication creation
        const data = `${this.login};${this.password}`
        const buff = Buffer.from(data)
        const base64 = buff.toString('base64')
    */

    const headers = this.getGeoveloHeaders();

    headers.set('Authentication', this.config.geovelo.authentification);

    const response = await axios.post(`https://backend.geovelo.fr/api/v1/authentication/geovelo`, '', {
      headers,
    });

    this.accessToken = response.headers['authorization'];
  }

  private getGeoveloHeaders(): AxiosHeaders {
    const headers = AxiosHeaders.from({
      'Api-key': this.config.geovelo.apiKey,
      Source: this.config.geovelo.source,
    });

    if (this.accessToken) {
      headers.set('Authorization', this.accessToken);
    }

    return headers;
  }
}
