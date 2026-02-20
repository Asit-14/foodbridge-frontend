import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import router from './routes';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-center"
            containerStyle={{ top: 12 }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 16px',
                maxWidth: '92vw',
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
