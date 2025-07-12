import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncService } from './sync.service';
import { StravaActivity } from './modules/strava/strava.model';
import { GpxData } from './modules/geovelo/geovelo.model';
import { configMock } from '../tests/mocks/config.mock';

const mockActivity: StravaActivity = {
  id: '12345',
  name: 'Morning Ride',
  start_date: '2025-07-02T08:30:00.000Z',
};

const mockGpxData: GpxData = {
  name: 'Morning Ride',
  content: '<?xml version="1.0"?><gpx version="1.1">...</gpx>',
};

const getActivityMock = vi.fn();
const getActivityGpxMock = vi.fn();
const pushGpxMock = vi.fn();

vi.mock('./modules/strava/strava.service', () => ({
  StravaService: vi.fn(() => ({
    getActivity: getActivityMock,
    getActivityGpx: getActivityGpxMock,
  })),
}));

vi.mock('./modules/geovelo/geovelo.service', () => ({
  GeoveloService: vi.fn(() => ({
    pushGpx: pushGpxMock,
  })),
}));

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new SyncService(configMock);
  });

  describe('syncActivityFromId', () => {
    it('should successfully sync an activity by ID', async () => {
      getActivityMock.mockResolvedValue(mockActivity);
      getActivityGpxMock.mockResolvedValue(mockGpxData);
      pushGpxMock.mockResolvedValue(undefined);

      await service.syncActivityFromId('12345');

      expect(getActivityMock).toHaveBeenCalledExactlyOnceWith('12345');
      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(mockActivity);
      expect(pushGpxMock).toHaveBeenCalledExactlyOnceWith(mockGpxData);
    });

    it('should handle errors when getting activity fails', async () => {
      const error = new Error('Failed to get activity');
      getActivityMock.mockRejectedValue(error);

      await expect(service.syncActivityFromId('12345')).rejects.toThrow('Failed to get activity');

      expect(getActivityMock).toHaveBeenCalledExactlyOnceWith('12345');
      expect(getActivityGpxMock).not.toHaveBeenCalled();
      expect(pushGpxMock).not.toHaveBeenCalled();
    });

    it('should handle errors when getting GPX data fails', async () => {
      const error = new Error('Failed to get GPX data');
      getActivityMock.mockResolvedValue(mockActivity);
      getActivityGpxMock.mockRejectedValue(error);

      await expect(service.syncActivityFromId('12345')).rejects.toThrow('Failed to get GPX data');

      expect(getActivityMock).toHaveBeenCalledExactlyOnceWith('12345');
      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(mockActivity);
      expect(pushGpxMock).not.toHaveBeenCalled();
    });

    it('should handle errors when pushing GPX to Geovelo fails', async () => {
      const error = new Error('Failed to push GPX');
      getActivityMock.mockResolvedValue(mockActivity);
      getActivityGpxMock.mockResolvedValue(mockGpxData);
      pushGpxMock.mockRejectedValue(error);

      await expect(service.syncActivityFromId('12345')).rejects.toThrow('Failed to push GPX');

      expect(getActivityMock).toHaveBeenCalledExactlyOnceWith('12345');
      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(mockActivity);
      expect(pushGpxMock).toHaveBeenCalledExactlyOnceWith(mockGpxData);
    });
  });

  describe('syncActivity', () => {
    it('should successfully sync a given activity', async () => {
      getActivityGpxMock.mockResolvedValue(mockGpxData);
      pushGpxMock.mockResolvedValue(undefined);

      await service.syncActivity(mockActivity);

      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(mockActivity);
      expect(pushGpxMock).toHaveBeenCalledExactlyOnceWith(mockGpxData);
    });

    it('should handle errors when getting GPX data fails', async () => {
      const error = new Error('Failed to get GPX data');
      getActivityGpxMock.mockRejectedValue(error);

      await expect(service.syncActivity(mockActivity)).rejects.toThrow('Failed to get GPX data');

      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(mockActivity);
      expect(pushGpxMock).not.toHaveBeenCalled();
    });

    it('should handle errors when pushing GPX to Geovelo fails', async () => {
      const error = new Error('Failed to push GPX');
      getActivityGpxMock.mockResolvedValue(mockGpxData);
      pushGpxMock.mockRejectedValue(error);

      await expect(service.syncActivity(mockActivity)).rejects.toThrow('Failed to push GPX');

      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(mockActivity);
      expect(pushGpxMock).toHaveBeenCalledExactlyOnceWith(mockGpxData);
    });

    it('should work with different activity data', async () => {
      const differentActivity: StravaActivity = {
        id: '67890',
        name: 'Evening Commute',
        start_date: '2025-07-02T18:00:00.000Z',
      };

      const differentGpxData: GpxData = {
        name: 'Evening Commute',
        content: '<?xml version="1.0"?><gpx version="1.1">...</gpx>',
      };

      getActivityGpxMock.mockResolvedValue(differentGpxData);
      pushGpxMock.mockResolvedValue(undefined);

      await service.syncActivity(differentActivity);

      expect(getActivityGpxMock).toHaveBeenCalledExactlyOnceWith(differentActivity);
      expect(pushGpxMock).toHaveBeenCalledExactlyOnceWith(differentGpxData);
    });
  });
});
