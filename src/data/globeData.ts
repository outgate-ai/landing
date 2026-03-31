export interface Connection {
  index: number;
  isContinent?: boolean;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
  size: number;
  connections: Connection[];
}

export interface GlobeConfig {
  rotation: { x: number; y: number };
  animation: { speed: number; mouseInfluence: number };
}

export function latLonToXYZ(latDeg: number, lonDeg: number) {
  const lat = (-latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return { x: cosLat * Math.cos(lon), y: Math.sin(lat), z: cosLat * Math.sin(lon) };
}

export const majorCities = [
  // North America
  { name: 'New York', lat: 40.7128, lon: -74.006, size: 3 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, size: 3 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, size: 2 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698, size: 2 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, size: 3 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, size: 2 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194, size: 3 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321, size: 2 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918, size: 2 },
  { name: 'Atlanta', lat: 33.749, lon: -84.388, size: 2 },
  // South America
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, size: 3 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, size: 2 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, size: 2 },
  { name: 'Bogotá', lat: 4.711, lon: -74.0721, size: 2 },
  { name: 'Lima', lat: -12.0464, lon: -77.0428, size: 2 },
  { name: 'Santiago', lat: -33.4489, lon: -70.6693, size: 2 },
  // Europe
  { name: 'London', lat: 51.5074, lon: -0.1278, size: 3 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, size: 3 },
  { name: 'Berlin', lat: 52.52, lon: 13.405, size: 2 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, size: 2 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, size: 3 },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, size: 2 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, size: 3 },
  { name: 'Vienna', lat: 48.2082, lon: 16.3738, size: 2 },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686, size: 2 },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, size: 2 },
  // Africa
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, size: 3 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792, size: 2 },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, size: 2 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219, size: 1 },
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898, size: 2 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, size: 2 },
  { name: 'Accra', lat: 5.6037, lon: -0.187, size: 1 },
  { name: 'Dar es Salaam', lat: -6.7924, lon: 39.2083, size: 1 },
  { name: 'Addis Ababa', lat: 9.0054, lon: 38.7636, size: 1 },
  { name: 'Kinshasa', lat: -4.4419, lon: 15.2663, size: 1 },
  { name: 'Luanda', lat: -8.8399, lon: 13.2894, size: 1 },
  // Asia
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917, size: 3 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, size: 3 },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737, size: 2 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978, size: 2 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, size: 2 },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, size: 3 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018, size: 2 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, size: 2 },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, size: 3 },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456, size: 3 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, size: 2 },
  { name: 'Tehran', lat: 35.6892, lon: 51.389, size: 2 },
  // Oceania
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, size: 2 },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631, size: 1 },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633, size: 1 },
  { name: 'Perth', lat: -31.9505, lon: 115.8605, size: 1 },
  { name: 'Brisbane', lat: -27.4698, lon: 153.0251, size: 1 },
  // South America (additional)
  { name: 'Montevideo', lat: -34.9011, lon: -56.1645, size: 1 },
  { name: 'Caracas', lat: 10.4806, lon: -66.9036, size: 1 },
  { name: 'Medellín', lat: 6.2476, lon: -75.5658, size: 1 },
  { name: 'Brasília', lat: -15.7975, lon: -47.8919, size: 1 },
  { name: 'Curitiba', lat: -25.4284, lon: -49.2733, size: 1 },
];

export function getCitiesInVicinity(
  centreLat: number,
  centreLon: number,
  options?: { count?: number; maxDistKm?: number; baseSize?: number; sizeJitter?: number }
): Point3D[] {
  const { count = 8, maxDistKm = 120, baseSize = 1, sizeJitter = 0.5 } = options ?? {};
  const EARTH_R_KM = 6371;
  const kmToRad = (km: number) => (km / EARTH_R_KM) * (180 / Math.PI);
  const points: Point3D[] = [];

  for (let i = 0; i < count; i++) {
    const bearing = Math.random() * 360;
    const distanceKm = Math.random() * maxDistKm;
    const phi = kmToRad(distanceKm);
    const si = (bearing * Math.PI) / 180;
    const ti1 = (centreLat * Math.PI) / 180;
    const lam1 = (centreLon * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(ti1) * Math.cos((phi * Math.PI) / 180) +
      Math.cos(ti1) * Math.sin((phi * Math.PI) / 180) * Math.cos(si)
    );
    const lon2 = lam1 + Math.atan2(
      Math.sin(si) * Math.sin((phi * Math.PI) / 180) * Math.cos(ti1),
      Math.cos((phi * Math.PI) / 180) - Math.sin(ti1) * Math.sin(lat2)
    );

    const { x, y, z } = latLonToXYZ((lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI);
    points.push({ x, y, z, size: baseSize + Math.random() * sizeJitter, connections: [] });
  }

  return points;
}

export const GLOBE_CONFIG: GlobeConfig = {
  rotation: { x: -0.2, y: 0 },
  animation: { speed: 0.001, mouseInfluence: 0.05 },
};
