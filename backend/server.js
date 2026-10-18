const express = require('express');
const cors = require('cors');
const path = require('path');

const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const authRoutes = require('./routes/authRoutes');
const busService = require('./services/busService');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Stops API
app.get('/api/stops', (req, res) => {
  const stops = busService.getAllStops(req.query.search);
  res.json({ success: true, count: stops.length, data: stops });
});

// Karnataka 31 Districts & Taluks Directory API
app.get('/api/districts', (req, res) => {
  const districts = busService.getAllDistricts(req.query.search);
  res.json({ success: true, count: districts.length, data: districts });
});

// System Stats (shown on dashboard & about section)
app.get('/api/stats', (req, res) => {
  const buses = busService.getAllBuses();
  const routes = busService.getAllRoutes();
  const stops = busService.getAllStops();
  res.json({
    success: true,
    data: {
      activeBuses: buses.length,
      routesCovered: routes.length,
      stopsCataloged: stops.length,
      districtsCovered: 30,
      telemetrySourceBreakdown: {
        driverSmartphone: buses.filter(b => b.currentLocation?.source?.includes('Driver')).length,
        hardwareGPS: buses.filter(b => b.currentLocation?.source?.includes('GPS')).length,
        estimatedSync: buses.filter(b => b.currentLocation?.source?.includes('Estimated')).length
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'KSRTC Ordinary Bus Tracker API',
    version: '1.0.0-hackathon',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚍 KSRTC Ordinary Bus Tracker API Server`);
  console.log(`📡 Backend REST API: http://localhost:${PORT}/api/buses`);
  console.log(`🌐 Full Application:  http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
