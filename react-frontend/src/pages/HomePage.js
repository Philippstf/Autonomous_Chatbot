import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  SmartToy as SmartToyIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAllChatbots, getAnalyticsOverview, healthCheck } from '../services/api';

function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch data using React Query
  const {
    data: chatbotsData,
    isLoading: chatbotsLoading,
    error: chatbotsError,
    refetch: refetchChatbots,
  } = useQuery('chatbots', getAllChatbots, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery('analytics', getAnalyticsOverview, {
    refetchInterval: 60000, // Refetch every minute
  });

  const {
    data: healthData,
    isLoading: healthLoading,
  } = useQuery('health', healthCheck, {
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const handleRefresh = () => {
    refetchChatbots();
    refetchAnalytics();
  };

  const QuickActionCard = ({ title, description, icon, action, color = 'primary' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 32px rgba(31, 58, 147, 0.2)`,
            transform: 'translateY(-2px)',
          },
        }}
        onClick={action}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color === 'primary' ? '#1f3a93, #34495e' : '#e74c3c, #c0392b'})`,
              mb: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StatCard = ({ title, value, change, icon, loading = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {value}
              </Typography>
            )}
            {change && !loading && (
              <Chip
                label={change}
                size="small"
                color={change.startsWith('+') ? 'success' : 'error'}
                sx={{ mt: 1, fontSize: '0.7rem' }}
              />
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(31, 58, 147, 0.1)',
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1f3a93, #34495e, #e74c3c)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Welcome to Your Chatbot Platform 🚀
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Create, manage, and deploy AI assistants with advanced business features
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Create New Chatbot
              </Button>
              {healthData && (
                <Chip
                  label={`System Status: ${healthData.status}`}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Error Alerts */}
      {(chatbotsError || analyticsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            severity="error"
            action={
              <IconButton color="inherit" size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            }
            sx={{ mb: 3 }}
          >
            {chatbotsError?.message || analyticsError?.message || 'Failed to load data'}
          </Alert>
        </motion.div>
      )}

      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Chatbots"
              value={chatbotsData?.total || 0}
              icon={<SmartToyIcon />}
              loading={chatbotsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Chatbots"
              value={chatbotsData?.active || 0}
              icon={<SpeedIcon />}
              loading={chatbotsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Conversations"
              value={analyticsData?.total_conversations || 0}
              change="+12%"
              icon={<ChatIcon />}
              loading={analyticsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Documents Processed"
              value={analyticsData?.total_documents || 0}
              icon={<TrendingUpIcon />}
              loading={analyticsLoading}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="Create New Chatbot"
              description="Build a new AI assistant with our step-by-step wizard"
              icon={<AddIcon sx={{ color: 'white', fontSize: 28 }} />}
              action={() => navigate('/create')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="Manage Chatbots"
              description="View, edit, and configure your existing chatbots"
              icon={<SmartToyIcon sx={{ color: 'white', fontSize: 28 }} />}
              action={() => navigate('/chatbots')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="View Analytics"
              description="Monitor performance and engagement metrics"
              icon={<TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />}
              action={() => navigate('/analytics')}
              color="accent"
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Recent Chatbots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Recent Chatbots
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/chatbots')}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        {chatbotsLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={4} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={40} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : chatbotsData?.chatbots?.length > 0 ? (
          <Grid container spacing={3}>
            {chatbotsData.chatbots.slice(0, 3).map((chatbot) => (
              <Grid item xs={12} md={4} key={chatbot.config.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 32px rgba(31, 58, 147, 0.2)',
                      },
                    }}
                    onClick={() => navigate(`/chatbot/${chatbot.config.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        🤖 {chatbot.config.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {chatbot.config.description || 'No description provided'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={chatbot.runtime_status?.loaded ? 'Active' : 'Inactive'}
                          color={chatbot.runtime_status?.loaded ? 'success' : 'default'}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(chatbot.config.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No chatbots created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by creating your first AI assistant
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create')}
              >
                Create Your First Chatbot
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </Box>
  );
}

export default HomePage;