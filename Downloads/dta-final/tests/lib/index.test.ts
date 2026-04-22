import { describe, it, expect, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('lib/index.ts', () => {
  describe('isValidTicker', () => {
    it('should accept valid ticker symbols (1-5 uppercase letters)', async () => {
      const { isValidTicker } = await import('../../lib/index');

      expect(isValidTicker('A')).toBe(true);
      expect(isValidTicker('AA')).toBe(true);
      expect(isValidTicker('AAA')).toBe(true);
      expect(isValidTicker('AAAA')).toBe(true);
      expect(isValidTicker('AAAAA')).toBe(true);
    });

    it('should reject invalid ticker symbols', async () => {
      const { isValidTicker } = await import('../../lib/index');

      expect(isValidTicker('')).toBe(false);
      expect(isValidTicker('AAAAAA')).toBe(false);
      expect(isValidTicker('a')).toBe(false);
      expect(isValidTicker('aa')).toBe(false);
      expect(isValidTicker('123')).toBe(false);
      expect(isValidTicker('AAPL1')).toBe(false);
      expect(isValidTicker('A-PL')).toBe(false);
    });
  });

  describe('downsampleStockHistory', () => {
    it('should not downsample if data is less than target points', async () => {
      const { downsampleStockHistory } = await import('../../lib/index');

      const data = [
        { date: new Date('2024-01-01'), open: 100, high: 105, low: 95, close: 102, volume: 1000 },
        { date: new Date('2024-01-02'), open: 102, high: 107, low: 97, close: 104, volume: 1100 },
      ];

      const result = downsampleStockHistory(data, 10);
      expect(result).toHaveLength(2);
    });

    it('should downsample when data exceeds target points', async () => {
      const { downsampleStockHistory } = await import('../../lib/index');

      // Create 252 data points (1 year of trading days)
      const data = Array.from({ length: 252 }, (_, i) => ({
        date: new Date(2024, 0, 1 + i),
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
        volume: 1000 + i * 10,
      }));

      const result = downsampleStockHistory(data, 50);
      expect(result).toHaveLength(50);
    });
  });

  describe('fetchHistory', () => {
    it('should throw error for invalid symbol', async () => {
      // Mock fetch to return 404
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid symbol' }),
      } as Response);

      const { fetchHistory } = await import('../../lib/index');

      await expect(fetchHistory('INVALID_SYMBOL_THAT_DOES_NOT_EXIST', '1y')).rejects.toThrow('Invalid symbol');
    });

    it('should return mapped stock history data', async () => {
      const mockData = [
        { date: '2024-01-01', open: 100, high: 105, low: 95, close: 102, volume: 1000 },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      } as Response);

      const { fetchHistory } = await import('../../lib/index');

      const result = await fetchHistory('AAPL', '1y');
      expect(result).toHaveLength(1);
      expect(result[0].date).toBeInstanceOf(Date);
      expect(result[0].close).toBe(102);
    });
  });
});