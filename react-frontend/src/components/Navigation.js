import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  IconButton,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  SmartToy as SmartToyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    description: 'Overview & Analytics'
  },
  {
    text: 'Create Chatbot',
    icon: <AddIcon />,
    path: '/create',
    description: 'New AI Assistant'
  },
  {
    text: 'My Chatbots',
    icon: <SmartToyIcon />,
    path: '/chatbots',
    description: 'Manage Bots'
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    description: 'Performance Insights'
  },
];

const bottomNavigationItems = [
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    description: 'Platform Config'
  },
  {
    text: 'Help & Support',
    icon: <HelpIcon />,
    path: '/help',
    description: 'Documentation'
  },
];

function Navigation({ open, onToggle, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { signOut, user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const renderNavigationItem = (item, index) => (
    <motion.div
      key={item.path}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          selected={isActivePath(item.path)}
          sx={{
            borderRadius: 2,
            mx: 1,
            '&.Mui-selected': {
              backgroundColor: 'rgba(31, 58, 147, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(31, 58, 147, 0.3)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActivePath(item.path) ? 'primary.main' : 'text.secondary',
              minWidth: 40,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                fontWeight={isActivePath(item.path) ? 600 : 400}
                color={isActivePath(item.path) ? 'primary.main' : 'text.primary'}
              >
                {item.text}
              </Typography>
            }
            secondary={
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                {item.description}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
    </motion.div>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={onToggle}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #171924 0%, #1f2937 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1f3a93, #34495e)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <IconButton
            onClick={onToggle}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            🚀 Chatbot
          </Typography>
          <Typography variant="subtitle2" opacity={0.9}>
            Professional Platform
          </Typography>
        </motion.div>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List>
          {navigationItems.map((item, index) => renderNavigationItem(item, index))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bottom Navigation */}
      <Box sx={{ py: 2 }}>
        <List>
          {bottomNavigationItems.map((item, index) => 
            renderNavigationItem(item, navigationItems.length + index)
          )}
        </List>
        
        {/* User Info & Logout */}
        <Box sx={{ px: 2, mt: 2 }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            mb: 1,
            fontSize: '0.8rem'
          }}>
            Angemeldet als:
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'white', 
            mb: 2,
            fontWeight: 500,
            fontSize: '0.9rem'
          }}>
            {user?.email}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.8rem',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Abmelden
          </Button>
        </Box>
      </Box>

      {/* Version Info */}
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Platform v2.0.0
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          React + FastAPI
        </Typography>
      </Box>
    </Drawer>
  );
}

export default Navigation;