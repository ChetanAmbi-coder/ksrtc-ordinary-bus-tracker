const express = require('express');
const router = express.Router();
const telemetryService = require('../services/telemetryService');

/**
 * @route   POST /api/telemetry
 * @desc    Ingest real-time telemetry from Driver App / Telemetry GPS Device
 * @body    { busNumber, latitude, longitude, speedKmH, currentStopName, source }
 */
router.post('/', (req, res) => {
  try {
    const { busNumber, busId, latitude, longitude, speedKmH, currentStopName, source } = req.body;

    if (!busNumber && !busId) {
      return res.status(400).json({
        success: false,
        message: 'busNumber or busId is required to ingest telemetry'
      });
    }

    const updatedBus = telemetryService.ingestTelemetry({
      busNumber,
      busId,
      latitude,
      longitude,
      speedKmH,
      currentStopName,
      source: source || 'Driver Smartphone Telemetry'
    });

    return res.json({
      success: true,
      message: 'Telemetry ingested successfully',
      data: {
        busNumber: updatedBus.busNumber,
        currentStop: updatedBus.currentStop,
        nextStop: updatedBus.nextStop,
        eta: updatedBus.eta,
        source: updatedBus.currentLocation.source,
        lastUpdated: updatedBus.currentLocation.lastUpdated
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/telemetry/simulate-step/:busId
 * @desc    Instantly advance a bus to its next stop (ideal for live hackathon presentation)
 */
router.post('/simulate-step/:busId', (req, res) => {
  try {
    const updatedBus = telemetryService.advanceBusStop(req.params.busId);
    if (!updatedBus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    return res.json({
      success: true,
      message: `Bus ${updatedBus.busNumber} advanced to ${updatedBus.currentStop}`,
      data: updatedBus
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/telemetry/toggle
 * @desc    Toggle automated live telemetry ticker
 */
router.post('/toggle', (req, res) => {
  const result = telemetryService.toggleSimulation(req.body.active);
  return res.json({ success: true, ...result });
});

module.exports = router;
