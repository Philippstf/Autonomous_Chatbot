import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { chatbotRegistryService } from '../services/firebaseService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sharing-tabpanel-${index}`}
      aria-labelledby={`sharing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function SharingModal({ open, onClose, chatbot }) {
  const [activeTab, setActiveTab] = useState(0);
  const [publicId, setPublicId] = useState(chatbot?.publicId || null);
  const [apiKeys, setApiKeys] = useState(chatbot?.apiKeys || []);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const baseUrl = window.location.origin;

  useEffect(() => {
    if (chatbot) {
      setPublicId(chatbot.publicId || null);
      setApiKeys(chatbot.apiKeys || []);
    }
  }, [chatbot]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const generatePublicLink = async () => {
    if (!chatbot) return;
    
    setLoading(true);
    try {
      const newPublicId = await chatbotRegistryService.generatePublicId(chatbot.id);
      setPublicId(newPublicId);
      showSnackbar('Öffentlicher Link erfolgreich generiert!');
    } catch (error) {
      console.error('Error generating public ID:', error);
      showSnackbar('Fehler beim Generieren des Links', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!chatbot) return;
    
    setLoading(true);
    try {
      const newApiKey = await chatbotRegistryService.generateApiKey(chatbot.id);
      setApiKeys(prev => [...prev, newApiKey]);
      showSnackbar('API-Key erfolgreich generiert!');
    } catch (error) {
      console.error('Error generating API key:', error);
      showSnackbar('Fehler beim Generieren des API-Keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeApiKey = async (apiKey) => {
    if (!chatbot) return;
    
    try {
      await chatbotRegistryService.removeApiKey(chatbot.id, apiKey);
      setApiKeys(prev => prev.filter(key => key !== apiKey));
      showSnackbar('API-Key erfolgreich entfernt!');
    } catch (error) {
      console.error('Error removing API key:', error);
      showSnackbar('Fehler beim Entfernen des API-Keys', 'error');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar('In Zwischenablage kopiert!');
    } catch (error) {
      showSnackbar('Fehler beim Kopieren', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const publicUrl = publicId ? `${baseUrl}/public/${publicId}` : '';
  const iframeCode = publicId ? `<iframe 
  src="${baseUrl}/public/${publicId}?embed=true" 
  width="400" 
  height="600" 
  frameborder="0"
  title="${chatbot?.config?.name || chatbot?.name} Chatbot">
</iframe>` : '';

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon />
          {chatbot?.config?.name || chatbot?.name} teilen
        </DialogTitle>

        <DialogContent>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="sharing options"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab icon={<LinkIcon />} label="Öffentlicher Link" />
            <Tab icon={<CodeIcon />} label="Website Widget" />
            <Tab icon={<KeyIcon />} label="API-Key" />
          </Tabs>

          {/* Public Link Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🌐 Öffentlicher Link
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Teilen Sie Ihren Chatbot über einen direkten Link mit Ihren Kunden
              </Typography>
            </Box>

            {publicId ? (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ihr öffentlicher Chatbot-Link:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    value={publicUrl}
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <IconButton 
                    onClick={() => copyToClipboard(publicUrl)}
                    color="primary"
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  📋 Teilen Sie diesen Link mit Ihren Kunden für direkten Zugang zum Chatbot
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Noch kein öffentlicher Link generiert
                </Typography>
                <Button
                  variant="contained"
                  onClick={generatePublicLink}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                >
                  {loading ? 'Generiere...' : 'Öffentlichen Link generieren'}
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* iframe Widget Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📎 Website Widget
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Betten Sie den Chatbot als Widget in Ihre Website ein
              </Typography>
            </Box>

            {publicId ? (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  iframe Code für Ihre Website:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={iframeCode}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    📋 Kopieren Sie diesen Code und fügen Sie ihn in Ihre Website ein
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(iframeCode)}
                  >
                    Kopieren
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Generieren Sie zuerst einen öffentlichen Link
                </Typography>
                <Button
                  variant="contained"
                  onClick={generatePublicLink}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                >
                  {loading ? 'Generiere...' : 'Öffentlichen Link generieren'}
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* API Key Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🔑 API-Key
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generieren Sie API-Keys für WordPress Plugin oder andere Integrationen
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={generateApiKey}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <KeyIcon />}
                fullWidth
              >
                {loading ? 'Generiere...' : 'Neuen API-Key generieren'}
              </Button>
            </Box>

            {apiKeys.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Bestehende API-Keys:
                </Typography>
                <Stack spacing={1}>
                  {apiKeys.map((apiKey, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={apiKey}
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(apiKey)}
                        color="primary"
                      >
                        <CopyIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeApiKey(apiKey)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  📋 Verwenden Sie diese Keys für WordPress Plugin oder andere Integrationen
                </Typography>
              </Paper>
            )}
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Schließen</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SharingModal;