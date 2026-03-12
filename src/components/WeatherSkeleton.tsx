import { Skeleton } from '@/components/ui/skeleton';

export function WeatherSkeleton() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="glass rounded-xl p-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-secondary" />
        <Skeleton className="h-20 w-32 bg-secondary" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-6 space-y-3">
        <Skeleton className="h-6 w-32 bg-secondary" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-20 flex-shrink-0 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
