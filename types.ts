export interface City {
  name: string;
  state: string;
  lat: number;
  lng: number;
  id: string;
}

export interface SurveillanceLog {
  timestamp: string;
  content: string;
  level: 'INFO' | 'WARN' | 'CRIT';
}

export type MapView = 'US' | 'GLOBE' | 'EUROPE' | 'ASIA' | 'AFRICA' | 'SOUTH_AMERICA' | 'AUSTRALIA';

export interface SantaStop {
  arrival: number;
  departure: number;
  city: string;
  region: string;
  location: { lat: number; lng: number };
  presentsDelivered: number;
  population: number;
  timezone: number;
}

export interface SantaState {
  currentLocation: { lat: number; lng: number };
  lastStop: SantaStop | null;
  nextStop: SantaStop | null;
  presentsDelivered: number;
  status: string;
}
