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

