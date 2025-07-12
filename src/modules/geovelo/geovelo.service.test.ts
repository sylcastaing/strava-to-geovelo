import { beforeEach, describe, expect, vi } from 'vitest';
import { GeoveloService } from './geovelo.service';
import { configMock } from '../../../tests/mocks/config.mock';
import { GpxData } from './geovelo.model';
import axios from 'axios';

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

describe('GeoveloService', () => {
  let service: GeoveloService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new GeoveloService(configMock);
  });

  describe('pushGpx', () => {
    it('should successfully push a gpx file', async () => {
      const data: GpxData = {
        name: 'test',
        content: '<test>test</test>',
      };

      vi.mocked(axios.post).mockResolvedValueOnce({
        headers: {
          authorization: 'test-token',
        },
      });

      await service.pushGpx(data);

      expect(axios.post).toHaveBeenCalledTimes(2);

      expect(axios.post).toHaveBeenNthCalledWith(1, 'https://backend.geovelo.fr/api/v1/authentication/geovelo', '', {
        headers: expect.objectContaining({
          'Api-key': 'test-api-key',
          Authentication: 'test-auth',
          Source: 'test-source',
        }),
      });

      expect(axios.post).toHaveBeenNthCalledWith(
        2,
        'https://backend.geovelo.fr/api/v2/user_trace_from_gpx',
        expect.any(global.FormData),
        {
          headers: expect.objectContaining({
            'Api-key': 'test-api-key',
            Authorization: 'test-token',
            Source: 'test-source',
          }),
        },
      );
    });
  });
});
