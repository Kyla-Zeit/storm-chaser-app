import { useState, useCallback } from 'react';
import { RefreshCw, Zap, HardDrive, Camera, MapPinned } from 'lucide-react';
import { toast } from 'sonner';
import { AppNav, type TabId } from '@/components/AppNav';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { WeatherSkeleton } from '@/components/WeatherSkeleton';
import { WeatherNotFound } from '@/components/WeatherNotFound';
import { StormDocForm } from '@/components/StormDocForm';
import { StormLog } from '@/components/StormLog';
import { StormMap } from '@/components/StormMap';
import { PhotoGallery } from '@/components/PhotoGallery';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useWeather } from '@/hooks/use-weather';
import { useStormReports } from '@/hooks/use-storm-reports';
import type { StormReport } from '@/types/storm';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('weather');

  const { location, loading: geoLoading, refresh: refreshGeo } = useGeolocation();
  const {
    weather,
    hourly,
    daily,
    loading: weatherLoading,
    error,
    refresh: refreshWeather,
  } = useWeather(location);

  const {
    reports,
    addReport,
    deleteReport,
    loading: reportsLoading,
    stats,
  } = useStormReports();

  const isLoading = geoLoading || weatherLoading;

  const handleRefresh = useCallback(() => {
    refreshGeo();
    refreshWeather();
  }, [refreshGeo, refreshWeather]);

  const handleAddReport = useCallback(
    (report: Omit<StormReport, 'id' | 'savedAt'>) => {
      addReport(report);

      const nextPhotoCount = stats.photoCount + (report.photoUrl ? 1 : 0);

      toast.success('Storm photo saved locally', {
        description: `${nextPhotoCount} saved photo${
          nextPhotoCount === 1 ? '' : 's'
        } on this device.`,
      });
    },
    [addReport, stats.photoCount]
  );

  return (
    <div className="min-h-screen storm-gradient">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-5 pb-28">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Storm Chaser
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Weather tracking, storm photos, and local field reports
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
            aria-label="Refresh weather and location"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <section className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5 text-primary" /> Stored
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {reportsLoading ? '...' : stats.totalReports}
            </p>
            <p className="text-xs text-muted-foreground">local reports</p>
          </div>

          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Camera className="h-3.5 w-3.5 text-primary" /> Photos
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {reportsLoading ? '...' : stats.photoCount}
            </p>
            <p className="text-xs text-muted-foreground">saved on device</p>
          </div>

          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <MapPinned className="h-3.5 w-3.5 text-primary" /> GPS
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {location ? 'Locked' : 'Pending'}
            </p>
            <p className="text-xs text-muted-foreground">coordinates</p>
          </div>
        </section>

        <main className="space-y-4">
          {activeTab === 'weather' && (
            <>
              {isLoading && <WeatherSkeleton />}
              {error && !weather && (
                <WeatherNotFound error={error} onRetry={handleRefresh} />
              )}

              {weather && location && (
                <>
                  <CurrentWeather weather={weather} location={location} />
                  {hourly.length > 0 && <HourlyForecast hourly={hourly} />}
                  {daily.length > 0 && <DailyForecast daily={daily} />}
                </>
              )}
            </>
          )}

          {activeTab === 'document' && (
            <>
              <StormDocForm
                location={location}
                weather={weather}
                onSubmit={handleAddReport}
                photoCount={stats.photoCount}
              />
              <PhotoGallery reports={reports} limit={6} />
            </>
          )}

          {activeTab === 'log' && (
            <StormLog reports={reports} onDelete={deleteReport} />
          )}

          {activeTab === 'map' && <StormMap reports={reports} />}
        </main>

        <footer className="text-center text-xs text-muted-foreground pt-1 pb-2">
          Storm Chaser App · Weather data from{' '}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open-Meteo
          </a>
        </footer>

        <AppNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reportCount={reports.length}
        />
      </div>
    </div>
  );
};

export default Index;