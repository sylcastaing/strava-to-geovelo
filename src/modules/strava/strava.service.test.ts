import { beforeEach, describe, expect, vi } from 'vitest';
import { StravaService } from './strava.service';
import { configMock } from '../../../tests/mocks/config.mock';
import axios, { AxiosHeaders } from 'axios';
import { StravaActivity, StravaStream } from './strava.model';

vi.mock('axios', async importOriginal => {
  const axios = await importOriginal<any>();

  return {
    ...axios,
    default: {
      ...axios.default,
      get: vi.fn(),
    },
  };
});

vi.mock('./strava-authentification.service.ts', () => ({
  StravaAuthentificationService: vi.fn(() => ({
    getAuthorizationHeaders: vi.fn().mockResolvedValue(AxiosHeaders.from({ Authorization: `Bearer token` })),
  })),
}));

describe('StravaService', () => {
  let service: StravaService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new StravaService(configMock);
  });

  describe('getActivity', () => {
    it('should successfully retrieve an activity', async () => {
      const activity: StravaActivity = {
        id: '1',
        name: 'Cycling',
        start_date: '2025-07-02T12:18:10.000Z',
      };

      vi.mocked(axios.get).mockResolvedValueOnce({ data: activity });

      const result = await service.getActivity('1');

      expect(result).toEqual(activity);
      expect(axios.get).toHaveBeenCalledExactlyOnceWith('https://www.strava.com/api/v3/activities/1', {
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      });
    });
  });

  describe('getActivityGpx', async () => {
    it('should successfully retrieve an activity gpx', async () => {
      const activity: StravaActivity = {
        id: '1',
        name: 'Cycling',
        start_date: '2025-07-02T12:18:10.000Z',
      };

      const streams: StravaStream[] = [
        {
          type: 'latlng',
          data: [
            [1, 2],
            [3, 4],
          ],
        },
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: streams });

      const result = await service.getActivityGpx(activity);

      expect(result.name).toBe(activity.name);
      expect(result.content).toStrictEqual(expect.stringContaining('<gpx'));

      expect(axios.get).toHaveBeenCalledExactlyOnceWith(
        'https://www.strava.com/api/v3/activities/1/streams?keys=latlng,time,altitude,heartrate,cadence,watts,temp',
        {
          headers: expect.objectContaining({
            Authorization: 'Bearer token',
          }),
        },
      );
    });

    it('should work with all stream types', async () => {
      const activity: StravaActivity = {
        id: '1',
        name: 'Cycling',
        start_date: '2025-07-02T12:18:10.000Z',
      };

      const streams: StravaStream[] = [
        {
          type: 'latlng',
          data: [
            [1, 2],
            [3, 4],
          ],
        },
        { type: 'time', data: [1, 2] },
        { type: 'altitude', data: [1, 2] },
        { type: 'heartrate', data: [1, 2] },
        { type: 'cadence', data: [1, 2] },
        { type: 'watts', data: [1, 2] },
        { type: 'temp', data: [1, 2] },
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: streams });

      expect(await service.getActivityGpx(activity)).toBeDefined();
    });
  });
});
