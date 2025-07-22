import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CreateChatbotPage from './pages/CreateChatbotPage';
import ChatbotListPage from './pages/ChatbotListPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeadManagementPage from './pages/LeadManagementPage';
import PrivacyPage from './pages/PrivacyPage';
import ImpressumPage from './pages/ImpressumPage';
import ContactPage from './pages/ContactPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Import components
import Navigation from './components/Navigation';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();

  // Check if we're on a public page (landing, auth, or legal pages)
  const isPublicPage = ['/', '/auth', '/privacy', '/impressum', '/contact', '/terms'].includes(location.pathname);

  // Automatically close sidebar on mobile, open on desktop
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <Box sx={{ minHeight: '100vh' }}>
        {/* Public pages (Landing, Auth & Legal) - no sidebar/header */}
        {isPublicPage ? (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
          </Routes>
        ) : (
          /* Protected app layout with sidebar/header */
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
              color: 'text.primary',
            }}
          >
            {/* Navigation */}
            <Navigation 
              open={sidebarOpen} 
              onToggle={handleSidebarToggle}
              isMobile={isMobile}
            />
            
            {/* Main Content */}
            <Box
              component="main"
              sx={{
                marginLeft: {
                  xs: 0,
                  md: sidebarOpen ? '240px' : '0px'
                },
                minHeight: '100vh',
                transition: 'margin-left 0.3s ease',
              }}
            >
              {/* Header */}
              <Header 
                onSidebarToggle={handleSidebarToggle}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
              />
              
              {/* Page Content */}
              <Box sx={{ p: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Routes>
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/create" element={<CreateChatbotPage />} />
                      <Route path="/chatbots" element={<ChatbotListPage />} />
                      <Route path="/chatbot/:id" element={<ChatbotPage />} />
                      <Route path="/leads" element={<LeadManagementPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                    </Route>
                  </Routes>
                </motion.div>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </AuthProvider>
  );
}

export default App;