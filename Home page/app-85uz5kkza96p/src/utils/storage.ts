/**
 * Local Storage Manager for Dataset Persistence
 * Uses IndexedDB for large datasets and localStorage for metadata
 */

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  fileType: string;
  fileSize: number;
  pointCount: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    minValue: number;
    maxValue: number;
  };
  variables?: string[];
  hasTemporal?: boolean;
  temporalSteps?: number;
}

export interface SavedDataset {
  metadata: DatasetMetadata;
  data: any[];
  rawFile?: ArrayBuffer;
}

const DB_NAME = 'GeoHeatmapDB';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'metadata.id' });
          objectStore.createIndex('uploadDate', 'metadata.uploadDate', { unique: false });
          objectStore.createIndex('name', 'metadata.name', { unique: false });
        }
      };
    });
  }

  async saveDataset(dataset: SavedDataset): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(dataset);

      request.onsuccess = () => {
        // Also save metadata to localStorage for quick access
        this.saveMetadataToLocalStorage(dataset.metadata);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getDataset(id: string): Promise<SavedDataset | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDatasets(): Promise<SavedDataset[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDataset(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.removeMetadataFromLocalStorage(id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllMetadata(): Promise<DatasetMetadata[]> {
    const stored = localStorage.getItem('dataset_metadata');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveMetadataToLocalStorage(metadata: DatasetMetadata): void {
    const allMetadata = this.getAllMetadataSync();
    const index = allMetadata.findIndex(m => m.id === metadata.id);
    if (index >= 0) {
      allMetadata[index] = metadata;
    } else {
      allMetadata.push(metadata);
    }
    localStorage.setItem('dataset_metadata', JSON.stringify(allMetadata));
  }

  private removeMetadataFromLocalStorage(id: string): void {
    const allMetadata = this.getAllMetadataSync();
    const filtered = allMetadata.filter(m => m.id !== id);
    localStorage.setItem('dataset_metadata', JSON.stringify(filtered));
  }

  private getAllMetadataSync(): DatasetMetadata[] {
    const stored = localStorage.getItem('dataset_metadata');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // User preferences
  saveUserPreferences(prefs: any): void {
    localStorage.setItem('user_preferences', JSON.stringify(prefs));
  }

  getUserPreferences(): any {
    const stored = localStorage.getItem('user_preferences');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}

export const storageManager = new StorageManager();
