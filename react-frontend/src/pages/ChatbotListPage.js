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
  IconButton,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { chatbotRegistryService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

function ChatbotListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedChatbot, setSelectedChatbot] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { user } = useAuth();

  const {
    data: chatbotsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['chatbots', user?.uid], 
    () => user ? chatbotRegistryService.getChatbotsByUser(user.uid) : Promise.resolve([]),
    {
      refetchInterval: 30000,
      enabled: !!user,
    }
  );

  const handleMenuOpen = (event, chatbot) => {
    setAnchorEl(event.currentTarget);
    setSelectedChatbot(chatbot);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChatbot(null);
  };

  const handleDelete = async () => {
    if (selectedChatbot) {
      try {
        await chatbotRegistryService.deleteChatbot(selectedChatbot.id);
        refetch();
        setDeleteDialogOpen(false);
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete chatbot:', error);
      }
    }
  };

  const ChatbotCard = ({ chatbot }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(31, 58, 147, 0.2)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🤖 {chatbot.config?.name || chatbot.name || 'Unbenannter Chatbot'}
              </Typography>
              <Chip
                label={chatbot.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                color={chatbot.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, chatbot);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Description */}
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
              minHeight: '2.5em',
            }}
          >
            {chatbot.config?.description || chatbot.description || 'Keine Beschreibung verfügbar'}
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Dokumente
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {chatbot.documentCount || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Chunks
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {chatbot.totalChunks || 0}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ChatIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chatbot/${chatbot.config?.id || chatbot.id}`);
              }}
              sx={{ flexGrow: 1 }}
            >
              Chat
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LaunchIcon />}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add frontend URL when available
                console.log('Open chatbot:', chatbot.id);
              }}
            >
              Öffnen
            </Button>
          </Box>

          {/* Footer */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Erstellt: {chatbot.created_at ? new Date(chatbot.created_at.seconds ? chatbot.created_at.seconds * 1000 : chatbot.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={30} />
        <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton variant="rectangular" width="60%" height={36} />
          <Skeleton variant="rectangular" width="35%" height={36} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      maxWidth: '1400px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: 4,
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 }
        }}>
          <Box>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              fontWeight={700} 
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              My Chatbots
            </Typography>
            <Typography 
              variant={isMobile ? 'body2' : 'subtitle1'} 
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {chatbotsData ? `${chatbotsData.length} Chatbot(s)` : 'Wird geladen...'}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', md: 'auto' }
          }}>
            <Button
              variant="outlined"
              startIcon={!isSmall ? <RefreshIcon /> : null}
              onClick={refetch}
              size={isMobile ? 'small' : 'medium'}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={!isSmall ? <AddIcon /> : null}
              onClick={() => navigate('/create')}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                background: 'linear-gradient(135deg, #1f3a93, #34495e)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4a69bd, #5a6c7d)',
                },
              }}
            >
              {isSmall ? 'Create' : 'Create New Chatbot'}
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            severity="error"
            action={
              <IconButton color="inherit" size="small" onClick={refetch}>
                <RefreshIcon />
              </IconButton>
            }
            sx={{ mb: 3 }}
          >
            Failed to load chatbots: {error.message}
          </Alert>
        </motion.div>
      )}

      {/* Chatbots Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <LoadingSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : chatbotsData?.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {chatbotsData.map((chatbot) => (
              <Grid item xs={12} sm={6} lg={4} key={chatbot.id}>
                <ChatbotCard chatbot={chatbot} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
              <Typography
                variant="h1"
                sx={{ 
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' }, 
                  mb: 2, 
                  opacity: 0.3 
                }}
              >
                🤖
              </Typography>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                color="text.secondary" 
                gutterBottom
              >
                No chatbots found
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 4, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Create your first AI assistant to get started
              </Typography>
              <Button
                variant="contained"
                size={isMobile ? 'medium' : 'large'}
                startIcon={!isSmall ? <AddIcon /> : null}
                onClick={() => navigate('/create')}
              >
                Create Your First Chatbot
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            navigate(`/chatbot/${selectedChatbot?.config?.id || selectedChatbot?.id}`);
            handleMenuClose();
          }}
        >
          <ChatIcon sx={{ mr: 1 }} />
          Chat öffnen
        </MenuItem>
        <MenuItem
          onClick={() => {
            // TODO: Implement edit functionality
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Einstellungen bearbeiten
        </MenuItem>
        <MenuItem
          onClick={() => {
            // TODO: Add frontend URL when available
            console.log('Open chatbot in new tab:', selectedChatbot?.id);
            handleMenuClose();
          }}
        >
          <LaunchIcon sx={{ mr: 1 }} />
          In neuem Tab öffnen
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Löschen
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Chatbot löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie "{selectedChatbot?.config?.name || selectedChatbot?.name}" löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatbotListPage;