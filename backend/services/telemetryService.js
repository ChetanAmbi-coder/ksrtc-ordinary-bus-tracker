const busService = require('./busService');

/**
 * Telemetry Service — Ingests multi-source telemetry
 * (Driver device, GPS hardware, or official API)
 * and calculates live ETA & route progress.
 */
class TelemetryService {
  constructor() {
    this.simulationActive = true;
    this.initAutoSimulation();
  }

  /**
   * Ingest telemetry from external device (Driver App / GPS hardware)
   */
  ingestTelemetry(telemetryData) {
    const { busNumber, busId, latitude, longitude, speedKmH, source, currentStopName } = telemetryData;
    const bus = busService.getBusById(busId || busNumber);

    if (!bus) {
      throw new Error(`Bus not found for identifier: ${busId || busNumber}`);
    }

    const patch = {
      speedKmH: speedKmH !== undefined ? Number(speedKmH) : bus.speedKmH,
      currentLocation: {
        lat: latitude ? Number(latitude) : bus.currentLocation.lat,
        lng: longitude ? Number(longitude) : bus.currentLocation.lng,
        lastUpdated: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
        source: source || 'Driver Smartphone Telemetry',
        confidence: 'High'
      }
    };

    // If driver pinged a stop name, update progress along stop list
    if (currentStopName) {
      const stopIndex = bus.stops.findIndex(s => s.name.toLowerCase().includes(currentStopName.toLowerCase()));
      if (stopIndex !== -1) {
        patch.currentStopIndex = stopIndex;
        patch.currentStop = bus.stops[stopIndex].name;
        patch.nextStop = stopIndex + 1 < bus.stops.length ? bus.stops[stopIndex + 1].name : 'Terminated / Destination';
        
        // Update stop statuses
        const updatedStops = bus.stops.map((stop, idx) => {
          if (idx < stopIndex) return { ...stop, status: 'completed' };
          if (idx === stopIndex) return { ...stop, status: 'current' };
          return { ...stop, status: 'upcoming' };
        });
        patch.stops = updatedStops;

        // Recalculate ETA
        const remainingStops = bus.stops.length - 1 - stopIndex;
        patch.eta = remainingStops === 0 ? 'Arrived' : `~${remainingStops * 18} min`;
      }
    }

    return busService.updateBusState(bus.id, patch);
  }

  /**
   * Manually advance a bus to the next stop for hackathon live demo
   */
  advanceBusStop(busId) {
    const bus = busService.getBusById(busId);
    if (!bus) return null;

    let nextIndex = bus.currentStopIndex + 1;
    // Loop back if reached the end for endless demonstration
    if (nextIndex >= bus.stops.length) {
      nextIndex = 0;
    }

    const updatedStops = bus.stops.map((stop, idx) => {
      if (idx < nextIndex) return { ...stop, status: 'completed' };
      if (idx === nextIndex) return { ...stop, status: 'current' };
      return { ...stop, status: 'upcoming' };
    });

    const currentStop = bus.stops[nextIndex].name;
    const nextStop = nextIndex + 1 < bus.stops.length ? bus.stops[nextIndex + 1].name : bus.destination;
    const remainingStops = bus.stops.length - 1 - nextIndex;
    const eta = remainingStops === 0 ? 'Arrived' : `~${remainingStops * 18} min`;

    const patch = {
      currentStopIndex: nextIndex,
      currentStop,
      nextStop,
      eta,
      stops: updatedStops,
      currentLocation: {
        lat: bus.currentLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: bus.currentLocation.lng + (Math.random() - 0.5) * 0.02,
        lastUpdated: 'Live updated at ' + new Date().toLocaleTimeString(),
        source: 'Driver Smartphone Telemetry',
        confidence: 'High'
      }
    };

    return busService.updateBusState(bus.id, patch);
  }

  /**
   * Start lightweight background simulation ticker
   */
  initAutoSimulation() {
    // Every 45 seconds, gently advance one bus location to show live tracking in background
    setInterval(() => {
      if (!this.simulationActive) return;
      const buses = busService.getRawBuses();
      if (buses.length > 0) {
        // Randomly pick one bus to update
        const randomBus = buses[Math.floor(Math.random() * buses.length)];
        this.advanceBusStop(randomBus.id);
      }
    }, 45000);
  }

  toggleSimulation(state) {
    this.simulationActive = state !== undefined ? state : !this.simulationActive;
    return { simulationActive: this.simulationActive };
  }
}

module.exports = new TelemetryService();
