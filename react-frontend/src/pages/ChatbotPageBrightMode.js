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
  Card,
  CardContent,
  Alert,
  Skeleton,
  Divider,
  Fade,
  Slide,
  Container,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatConfig, sendChatMessage } from '../services/api';

function ChatbotPage() {
  const { id: chatbotId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
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
      const response = await sendChatMessage(chatbotId, userMessage.content, conversationId);
      
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        sources: response.sources || [],
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, botMessage]);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const LoadingDots = () => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', py: 1 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
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

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      style={{
        display: 'flex',
        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
        marginBottom: 20,
        paddingLeft: message.type === 'user' ? 60 : 0,
        paddingRight: message.type === 'bot' ? 60 : 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1.5,
          maxWidth: '100%',
          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: message.type === 'user' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        >
          {message.type === 'user' ? (
            <PersonIcon sx={{ fontSize: 20 }} />
          ) : (
            <SmartToyIcon sx={{ fontSize: 20 }} />
          )}
        </Avatar>

        {/* Message Content */}
        <Box sx={{ maxWidth: '100%', minWidth: 0 }}>
          <Paper
            elevation={2}
            sx={{
              position: 'relative',
              p: 2,
              borderRadius: 3,
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : message.isError 
                  ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: message.type === 'user' ? 'white' : '#2d3436',
              maxWidth: '100%',
              wordBreak: 'break-word',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              
              // Message tail
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                ...(message.type === 'user' 
                  ? { 
                      right: -8,
                      borderLeft: '8px solid transparent',
                      borderTop: '8px solid #764ba2',
                    }
                  : {
                      left: -8,
                      borderRight: '8px solid transparent', 
                      borderTop: '8px solid #fed6e3',
                    }
                ),
              },
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.5,
                fontSize: '0.95rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </Typography>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 1.5, opacity: 0.4 }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    opacity: 0.8,
                    fontWeight: 600,
                  }}
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
                      sx={{ 
                        fontSize: '0.75rem',
                        height: 24,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'inherit',
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Timestamp & Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              px: 1,
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
            
            {message.type === 'bot' && (
              <IconButton
                size="small"
                onClick={() => copyToClipboard(message.content)}
                sx={{ 
                  opacity: 0.6,
                  '&:hover': { opacity: 1 },
                  transition: 'all 0.2s',
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );

  if (configLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (configError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load chatbot: {configError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Chatbot Header */}
      <Slide direction="down" in={true} timeout={600}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${chatConfig?.branding?.primary_color || '#667eea'} 0%, ${chatConfig?.branding?.secondary_color || '#764ba2'} 100%)`,
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              🤖 {chatConfig?.name}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              {chatConfig?.description || 'AI Assistant'}
            </Typography>
            {chatConfig?.company_info?.company_name && (
              <Chip
                label={chatConfig.company_info.company_name}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  fontWeight: 600,
                  px: 2,
                }}
              />
            )}
          </Box>
        </Paper>
      </Slide>

      {/* Chat Interface */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={4}
          sx={{
            height: 650,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 3,
              background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
              
              // Custom scrollbar
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                },
              },
            }}
          >
            <AnimatePresence mode="wait">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 20,
                  paddingRight: 60,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: -8,
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid #fed6e3',
                      },
                    }}
                  >
                    <LoadingDots />
                  </Paper>
                </Box>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid rgba(255,255,255,0.8)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem',
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!inputMessage.trim() || isLoading}
                  sx={{
                    borderRadius: '50%',
                    minWidth: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.3)',
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

      {/* Quick Actions */}
      <Slide direction="up" in={true} timeout={1000}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2d3436' }}>
            🚀 Schnelle Aktionen
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { label: 'Hilfe', message: 'Was können Sie für mich tun?' },
              { label: 'Services', message: 'Welche Services bieten Sie an?' },
              ...(chatConfig?.features?.contact_persons ? [
                { label: 'Kontakt', message: 'Ich möchte mit einem Ansprechpartner sprechen' }
              ] : []),
            ].map((action, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => setInputMessage(action.message)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
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
                borderRadius: 3,
                px: 3,
                py: 1,
                borderColor: 'rgba(245, 87, 108, 0.3)',
                color: '#f5576c',
                '&:hover': {
                  borderColor: '#f5576c',
                  backgroundColor: 'rgba(245, 87, 108, 0.05)',
                },
              }}
            >
              Neu starten
            </Button>
          </Box>
        </Paper>
      </Slide>
    </Container>
  );
}

export default ChatbotPage;