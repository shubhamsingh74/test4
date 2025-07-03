// Import required modules
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to the items data file
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data asynchronously from the JSON file
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// Utility to write data asynchronously to the JSON file
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items
// Returns a paginated and optionally filtered list of items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q, page = 1 } = req.query;
    let results = data;

    // Filter by search query if provided
    if (q) {
      results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
    }

    // Pagination logic
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : results.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Respond with paginated results and metadata
    res.json({
      items: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: results.length,
        totalPages: Math.ceil(results.length / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
// Returns a single item by its ID
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
// Adds a new item to the list
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission for this assessment)
    const item = req.body;
    const data = await readData();
    // Use timestamp as a unique ID
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// Export the router for use in the main app
module.exports = router;