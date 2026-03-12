import { useState, useEffect, useCallback } from 'react';
import type {
  WeatherData,
  HourlyForecast,
  DailyForecast,
  GeoLocation,
} from '@/types/storm';

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

export function getWeatherDescription(code: number): string {
  return WMO_CODES[code] || 'Unknown';
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

export function useWeather(location: GeoLocation | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!location) {
      setWeather(null);
      setHourly([]);
      setDaily([]);
      setError('Location unavailable. Unable to retrieve weather data.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

   /* // TEMPORARY TEST ERROR
    setWeather(null);
    setHourly([]);
    setDaily([]);
    setError('Failed to retrieve weather data for your current location.');
    setLoading(false);
    return;
    */

    try {
      const { latitude, longitude } = location;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();

      const current = data.current;
      setWeather({
        temperature: current.temperature_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
        apparentTemperature: current.apparent_temperature,
        pressure: current.pressure_msl || current.surface_pressure,
        cloudCover: current.cloud_cover,
        visibility: 10,
        uvIndex: 0,
      });

      const hourlyData: HourlyForecast[] = data.hourly.time
        .slice(0, 24)
        .map((time: string, i: number) => ({
          time,
          temperature: data.hourly.temperature_2m[i],
          weatherCode: data.hourly.weather_code[i],
          windSpeed: data.hourly.wind_speed_10m[i],
          precipitation: data.hourly.precipitation[i],
        }));
      setHourly(hourlyData);

      const dailyData: DailyForecast[] = data.daily.time.map(
        (date: string, i: number) => ({
          date,
          temperatureMax: data.daily.temperature_2m_max[i],
          temperatureMin: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weather_code[i],
          precipitationSum: data.daily.precipitation_sum[i],
          windSpeedMax: data.daily.wind_speed_10m_max[i],
        })
      );
      setDaily(dailyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { weather, hourly, daily, loading, error, refresh: fetchWeather };
}