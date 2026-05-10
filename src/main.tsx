import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { DataProvider } from './context/DataContext';
import App from './App';
import './admin.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
