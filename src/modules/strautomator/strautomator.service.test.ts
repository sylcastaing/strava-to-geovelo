import { describe, expect } from 'vitest';
import { StrautomatorService } from './strautomator.service';

describe('StrautomatorService', () => {
  const service = new StrautomatorService();

  describe('parseWebhookPayload', () => {
    it('should parse valid webhook payload correctly', () => {
      const validPayload = JSON.stringify({
        id: 12345,
        name: 'Morning Run',
        dateStart: '2023-12-01T08:00:00Z',
      });

      const result = service.parseWebhookPayload(validPayload);

      expect(result).toEqual({
        id: '12345',
        name: 'Morning Run',
        start_date: '2023-12-01T08:00:00Z',
      });
    });

    it('should coerce id to string when id is a number', () => {
      const payload = JSON.stringify({
        id: 98765,
        name: 'Evening Bike Ride',
        dateStart: '2023-12-01T18:00:00Z',
      });

      const result = service.parseWebhookPayload(payload);

      expect(result.id).toBe('98765');
      expect(typeof result.id).toBe('string');
    });

    it('should throw on empty name', () => {
      const payload = JSON.stringify({
        id: 12345,
        name: '',
        dateStart: '2023-12-01T08:00:00Z',
      });

      expect(() => service.parseWebhookPayload(payload)).toThrow();
    });

    it('should throw on missing field', () => {
      const payload = JSON.stringify({
        id: '123456',
        name: 'Cycling activity',
      });

      expect(() => service.parseWebhookPayload(payload)).toThrow();
    });
  });
});
