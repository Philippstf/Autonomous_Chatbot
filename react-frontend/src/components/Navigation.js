import React, { useState, useEffect } from 'react';
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
  Badge,
  Chip,
  alpha,
  Avatar,
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
  Email as EmailIcon,
  RocketLaunch as RocketIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const navigationItems = [
  {
    text: 'Mission Control',
    icon: <RocketIcon />,
    path: '/dashboard',
    description: 'Operations Dashboard',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    badge: null,
    isNew: false
  },
  {
    text: 'Neural Forge',
    icon: <PsychologyIcon />,
    path: '/create',
    description: 'Create AI Assistant',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    badge: null,
    isNew: false
  },
  {
    text: 'AI Arsenal',
    icon: <SmartToyIcon />,
    path: '/chatbots',
    description: 'Manage AI Workforce',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    badge: 'active',
    isNew: false
  },
  {
    text: 'Data Nexus',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    description: 'Intelligence Metrics',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    badge: null,
    isNew: false
  },
  {
    text: 'Lead Matrix',
    icon: <EmailIcon />,
    path: '/leads',
    description: 'Contact Intelligence',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    badge: 3,
    isNew: true
  },
];

const bottomNavigationItems = [
  {
    text: 'Command Center',
    icon: <SettingsIcon />,
    path: '/settings',
    description: 'System Configuration',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    badge: null,
    isNew: false
  },
  {
    text: 'Knowledge Base',
    icon: <HelpIcon />,
    path: '/help',
    description: 'Documentation Hub',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    badge: null,
    isNew: false
  },
];

// Removed SystemStats component - technical metrics not suitable for user application

function Navigation({ open, onToggle, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { signOut, user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
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

  const renderNavigationItem = (item, index) => (
    <motion.div
      key={item.path}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      <ListItem disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          selected={isActivePath(item.path)}
          sx={{
            borderRadius: 2,
            mx: 2,
            py: 1.5,
            background: isActivePath(item.path) 
              ? `linear-gradient(135deg, ${alpha('#fff', 0.15)}, ${alpha('#fff', 0.05)})` 
              : 'transparent',
            border: isActivePath(item.path) 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid transparent',
            backdropFilter: isActivePath(item.path) ? 'blur(10px)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isActivePath(item.path) ? item.gradient : 'transparent',
              opacity: isActivePath(item.path) ? 0.1 : 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha('#fff', 0.1)}, ${alpha('#fff', 0.03)})`,
              transform: 'translateX(4px)',
              '&::before': {
                opacity: 0.15,
                background: item.gradient,
              }
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ListItemIcon
            sx={{
              color: isActivePath(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              minWidth: 48,
              '& svg': {
                fontSize: '1.4rem',
                filter: isActivePath(item.path) 
                  ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                  : 'none'
              }
            }}
          >
            {item.badge && (
              <Badge 
                badgeContent={item.badge} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    height: 16,
                    minWidth: 16
                  }
                }}
              >
                {item.icon}
              </Badge>
            )}
            {!item.badge && item.icon}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={isActivePath(item.path) ? 700 : 500}
                  sx={{
                    color: isActivePath(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: '0.9rem',
                    letterSpacing: '0.3px'
                  }}
                >
                  {item.text}
                </Typography>
                {item.isNew && (
                  <Chip 
                    label="NEW" 
                    size="small"
                    sx={{ 
                      height: 16,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
                      color: '#000',
                      '& .MuiChip-label': {
                        px: 0.5
                      }
                    }}
                  />
                )}
              </Box>
            }
            secondary={
              <Typography
                variant="caption"
                sx={{
                  color: isActivePath(item.path) 
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.7rem',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {item.description}
              </Typography>
            }
          />
          
          {/* Active indicator */}
          {isActivePath(item.path) && (
            <Box
              sx={{
                position: 'absolute',
                right: 8,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
              }}
            />
          )}
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
        keepMounted: true,
      }}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, rgba(240, 147, 251, 0.05) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }
        },
      }}
    >
      {/* Header with Glassmorphism */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(139, 92, 246, 0.1))',
          backdropFilter: 'blur(20px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              onClick={onToggle}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: 'white',
                background: alpha('#fff', 0.1),
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: alpha('#fff', 0.2),
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </motion.div>
        )}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ marginRight: '12px' }}
            >
              <Typography variant="h4">🚀</Typography>
            </motion.div>
            <Typography 
              variant="h5" 
              fontWeight={900}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Space Grotesk", sans-serif',
                letterSpacing: '-0.02em'
              }}
            >
              HELFERLAIN
            </Typography>
          </Box>
          
          <Typography 
            variant="subtitle2" 
            sx={{
              opacity: 0.9,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.7rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            Neural Network Platform
          </Typography>
          
          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1
          }}>
            <Chip
              label="AI ACTIVE"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: '#00ff88',
                fontWeight: 700,
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                animation: 'pulse 2s infinite',
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* Removed System Stats - technical metrics not suitable for user application */}

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, py: 1, position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            px: 3, 
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 700,
            fontSize: '0.7rem'
          }}
        >
          Core Systems
        </Typography>
        <List sx={{ mt: 1 }}>
          {navigationItems.map((item, index) => renderNavigationItem(item, index))}
        </List>
      </Box>

      <Divider sx={{ 
        borderColor: 'rgba(255, 255, 255, 0.1)',
        mx: 2,
        '&::before': {
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
        }
      }} />

      {/* Bottom Navigation */}
      <Box sx={{ py: 2, position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            px: 3, 
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 700,
            fontSize: '0.7rem'
          }}
        >
          Control Panel
        </Typography>
        <List sx={{ mt: 1 }}>
          {bottomNavigationItems.map((item, index) => 
            renderNavigationItem(item, navigationItems.length + index)
          )}
        </List>
      </Box>

      {/* User Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Box sx={{ 
          mx: 2, 
          mb: 2, 
          p: 2, 
          background: alpha('#000', 0.3),
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'monospace',
                mr: 1.5
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ 
                color: 'white', 
                fontWeight: 600,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.displayName || user?.email?.split('@')[0] || 'Neural User'}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.7rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&:hover': {
                borderColor: '#ff4757',
                backgroundColor: alpha('#ff4757', 0.1),
                color: '#ff4757',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(255, 71, 87, 0.2)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Disconnect
          </Button>
        </Box>
      </motion.div>

      {/* Version Info */}
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: alpha('#000', 0.2),
        }}
      >
        <Typography variant="caption" sx={{ 
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
          fontSize: '0.7rem'
        }}>
          Neural Platform v3.0.1
        </Typography>
        <br />
        <Typography variant="caption" sx={{ 
          color: 'rgba(255, 255, 255, 0.3)',
          fontFamily: 'monospace',
          fontSize: '0.6rem'
        }}>
          Next-Gen AI Architecture
        </Typography>
      </Box>
    </Drawer>
  );
}

export default Navigation;