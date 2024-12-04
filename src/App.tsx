import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/properties/Properties';
import { PropertyForm } from './pages/properties/PropertyForm';
import { Keys } from './pages/keys/Keys';
import { KeyForm } from './pages/keys/KeyForm';
import { Suppliers } from './pages/suppliers/Suppliers';
import { SupplierForm } from './pages/suppliers/SupplierForm';
import { Alerts } from './pages/alerts/Alerts';
import { AlertForm } from './pages/alerts/AlertForm';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider, useAuth } from './lib/auth';
import './lib/firebase';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002DB3]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="properties">
                <Route index element={<Properties />} />
                <Route path="new" element={<PropertyForm />} />
                <Route path=":id/edit" element={<PropertyForm />} />
              </Route>
              <Route path="keys">
                <Route index element={<Keys />} />
                <Route path="new" element={<KeyForm />} />
                <Route path=":id/edit" element={<KeyForm />} />
              </Route>
              <Route path="suppliers">
                <Route index element={<Suppliers />} />
                <Route path="new" element={<SupplierForm />} />
                <Route path=":id/edit" element={<SupplierForm />} />
              </Route>
              <Route path="alerts">
                <Route index element={<Alerts />} />
                <Route path="new" element={<AlertForm />} />
                <Route path=":id/edit" element={<AlertForm />} />
              </Route>
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}