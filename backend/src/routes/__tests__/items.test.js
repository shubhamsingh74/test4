const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('../items');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('Items Routes', () => {
  const mockItems = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
    { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
    { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    it('should return all items when no query parameters', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toEqual({
        items: mockItems,
        pagination: {
          page: 1,
          limit: 3,
          total: 3,
          totalPages: 1
        }
      });
    });

    it('should filter items by search query', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Laptop Pro');
    });

    it('should paginate results', async () => {
      const largeMockItems = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        category: 'Test',
        price: 100
      }));
      
      fs.readFile.mockResolvedValue(JSON.stringify(largeMockItems));

      const response = await request(app)
        .get('/api/items?page=2&limit=3')
        .expect(200);

      expect(response.body.items).toHaveLength(3);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 3,
        total: 10,
        totalPages: 4
      });
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await request(app)
        .get('/api/items')
        .expect(500);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return item by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toEqual(mockItems[0]);
    });

    it('should return 404 for non-existent item', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      await request(app)
        .get('/api/items/999')
        .expect(404);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await request(app)
        .get('/api/items/1')
        .expect(500);
    });
  });

  describe('POST /api/items', () => {
    it('should create new item', async () => {
      const newItem = { name: 'New Item', category: 'Test', price: 100 };
      const mockTimestamp = 1751461242255;
      
      // Mock Date.now() to return a predictable timestamp
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => mockTimestamp);
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      const expectedItem = { ...newItem, id: mockTimestamp };
      expect(response.body).toEqual(expectedItem);
      
      const expectedData = [...mockItems, expectedItem];
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(expectedData, null, 2),
        'utf8'
      );
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await request(app)
        .post('/api/items')
        .send({ name: 'Test', category: 'Test', price: 100 })
        .expect(500);
    });

    it('should handle file write errors', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockRejectedValue(new Error('Write failed'));

      await request(app)
        .post('/api/items')
        .send({ name: 'Test', category: 'Test', price: 100 })
        .expect(500);
    });
  });
}); 