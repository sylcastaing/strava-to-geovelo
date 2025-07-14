import { beforeEach, describe, expect, vi } from 'vitest';
import { configMock } from '../tests/mocks/config.mock';
import { SyncService } from './sync.service';
import { parseConfig } from './config';
import { handler } from './index';
import { StrautomatorService } from './modules/strautomator/strautomator.service';

vi.mock('./config', () => ({
  parseConfig: vi.fn().mockReturnValue(configMock),
}));

const syncActivityMock = vi.fn();

vi.mock('./sync.service', () => ({
  SyncService: vi.fn(() => ({
    syncActivity: syncActivityMock,
  })),
}));

const parseWebhookSpy = vi.spyOn(StrautomatorService.prototype, 'parseWebhookPayload');

describe('Function handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST resquest', () => {
    it('should sync activity', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          id: '12345',
          name: 'Morning Ride',
          dateStart: '2025-07-02T08:30:00.000Z',
        }),
      };

      const result = await handler(event as any);

      expect(parseConfig).toHaveBeenCalledOnce();
      expect(parseWebhookSpy).toHaveBeenCalledOnce();
      expect(SyncService).toHaveBeenCalledExactlyOnceWith(configMock);
      expect(syncActivityMock).toHaveBeenCalledExactlyOnceWith({
        id: '12345',
        name: 'Morning Ride',
        start_date: '2025-07-02T08:30:00.000Z',
      });

      expect(result).toEqual({ statusCode: 204 });
    });

    it('should handle webhook parsing errors', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          id: '12345',
          name: '',
        }),
      };

      await expect(handler(event as any)).rejects.toThrow();

      expect(parseConfig).toHaveBeenCalledOnce();
      expect(parseWebhookSpy).toHaveBeenCalledOnce();
      expect(SyncService).toHaveBeenCalledExactlyOnceWith(configMock);
      expect(syncActivityMock).not.toHaveBeenCalled();
    });
  });

  describe('Not a POST request', () => {
    it('should return 405', async () => {
      const event = {
        httpMethod: 'GET',
      };

      const result = await handler(event as any);

      expect(result).toEqual({ statusCode: 405 });
    });
  });
});
