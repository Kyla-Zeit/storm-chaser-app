export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  apparentTemperature: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  precipitationSum: number;
  windSpeedMax: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export type StormType =
  | 'thunderstorm'
  | 'tornado'
  | 'hurricane'
  | 'hailstorm'
  | 'blizzard'
  | 'derecho'
  | 'microburst'
  | 'supercell'
  | 'other';

export interface StormReport {
  id: string;
  photoUrl: string;
  location: GeoLocation;
  timestamp: string;
  savedAt: string;
  weatherConditions: string;
  notes: string;
  stormType: StormType;
  temperature?: number;
  windSpeed?: number;
}
