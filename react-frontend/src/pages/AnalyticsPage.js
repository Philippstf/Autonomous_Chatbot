import React from 'react';
import { useQuery } from 'react-query';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  SmartToy as SmartToyIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { chatbotRegistryService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

function AnalyticsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  // Get user's chatbots to calculate analytics
  const {
    data: chatbotsData,
    isLoading: chatbotsLoading,
    error: chatbotsError,
  } = useQuery(
    ['chatbots', user?.uid], 
    () => user ? chatbotRegistryService.getChatbotsByUser(user.uid) : Promise.resolve([]),
    {
      enabled: !!user,
    }
  );

  // Calculate analytics from chatbots data
  const analyticsData = React.useMemo(() => {
    if (!chatbotsData) return null;
    
    return {
      totalChatbots: chatbotsData.length,
      activeChatbots: chatbotsData.filter(bot => bot.status === 'active').length,
      totalDocuments: chatbotsData.reduce((sum, bot) => sum + (bot.documentCount || 0), 0),
      totalChunks: chatbotsData.reduce((sum, bot) => sum + (bot.totalChunks || 0), 0),
      avgResponseTime: '1.2s', // Placeholder
      totalMessages: 0, // Placeholder - would need to query messages collection
    };
  }, [chatbotsData]);

  const analyticsLoading = chatbotsLoading;
  const analyticsError = chatbotsError;

  const MetricCard = ({ title, value, change, icon, color = 'primary', loading = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={40} />
            ) : (
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight={700} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
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
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: '50%',
              background: color === 'primary' 
                ? 'rgba(31, 58, 147, 0.1)' 
                : color === 'secondary'
                  ? 'rgba(52, 73, 94, 0.1)'
                  : 'rgba(231, 76, 60, 0.1)',
              color: color === 'primary' 
                ? 'primary.main'
                : color === 'secondary'
                  ? 'secondary.main'
                  : '#e74c3c',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ChatbotPerformanceCard = ({ chatbot }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            🤖 {chatbot.config?.name || chatbot.name || 'Unbenannter Chatbot'}
          </Typography>
          <Chip
            label={chatbot.status === 'active' ? 'Aktiv' : 'Inaktiv'}
            color={chatbot.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Dokumente verarbeitet
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {chatbot.documentCount || 0}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Text-Chunks
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {chatbot.totalChunks || 0}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Erstellt: {chatbot.created_at ? new Date(chatbot.created_at.seconds ? chatbot.created_at.seconds * 1000 : chatbot.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Monitor your chatbot performance and engagement metrics
        </Typography>
      </motion.div>

      {/* Error Alerts */}
      {(analyticsError || chatbotsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load analytics data: {analyticsError?.message || chatbotsError?.message}
          </Alert>
        </motion.div>
      )}

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Platform Overview
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Gesamt Chatbots"
              value={analyticsData?.totalChatbots || 0}
              icon={<SmartToyIcon />}
              loading={analyticsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Aktive Chatbots"
              value={analyticsData?.activeChatbots || 0}
              icon={<SpeedIcon />}
              color="secondary"
              loading={analyticsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Dokumente"
              value={analyticsData?.totalDocuments || 0}
              icon={<DescriptionIcon />}
              loading={analyticsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Text-Chunks"
              value={analyticsData?.totalChunks || 0}
              icon={<ChatIcon />}
              color="accent"
              loading={analyticsLoading}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Performance Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          System Performance
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Response Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    1.2s
                  </Typography>
                  <Chip label="Excellent" color="success" size="small" />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={85}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'success.main',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Average response time across all chatbots
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Uptime
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    99.9%
                  </Typography>
                  <Chip label="Stable" color="success" size="small" />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={99.9}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'success.main',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Platform availability in the last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Chatbot Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Individual Chatbot Performance
        </Typography>
        
        {chatbotsLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="50%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : chatbotsData?.chatbots?.length > 0 ? (
          <Grid container spacing={3}>
            {chatbotsData.chatbots.map((chatbot) => (
              <Grid item xs={12} md={6} lg={4} key={chatbot.config.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatbotPerformanceCard chatbot={chatbot} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No chatbots available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first chatbot to see performance metrics
              </Typography>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Usage Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3, mt: 4 }}>
          Usage Insights
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Active Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Document Processing</Typography>
                    <Chip label="95%" color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Website Integration</Typography>
                    <Chip label="78%" color="secondary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Custom Branding</Typography>
                    <Chip label="65%" color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Contact Management</Typography>
                    <Chip label="42%" color="warning" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Usage
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Storage Used
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={45}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      2.3 GB of 5 GB
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      API Calls (Monthly)
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={67}
                      sx={{ height: 6, borderRadius: 3 }}
                      color="secondary"
                    />
                    <Typography variant="caption" color="text.secondary">
                      6,700 of 10,000 calls
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}

export default AnalyticsPage;