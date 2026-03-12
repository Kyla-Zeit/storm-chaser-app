import { describe, it, expect } from 'vitest';
import { getWeatherDescription, getWeatherIcon } from '@/hooks/use-weather';

describe('Weather utilities', () => {
  it('returns correct description for known WMO codes', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
    expect(getWeatherDescription(65)).toBe('Heavy rain');
  });

  it('returns "Unknown" for unrecognized codes', () => {
    expect(getWeatherDescription(999)).toBe('Unknown');
  });

  it('returns correct emoji icon for weather codes', () => {
    expect(getWeatherIcon(0)).toBe('☀️');
    expect(getWeatherIcon(95)).toBe('⛈️');
    expect(getWeatherIcon(73)).toBe('🌨️');
  });
});
