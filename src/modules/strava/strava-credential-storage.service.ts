import { StravaCredentials } from './strava.model';
import { Config } from '../../config';

export abstract class StravaCredentialStorageService {
  protected readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  abstract getCredentials(): Promise<StravaCredentials>;
  abstract saveCredentials(credentials: StravaCredentials): Promise<void>;

  protected validateCredentials(credentials: StravaCredentials): StravaCredentials {
    return StravaCredentials.parse(credentials);
  }
}
