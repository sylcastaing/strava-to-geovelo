import { beforeEach, describe, expect, vi } from 'vitest';
import { StravaAuthentificationService } from './strava-authentification.service';
import { configMock } from '../../../tests/mocks/config.mock';
import { StravaCredentials } from './strava.model';
import axios from 'axios';

const mockCredentials: StravaCredentials = {
  access_token: 'valid-access-token',
  refresh_token: 'valid-refresh-token',
  expires_at: Math.round(new Date().getTime() / 1000 + 1000000),
};

const getCredentialsMock = vi.fn().mockResolvedValue(mockCredentials);
const saveCredentialsMock = vi.fn().mockResolvedValue(null);

vi.mock('axios', async importOriginal => {
  const axios = await importOriginal<any>();

  return {
    ...axios,
    default: {
      ...axios.default,
      post: vi.fn(),
    },
  };
});

vi.mock('./strava-credential-s3-storage.service.ts', () => ({
  StravaCredentialS3StorageService: vi.fn(() => ({
    getCredentials: getCredentialsMock,
    saveCredentials: saveCredentialsMock,
  })),
}));

describe('StravaAuthentificationService', () => {
  let service: StravaAuthentificationService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new StravaAuthentificationService(configMock);
  });

  describe('getCodeLink', () => {
    it('should return a valid link', () => {
      const link = service.getCodeLink();

      expect(link).toBe(
        'https://www.strava.com/oauth/authorize?client_id=test-client-id&redirect_uri=http://localhost:3000&response_type=code&approval_prompt=auto&scope=activity:read_all',
      );
    });
  });

  describe('createCredentials', () => {
    it('should successfully create credentials', async () => {
      const code = 'test-code';

      vi.mocked(axios.post).mockResolvedValue({ data: mockCredentials });

      await service.createCredentials(code);

      expect(axios.post).toHaveBeenCalledExactlyOnceWith('https://www.strava.com/oauth/token', {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        code: 'test-code',
        grant_type: 'authorization_code',
      });

      expect(saveCredentialsMock).toHaveBeenCalledExactlyOnceWith(mockCredentials);
    });
  });

  describe.sequential('getAuthorizationHeaders', () => {
    it('should return a valid authorization header', async () => {
      const headers = await service.getAuthorizationHeaders();

      expect(getCredentialsMock).toHaveResolvedWith(mockCredentials);

      expect(headers.toJSON()).toEqual({
        Authorization: 'Bearer valid-access-token',
      });
    });

    it('should refresh if credentials are expired', async () => {
      const expiredCredentials: StravaCredentials = {
        ...mockCredentials,
        expires_at: Math.round(new Date().getTime() / 1000 - 1000000),
      };

      getCredentialsMock.mockResolvedValueOnce(expiredCredentials);

      const refreshedCredentials: StravaCredentials = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: 1752324920,
      };

      vi.mocked(axios.post).mockResolvedValue({ data: refreshedCredentials });

      const headers = await service.getAuthorizationHeaders();

      expect(getCredentialsMock).toHaveResolvedWith(expiredCredentials);

      expect(axios.post).toHaveBeenCalledExactlyOnceWith('https://www.strava.com/oauth/token', {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        grant_type: 'refresh_token',
        refresh_token: 'valid-refresh-token',
      });

      expect(saveCredentialsMock).toHaveBeenCalledExactlyOnceWith(refreshedCredentials);

      expect(headers.toJSON()).toEqual({
        Authorization: 'Bearer new-access-token',
      });
    });
  });
});
