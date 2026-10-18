const express = require('express');
const router = express.Router();
const busService = require('../services/busService');

/**
 * @route   GET /api/buses
 * @desc    Get all ordinary buses with optional query filters (city, from, to, status, routeId)
 */
router.get('/', (req, res) => {
  try {
    const { city, from, to, status, routeId } = req.query;
    const buses = busService.getAllBuses({ city, from, to, status, routeId });
    return res.json({
      success: true,
      count: buses.length,
      filters: { city, from, to, status, routeId },
      data: buses
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/buses/:id
 * @desc    Get detailed bus route, current stop, ETA, and full stop timeline
 */
router.get('/:id', (req, res) => {
  try {
    const bus = busService.getBusById(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    return res.json({ success: true, data: bus });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/buses/:id/tracking
 * @desc    Get live telemetry & location details for a bus
 */
router.get('/:id/tracking', (req, res) => {
  try {
    const bus = busService.getBusById(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    return res.json({
      success: true,
      data: {
        busId: bus.id,
        busNumber: bus.busNumber,
        status: bus.status,
        currentStop: bus.currentStop,
        nextStop: bus.nextStop,
        eta: bus.eta,
        speedKmH: bus.speedKmH,
        location: bus.currentLocation,
        stopProgress: {
          current: bus.currentStopIndex + 1,
          total: bus.totalStops
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
