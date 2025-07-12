import { beforeEach, describe, expect, it } from 'vitest';
import { StravaCredentials } from './strava.model';
import { StravaCredentialStorageService } from './strava-credential-storage.service';
import { configMock } from '../../../tests/mocks/config.mock';

class StravaCredentialStorageServiceTest extends StravaCredentialStorageService {
  getCredentials(): Promise<StravaCredentials> {
    throw new Error('Method not implemented.');
  }

  saveCredentials(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  validateCredentials(credentials: StravaCredentials): StravaCredentials {
    return super.validateCredentials(credentials);
  }
}

describe('StravaCredentialStorageService', () => {
  let service: StravaCredentialStorageServiceTest;

  beforeEach(() => {
    service = new StravaCredentialStorageServiceTest(configMock);
  });

  describe('validateCredentials', () => {
    it('should validate valid credentials', () => {
      const validCredentials: StravaCredentials = {
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_at: 1234567890,
      };

      const result = service.validateCredentials(validCredentials);

      expect(result).toEqual(validCredentials);
    });

    it('should throw on invalid credentials', () => {
      const invalidCredentials = {
        access_token: 'invalid-access-token',
        refresh_token: 15,
      } as unknown as StravaCredentials;

      expect(() => service.validateCredentials(invalidCredentials)).toThrow();
    });
  });
});
