import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@kaam25/ui';
import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
