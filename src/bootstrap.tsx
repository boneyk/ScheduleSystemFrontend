import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { theme } from 'styles';

import { queryClient } from './api/queries';
import './index.css';
import Navigation from './navigation/Navigation';
import { setupTelemetry } from './telemetry';
import { timetableStore } from '@/stores/timetable.store';

try {
  setupTelemetry();
} catch (error) {
  console.error('Ошибка трассировки', error);
}

dayjs.locale('ru');

export const StoresContext = React.createContext({
  timetableStore
});

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoresContext.Provider value={{ timetableStore }}>
          <Navigation />
        </StoresContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);
