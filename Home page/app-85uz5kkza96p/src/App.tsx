import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DatasetProvider } from './contexts/DatasetContext';
import routes from './routes';

const App: React.FC = () => {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <DatasetProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {routes.map((route, index) => {
            const Component = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={<Component />}
              />
            );
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DatasetProvider>
  );
};

export default App;
