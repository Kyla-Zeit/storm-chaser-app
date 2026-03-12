import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  MapPin,
  X,
  CloudLightning,
  ImagePlus,
  Clock3,
  FileText,
  Compass,
  TriangleAlert,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import {
  Camera as CapCamera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StormType, GeoLocation, WeatherData } from '@/types/storm';
import { getWeatherDescription } from '@/hooks/use-weather';

const STORM_TYPES: { value: StormType; label: string }[] = [
  { value: 'thunderstorm', label: '⛈️ Thunderstorm' },
  { value: 'tornado', label: '🌪️ Tornado' },
  { value: 'hurricane', label: '🌀 Hurricane' },
  { value: 'hailstorm', label: '🧊 Hailstorm' },
  { value: 'blizzard', label: '❄️ Blizzard' },
  { value: 'derecho', label: '💨 Derecho' },
  { value: 'microburst', label: '🌬️ Microburst' },
  { value: 'supercell', label: '🌩️ Supercell' },
  { value: 'other', label: '🌧️ Other' },
];

interface Props {
  location: GeoLocation | null;
  weather: WeatherData | null;
  photoCount: number;
  onSubmit: (data: {
    photoUrl: string;
    location: GeoLocation;
    timestamp: string;
    weatherConditions: string;
    notes: string;
    stormType: StormType;
    temperature?: number;
    windSpeed?: number;
  }) => void;
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

async function compressDataUrl(
  dataUrl: string,
  maxWidth = 1600,
  quality = 0.82
): Promise<string> {
  const img = await loadImageFromDataUrl(dataUrl);

  const scale = Math.min(1, maxWidth / img.width);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  return compressDataUrl(rawDataUrl);
}

export function StormDocForm({
  location,
  weather,
  photoCount,
  onSubmit,
}: Props) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [stormType, setStormType] = useState<StormType>('thunderstorm');
  const [showForm, setShowForm] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureTime = new Date();
  const weatherConditions = weather
    ? getWeatherDescription(weather.weatherCode)
    : 'No weather data';

  const hasLiveLocation = Boolean(location);
  const saveLocation: GeoLocation = location ?? { latitude: 0, longitude: 0 };

  const setPreparedPhoto = async (incomingDataUrl: string) => {
    setIsPreparingPhoto(true);

    try {
      const compressed = await compressDataUrl(incomingDataUrl);
      setPhotoUrl(compressed);
      setShowForm(true);
    } catch (error) {
      console.error('Image preparation error:', error);
      setPhotoUrl(incomingDataUrl);
      setShowForm(true);
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const takeNativePhoto = async (source: CameraSource) => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source,
      });

      if (image.dataUrl) {
        await setPreparedPhoto(image.dataUrl);
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

const handleTakePhoto = () => {
  if (Capacitor.isNativePlatform()) {
    void takeNativePhoto(CameraSource.Camera);
  } else {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = () => {
      void processSelectedFile(input.files?.[0], input);
    };

    input.click();
  }
};

  const handlePickPhoto = () => {
    if (Capacitor.isNativePlatform()) {
      void takeNativePhoto(CameraSource.Photos);
    } else {
      fileInputRef.current?.click();
    }
  };

  const processSelectedFile = async (
  file: File | null | undefined,
  inputEl?: HTMLInputElement | null
) => {
  if (!file) return;

  setIsPreparingPhoto(true);

  try {
    const compressed = await fileToCompressedDataUrl(file);
    setPhotoUrl(compressed);
    setShowForm(true);
  } catch (error) {
    console.error('File selection error:', error);
  } finally {
    setIsPreparingPhoto(false);
    if (inputEl) {
      inputEl.value = '';
    }
  }
};

  const handleFileSelect = async (e: React. ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreparingPhoto(true);

    try {
      const compressed = await fileToCompressedDataUrl(file);
      setPhotoUrl(compressed);
      setShowForm(true);
    } catch (error) {
      console.error('File selection error:', error);
    } finally {
      setIsPreparingPhoto(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setPhotoUrl('');
    setNotes('');
    setStormType('thunderstorm');
    setShowForm(false);
    setIsPreparingPhoto(false);
  };

  const handleSubmit = () => {
    if (!photoUrl) return;

    const finalNotes = hasLiveLocation
      ? notes
      : `${
          notes ? `${notes}\n\n` : ''
        }[GPS unavailable in phone browser preview. Report saved without live coordinates.]`;

    onSubmit({
      photoUrl,
      location: saveLocation,
      timestamp: new Date().toISOString(),
      weatherConditions,
      notes: finalNotes,
      stormType,
      temperature: weather?.temperature,
      windSpeed: weather?.windSpeed,
    });

    resetForm();
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-6 text-center space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CloudLightning className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              Document a Storm
            </h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Capture a photo, tag the storm type, and save weather,
              coordinates, date, time, and notes locally on your device.
            </p>
          </div>

          {!hasLiveLocation && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                GPS is unavailable in this phone browser preview right now. You can
                still save the report, but coordinates will be marked unavailable.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              onClick={handleTakePhoto}
              className="h-11 gap-2"
              disabled={isPreparingPhoto}
            >
              <Camera className="h-4 w-4" />
              {isPreparingPhoto ? 'Preparing...' : 'Take Photo'}
            </Button>

            <Button
              variant="outline"
              onClick={handlePickPhoto}
              className="h-11 gap-2"
              disabled={isPreparingPhoto}
            >
              <ImagePlus className="h-4 w-4" />
              {isPreparingPhoto ? 'Preparing...' : 'Gallery'}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl bg-secondary/30 p-3 text-left text-xs text-muted-foreground sm:grid-cols-3">
            <div className="space-y-1">
              <span className="block uppercase tracking-wider">Conditions</span>
              <p className="text-sm font-medium text-foreground">
                {weatherConditions}
              </p>
            </div>

            <div className="space-y-1">
              <span className="block uppercase tracking-wider">Coordinates</span>
              <p className="text-sm font-medium text-foreground">
                {hasLiveLocation
                  ? `${location!.latitude.toFixed(4)}, ${location!.longitude.toFixed(4)}`
                  : 'Unavailable in phone preview'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="block uppercase tracking-wider">Saved Photos</span>
              <p className="text-sm font-medium text-foreground">
                {photoCount}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFileSelect(e)}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass overflow-hidden rounded-2xl"
          >
            <div className="relative">
              <img
                src={photoUrl}
                alt="Storm capture"
                className="h-52 w-full object-cover sm:h-64"
              />

              <button
                onClick={resetForm}
                className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs text-foreground backdrop-blur-sm">
                <MapPin className="h-3 w-3" />
                {hasLiveLocation
                  ? `${saveLocation.latitude.toFixed(4)}°, ${saveLocation.longitude.toFixed(4)}°`
                  : 'Coordinates unavailable'}
              </div>
            </div>

            <div className="space-y-4 p-5">
              {!hasLiveLocation && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    This report will save without live GPS because the phone browser
                    preview is not exposing location.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Storm Type / Classification
                  </label>
                  <Select
                    value={stormType}
                    onValueChange={(v) => setStormType(v as StormType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STORM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Weather Conditions
                  </label>
                  <Input
                    readOnly
                    value={weatherConditions}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Date & time
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {captureTime.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2 rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Compass className="h-3.5 w-3.5" />
                    Location coordinates
                  </div>
                  <p className="break-words text-sm font-medium text-foreground">
                    {hasLiveLocation
                      ? `${saveLocation.latitude.toFixed(6)}, ${saveLocation.longitude.toFixed(6)}`
                      : 'Unavailable in phone preview'}
                  </p>
                </div>
              </div>

              {weather && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Temperature
                    </label>
                    <Input
                      readOnly
                      value={`${weather.temperature}°C`}
                      className="bg-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Wind Speed
                    </label>
                    <Input
                      readOnly
                      value={`${weather.windSpeed} km/h`}
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes / Description
                </label>
                <Textarea
                  placeholder="Describe the cloud structure, precipitation, wind, lightning, damage, movement, or anything else you observed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-background/30 p-3 text-xs text-muted-foreground">
                <FileText className="mt-0.5 h-4 w-4 text-primary" />
                <p>
                  Saving this report stores the photo and metadata locally on the
                  device, so your storm log persists between sessions.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                className="h-11 w-full gap-2"
                size="lg"
                disabled={!photoUrl}
              >
                <CloudLightning className="h-4 w-4" />
                Save Storm Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}