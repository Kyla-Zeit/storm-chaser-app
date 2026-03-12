import type { StormReport } from '@/types/storm';

const DB_NAME = 'storm-chaser-db';
const STORE_NAME = 'stormReports';
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = 'storm-chaser-reports';

function hasIndexedDb() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function hasLocalStorage() {
  return typeof window !== 'undefined' && 'localStorage' in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open local database'));
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

async function getAllFromDb(): Promise<StormReport[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to load reports from IndexedDB'));
    };

    request.onsuccess = () => {
      const rows = (request.result as StormReport[]) ?? [];
      resolve(rows.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)));
    };
  });
}

async function replaceAllInDb(reports: StormReport[]): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const clearRequest = store.clear();

    clearRequest.onerror = () => {
      reject(clearRequest.error ?? new Error('Failed to clear IndexedDB store'));
    };

    clearRequest.onsuccess = () => {
      for (const report of reports) {
        store.put(report);
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(transaction.error ?? new Error('Failed to save reports to IndexedDB'));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
    };
  });
}

function getAllFromLocalStorage(): StormReport[] {
  if (!hasLocalStorage()) return [];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];

    const rows = JSON.parse(raw) as StormReport[];
    return rows.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  } catch {
    return [];
  }
}

function replaceAllInLocalStorage(reports: StormReport[]) {
  if (!hasLocalStorage()) return;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.warn('localStorage save skipped:', error);
  }
}

export async function loadStormReports(): Promise<StormReport[]> {
  if (hasIndexedDb()) {
    try {
      const dbReports = await getAllFromDb();
      if (dbReports.length > 0) {
        return dbReports;
      }
    } catch (error) {
      console.warn('IndexedDB load failed, falling back to localStorage:', error);
    }
  }

  return getAllFromLocalStorage();
}

export async function saveStormReports(reports: StormReport[]): Promise<void> {
  if (hasIndexedDb()) {
    try {
      await replaceAllInDb(reports);
    } catch (error) {
      console.warn('IndexedDB save failed:', error);
    }
  }

  replaceAllInLocalStorage(reports);
}