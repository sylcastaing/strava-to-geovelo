import { Config } from '../../config';
import { StravaCredentialStorageService } from './strava-credential-storage.service';
import { StravaCredentialS3StorageService } from './strava-credential-s3-storage.service';
import axios, { AxiosHeaders } from 'axios';
import { StravaCredentials } from './strava.model';

export class StravaAuthentificationService {
  private readonly config: Config;
  private readonly storage: StravaCredentialStorageService;

  constructor(config: Config) {
    this.config = config;
    this.storage = new StravaCredentialS3StorageService(config);
  }

  getCodeLink(): string {
    return `https://www.strava.com/oauth/authorize?client_id=${this.config.strava.clientId}&redirect_uri=http://localhost:3000&response_type=code&approval_prompt=auto&scope=activity:read_all`;
  }

  async createCredentials(code: string): Promise<void> {
    const response = await axios.post<StravaCredentials>('https://www.strava.com/oauth/token', {
      client_id: this.config.strava.clientId,
      client_secret: this.config.strava.clientSecret,
      grant_type: 'authorization_code',
      code,
    });

    await this.storage.saveCredentials(response.data);
  }

  async getAuthorizationHeaders(): Promise<AxiosHeaders> {
    const credentials = await this.getCredentials();

    return AxiosHeaders.from({ Authorization: `Bearer ${credentials.access_token}` });
  }

  private async getCredentials(): Promise<StravaCredentials> {
    const credentials = await this.storage.getCredentials();

    // epoc second to millisecond + add 100 seconds to be sure not expired
    const expiredAt = new Date((credentials.expires_at - 100) * 1000);

    if (expiredAt < new Date()) {
      return await this.refreshCredentials(credentials);
    }

    return credentials;
  }

  private async refreshCredentials(credentials: StravaCredentials): Promise<StravaCredentials> {
    const response = await axios.post<StravaCredentials>('https://www.strava.com/oauth/token', {
      client_id: this.config.strava.clientId,
      client_secret: this.config.strava.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token,
    });

    const newCredentials = response.data;

    await this.storage.saveCredentials(newCredentials);

    return newCredentials;
  }
}
