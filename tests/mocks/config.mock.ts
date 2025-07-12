import { Config } from '../../src/config';

export const configMock: Config = {
  strava: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  },
  geovelo: {
    authentification: 'test-auth',
    apiKey: 'test-api-key',
    source: 'test-source',
  },
  storage: {
    bucket: 'test-bucket',
    region: 'test-region',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    credentialPath: '/test/path',
  },
};
