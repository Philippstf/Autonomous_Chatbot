import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Container,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { chatbotRegistryService } from '../services/firebaseService';
import { sendPublicChatMessage } from '../services/api';

function PublicChatbotPage() {
  const { publicId } = useParams();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  
  const [chatbot, setChatbot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadChatbot();
  }, [publicId]);

  const loadChatbot = async () => {
    try {
      setLoading(true);
      const chatbotData = await chatbotRegistryService.getChatbotByPublicId(publicId);
      
      if (!chatbotData) {
        setError('Chatbot nicht gefunden oder nicht verfügbar.');
        return;
      }

      setChatbot(chatbotData);
      
      // Initialize welcome message
      const welcomeMessage = chatbotData.config?.branding?.welcome_message || 
                            chatbotData.branding?.welcome_message || 
                            `Hallo! Ich bin ${chatbotData.config?.name || chatbotData.name}. Wie kann ich Ihnen helfen?`;
      
      setMessages([{
        id: 1,
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }]);
      
    } catch (err) {
      console.error('Error loading chatbot:', err);
      setError('Fehler beim Laden des Chatbots.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || sendingMessage) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSendingMessage(true);

    try {
      // Send message to backend API
      const response = await sendPublicChatMessage(publicId, userMessage.content);
      
      const botResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response || response.message || 'Keine Antwort erhalten.',
        timestamp: new Date(),
        sources: response.sources || [],
      };

      setMessages(prev => [...prev, botResponse]);
      
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Nachricht. ${err.message.includes('Failed to fetch') ? 'Das Backend ist nicht erreichbar.' : err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getBrandingColors = () => {
    const branding = chatbot?.config?.branding || chatbot?.branding || {};
    return {
      primary: branding.primary_color || '#1f3a93',
      secondary: branding.secondary_color || '#34495e',
    };
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: isEmbed ? '400px' : '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" color="text.secondary">
          Der angeforderte Chatbot ist nicht verfügbar oder wurde entfernt.
        </Typography>
      </Container>
    );
  }

  const colors = getBrandingColors();
  const chatbotName = chatbot?.config?.name || chatbot?.name || 'Chatbot';

  return (
    <Box 
      sx={{ 
        height: isEmbed ? '100%' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isEmbed ? 'transparent' : 'background.default',
      }}
    >
      {/* Header */}
      {!isEmbed && (
        <Paper 
          elevation={1} 
          sx={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: 'white',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            🤖 {chatbotName}
          </Typography>
          {chatbot?.config?.description && (
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {chatbot.config.description}
            </Typography>
          )}
        </Paper>
      )}

      {/* Chat Messages */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: isEmbed ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                maxWidth: '70%',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: message.role === 'user' ? 'primary.main' : colors.primary,
                  fontSize: '0.875rem',
                }}
              >
                {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
              </Avatar>
              
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  bgcolor: message.role === 'user' 
                    ? 'primary.main' 
                    : 'background.paper',
                  color: message.role === 'user' 
                    ? 'primary.contrastText' 
                    : 'text.primary',
                  borderRadius: 2,
                  borderBottomLeftRadius: message.role === 'assistant' ? 0 : 2,
                  borderBottomRightRadius: message.role === 'user' ? 0 : 2,
                }}
              >
                <Typography variant="body2">
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5, 
                    opacity: 0.7,
                    fontSize: '0.75rem',
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        
        {sendingMessage && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}>
                <BotIcon />
              </Avatar>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                  Tippt...
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Paper 
        elevation={isEmbed ? 1 : 3} 
        sx={{ 
          p: isEmbed ? 1 : 2, 
          borderRadius: isEmbed ? 1 : 0,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder={`Nachricht an ${chatbotName}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={!inputValue.trim() || sendingMessage}
            sx={{ 
              bgcolor: colors.primary,
              color: 'white',
              '&:hover': { bgcolor: colors.secondary },
              '&:disabled': { bgcolor: 'action.disabled' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Embed Footer */}
      {isEmbed && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Powered by Helferlain
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default PublicChatbotPage;