import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StravaCredentialS3StorageService } from './strava-credential-s3-storage.service';
import { configMock } from '../../../tests/mocks/config.mock';
import { StravaCredentials } from './strava.model';
import axios from 'axios';
import aws4 from 'aws4';

vi.mock('axios');

describe('StravaCredentialS3StorageService', () => {
  let service: StravaCredentialS3StorageService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new StravaCredentialS3StorageService(configMock);
  });

  describe('getCredentials', () => {
    it('should successfully retrieve credentials from S3', async () => {
      const mockCredentials: StravaCredentials = {
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_at: 1234567890,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockCredentials });

      const aws4Spy = vi.spyOn(aws4, 'sign');

      const result = await service.getCredentials();

      expect(result).toEqual(mockCredentials);

      expect(aws4Spy).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          host: 'test.com',
          method: 'GET',
          path: '/test/path',
          region: 'test-region',
          service: 's3',
        }),
        expect.objectContaining({
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        }),
      );

      expect(axios.get).toHaveBeenCalledExactlyOnceWith(
        'https://test.com/test/path',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });

  describe('saveCredentials', () => {
    it('should successfully save credentials to S3', async () => {
      const mockCredentials: StravaCredentials = {
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_at: 1234567890,
      };

      vi.mocked(axios.put).mockResolvedValue(null);

      const aws4Spy = vi.spyOn(aws4, 'sign');

      await service.saveCredentials(mockCredentials);

      expect(aws4Spy).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          host: 'test.com',
          method: 'PUT',
          path: '/test/path',
          region: 'test-region',
          service: 's3',
        }),
        expect.objectContaining({
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        }),
      );

      expect(axios.put).toHaveBeenCalledExactlyOnceWith(
        'https://test.com/test/path',
        mockCredentials,
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });
});
