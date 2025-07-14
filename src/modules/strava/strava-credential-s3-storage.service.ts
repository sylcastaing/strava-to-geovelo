import { StravaCredentialStorageService } from './strava-credential-storage.service';
import { StravaCredentials } from './strava.model';
import axios, { AxiosHeaders } from 'axios';
import aws4 from 'aws4';

export class StravaCredentialS3StorageService extends StravaCredentialStorageService {
  async getCredentials(): Promise<StravaCredentials> {
    const response = await axios.get<StravaCredentials>(
      `${this.config.storage.endpoint}${this.config.storage.credentialPath}`,
      {
        headers: this.getBucketHeaders('GET'),
      },
    );

    return this.validateCredentials(response.data);
  }

  async saveCredentials(credentials: StravaCredentials): Promise<void> {
    await axios.put(
      `${this.config.storage.endpoint}${this.config.storage.credentialPath}`,
      this.validateCredentials(credentials),
      {
        headers: this.getBucketHeaders('PUT'),
      },
    );
  }

  private getBucketHeaders(method: 'GET' | 'PUT'): AxiosHeaders {
    return aws4.sign(
      {
        service: 's3',
        region: this.config.storage.region,
        method,
        host: new URL(this.config.storage.endpoint).host,
        path: this.config.storage.credentialPath,
      },
      {
        accessKeyId: this.config.storage.accessKeyId,
        secretAccessKey: this.config.storage.secretAccessKey,
      },
    ).headers as AxiosHeaders;
  }
}
