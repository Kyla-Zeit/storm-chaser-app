import { Image as ImageIcon, CalendarDays, MapPin } from 'lucide-react';
import type { StormReport } from '@/types/storm';

interface Props {
  reports: StormReport[];
  title?: string;
  description?: string;
  limit?: number;
}

const STORM_LABEL: Record<string, string> = {
  thunderstorm: 'Thunderstorm',
  tornado: 'Tornado',
  hurricane: 'Hurricane',
  hailstorm: 'Hailstorm',
  blizzard: 'Blizzard',
  derecho: 'Derecho',
  microburst: 'Microburst',
  supercell: 'Supercell',
  other: 'Other',
};

export function PhotoGallery({
  reports,
  title = 'Saved Photos',
  description = 'Photos are stored locally with each storm report on this device.',
  limit,
}: Props) {
  const photoReports = reports.filter((report) => Boolean(report.photoUrl));
  const visibleReports =
    typeof limit === 'number' ? photoReports.slice(0, limit) : photoReports;

  return (
    <section className="glass rounded-2xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Photos
          </p>
          <p className="text-lg font-semibold text-foreground">
            {photoReports.length}
          </p>
        </div>
      </div>

      {photoReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/20 px-4 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No saved storm photos yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture a storm photo and it will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibleReports.map((report) => {
              const date = new Date(report.timestamp);

              return (
                <article
                  key={report.id}
                  className="overflow-hidden rounded-2xl border border-border/50 bg-background/20"
                >
                  <img
                    src={report.photoUrl}
                    alt={`${STORM_LABEL[report.stormType] ?? 'Storm'} report`}
                    className="h-32 w-full object-cover sm:h-40"
                  />

                  <div className="space-y-2 p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {STORM_LABEL[report.stormType] ?? 'Storm'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.weatherConditions}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5 truncate">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {date.toLocaleDateString()}{' '}
                        {date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      <p className="flex items-center gap-1.5 truncate">
  <MapPin className="h-3.5 w-3.5" />
  {report.location.latitude === 0 && report.location.longitude === 0
    ? 'Location unavailable'
    : `${report.location.latitude.toFixed(3)}, ${report.location.longitude.toFixed(3)}`}
</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {typeof limit === 'number' && photoReports.length > limit && (
            <p className="text-xs text-muted-foreground">
              Showing the latest {limit} photos out of {photoReports.length} saved
              reports.
            </p>
          )}
        </>
      )}
    </section>
  );
}