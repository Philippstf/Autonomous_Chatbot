import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const pageConfig = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Platform Overview & Analytics',
    emoji: '📊'
  },
  '/create': {
    title: 'Create Chatbot',
    subtitle: 'Build Your AI Assistant',
    emoji: '🤖'
  },
  '/chatbots': {
    title: 'My Chatbots',
    subtitle: 'Manage Your AI Assistants',
    emoji: '🚀'
  },
  '/analytics': {
    title: 'Analytics',
    subtitle: 'Performance Insights & Metrics',
    emoji: '📈'
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Platform Configuration',
    emoji: '⚙️'
  },
  '/help': {
    title: 'Help & Support',
    subtitle: 'Documentation & Resources',
    emoji: '❓'
  },
};

function Header({ onSidebarToggle, sidebarOpen, isMobile }) {
  const location = useLocation();
  
  // Get current page config or default
  const currentPage = pageConfig[location.pathname] || {
    title: 'Chatbot Platform',
    subtitle: 'Professional AI Assistant Platform',
    emoji: '🚀'
  };

  // Extract chatbot ID from dynamic routes
  const chatbotMatch = location.pathname.match(/\/chatbot\/(.+)/);
  if (chatbotMatch) {
    currentPage.title = 'Chatbot Chat';
    currentPage.subtitle = `Chat with AI Assistant`;
    currentPage.emoji = '💬';
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onSidebarToggle}
            edge="start"
            sx={{
              mr: 2,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(31, 58, 147, 0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {/* Page Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ flex: 1 }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            ml: isMobile ? 0 : 0
          }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
              }}
            >
              {currentPage.emoji}
            </Typography>
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight={700}
                color="text.primary"
                sx={{
                  background: 'linear-gradient(135deg, #1f3a93, #34495e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.25rem', sm: '2rem' },
                }}
              >
                {currentPage.title}
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "subtitle1"}
                color="text.secondary"
                sx={{ 
                  mt: 0.5,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {currentPage.subtitle}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Right Section - Status & User */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Status Chip */}
            <Chip
              label="System Online"
              color="success"
              size="small"
              sx={{
                fontWeight: 600,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                },
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Theme Toggle">
                <IconButton
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(31, 58, 147, 0.1)',
                    },
                  }}
                >
                  <Brightness4Icon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(31, 58, 147, 0.1)',
                    },
                  }}
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(31, 58, 147, 0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background: 'linear-gradient(135deg, #1f3a93, #34495e)',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;