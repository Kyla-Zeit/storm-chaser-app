import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trash2, Wind, Thermometer, Calendar, HardDrive } from 'lucide-react';
import type { StormReport } from '@/types/storm';

interface Props {
  reports: StormReport[];
  onDelete: (id: string) => void;
}

const STORM_EMOJI: Record<string, string> = {
  thunderstorm: '⛈️', tornado: '🌪️', hurricane: '🌀', hailstorm: '🧊',
  blizzard: '❄️', derecho: '💨', microburst: '🌬️', supercell: '🌩️', other: '🌧️',
};

export function StormLog({ reports, onDelete }: Props) {
  if (reports.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-4xl mb-3">🌤️</p>
        <h3 className="text-lg font-semibold text-foreground">No Storm Reports Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Head to Document to capture your first storm report with a photo and metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4 flex items-center gap-3 text-sm text-muted-foreground">
        <HardDrive className="h-4 w-4 text-primary" />
        {reports.length} report{reports.length === 1 ? '' : 's'} stored locally on this device.
      </div>
      <AnimatePresence>
        {reports.map((report) => {
          const date = new Date(report.timestamp);
          return (
            <motion.div
              key={report.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl overflow-hidden group"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={report.photoUrl}
                  alt="Storm"
                  className="w-full sm:w-36 h-40 sm:h-36 object-cover flex-shrink-0"
                />
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {STORM_EMOJI[report.stormType] || '🌧️'} {report.stormType.charAt(0).toUpperCase() + report.stormType.slice(1)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">{report.weatherConditions}</p>
                    </div>
                    <button
                      onClick={() => onDelete(report.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      aria-label="Delete storm report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location.latitude.toFixed(4)}°, {report.location.longitude.toFixed(4)}°
                    </span>
                    {report.temperature !== undefined && (
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        {report.temperature}°C
                      </span>
                    )}
                    {report.windSpeed !== undefined && (
                      <span className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        {report.windSpeed} km/h
                      </span>
                    )}
                  </div>

                  {report.notes && (
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{report.notes}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
