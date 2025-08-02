import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  CardActions,
  Chip,
  Avatar,
  alpha,
  LinearProgress
} from '@mui/material';
import { 
  SmartToy, 
  Analytics, 
  Add,
  TrendingUp,
  ChatBubbleOutline,
  PeopleAlt,
  Chat,
  Settings,
  Visibility,
  RocketLaunch,
  Psychology,
  Speed,
  Security,
  AutoAwesome,
  Timeline,
  Memory,
  CloudQueue,
  FlashOn
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import api from '../services/api';
import { chatbotRegistryService } from '../services/firebaseService';
import { authService } from '../services/authService';

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    totalChatbots: 0,
    totalConversations: 0,
    totalDocuments: 0,
    activeChatbots: 0
  });
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) {
        setError('Bitte melden Sie sich an, um das Dashboard zu sehen.');
        return;
      }
      
      // Create user profile if it doesn't exist (with token refresh)
      try {
        await user.reload();
        await user.getIdToken(true); // Force token refresh
        await authService.createUserProfile(user);
      } catch (profileError) {
        console.warn('Profile creation failed:', profileError);
        // Continue anyway - profile is not critical for dashboard
      }
      
      // Fetch user's chatbots from Firebase
      const chatbots = await chatbotRegistryService.getChatbotsByUser(user.uid);
      
      setStats({
        totalChatbots: chatbots.length,
        totalConversations: 0, // TODO: Calculate from conversations
        totalDocuments: chatbots.reduce((sum, bot) => sum + (bot.documentCount || 0), 0),
        activeChatbots: chatbots.filter(bot => bot.status === 'active').length
      });
      
      // Set recent chatbots (last 3)
      setChatbots(chatbots.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Dashboard-Daten konnten nicht geladen werden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const NeuralBotCard = ({ chatbot }) => {
    const isActive = chatbot.runtime_status?.loaded;
    const gradient = isActive 
      ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    return (
      <motion.div
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          boxShadow: `0 20px 40px ${alpha(isActive ? '#43e97b' : '#667eea', 0.3)}` 
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Card sx={{ 
          height: '100%',
          background: alpha('#fff', 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isActive ? '#43e97b' : '#667eea', 0.2)}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: gradient,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  position: 'relative',
                  boxShadow: `0 8px 32px ${alpha(isActive ? '#43e97b' : '#667eea', 0.3)}`,
                }}
              >
                <Psychology sx={{ color: 'white', fontSize: 28 }} />
                {isActive && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#00ff88',
                      top: 4,
                      right: 4,
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </Box>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  fontFamily: '"Space Grotesk", sans-serif',
                  background: gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {chatbot.config.name}
                </Typography>
                <Chip 
                  label={isActive ? "NEURAL ACTIVE" : "OFFLINE"}
                  size="small"
                  sx={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))'
                      : alpha('#666', 0.1),
                    border: `1px solid ${isActive ? 'rgba(0, 255, 136, 0.3)' : alpha('#666', 0.2)}`,
                    color: isActive ? '#00ff88' : '#666',
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    fontFamily: 'monospace',
                    animation: isActive ? 'pulse 2s infinite' : 'none',
                  }}
                />
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {chatbot.config.description || 'Advanced AI Neural Network'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Created: {new Date(chatbot.created_at).toLocaleDateString('de-DE')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Memory sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  v3.0
                </Typography>
              </Box>
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
            <Button 
              size="small" 
              startIcon={<Chat />}
              onClick={() => navigate(`/chatbot/${chatbot.config.id}`)}
              sx={{ 
                background: gradient,
                color: 'white',
                fontWeight: 600,
                px: 2,
                '&:hover': {
                  background: gradient,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 16px ${alpha(isActive ? '#43e97b' : '#667eea', 0.3)}`,
                }
              }}
            >
              Interface
            </Button>
            <Button 
              size="small" 
              startIcon={<Settings />}
              onClick={() => navigate(`/chatbots`)}
              variant="outlined"
              sx={{ 
                borderColor: alpha('#000', 0.2),
                color: 'text.primary',
                '&:hover': {
                  borderColor: isActive ? '#43e97b' : '#667eea',
                  background: alpha(isActive ? '#43e97b' : '#667eea', 0.1),
                  color: isActive ? '#43e97b' : '#667eea',
                }
              }}
            >
              Configure
            </Button>
          </CardActions>
        </Card>
      </motion.div>
    );
  };

  const MetricsCard = ({ title, value, icon, gradient, description, trend, onClick }) => (
    <motion.div
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: `0 20px 40px ${alpha(gradient.split(' ')[3], 0.3)}` 
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          background: alpha('#fff', 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(gradient.split(' ')[3], 0.2)}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: gradient,
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 3,
            background: gradient,
            mb: 3,
            position: 'relative',
            boxShadow: `0 8px 32px ${alpha(gradient.split(' ')[3], 0.3)}`,
          }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: '2.2rem', color: 'white' } 
            })}
            {trend && (
              <motion.div
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: trend > 0 ? '#00ff88' : '#ff4757',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>
                  {trend > 0 ? '↗' : '↘'}
                </Typography>
              </motion.div>
            )}
          </Box>
          
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            background: gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            fontFamily: '"Space Grotesk", sans-serif',
          }}>
            {loading ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ---
              </motion.div>
            ) : value}
          </Typography>
          
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
            fontFamily: '"Space Grotesk", sans-serif',
          }}>
            {title}
          </Typography>
          
          {description && (
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}>
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const ActionPortal = ({ title, description, icon, onClick, gradient, emoji }) => (
    <motion.div
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: `0 20px 40px ${alpha(gradient.split(' ')[3], 0.4)}` 
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          background: gradient,
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Typography variant="h2" sx={{ mb: 2, filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))' }}>
              {emoji}
            </Typography>
          </motion.div>
          
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            mb: 2,
            fontFamily: '"Space Grotesk", sans-serif',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
          }}>
            {title}
          </Typography>
          
          <Typography variant="body1" sx={{ 
            opacity: 0.9,
            fontWeight: 500,
            lineHeight: 1.6,
          }}>
            {description}
          </Typography>
          
          <Box sx={{ 
            mt: 3,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1
          }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: '1.2rem', opacity: 0.8 } 
            })}
            <Typography variant="caption" sx={{ 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
              opacity: 0.8
            }}>
              Initialize
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(67, 233, 123, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RocketLaunch sx={{ fontSize: 64, color: 'white', mb: 2 }} />
          </motion.div>
          <Typography variant="h5" sx={{ 
            color: 'white', 
            fontWeight: 700,
            fontFamily: '"Space Grotesk", sans-serif',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}>
            Initializing Mission Control...
          </Typography>
          <LinearProgress 
            sx={{ 
              mt: 3, 
              width: 200, 
              height: 4,
              borderRadius: 2,
              backgroundColor: alpha('#fff', 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ff88',
                borderRadius: 2,
              }
            }} 
          />
        </motion.div>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Neural Command Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 6, textAlign: 'center' }}>
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
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              <Typography variant="h1" sx={{ 
                fontSize: '4rem',
                filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.6))'
              }}>
                🚀
              </Typography>
            </motion.div>
            
            <Typography variant="h2" sx={{ 
              fontWeight: 900, 
              color: 'white',
              mb: 2,
              fontFamily: '"Space Grotesk", sans-serif',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
              letterSpacing: '-0.02em'
            }}>
              Mission Control
            </Typography>
            
            <Typography variant="h5" sx={{ 
              color: alpha('#fff', 0.9),
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              mb: 1
            }}>
              Welcome back, Commander {user?.displayName || user?.email?.split('@')[0] || 'Neural'}
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: alpha('#fff', 0.7),
              fontSize: '1.1rem',
              fontWeight: 400
            }}>
              Neural Network Operations Center - Manage Your AI Fleet
            </Typography>
          </Box>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                background: alpha('#ff4757', 0.1),
                border: '1px solid rgba(255, 71, 87, 0.3)',
                color: '#ff4757',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Neural Network Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 4, 
            color: 'white',
            fontFamily: '"Space Grotesk", sans-serif',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
          }}>
            ⚡ Neural Network Status
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricsCard
                title="Active Bots"
                value={stats.activeChatbots}
                icon={<Psychology />}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                description="Neural Units Online"
                trend={stats.activeChatbots > 0 ? 1 : 0}
                onClick={() => navigate('/chatbots')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricsCard
                title="Total Fleet"
                value={stats.totalChatbots}
                icon={<RocketLaunch />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                description="AI Arsenal Size"
                onClick={() => navigate('/chatbots')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricsCard
                title="Data Sources"
                value={stats.totalDocuments}
                icon={<Memory />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                description="Knowledge Banks"
                onClick={() => navigate('/analytics')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricsCard
                title="Conversations"
                value={stats.totalConversations || '---'}
                icon={<FlashOn />}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                description="Neural Interactions"
                onClick={() => navigate('/analytics')}
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* Active Neural Units */}
        {stats.totalChatbots > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 4, 
              color: 'white',
              fontFamily: '"Space Grotesk", sans-serif',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
            }}>
              🤖 Active Neural Units
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {chatbots.slice(0, 4).map((chatbot, index) => (
                <Grid item xs={12} sm={6} lg={3} key={chatbot.config.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <NeuralBotCard chatbot={chatbot} />
                  </motion.div>
                </Grid>
              ))}
              
              {chatbots.length > 4 && (
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/chatbots')}
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      background: alpha('#fff', 0.05),
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: '#43e97b',
                        background: alpha('#43e97b', 0.1),
                        color: '#43e97b',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
                      }
                    }}
                  >
                    Access Full Neural Fleet ({chatbots.length} Units)
                  </Button>
                </Grid>
              )}
            </Grid>
          </motion.div>
        )}

        {/* Command Portals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 4, 
            color: 'white',
            fontFamily: '"Space Grotesk", sans-serif',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
          }}>
            ⚡ Command Portals
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <ActionPortal
                title="Neural Forge"
                description="Initialize a new AI consciousness and deploy to the neural network"
                icon={<Add />}
                emoji="🧠"
                onClick={() => navigate('/create')}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ActionPortal
                title="AI Arsenal"
                description="Command center for managing your deployed neural workforce"
                icon={<SmartToy />}
                emoji="🚀"
                onClick={() => navigate('/chatbots')}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ActionPortal
                title="Data Nexus"
                description="Advanced intelligence metrics and neural performance analytics"
                icon={<Analytics />}
                emoji="📊"
                onClick={() => navigate('/analytics')}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* Neural Intelligence Brief */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                background: alpha('#fff', 0.95),
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Typography variant="h4" sx={{ mr: 2 }}>🧠</Typography>
                    </motion.div>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: '"Space Grotesk", sans-serif',
                    }}>
                      Neural Network Intelligence
                    </Typography>
                  </Box>
                  
                  {stats.totalChatbots === 0 ? (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                        Initialize Your First Neural Unit
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Deploy your first AI consciousness to the neural network:
                      </Typography>
                      
                      <Box sx={{ pl: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: '#43e97b', 
                            mr: 2 
                          }} />
                          <Typography variant="body2" color="text.secondary">
                            Input data sources or knowledge matrices
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: '#4facfe', 
                            mr: 2 
                          }} />
                          <Typography variant="body2" color="text.secondary">
                            Configure neural pathways and responses
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: '#f093fb', 
                            mr: 2 
                          }} />
                          <Typography variant="body2" color="text.secondary">
                            Deploy to neural mesh and activate
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        startIcon={<RocketLaunch />}
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 700,
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                          }
                        }}
                        onClick={() => navigate('/create')}
                      >
                        Initialize First Neural Unit
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                        Neural Fleet Status: Operational
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                        Command successful! You have {stats.totalChatbots} neural unit{stats.totalChatbots > 1 ? 's' : ''} deployed and operational.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${stats.activeChatbots} Active Units`}
                          sx={{
                            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.2), rgba(67, 233, 123, 0.1))',
                            border: '1px solid rgba(67, 233, 123, 0.3)',
                            color: '#43e97b',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          }}
                        />
                        <Chip 
                          label={`${stats.totalDocuments} Data Banks`}
                          sx={{
                            background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(79, 172, 254, 0.1))',
                            border: '1px solid rgba(79, 172, 254, 0.3)',
                            color: '#4facfe',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        Optimize neural performance via Data Nexus or expand fleet with new units.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                height: '100%',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none',
                }
              }}>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Security sx={{ fontSize: 32, mr: 2 }} />
                    </motion.div>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Quantum Secure
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ 
                    opacity: 0.95,
                    lineHeight: 1.6,
                    mb: 2
                  }}>
                    Neural data processed exclusively on German quantum-secured servers with full GDPR compliance.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudQueue sx={{ fontSize: 16, opacity: 0.8 }} />
                    <Typography variant="caption" sx={{ 
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 600,
                      opacity: 0.8
                    }}>
                      EU Data Sovereignty
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
    </Container>
  );
};

export default DashboardPage;