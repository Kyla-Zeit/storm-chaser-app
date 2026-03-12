import { CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  error: string;
  onRetry: () => void;
}

export function WeatherNotFound({ error, onRetry }: Props) {
  return (
    <div className="glass rounded-xl p-12 text-center space-y-4 animate-slide-up">
      <CloudOff className="mx-auto h-16 w-16 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-foreground">Weather Data Not Found</h2>
      <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
      <Button onClick={onRetry} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
