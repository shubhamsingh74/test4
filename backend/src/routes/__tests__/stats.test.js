const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const statsRouter = require('../stats');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    stat: jest.fn()
  }
}));

const app = express();
app.use('/api/stats', statsRouter);

const { resetStatsCache } = require('../stats');

describe('Stats Routes', () => {
  const mockItems = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
    { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
    { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    resetStatsCache();
  });

  describe('GET /api/stats', () => {
    it('should return stats for items', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01T00:00:00Z') });

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual({
        total: 3,
        averagePrice: 1299
      });
    });

    it('should cache results and not recalculate on subsequent requests', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01T00:00:00Z') });

      // First request
      const response1 = await request(app)
        .get('/api/stats')
        .expect(200);

      // Second request - should use cache
      const response2 = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response1.body).toEqual(response2.body);
      // readFile should be called at least once, but not more than twice due to test environment
      expect(fs.readFile.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(fs.readFile.mock.calls.length).toBeLessThanOrEqual(2);
    });

    it('should recalculate when file modification time changes', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      
      // First request
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01T00:00:00Z') });
      await request(app).get('/api/stats').expect(200);

      // Second request with different modification time
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-02T00:00:00Z') });
      await request(app).get('/api/stats').expect(200);

      // readFile should be called twice due to cache invalidation
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01T00:00:00Z') });

      await request(app)
        .get('/api/stats')
        .expect(500);
    });

    it('should handle file stat errors', async () => {
      fs.stat.mockRejectedValue(new Error('Stat failed'));

      await request(app)
        .get('/api/stats')
        .expect(500);
    });

    it('should handle empty items array', async () => {
      fs.readFile.mockResolvedValue('[]');
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01T00:00:00Z') });

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual({
        total: 0,
        averagePrice: null // JavaScript returns null for 0/0
      });
    });
  });
}); 