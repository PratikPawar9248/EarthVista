import L from 'leaflet';

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate total distance along a path of coordinates
 * @param coordinates Array of [lat, lon] pairs
 * @returns Total distance in meters
 */
export function calculatePathDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];
    totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
  }

  return totalDistance;
}

/**
 * Calculate area of a polygon using spherical excess formula
 * @param coordinates Array of [lat, lon] pairs forming a closed polygon
 * @returns Area in square meters
 */
export function calculatePolygonArea(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0;

  const R = 6371000; // Earth's radius in meters
  
  // Ensure polygon is closed
  const coords = [...coordinates];
  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
    coords.push(coords[0]);
  }

  // Convert to radians
  const points = coords.map(([lat, lon]) => ({
    lat: (lat * Math.PI) / 180,
    lon: (lon * Math.PI) / 180,
  }));

  // Calculate spherical excess
  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    area += (p2.lon - p1.lon) * (2 + Math.sin(p1.lat) + Math.sin(p2.lat));
  }

  area = Math.abs((area * R * R) / 2);
  return area;
}

/**
 * Create a Leaflet polyline for distance measurement
 */
export function createMeasurementPolyline(
  latlngs: L.LatLng[],
  map: L.Map
): L.Polyline {
  return L.polyline(latlngs, {
    color: '#FF6B35', // ISRO Orange
    weight: 3,
    opacity: 0.9,
    dashArray: '10, 5',
  }).addTo(map);
}

/**
 * Create a Leaflet polygon for area measurement
 */
export function createMeasurementPolygon(
  latlngs: L.LatLng[],
  map: L.Map
): L.Polygon {
  return L.polygon(latlngs, {
    color: '#FF6B35', // ISRO Orange
    weight: 3,
    opacity: 0.9,
    fillColor: '#FF6B35', // ISRO Orange
    fillOpacity: 0.2,
  }).addTo(map);
}

/**
 * Create a marker for measurement points
 */
export function createMeasurementMarker(
  latlng: L.LatLng,
  map: L.Map,
  label?: string
): L.CircleMarker {
  const marker = L.circleMarker(latlng, {
    radius: 6,
    color: '#ffffff',
    weight: 2,
    fillColor: '#FF6B35', // ISRO Orange
    fillOpacity: 1,
  }).addTo(map);

  if (label) {
    marker.bindTooltip(label, {
      permanent: true,
      direction: 'top',
      className: 'measurement-tooltip',
    });
  }

  return marker;
}
