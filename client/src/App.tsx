import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { ColorModeProvider } from './context/ColorModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrackStatus from './pages/TrackStatus';
import AgileBoard from './pages/AgileBoard';
import AdminPage from './pages/AdminPage';
import AdminConsolePage from './pages/AdminConsolePage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="track" element={<TrackStatus />} />
        <Route path="agile" element={<AgileBoard />} />
        <Route path="admin/:id" element={<AdminPage />}>
          <Route path="console/:consoleId" element={<AdminConsolePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ColorModeProvider>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <AdminProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AdminProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ColorModeProvider>
  );
};

export default App;
