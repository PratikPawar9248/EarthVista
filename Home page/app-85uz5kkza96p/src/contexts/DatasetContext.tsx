import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Dataset } from '@/types/heatmap';

interface DatasetContextType {
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  return (
    <DatasetContext.Provider value={{ dataset, setDataset }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}
