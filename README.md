# Storm Chaser

Storm Chaser is a mobile-first weather and storm documentation app built for the **Speer Technologies Mobile Development Assessment**. It allows users to view current weather conditions based on device location, document storm events with photos and metadata, save reports locally on the device, and navigate between weather, documentation, log, and map views.

## Assessment Summary

This project was built to satisfy the core requirements of the mobile assessment:

- Fetch and display current weather data using the device's current location
- Show key meteorological information relevant to storm chasers
- Display a "Not Found" state when weather data cannot be retrieved
- Capture storm photos with metadata
- Save captured storm data locally on the device
- Support intuitive navigation between app sections

In addition to the core requirements, this implementation also includes several extra quality-of-life features such as forecast views, a map view, loading states, and a mobile-friendly interface.

---

## Features

### 1. Weather Data View
- Fetches current weather data using the device's geolocation
- Displays storm-relevant weather information including:
  - Temperature
  - Wind speed
  - Wind direction
  - Humidity
  - Precipitation
  - Pressure
  - Cloud cover
  - Apparent temperature
- Includes hourly and daily forecast cards
- Displays a dedicated **Weather Data Not Found** state when weather retrieval fails
- Includes loading skeletons while weather data is being fetched
- Includes a manual refresh action

### 2. Storm Documentation
- Capture a storm photo using the device camera or photo library
- Attach metadata to each report:
  - Weather conditions
  - Location coordinates
  - Date and time
  - Notes / description
  - Storm type / classification
- Compresses image data before saving to improve mobile/browser persistence reliability

### 3. Local Data Persistence
- Saves storm reports locally on the device/browser
- Uses local storage strategy for persistence
- Reports persist across sessions
- Saved reports include:
  - Photo
  - Timestamp
  - Location
  - Storm type
  - Weather summary
  - Notes

### 4. Navigation / UX
- Mobile-style bottom navigation between:
  - Weather
  - Document
  - Log
  - Map
- Top dashboard cards showing:
  - Stored reports
  - Saved photos
  - GPS status
- Mobile-friendly responsive layout for browser-based phone testing

### 5. Additional Enhancements
- Saved photo gallery
- Storm log view
- Map visualization of storm report locations
- Animated UI transitions
- Friendly empty states and retry states

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion**
- **Lucide React**
- **Open-Meteo API** for weather data
- **Capacitor Camera** for native/browser-compatible photo capture
- **IndexedDB with localStorage fallback** for local storm report storage
- **Vitest** for unit testing

---

## Architecture / Implementation Decisions

This app uses a **component-based architecture** with logic separated into reusable hooks and UI components.

### Key decisions
- **Custom hooks** are used for location, weather fetching, and report persistence
- **Reusable UI components** are used to keep the interface modular and easier to maintain
- **Weather logic** is separated from display components
- **Persistence** is handled outside page components to keep views focused on rendering
- **Mobile-first layout** was prioritized because the assessment is specifically for a storm-chasing mobile experience
- **Browser-based phone testing over local IP** was supported to make device preview easier without requiring a full native build

### Main architectural pieces
- `use-geolocation`  
  Handles device location retrieval
- `use-weather`  
  Handles weather fetching, loading state, error state, and refresh logic
- `use-storm-reports`  
  Handles report creation, deletion, local persistence, and statistics
- `StormDocForm`  
  Handles photo capture, metadata entry, and report submission
- `PhotoGallery`, `StormLog`, `StormMap`  
  Present saved storm data in different views

---

## Project Structure

```text
src/
  components/
    AppNav.tsx
    CurrentWeather.tsx
    DailyForecast.tsx
    HourlyForecast.tsx
    PhotoGallery.tsx
    StormDocForm.tsx
    StormLog.tsx
    StormMap.tsx
    WeatherNotFound.tsx
    WeatherSkeleton.tsx

  hooks/
    use-geolocation.ts
    use-storm-reports.ts
    use-weather.ts

  lib/
    storm-report-storage.ts

  pages/
    Index.tsx
    NotFound.tsx

  test/
    example.test.ts
    weather.test.ts

  types/
    storm.ts