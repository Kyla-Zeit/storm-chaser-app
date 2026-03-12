import { motion } from 'framer-motion';
import type { DailyForecast as DailyData } from '@/types/storm';
import { getWeatherIcon, getWeatherDescription } from '@/hooks/use-weather';

interface Props {
  daily: DailyData[];
}

export function DailyForecast({ daily }: Props) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        7-Day Forecast
      </h3>
      <div className="space-y-1">
        {daily.map((d, i) => {
          const date = new Date(d.date + 'T00:00:00');
          const dayName = i === 0 ? 'Today' : dayNames[date.getDay()];
          const range = d.temperatureMax - d.temperatureMin;
          const maxAll = Math.max(...daily.map((dd) => dd.temperatureMax));
          const minAll = Math.min(...daily.map((dd) => dd.temperatureMin));
          const totalRange = maxAll - minAll || 1;

          return (
            <div
              key={d.date}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground w-12">{dayName}</span>
              <span className="text-xl w-8">{getWeatherIcon(d.weatherCode)}</span>
              <span className="text-xs text-muted-foreground flex-1 hidden sm:block">
                {getWeatherDescription(d.weatherCode)}
              </span>
              <span className="text-sm text-muted-foreground w-8 text-right">
                {Math.round(d.temperatureMin)}°
              </span>
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden mx-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-storm-cyan to-storm-orange"
                  style={{
                    marginLeft: `${((d.temperatureMin - minAll) / totalRange) * 100}%`,
                    width: `${(range / totalRange) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-8">
                {Math.round(d.temperatureMax)}°
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
