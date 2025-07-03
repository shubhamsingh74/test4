// Import required modules
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to the items data file
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// In-memory cache for stats and last modification time
let statsCache = null;
let lastModified = null;

// Calculate stats from the items data
async function calculateStats() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  // Calculate total and average price
  const stats = {
    total: items.length,
    averagePrice: items.length > 0 ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length : null
  };
  return stats;
}

// Check if the cache is still valid by comparing file modification time
async function isCacheValid() {
  try {
    const stats = await fs.stat(DATA_PATH);
    return lastModified && stats.mtime.getTime() === lastModified.getTime();
  } catch (err) {
    return false;
  }
}

// Update the cache by recalculating stats and updating lastModified
async function updateCache() {
  try {
    const stats = await fs.stat(DATA_PATH);
    lastModified = stats.mtime.getTime();
    statsCache = await calculateStats();
  } catch (err) {
    console.error('Error updating stats cache:', err);
    throw err;
  }
}

// For testing: reset cache
function resetStatsCache() {
  statsCache = null;
  lastModified = null;
}

// GET /api/stats
// Returns cached stats, recalculating only if the data file has changed
router.get('/', async (req, res, next) => {
  try {
    // Only recalculate if cache is invalid or missing
    if (!statsCache || !(await isCacheValid())) {
      await updateCache();
    }
    res.json(statsCache);
  } catch (err) {
    next(err);
  }
});

// Export the router and cache reset for tests
module.exports = router;
module.exports.resetStatsCache = resetStatsCache;