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
  Avatar
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
  Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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

  const ChatbotCard = ({ chatbot }) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
        border: '1px solid rgba(30, 58, 138, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#1e3a8a', 
              mr: 2, 
              width: 48, 
              height: 48 
            }}>
              <SmartToy />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#1e3a8a',
                mb: 0.5
              }}>
                {chatbot.config.name}
              </Typography>
              <Chip 
                label={chatbot.runtime_status?.loaded ? "Aktiv" : "Inaktiv"}
                size="small"
                color={chatbot.runtime_status?.loaded ? "success" : "default"}
              />
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {chatbot.config.description || 'Keine Beschreibung verfügbar'}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Erstellt: {new Date(chatbot.created_at).toLocaleDateString('de-DE')}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            size="small" 
            startIcon={<Chat />}
            onClick={() => navigate(`/chatbot/${chatbot.config.id}`)}
            sx={{ mr: 1 }}
          >
            Chat
          </Button>
          <Button 
            size="small" 
            startIcon={<Settings />}
            onClick={() => navigate(`/chatbots`)}
          >
            Verwalten
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );

  const StatCard = ({ title, value, icon, color = '#1e3a8a', onClick }) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          border: '1px solid rgba(30, 58, 138, 0.1)'
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            mb: 2
          }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: '2rem', color } 
            })}
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e3a8a', 
            mb: 1 
          }}>
            {loading ? '...' : value}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color = '#1e3a8a' }) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          color: 'white'
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: '3rem', color: 'white' } 
            })}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={50} sx={{ color: '#1e3a8a' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, color: 'white' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e3a8a',
            mb: 1
          }}>
            Willkommen zurück, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Verwalten Sie Ihre KI-Chatbots und analysieren Sie deren Performance
          </Typography>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Recent Chatbots - only show if user has chatbots */}
      {stats.totalChatbots > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#374151' }}>
            🤖 Letzte Chatbots
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {chatbots.slice(0, 4).map((chatbot) => (
              <Grid item xs={12} sm={6} lg={3} key={chatbot.config.id}>
                <ChatbotCard chatbot={chatbot} />
              </Grid>
            ))}
            
            {chatbots.length > 4 && (
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/chatbots')}
                  sx={{ 
                    borderColor: '#1e3a8a',
                    color: '#1e3a8a'
                  }}
                >
                  Alle {chatbots.length} Chatbots anzeigen
                </Button>
              </Grid>
            )}
          </Grid>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#374151' }}>
          🚀 Schnellaktionen
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Neuer Chatbot"
              description="Erstellen Sie einen neuen KI-Chatbot in wenigen Minuten"
              icon={<Add />}
              onClick={() => navigate('/create')}
              color="#1e3a8a"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Chatbots verwalten"
              description="Bearbeiten und konfigurieren Sie Ihre bestehenden Chatbots"
              icon={<SmartToy />}
              onClick={() => navigate('/chatbots')}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Analytics"
              description="Analysieren Sie die Performance Ihrer Chatbots"
              icon={<Analytics />}
              onClick={() => navigate('/analytics')}
              color="#3b82f6"
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Recent Activity / Tips */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              border: '1px solid rgba(30, 58, 138, 0.1)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e3a8a' }}>
                  💡 Erste Schritte mit HELFERLAIN
                </Typography>
                {stats.totalChatbots === 0 ? (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Erstellen Sie Ihren ersten Chatbot:
                    </Typography>
                    <ul style={{ color: '#6b7280' }}>
                      <li>Website-URL eingeben oder Dokumente hochladen</li>
                      <li>Branding und Verhalten konfigurieren</li>
                      <li>Testen und auf Ihrer Website einbinden</li>
                    </ul>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        mt: 2,
                        background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                        }
                      }}
                      onClick={() => navigate('/create')}
                    >
                      Ersten Chatbot erstellen
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2, color: '#374151' }}>
                      Großartig! Sie haben bereits {stats.totalChatbots} Chatbot{stats.totalChatbots > 1 ? 's' : ''} erstellt.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optimieren Sie die Performance durch Analytics oder erstellen Sie weitere Chatbots für verschiedene Anwendungsfälle.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  🇩🇪 DSGVO-konform
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Ihre Daten werden ausschließlich auf deutschen Servern verarbeitet und sind vollständig DSGVO-konform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default DashboardPage;