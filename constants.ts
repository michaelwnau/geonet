import { City } from './types';

export const CITIES: City[] = [
  { name: 'Spokane', state: 'WA', lat: 47.6588, lng: -117.4260, id: 'spk' },
  { name: 'Hartford', state: 'CT', lat: 41.7658, lng: -72.6734, id: 'hfd' },
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, id: 'nyc' },
  { name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, id: 'bwi' },
  { name: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369, id: 'dca' },
  { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, id: 'atl' },
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, id: 'aus' },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, id: 'sat' },
  { name: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792, id: 'mco' },
  { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, id: 'mia' },
];

export const INITIAL_LOGS: string[] = [
  "SYSTEM INITIALIZED...",
  "ESTABLISHING SECURE CONNECTION...",
  "LOADING GEOSPATIAL ASSETS...",
  "CONNECTING TO SATELLITE UPLINK [SAT-44X]...",
  "READY FOR TARGET SELECTION."
];
