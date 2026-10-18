const express = require('express');
const router = express.Router();
const busService = require('../services/busService');

/**
 * @route   GET /api/routes
 * @desc    Get popular KSRTC ordinary routes
 */
router.get('/', (req, res) => {
  try {
    const routes = busService.getAllRoutes();
    return res.json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/routes/:id
 * @desc    Get route details by ID
 */
router.get('/:id', (req, res) => {
  try {
    const route = busService.getRouteById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    return res.json({ success: true, data: route });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
