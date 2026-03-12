import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { StormReport } from '@/types/storm';
import { loadStormReports, saveStormReports } from '@/lib/storm-report-storage';

function sortReports(reports: StormReport[]) {
  return [...reports].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
  );
}

function mergeReports(
  currentReports: StormReport[],
  incomingReports: StormReport[]
) {
  const map = new Map<string, StormReport>();

  for (const report of incomingReports) {
    map.set(report.id, report);
  }

  for (const report of currentReports) {
    map.set(report.id, report);
  }

  return sortReports(Array.from(map.values()));
}

function createReportId() {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `report_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function persistReports(reports: StormReport[]) {
  try {
    await saveStormReports(reports);
  } catch (error) {
    console.error('Failed to persist storm reports:', error);
  }
}

export function useStormReports() {
  const [reports, setReports] = useState<StormReport[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFinishedInitialLoad = useRef(false);

  useEffect(() => {
    let active = true;

    loadStormReports()
      .then((storedReports) => {
        if (!active) return;
        setReports((prev) => mergeReports(prev, storedReports));
      })
      .catch((error) => {
        console.error('Failed to load stored storm reports:', error);
      })
      .finally(() => {
        if (active) {
          hasFinishedInitialLoad.current = true;
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasFinishedInitialLoad.current) return;
    void persistReports(reports);
  }, [reports]);

  const addReport = useCallback((report: Omit<StormReport, 'id' | 'savedAt'>) => {
    const newReport: StormReport = {
      ...report,
      id: createReportId(),
      savedAt: new Date().toISOString(),
    };

    let nextReports: StormReport[] = [];

    setReports((prev) => {
      nextReports = mergeReports([newReport], prev);
      return nextReports;
    });

    void persistReports(nextReports);

    return newReport;
  }, []);

  const deleteReport = useCallback((id: string) => {
    let nextReports: StormReport[] = [];

    setReports((prev) => {
      nextReports = prev.filter((r) => r.id !== id);
      return nextReports;
    });

    void persistReports(nextReports);
  }, []);

  const stats = useMemo(() => {
    const photoCount = reports.filter((r) => Boolean(r.photoUrl)).length;
    const latestReport = reports[0] ?? null;

    return {
      totalReports: reports.length,
      photoCount,
      latestReport,
    };
  }, [reports]);

  return { reports, addReport, deleteReport, loading, stats };
}