import { afterEach, describe, expect, it } from 'vitest';
import { parseConfig } from './config';

describe('config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should parse and validate env variables', () => {
    vi.stubEnv('STRAVA_CLIENT_ID', 'test_client_id');
    vi.stubEnv('STRAVA_CLIENT_SECRET', 'test_client_secret');
    vi.stubEnv('GEOVELO_AUTHENTIFICATION', 'test_auth');
    vi.stubEnv('GEOVELO_API_KEY', 'test_api_key');
    vi.stubEnv('GEOVELO_SOURCE', 'test_source');
    vi.stubEnv('STORAGE_BUCKET', 'test_bucket');
    vi.stubEnv('STORAGE_REGION', 'us-east-1');
    vi.stubEnv('STORAGE_ACCESS_KEY_ID', 'test_access_key');
    vi.stubEnv('STORAGE_SECRET_ACCESS_KEY', 'test_secret_key');
    vi.stubEnv('STORAGE_CREDENTIAL_PATH', '/path/to/credentials');

    const config = parseConfig();

    expect(config).toEqual({
      strava: {
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
      },
      geovelo: {
        authentification: 'test_auth',
        apiKey: 'test_api_key',
        source: 'test_source',
      },
      storage: {
        bucket: 'test_bucket',
        region: 'us-east-1',
        accessKeyId: 'test_access_key',
        secretAccessKey: 'test_secret_key',
        credentialPath: '/path/to/credentials',
      },
    });
  });

  it('should throw error when required env variables are missing', () => {
    vi.stubEnv('STRAVA_CLIENT_ID', 'test_client_id');
    vi.stubEnv('STRAVA_CLIENT_SECRET', 'test_client_secret');

    expect(() => parseConfig()).toThrow();
  });
});
