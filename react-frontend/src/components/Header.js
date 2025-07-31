import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/auth?mode=login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/settings');
    handleMenuClose();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.displayName || user.email;
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return 'U';
  };

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

              <Tooltip title="Konto">
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
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
                      cursor: 'pointer',
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>
      </Toolbar>
      
      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #1f3a93, #34495e)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={600}>
              {user?.displayName || user?.email?.split('@')[0] || 'Benutzer'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Einstellungen</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Abmelden</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Header;