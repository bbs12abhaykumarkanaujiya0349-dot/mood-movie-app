import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <LibraryProvider>
            {/* Toast Notification Provider with Dark Theme Styling */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#121520',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  fontSize: '13px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                },
                success: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#ffffff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff'
                  }
                }
              }}
            />

            {/* Main Application Routes */}
            <AppRoutes />
          </LibraryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
