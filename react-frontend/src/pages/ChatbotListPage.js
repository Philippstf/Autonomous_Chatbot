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
import { getAllChatbots, deleteChatbot } from '../services/api';

function ChatbotListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedChatbot, setSelectedChatbot] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const {
    data: chatbotsData,
    isLoading,
    error,
    refetch,
  } = useQuery('chatbots', getAllChatbots, {
    refetchInterval: 30000,
  });

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
        await deleteChatbot(selectedChatbot.config.id);
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
                🤖 {chatbot.config.name}
              </Typography>
              <Chip
                label={chatbot.runtime_status?.loaded ? 'Active' : 'Inactive'}
                color={chatbot.runtime_status?.loaded ? 'success' : 'default'}
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
            {chatbot.config.description || 'No description provided'}
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Documents
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {chatbot.rag_info?.total_chunks || 0}
              </Typography>
            </Box>
            {chatbot.config.website_url && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Website
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  Connected
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ChatIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chatbot/${chatbot.config.id}`);
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
                window.open(chatbot.runtime_status?.frontend_url, '_blank');
              }}
            >
              Open
            </Button>
          </Box>

          {/* Footer */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Created: {new Date(chatbot.config.created_at).toLocaleDateString()}
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
              {chatbotsData ? `${chatbotsData.total} chatbot(s), ${chatbotsData.active} active` : 'Loading...'}
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
        ) : chatbotsData?.chatbots?.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {chatbotsData.chatbots.map((chatbot) => (
              <Grid item xs={12} sm={6} lg={4} key={chatbot.config.id}>
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
            navigate(`/chatbot/${selectedChatbot?.config.id}`);
            handleMenuClose();
          }}
        >
          <ChatIcon sx={{ mr: 1 }} />
          Open Chat
        </MenuItem>
        <MenuItem
          onClick={() => {
            // TODO: Implement edit functionality
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(selectedChatbot?.runtime_status?.frontend_url, '_blank');
            handleMenuClose();
          }}
        >
          <LaunchIcon sx={{ mr: 1 }} />
          Open in New Tab
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Chatbot</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedChatbot?.config.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatbotListPage;