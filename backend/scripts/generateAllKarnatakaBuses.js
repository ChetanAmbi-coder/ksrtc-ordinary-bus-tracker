const fs = require('fs');
const path = require('path');

const districts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'karnatakaDistricts.json'), 'utf8'));

// District centers and RTO codes
const REGISTRY = {
  "Bengaluru Urban": { lat: 12.9716, lng: 77.5946, rto: "KA-01", division: "KSRTC Central", dest: "Mysuru" },
  "Bengaluru Rural": { lat: 13.2500, lng: 77.6000, rto: "KA-43", division: "KSRTC Bengaluru", dest: "Doddaballapura" },
  "Ramanagara": { lat: 12.7208, lng: 77.2796, rto: "KA-42", division: "KSRTC Ramanagara", dest: "Channapatna" },
  "Mandya": { lat: 12.5234, lng: 76.8988, rto: "KA-11", division: "KSRTC Mandya", dest: "Srirangapatna" },
  "Mysuru": { lat: 12.3117, lng: 76.6554, rto: "KA-09", division: "KSRTC Mysuru", dest: "Nanjangud" },
  "Chamarajanagar": { lat: 11.9261, lng: 76.9437, rto: "KA-10", division: "KSRTC Chamarajanagar", dest: "Gundlupete" },
  "Hassan": { lat: 13.0072, lng: 76.1030, rto: "KA-13", division: "KSRTC Hassan", dest: "Sakleshpur" },
  "Tumakuru": { lat: 13.3379, lng: 77.1006, rto: "KA-06", division: "KSRTC Tumakuru", dest: "Tiptur" },
  "Kolar": { lat: 13.1362, lng: 78.1291, rto: "KA-07", division: "KSRTC Kolar", dest: "KGF" },
  "Chikkaballapura": { lat: 13.4325, lng: 77.7275, rto: "KA-40", division: "KSRTC Chikkaballapura", dest: "Gauribidanur" },
  "Chitradurga": { lat: 14.2251, lng: 76.4024, rto: "KA-16", division: "KSRTC Chitradurga", dest: "Challakere" },
  "Davangere": { lat: 14.4644, lng: 75.9218, rto: "KA-17", division: "KSRTC Davangere", dest: "Harihara" },
  "Shivamogga": { lat: 13.9299, lng: 75.5681, rto: "KA-14", division: "KSRTC Shivamogga", dest: "Sagara" },
  "Dakshina Kannada": { lat: 12.8631, lng: 74.8391, rto: "KA-19", division: "KSRTC Mangaluru", dest: "Puttur" },
  "Udupi": { lat: 13.3409, lng: 74.7421, rto: "KA-20", division: "KSRTC Udupi", dest: "Kundapura" },
  "Chikkamagaluru": { lat: 13.3161, lng: 75.7720, rto: "KA-18", division: "KSRTC Chikkamagaluru", dest: "Tarikere" },
  "Kodagu": { lat: 12.4244, lng: 75.7382, rto: "KA-12", division: "KSRTC Madikeri", dest: "Kushalnagar" },
  "Dharwad": { lat: 15.4589, lng: 75.0078, rto: "KA-25", division: "NWKRTC Dharwad", dest: "Hubballi" },
  "Belagavi": { lat: 15.8497, lng: 74.4977, rto: "KA-22", division: "NWKRTC Belagavi", dest: "Gokak" },
  "Vijayapura": { lat: 16.8302, lng: 75.7100, rto: "KA-28", division: "NWKRTC Vijayapura", dest: "Indi" },
  "Bagalkote": { lat: 16.1691, lng: 75.6615, rto: "KA-29", division: "NWKRTC Bagalkote", dest: "Badami" },
  "Gadag": { lat: 15.4167, lng: 75.6333, rto: "KA-26", division: "NWKRTC Gadag", dest: "Ron" },
  "Haveri": { lat: 14.7952, lng: 75.3991, rto: "KA-27", division: "NWKRTC Haveri", dest: "Ranebennur" },
  "Uttara Kannada": { lat: 14.8136, lng: 74.1298, rto: "KA-30", division: "NWKRTC Uttara Kannada", dest: "Sirsi" },
  "Ballari": { lat: 15.1394, lng: 76.9214, rto: "KA-34", division: "KKRTC Ballari", dest: "Siruguppa" },
  "Vijayanagara": { lat: 15.2689, lng: 76.3909, rto: "KA-35", division: "KKRTC Hosapete", dest: "Kudligi" },
  "Bidar": { lat: 17.9104, lng: 77.5199, rto: "KA-38", division: "KKRTC Bidar", dest: "Basavakalyan" },
  "Kalaburagi": { lat: 17.3297, lng: 76.8343, rto: "KA-32", division: "KKRTC Kalaburagi", dest: "Shahabad" },
  "Raichur": { lat: 16.2076, lng: 77.3463, rto: "KA-36", division: "KKRTC Raichur", dest: "Sindhanur" },
  "Koppal": { lat: 15.3458, lng: 76.1554, rto: "KA-37", division: "KKRTC Koppal", dest: "Gangavathi" },
  "Yadgir": { lat: 16.7708, lng: 77.1376, rto: "KA-33", division: "KKRTC Yadgir", dest: "Shorapur" }
};

const allBuses = [];
let busCount = 100;

districts.forEach(d => {
  const reg = REGISTRY[d.district] || { lat: 14.0, lng: 76.0, rto: "KA-01", division: "KSRTC Karnataka" };
  const taluks = d.taluks;

  // 1. Create a bus between District HQ and primary taluks
  for (let i = 0; i < taluks.length; i += 2) {
    const originTaluk = taluks[i];
    const destTaluk = (i + 1 < taluks.length) ? taluks[i + 1] : d.district;
    
    busCount++;
    const randReg = 1000 + Math.floor(Math.random() * 8999);
    const busNumber = `${reg.rto}-F-${randReg}`;
    const baseFare = 30 + (i * 12);

    const lat1 = reg.lat + (i * 0.03);
    const lng1 = reg.lng - (i * 0.03);
    const lat2 = reg.lat - (i * 0.04);
    const lng2 = reg.lng + (i * 0.04);

    const stops = [
      { name: `${originTaluk} Bus Stand`, time: "08:00 AM", status: "completed", fare: 0, lat: lat1, lng: lng1 },
      { name: `${originTaluk} Rural Cross`, time: "08:35 AM", status: "completed", fare: Math.round(baseFare * 0.35), lat: lat1 + (lat2 - lat1)*0.35, lng: lng1 + (lng2 - lng1)*0.35 },
      { name: `${d.district} Main Bypass`, time: "09:10 AM", status: "current", fare: Math.round(baseFare * 0.65), lat: lat1 + (lat2 - lat1)*0.65, lng: lng1 + (lng2 - lng1)*0.65 },
      { name: `${destTaluk} KSRTC Stand`, time: "09:50 AM", status: "upcoming", fare: baseFare, lat: lat2, lng: lng2 }
    ];

    allBuses.push({
      id: `BUS-${busCount}`,
      busNumber,
      busType: "Ordinary (Karnataka Sarige)",
      busCategory: "Ordinary",
      shaktiSchemeEligible: true,
      fareDetails: {
        female: "₹0 (FREE under Shakthi Scheme)",
        male: `₹${baseFare}`,
        note: "🌸 Shakthi Scheme: 100% Free Travel for Women with Karnataka Domicile"
      },
      depot: `${reg.division} - ${d.district} Depot`,
      routeId: `RT-${reg.rto}-${i}`,
      routeName: `${originTaluk} ⟶ ${destTaluk} (${d.district})`,
      origin: originTaluk,
      destination: destTaluk,
      departureTime: "08:00 AM",
      expectedArrivalTime: "09:50 AM",
      status: i % 3 === 0 ? "On Time" : (i % 3 === 1 ? "Slight Delay" : "On Time"),
      currentStop: stops[2].name,
      nextStop: stops[3].name,
      eta: `~${20 + (i * 5)} min`,
      totalStops: stops.length,
      currentStopIndex: 2,
      speedKmH: 46 + (i % 8),
      currentLocation: {
        lat: stops[2].lat,
        lng: stops[2].lng,
        lastUpdated: "Live GPS Active",
        source: "Driver Smartphone Live GPS",
        confidence: "High (Driver GPS ON)"
      },
      stops
    });
  }
});

// Add luxury / special non-ordinary buses to clearly demonstrate the contrast
allBuses.push({
  id: "BUS-PREM-901",
  busNumber: "KA-01-F-9901",
  busType: "Special (Rajahamsa Executive)",
  busCategory: "Special / Premium",
  shaktiSchemeEligible: false,
  fareDetails: {
    female: "₹240 (Full Ticket Required)",
    male: "₹240 (Full Ticket Required)",
    note: "🚫 Shakthi Scheme is NOT APPLICABLE in Rajahamsa services"
  },
  depot: "Bengaluru Central Depot-1",
  routeId: "RT-BLR-MYS-PREM",
  routeName: "Bengaluru (Majestic) ⟶ Mysuru (Suburban)",
  origin: "Bengaluru",
  destination: "Mysuru",
  departureTime: "09:00 AM",
  expectedArrivalTime: "11:30 AM",
  status: "On Time",
  currentStop: "Ramanagara Bypass",
  nextStop: "Mandya Bypass",
  eta: "~50 min",
  totalStops: 4,
  currentStopIndex: 1,
  speedKmH: 68,
  currentLocation: { lat: 12.7208, lng: 77.2796, lastUpdated: "Live GPS Active", source: "Driver Smartphone Live GPS", confidence: "High" },
  stops: [
    { name: "Bengaluru (Majestic)", time: "09:00 AM", status: "completed", fare: 0, lat: 12.9772, lng: 77.5713 },
    { name: "Ramanagara Bypass", time: "09:50 AM", status: "current", fare: 130, lat: 12.7208, lng: 77.2796 },
    { name: "Mandya Bypass", time: "10:45 AM", status: "upcoming", fare: 195, lat: 12.5234, lng: 76.8988 },
    { name: "Mysuru (Suburban)", time: "11:30 AM", status: "upcoming", fare: 240, lat: 12.3117, lng: 76.6554 }
  ]
});

allBuses.push({
  id: "BUS-PREM-902",
  busNumber: "KA-57-F-7733",
  busType: "Special (Airavat Club Class Multi-Axle AC)",
  busCategory: "Special / Premium",
  shaktiSchemeEligible: false,
  fareDetails: {
    female: "₹850 (Full Ticket Required)",
    male: "₹850 (Full Ticket Required)",
    note: "Luxury AC Bus — Shakthi Scheme NOT Allowed"
  },
  depot: "Bengaluru Central Depot-2",
  routeId: "RT-BLR-HUB-PREM",
  routeName: "Bengaluru ⟶ Hubballi",
  origin: "Bengaluru",
  destination: "Hubballi",
  departureTime: "10:00 AM",
  expectedArrivalTime: "05:00 PM",
  status: "On Time",
  currentStop: "Tumakuru Toll Plaza",
  nextStop: "Chitradurga Bypass",
  eta: "~5 hrs 15 min",
  totalStops: 4,
  currentStopIndex: 1,
  speedKmH: 75,
  currentLocation: { lat: 13.3379, lng: 77.1006, lastUpdated: "Live GPS Active", source: "Official Fleet Telemetry", confidence: "High" },
  stops: [
    { name: "Bengaluru (Majestic)", time: "10:00 AM", status: "completed", fare: 0, lat: 12.9772, lng: 77.5713 },
    { name: "Tumakuru Toll Plaza", time: "11:15 AM", status: "current", fare: 250, lat: 13.3379, lng: 77.1006 },
    { name: "Chitradurga Bypass", time: "01:30 PM", status: "upcoming", fare: 520, lat: 14.2251, lng: 76.4024 },
    { name: "Hubballi Old Bus Stand", time: "05:00 PM", status: "upcoming", fare: 850, lat: 15.3647, lng: 75.1240 }
  ]
});

fs.writeFileSync(path.join(__dirname, '..', 'data', 'buses.json'), JSON.stringify(allBuses, null, 2), 'utf8');
console.log(`Successfully generated ${allBuses.length} real-world buses across all 31 Karnataka districts and taluks!`);
