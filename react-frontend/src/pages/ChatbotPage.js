import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Alert,
  Skeleton,
  Divider,
  Fade,
  Container,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatConfig, sendChatMessage, submitLead } from '../services/api';
import ContactPersonModal from '../components/ContactPersonModal';

function ChatbotPage() {
  const { id: chatbotId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    // FIXED: Generiere eine feste conversationId die NIEMALS wechselt
    const storageKey = `conversation_${chatbotId}`;
    let stored = sessionStorage.getItem(storageKey);
    if (!stored) {
      stored = `fixed_${chatbotId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(storageKey, stored);
      console.log('🔍 Frontend - Generated NEW fixed conversationId:', stored);
    } else {
      console.log('🔍 Frontend - Loaded EXISTING conversationId:', stored);
    }
    return stored;
  });
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCapturePrompt, setEmailCapturePrompt] = useState('');
  const [emailFormData, setEmailFormData] = useState({ email: '', name: '', phone: '', message: '' });
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [showContactPersons, setShowContactPersons] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    data: chatConfig,
    isLoading: configLoading,
    error: configError,
  } = useQuery(['chatConfig', chatbotId], () => getChatConfig(chatbotId));

  useEffect(() => {
    if (chatConfig) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: chatConfig.welcome_message || `Hallo! Ich bin ${chatConfig.name}.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [chatConfig]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔍 Frontend - Sending with conversationId:', conversationId);
      const response = await sendChatMessage(chatbotId, userMessage.content, conversationId);
      console.log('🔍 Frontend - Response conversation_id:', response.conversation_id);
      
      // NICHT MEHR NÖTIG - conversationId ist immer gesetzt
      // if (!conversationId) {
      //   console.log('🔍 Frontend - Setting new conversationId:', response.conversation_id);
      //   setConversationId(response.conversation_id);
      //   // Update session storage
      //   const storageKey = `conversation_${chatbotId}`;
      //   sessionStorage.setItem(storageKey, response.conversation_id);
      // }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        sources: response.sources || [],
        timestamp: new Date(response.timestamp),
        metadata: response.metadata || {}
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Debug logging für modal triggers
      console.log('🔍 Frontend Debug - Response metadata:', response.metadata);
      console.log('🔍 Frontend Debug - Show email capture:', response.metadata?.show_email_capture);
      console.log('🔍 Frontend Debug - Show contact persons:', response.metadata?.show_contact_persons);
      console.log('🔍 Frontend Debug - Current showEmailCapture state:', showEmailCapture);
      console.log('🔍 Frontend Debug - Current showContactPersons state:', showContactPersons);
      
      // Check for email capture trigger
      if (response.metadata?.show_email_capture && !showEmailCapture) {
        console.log('✅ Triggering email capture modal');
        setShowEmailCapture(true);
        setEmailCapturePrompt(response.metadata.email_prompt || 'Möchten Sie weitere Informationen erhalten?');
      }
      
      // Check for contact persons trigger
      if (response.metadata?.show_contact_persons && !showContactPersons) {
        console.log('✅ Triggering contact persons modal');
        setShowContactPersons(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        isError: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailFormData.email.trim() || emailSubmitting) return;

    setEmailSubmitting(true);
    try {
      const leadData = {
        email: emailFormData.email,
        name: emailFormData.name || null,
        phone: emailFormData.phone || null,
        message: emailFormData.message || null,
        conversation_id: conversationId,
        lead_source: 'chat_capture'
      };

      const response = await submitLead(chatbotId, leadData);
      
      // Add confirmation message to chat
      const confirmationMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: response.message || 'Vielen Dank! Wir haben Ihre Kontaktdaten erhalten und werden uns bald bei Ihnen melden.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      setShowEmailCapture(false);
      setEmailFormData({ email: '', name: '', phone: '', message: '' });
      
    } catch (error) {
      console.error('Failed to submit lead:', error);
      const errorMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Entschuldigung, beim Speichern Ihrer Kontaktdaten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        isError: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleEmailClose = () => {
    setShowEmailCapture(false);
    
    // Add dismissal message to chat
    const dismissalMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: 'Kein Problem! Wenn Sie später Kontaktinformationen benötigen, fragen Sie einfach nach "Kontakt" oder "Angebot".',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, dismissalMessage]);
  };

  const handleContactPersonsClose = () => {
    setShowContactPersons(false);
    
    // Add dismissal message to chat
    const dismissalMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: 'Kein Problem! Falls Sie später einen direkten Ansprechpartner benötigen, fragen Sie einfach nach \"Kontakt\" oder \"Ansprechpartner\".',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, dismissalMessage]);
  };


  const LoadingDots = () => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', py: 1 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: 'rgba(225, 225, 225, 0.6)',
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            '@keyframes pulse': {
              '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
              '40%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        />
      ))}
    </Box>
  );

  const MessageBubble = ({ message }) => {
    // System messages (confirmations, errors) - centered layout
    if (message.type === 'system') {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2,
          px: 2 
        }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              maxWidth: '80%',
              textAlign: 'center',
              background: message.isError 
                ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.1))'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
              border: `1px solid ${message.isError ? 'rgba(231, 76, 60, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            <Typography variant="body2" color={message.isError ? 'error' : 'success.main'}>
              {message.content}
            </Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
          marginBottom: 16,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            maxWidth: isMobile ? '90%' : '75%',
            flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
          }}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              width: isMobile ? 32 : 36,
              height: isMobile ? 32 : 36,
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, #1f3a93, #4a69bd)'
                : 'linear-gradient(135deg, #34495e, #5a6c7d)',
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {message.type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
          </Avatar>

        {/* Message Content */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, rgba(31, 58, 147, 0.2), rgba(74, 105, 189, 0.2))'
                : message.isError 
                  ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.1))'
                  : 'linear-gradient(135deg, rgba(52, 73, 94, 0.1), rgba(90, 108, 125, 0.1))',
              border: `1px solid ${
                message.type === 'user' 
                  ? 'rgba(31, 58, 147, 0.3)'
                  : message.isError 
                    ? 'rgba(231, 76, 60, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)'
              }`,
              backdropFilter: 'blur(10px)',
              color: 'text.primary',
            }}
          >
            <Typography 
              variant={isMobile ? 'body2' : 'body1'} 
              sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.6,
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              {message.content}
            </Typography>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', mb: 1, fontWeight: 600 }}
                >
                  📚 Quellen:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {message.sources.map((source, index) => (
                    <Chip
                      key={index}
                      label={source.title || `Quelle ${index + 1}`}
                      size="small"
                      variant="outlined"
                      clickable={!!source.url}
                      onClick={source.url ? () => window.open(source.url, '_blank') : undefined}
                      icon={source.url ? <LaunchIcon /> : undefined}
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 24,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'text.secondary',
                        '&:hover': source.url ? {
                          backgroundColor: 'rgba(31, 58, 147, 0.1)',
                          borderColor: 'rgba(31, 58, 147, 0.3)',
                        } : {},
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

          </Paper>
        </Box>
      </Box>
    </div>
    );
  };

  if (configLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (configError) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load chatbot: {configError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Chatbot Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${chatConfig?.branding?.primary_color || '#1f3a93'}, ${chatConfig?.branding?.secondary_color || '#34495e'})`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'center', md: 'flex-start' }, 
            mb: 2,
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 }
          }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight={700} 
                gutterBottom
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}
              >
                🤖 {chatConfig?.name}
              </Typography>
              <Typography 
                variant={isMobile ? 'body2' : 'subtitle1'} 
                sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}
              >
                {chatConfig?.description || 'AI Assistant'}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome',
                    type: 'bot',
                    content: chatConfig.welcome_message || `Hallo! Ich bin ${chatConfig.name}.`,
                    timestamp: new Date(),
                  },
                ]);
                setConversationId(null);
              }}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
          {chatConfig?.company_info?.company_name && (
            <Chip
              label={chatConfig.company_info.company_name}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          )}
        </Paper>
      </motion.div>

      {/* Chat Interface */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={4}
          sx={{
            minHeight: 400,
            height: 'auto',
            maxHeight: { xs: '70vh', md: '75vh' },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(31, 58, 147, 0.05), rgba(52, 73, 94, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            transition: 'height 0.3s ease',
          }}
        >
          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 300,
              maxHeight: { xs: '50vh', md: '60vh' },
              overflowY: 'auto',
              p: { xs: 1.5, sm: 2, md: 3 },
              
              // Custom scrollbar for dark theme
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              },
            }}
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 16,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background: 'linear-gradient(135deg, #34495e, #5a6c7d)',
                    }}
                  >
                    <SmartToyIcon />
                  </Avatar>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.1), rgba(90, 108, 125, 0.1))',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <LoadingDots />
                  </Paper>
                </Box>
              </div>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(31, 58, 147, 0.1), rgba(52, 73, 94, 0.1))',
              backdropFilter: 'blur(10px)',
            }}
          >
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Schreiben Sie Ihre Nachricht..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      '& fieldset': {
                        borderColor: 'rgba(75, 85, 99, 0.5)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1f3a93',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!inputMessage.trim() || isLoading}
                  sx={{
                    borderRadius: isMobile ? 2 : '50%',
                    minWidth: isMobile ? 64 : 56,
                    height: isMobile ? 48 : 56,
                    px: isMobile ? 2 : 0,
                    background: 'linear-gradient(135deg, #1f3a93, #4a69bd)',
                    boxShadow: '0 4px 15px rgba(31, 58, 147, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4a69bd, #5a6c7d)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(31, 58, 147, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'none',
                    },
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Fade>

      {/* Email Capture Dialog */}
      <Dialog
        open={showEmailCapture}
        onClose={handleEmailClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
          color: 'white',
          textAlign: 'center'
        }}>
          📧 Kontaktinformationen
        </DialogTitle>
        
        <form onSubmit={handleEmailSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#374151' }}>
              {emailCapturePrompt}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-Mail-Adresse *"
                  type="email"
                  value={emailFormData.email}
                  onChange={(e) => setEmailFormData(prev => ({...prev, email: e.target.value}))}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name (optional)"
                  value={emailFormData.name}
                  onChange={(e) => setEmailFormData(prev => ({...prev, name: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon (optional)"
                  value={emailFormData.phone}
                  onChange={(e) => setEmailFormData(prev => ({...prev, phone: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nachricht (optional)"
                  multiline
                  rows={3}
                  value={emailFormData.message}
                  onChange={(e) => setEmailFormData(prev => ({...prev, message: e.target.value}))}
                  placeholder="Beschreiben Sie Ihr Interesse oder Ihre Fragen..."
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 2, fontSize: '0.9rem' }}>
              Ihre Daten werden vertraulich behandelt und nur für die Kontaktaufnahme verwendet.
            </Alert>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
            <Button
              onClick={handleEmailClose}
              variant="outlined"
              sx={{ 
                borderColor: '#6b7280',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#374151',
                  color: '#374151'
                }
              }}
            >
              Später
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={!emailFormData.email.trim() || emailSubmitting}
              sx={{
                background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                }
              }}
            >
              {emailSubmitting ? 'Wird gesendet...' : 'Kontaktdaten senden'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Contact Persons Modal */}
      <ContactPersonModal
        open={showContactPersons}
        onClose={handleContactPersonsClose}
        contactPersons={chatConfig?.contact_persons || []}
        chatbotName={chatConfig?.name || 'Chatbot'}
      />

    </Container>
  );
}

export default ChatbotPage;