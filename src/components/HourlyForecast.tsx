import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { HourlyForecast as HourlyData } from '@/types/storm';
import { getWeatherIcon } from '@/hooks/use-weather';

interface Props {
  hourly: HourlyData[];
}

export function HourlyForecast({ hourly }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        24-Hour Forecast
      </h3>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {hourly.map((h, i) => {
            const time = new Date(h.time);
            const hour = time.getHours();
            const label = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg min-w-[60px] hover:bg-secondary/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xl">{getWeatherIcon(h.weatherCode)}</span>
                <span className="text-sm font-medium text-foreground">{Math.round(h.temperature)}°</span>
                {h.precipitation > 0 && (
                  <span className="text-xs text-storm-cyan">{h.precipitation}mm</span>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  );
}
