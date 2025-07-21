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
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
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
      // Add welcome message
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

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`chat-message ${message.type}`}
      style={{
        display: 'flex',
        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '80%',
          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            backgroundColor: message.type === 'user' ? 'primary.main' : 'secondary.main',
            fontSize: '1rem',
          }}
        >
          {message.type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
        </Avatar>

        {/* Message Content */}
        <Box
          sx={{
            backgroundColor: message.type === 'user' 
              ? 'linear-gradient(135deg, #1f3a93, #4a69bd)'
              : message.isError 
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(255, 255, 255, 0.1)',
            color: message.type === 'user' ? 'white' : 'text.primary',
            borderRadius: '18px',
            padding: '12px 16px',
            position: 'relative',
            border: message.isError ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            ...(message.type === 'user' 
              ? { borderBottomRightRadius: '6px' }
              : { borderBottomLeftRadius: '6px' }
            ),
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1, opacity: 0.3 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Quellen:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {message.sources.map((source, index) => (
                  <Chip
                    key={index}
                    label={source.title || `Quelle ${index + 1}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Timestamp & Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              opacity: 0.7,
            }}
          >
            <Typography variant="caption">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            {message.type === 'bot' && (
              <IconButton
                size="small"
                onClick={() => copyToClipboard(message.content)}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
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
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="60%" />
        </Paper>
        <Paper sx={{ height: 600, p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Paper>
      </Box>
    );
  }

  if (configError) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">
          Failed to load chatbot: {configError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Chatbot Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${chatConfig?.branding?.primary_color || '#1f3a93'}, ${chatConfig?.branding?.secondary_color || '#34495e'})`,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🤖 {chatConfig?.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {chatConfig?.description || 'AI Assistant'}
          </Typography>
          {chatConfig?.company_info?.company_name && (
            <Chip
              label={chatConfig.company_info.company_name}
              sx={{
                mt: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
              }}
            />
          )}
        </Paper>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper
          sx={{
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <AnimatePresence>
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
                  marginBottom: '16px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 36, height: 36, backgroundColor: 'secondary.main' }}>
                    <SmartToyIcon />
                  </Avatar>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '18px',
                      padding: '12px 16px',
                      borderBottomLeftRadius: '6px',
                    }}
                  >
                    <div className="loading-spinner" style={{ width: 20, height: 20, margin: 0 }} />
                  </Box>
                </Box>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Schreiben Sie Ihre Nachricht..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '25px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                    background: `linear-gradient(135deg, ${chatConfig?.branding?.primary_color || '#1f3a93'}, ${chatConfig?.branding?.secondary_color || '#34495e'})`,
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </motion.div>

      {/* Quick Actions */}
      {chatConfig?.features && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => setInputMessage('Was können Sie für mich tun?')}
              >
                Hilfe
              </Button>
              <Button
                variant="outlined"
                onClick={() => setInputMessage('Welche Services bieten Sie an?')}
              >
                Services
              </Button>
              {chatConfig.features.contact_persons && (
                <Button
                  variant="outlined"
                  onClick={() => setInputMessage('Ich möchte mit einem Ansprechpartner sprechen')}
                >
                  Kontakt
                </Button>
              )}
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
              >
                Neu starten
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
}

export default ChatbotPage;