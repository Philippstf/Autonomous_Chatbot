import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

// Import pages
import HomePage from './pages/HomePage';
import CreateChatbotPage from './pages/CreateChatbotPage';
import ChatbotListPage from './pages/ChatbotListPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Import components
import Navigation from './components/Navigation';
import Header from './components/Header';

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
        color: 'text.primary',
      }}
    >
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          marginLeft: { xs: 0, md: '240px' },
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateChatbotPage />} />
              <Route path="/chatbots" element={<ChatbotListPage />} />
              <Route path="/chatbot/:id" element={<ChatbotPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

export default App;