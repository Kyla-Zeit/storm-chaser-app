import { motion } from 'framer-motion';
import { Wind, Droplets, Eye, Gauge, Cloud, Thermometer } from 'lucide-react';
import type { WeatherData, GeoLocation } from '@/types/storm';
import { getWeatherDescription, getWeatherIcon } from '@/hooks/use-weather';

interface Props {
  weather: WeatherData;
  location: GeoLocation;
}

function MetricCard({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: string | number; unit: string }) {
  return (
    <div className="glass rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold text-foreground">
        {value}<span className="text-sm text-muted-foreground ml-0.5">{unit}</span>
      </p>
    </div>
  );
}

export function CurrentWeather({ weather, location }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 glow-primary"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {location.locationName || `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-light text-foreground tracking-tight">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-muted-foreground text-sm">C</span>
          </div>
          <p className="text-muted-foreground mt-1">
            Feels like {Math.round(weather.apparentTemperature)}°
          </p>
        </div>
        <div className="text-right">
          <span className="text-5xl">{getWeatherIcon(weather.weatherCode)}</span>
          <p className="text-sm text-muted-foreground mt-1">
            {getWeatherDescription(weather.weatherCode)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard icon={Wind} label="Wind" value={weather.windSpeed} unit="km/h" />
        <MetricCard icon={Droplets} label="Humidity" value={weather.humidity} unit="%" />
        <MetricCard icon={Gauge} label="Pressure" value={Math.round(weather.pressure)} unit="hPa" />
        <MetricCard icon={Cloud} label="Cloud" value={weather.cloudCover} unit="%" />
        <MetricCard icon={Thermometer} label="Precip" value={weather.precipitation} unit="mm" />
        <MetricCard icon={Eye} label="Wind Dir" value={weather.windDirection} unit="°" />
      </div>
    </motion.div>
  );
}
