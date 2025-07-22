import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }}
      >
        <CircularProgress size={40} sx={{ color: '#1e3a8a', mb: 2 }} />
        <Typography color="text.secondary">
          Authentifizierung wird überprüft...
        </Typography>
      </Box>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <Outlet />;
};

export default ProtectedRoute;