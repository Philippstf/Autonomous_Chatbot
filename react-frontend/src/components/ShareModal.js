import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`share-tabpanel-${index}`}
      aria-labelledby={`share-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ShareModal({ open, onClose, chatbot }) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowAnonymous: true,
    trackAnalytics: true,
    showBranding: true,
    customDomain: '',
    accessPassword: '',
  });

  // API Endpoint (sollte aus Environment kommen)
  const API_BASE = process.env.REACT_APP_API_BASE || 'https://helferlain-a4178.web.app';
  
  // URLs generieren
  const publicChatUrl = `${API_BASE}/chat/${chatbot?.id}`;
  const embeddedUrl = `${API_BASE}/embed/${chatbot?.id}`;
  const widgetUrl = `${API_BASE}/widget.js`;

  useEffect(() => {
    if (chatbot?.shareSettings) {
      setShareSettings(chatbot.shareSettings);
    }
  }, [chatbot]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = async (text, label = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({
        open: true,
        message: `${label} kopiert!`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Kopieren fehlgeschlagen',
        severity: 'error'
      });
    }
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...shareSettings, [setting]: value };
    setShareSettings(newSettings);
    // TODO: Save to backend
    console.log('Share settings updated:', newSettings);
  };

  const generateWidgetCode = (config = {}) => {
    const settings = {
      botId: chatbot?.id,
      apiEndpoint: API_BASE,
      position: config.position || 'bottom-right',
      theme: config.theme || 'light',
      autoOpen: config.autoOpen || false,
      ...config
    };

    return `<!-- HELFERLAIN Chatbot Widget -->
<script src="${widgetUrl}"></script>
<script>
HELFERLAIN.init(${JSON.stringify(settings, null, 2)});
</script>`;
  };

  const generateWordPressShortcode = (config = {}) => {
    const params = Object.entries(config)
      .filter(([key, value]) => value && key !== 'botId')
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    return `[helferlain_chatbot bot_id="${chatbot?.id}"${params ? ' ' + params : ''}]`;
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon color="primary" />
            <Typography variant="h6" component="span">
              Chatbot teilen: {chatbot?.config?.name || chatbot?.name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                icon={<LinkIcon />} 
                label="Öffentlicher Link" 
                iconPosition="start"
              />
              <Tab 
                icon={<CodeIcon />} 
                label="Website Integration" 
                iconPosition="start"
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="Einstellungen" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ px: 3 }}>
            {/* Tab 1: Öffentlicher Link */}
            <TabPanel value={tabValue} index={0}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Teilen Sie Ihren Chatbot über einen direkten Link. Besucher können sofort chatten ohne Anmeldung.
                </Typography>

                <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      🌐 Öffentlicher Chat-Link
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={publicChatUrl}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Link kopieren">
                                <IconButton 
                                  onClick={() => copyToClipboard(publicChatUrl, 'Link')}
                                  size="small"
                                >
                                  <CopyIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Link öffnen">
                                <IconButton 
                                  onClick={() => openInNewTab(publicChatUrl)}
                                  size="small"
                                >
                                  <LaunchIcon />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                        sx={{ mr: 1 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Besucher öffnen diesen Link für einen einmaligen Chat mit Ihrem Bot
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      📱 QR-Code zum Teilen
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          QR-Code
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Scannen Sie diesen QR-Code mit dem Smartphone für direkten Zugang zum Chat.
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            // TODO: Generate and download QR code
                            console.log('Generate QR code for:', publicChatUrl);
                          }}
                        >
                          QR-Code herunterladen
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    💡 <strong>Tipp:</strong> Der öffentliche Link funktioniert sofort. 
                    Besucher benötigen keine Anmeldung und können direkt chatten.
                  </Typography>
                </Alert>
              </motion.div>
            </TabPanel>

            {/* Tab 2: Website Integration */}
            <TabPanel value={tabValue} index={1}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Integrieren Sie den Chatbot in Ihre Website mit verschiedenen Methoden.
                </Typography>

                {/* HTML/JavaScript Widget */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CodeIcon color="primary" />
                      HTML/JavaScript Widget
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Universelle Integration für alle Website-Typen
                    </Typography>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={generateWidgetCode()}
                      InputProps={{
                        readOnly: true,
                        sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={() => copyToClipboard(generateWidgetCode(), 'Widget-Code')}
                    >
                      Code kopieren
                    </Button>
                  </CardContent>
                </Card>

                {/* WordPress Plugin */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxLjQ2OSAxMC45NDRDMjEuNzg4IDExLjg5NCAyMiAxMi45MTIgMjIgMTMuOTc5QzIyIDE4LjQxNiAxOC40MTYgMjIgMTMuOTc5IDIyQzEwLjU2MyAyMiA3LjY0NiAyMC4wOTQgNi41OTQgMTcuMjE5TDEwLjY4OCAxNS41TDIxLjQ2OSAxMC45NDRaTTEzLjk3OSAyQzE4LjQxNiAyIDIyIDUuNTg0IDIyIDEwLjAyMUwyMSAxMC4wMjFMMTMuOTc5IDEyLjhMNi45NTggMTAuMDIxSDIuMDAyQzIuMDAyIDUuNTg0IDUuNTg2IDIgMTAuMDIzIDJIMTMuOTc5WiIgZmlsbD0iIzIxOTZGMyIvPgo8L3N2Zz4K" alt="WordPress" width="20" />
                      WordPress Shortcode
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Für WordPress-Websites mit unserem Plugin
                    </Typography>
                    
                    <TextField
                      fullWidth
                      value={generateWordPressShortcode()}
                      InputProps={{
                        readOnly: true,
                        sx: { fontFamily: 'monospace' }
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(generateWordPressShortcode(), 'Shortcode')}
                      >
                        Shortcode kopieren
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openInNewTab('https://wordpress.org/plugins/helferlain-chatbot')}
                      >
                        Plugin herunterladen
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* Erweiterte Konfiguration */}
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      🎨 Erweiterte Konfiguration
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Passen Sie das Widget an Ihre Website an
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                      <TextField
                        select
                        label="Position"
                        defaultValue="bottom-right"
                        SelectProps={{ native: true }}
                        size="small"
                      >
                        <option value="bottom-right">Unten rechts</option>
                        <option value="bottom-left">Unten links</option>
                        <option value="top-right">Oben rechts</option>
                        <option value="top-left">Oben links</option>
                      </TextField>
                      
                      <TextField
                        select
                        label="Theme"
                        defaultValue="light"
                        SelectProps={{ native: true }}
                        size="small"
                      >
                        <option value="light">Hell</option>
                        <option value="dark">Dunkel</option>
                        <option value="auto">Automatisch</option>
                      </TextField>
                    </Box>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked={false} />}
                      label="Automatisch öffnen"
                      sx={{ mb: 1 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabPanel>

            {/* Tab 3: Einstellungen */}
            <TabPanel value={tabValue} index={2}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Konfigurieren Sie die Freigabe-Einstellungen für Ihren Chatbot.
                </Typography>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      🔗 Freigabe-Status
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={shareSettings.isPublic}
                          onChange={(e) => handleSettingChange('isPublic', e.target.checked)}
                        />
                      }
                      label="Öffentlich zugänglich"
                      sx={{ mb: 2 }}
                    />
                    
                    {shareSettings.isPublic && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        ✅ Ihr Chatbot ist öffentlich zugänglich über den Share-Link
                      </Alert>
                    )}
                    
                    {!shareSettings.isPublic && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        ⚠️ Ihr Chatbot ist privat. Aktivieren Sie die öffentliche Freigabe zum Teilen.
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      👥 Zugangs-Einstellungen
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={shareSettings.allowAnonymous}
                          onChange={(e) => handleSettingChange('allowAnonymous', e.target.checked)}
                        />
                      }
                      label="Anonyme Benutzer erlauben"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Zugangs-Passwort (optional)"
                      type="password"
                      value={shareSettings.accessPassword}
                      onChange={(e) => handleSettingChange('accessPassword', e.target.value)}
                      placeholder="Leer lassen für offenen Zugang"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      📊 Analytics & Branding
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={shareSettings.trackAnalytics}
                          onChange={(e) => handleSettingChange('trackAnalytics', e.target.checked)}
                        />
                      }
                      label="Analytics verfolgen"
                      sx={{ mb: 1 }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={shareSettings.showBranding}
                          onChange={(e) => handleSettingChange('showBranding', e.target.checked)}
                        />
                      }
                      label="HELFERLAIN Branding anzeigen"
                      sx={{ mb: 2 }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      🌐 Custom Domain (Premium)
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Custom Domain"
                      value={shareSettings.customDomain}
                      onChange={(e) => handleSettingChange('customDomain', e.target.value)}
                      placeholder="chat.ihr-domain.de"
                      size="small"
                      disabled={true} // Disabled for now
                      helperText="Verfügbar in Premium-Plänen"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabPanel>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>
            Schließen
          </Button>
          <Button 
            variant="contained" 
            startIcon={<LaunchIcon />}
            onClick={() => openInNewTab(publicChatUrl)}
          >
            Chatbot testen
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ShareModal;