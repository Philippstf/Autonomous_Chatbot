import React, { useState, useEffect } from 'react';
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
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const pageConfig = {
  '/': {
    title: 'Mission Control',
    subtitle: 'AI Operations Dashboard',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bgPattern: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)'
  },
  '/create': {
    title: 'Neural Forge',
    subtitle: 'Build Next-Gen AI Assistants',
    emoji: '🧠',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%)'
  },
  '/chatbots': {
    title: 'AI Arsenal',
    subtitle: 'Manage Your Digital Workforce',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    bgPattern: 'radial-gradient(circle at 60% 80%, rgba(79, 172, 254, 0.3) 0%, transparent 50%)'
  },
  '/analytics': {
    title: 'Data Nexus',
    subtitle: 'Advanced Intelligence Metrics',
    emoji: '📊',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    bgPattern: 'radial-gradient(circle at 40% 40%, rgba(67, 233, 123, 0.3) 0%, transparent 50%)'
  },
  '/settings': {
    title: 'Command Center',
    subtitle: 'System Configuration',
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    bgPattern: 'radial-gradient(circle at 70% 30%, rgba(250, 112, 154, 0.3) 0%, transparent 50%)'
  },
  '/help': {
    title: 'Knowledge Base',
    subtitle: 'Documentation & Resources',
    emoji: '📚',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(168, 237, 234, 0.3) 0%, transparent 50%)'
  },
};

const SystemStatusChip = ({ status = 'online' }) => {
  const theme = useTheme();
  const statusConfig = {
    online: {
      label: 'NEURAL NET ACTIVE',
      color: '#00ff88',
      icon: '🟢',
      pulse: true
    },
    warning: {
      label: 'SYSTEM ALERT',
      color: '#ffaa00',
      icon: '🟡',
      pulse: true
    },
    error: {
      label: 'SYSTEM ERROR',
      color: '#ff4444',
      icon: '🔴',
      pulse: true
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Chip
        label={config.label}
        size="small"
        sx={{
          background: `linear-gradient(135deg, ${alpha(config.color, 0.2)}, ${alpha(config.color, 0.1)})`,
          border: `1px solid ${alpha(config.color, 0.3)}`,
          color: config.color,
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.5px',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          backdropFilter: 'blur(10px)',
          animation: config.pulse ? 'statusPulse 2s infinite' : 'none',
          '@keyframes statusPulse': {
            '0%': { 
              boxShadow: `0 0 0 0 ${alpha(config.color, 0.4)}`,
              transform: 'scale(1)'
            },
            '50%': { 
              boxShadow: `0 0 0 4px ${alpha(config.color, 0.1)}`,
              transform: 'scale(1.02)'
            },
            '100%': { 
              boxShadow: `0 0 0 0 ${alpha(config.color, 0)}`,
              transform: 'scale(1)'
            },
          },
          '&::before': {
            content: `"${config.icon}"`,
            marginRight: '4px',
            fontSize: '8px'
          }
        }}
      />
    </motion.div>
  );
};

// Removed StatusIndicators component - technical metrics not suitable for user application

function Header({ onSidebarToggle, sidebarOpen, isMobile, darkMode, onThemeToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(3);
  
  // Get current page config or default
  const currentPage = pageConfig[location.pathname] || {
    title: 'HelferLain',
    subtitle: 'AI Assistant Platform',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)'
  };

  // Extract chatbot ID from dynamic routes
  const chatbotMatch = location.pathname.match(/\/chatbot\/(.+)/);
  if (chatbotMatch) {
    currentPage.title = 'Neural Interface';
    currentPage.subtitle = `AI Communication Portal`;
    currentPage.emoji = '💬';
    currentPage.gradient = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
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
    if (!user) return 'AI';
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
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: currentPage.bgPattern,
          opacity: 0.6,
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(20px) saturate(120%)',
          background: alpha(theme.palette.background.paper, 0.8),
          zIndex: -1,
        }
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: 2,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onSidebarToggle}
              edge="start"
              sx={{
                mr: 2,
                color: 'text.primary',
                background: alpha(theme.palette.primary.main, 0.1),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.2),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </motion.div>
        )}

        {/* Page Title Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{ flex: 1 }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            ml: isMobile ? 0 : 0
          }}>
            {/* Futuristic Emoji with Glow */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.5rem' },
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))',
                  background: currentPage.gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {currentPage.emoji}
              </Typography>
            </motion.div>

            <Box>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  fontWeight={900}
                  sx={{
                    background: currentPage.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.5rem', sm: '2.2rem' },
                    fontFamily: '"Space Grotesk", "Inter", sans-serif',
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 30px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {currentPage.title}
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Typography
                  variant={isMobile ? "body2" : "subtitle1"}
                  color="text.secondary"
                  sx={{ 
                    mt: 0.5,
                    display: { xs: 'none', sm: 'block' },
                    fontWeight: 500,
                    fontFamily: '"Space Grotesk", sans-serif',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem'
                  }}
                >
                  {currentPage.subtitle}
                </Typography>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

        {/* Right Section - Metrics, Status & User */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Status Chip */}
            <SystemStatusChip status="online" />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton
                    onClick={onThemeToggle}
                    sx={{
                      color: 'text.secondary',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      '&:hover': {
                        color: 'primary.main',
                        background: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </motion.div>
              </Tooltip>

              <Tooltip title="System Notifications">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton
                    sx={{
                      color: 'text.secondary',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      '&:hover': {
                        color: 'primary.main',
                        background: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    <Badge badgeContent={notifications} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </motion.div>
              </Tooltip>

              <Tooltip title="User Account">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      p: 0.5,
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: currentPage.gradient,
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  </IconButton>
                </motion.div>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>
      </Toolbar>
      
      {/* User Menu */}
      <AnimatePresence>
        {Boolean(anchorEl) && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(20px) saturate(120%)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                mt: 1.5,
                minWidth: 220,
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  }
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  transform: 'translateY(-50%) rotate(45deg)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderBottom: 'none',
                  borderRight: 'none',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => {}} sx={{ mb: 1 }}>
              <ListItemIcon>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: currentPage.gradient,
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={600}>
                  {user?.displayName || user?.email?.split('@')[0] || 'Neural User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </ListItemText>
            </MenuItem>
            
            <Divider sx={{ mx: 1, mb: 1 }} />
            
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>System Preferences</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Disconnect</ListItemText>
            </MenuItem>
          </Menu>
        )}
      </AnimatePresence>
    </AppBar>
  );
}

export default Header;