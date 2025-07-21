import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';

function PreviewStep({ formData, onCreateChatbot }) {
  // Validation checks
  const validationResults = [
    {
      label: 'Chatbot-Name',
      valid: Boolean(formData.name?.trim()),
      required: true,
    },
    {
      label: 'Unternehmensdaten',
      valid: Boolean(formData.company_info?.company_name?.trim() && formData.company_info?.email?.trim()),
      required: true,
    },
    {
      label: 'Datenquellen',
      valid: Boolean(
        formData.website_url?.trim() ||
        formData.uploaded_files?.length ||
        formData.manual_text?.trim()
      ),
      required: true,
    },
    {
      label: 'Branding',
      valid: Boolean(formData.branding?.primary_color),
      required: false,
    },
    {
      label: 'Features konfiguriert',
      valid: Boolean(formData.features),
      required: false,
    },
  ];

  const canCreate = validationResults.filter(r => r.required).every(r => r.valid);

  const ValidationItem = ({ label, valid, required }) => (
    <ListItem>
      <ListItemIcon>
        {valid ? (
          <CheckCircleIcon color="success" />
        ) : required ? (
          <WarningIcon color="error" />
        ) : (
          <InfoIcon color="info" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={
          valid ? 'Konfiguriert' : required ? 'Erforderlich - bitte ergänzen' : 'Optional'
        }
      />
    </ListItem>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🚀 Vorschau & Deployment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Überprüfen Sie Ihre Konfiguration und erstellen Sie Ihren Chatbot
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Konfigurationszusammenfassung
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Grundeinstellungen
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.name || 'Nicht festgelegt'}
                </Typography>
                <Typography variant="body2">
                  <strong>Beschreibung:</strong> {formData.description || 'Keine Beschreibung'}
                </Typography>
                {formData.tags?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Unternehmen
                </Typography>
                <Typography variant="body2">
                  <strong>Firma:</strong> {formData.company_info?.company_name || 'Nicht festgelegt'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {formData.company_info?.email || 'Nicht festgelegt'}
                </Typography>
                <Typography variant="body2">
                  <strong>Branche:</strong> {formData.company_info?.industry || 'Nicht festgelegt'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Features
                </Typography>
                <Typography variant="body2">
                  <strong>Email-Erfassung:</strong>{' '}
                  {formData.features?.email_capture_enabled ? '✅ Aktiviert' : '❌ Deaktiviert'}
                </Typography>
                <Typography variant="body2">
                  <strong>Kontaktpersonen:</strong>{' '}
                  {formData.features?.contact_persons_enabled ? '✅ Aktiviert' : '❌ Deaktiviert'}
                </Typography>
                {formData.contact_persons?.length > 0 && (
                  <Typography variant="body2">
                    <strong>Anzahl Kontakte:</strong> {formData.contact_persons.length}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Datenquellen
                </Typography>
                <Typography variant="body2">
                  <strong>Website:</strong>{' '}
                  {formData.website_url ? `✅ ${formData.website_url}` : '❌ Keine Website'}
                </Typography>
                <Typography variant="body2">
                  <strong>Dokumente:</strong>{' '}
                  {formData.uploaded_files?.length ? `✅ ${formData.uploaded_files.length} Dateien` : '❌ Keine Dokumente'}
                </Typography>
                <Typography variant="body2">
                  <strong>Manueller Text:</strong>{' '}
                  {formData.manual_text?.trim() ? '✅ Vorhanden' : '❌ Kein Text'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Validation & Preview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ✅ Validierung
              </Typography>

              <List dense>
                {validationResults.map((result, index) => (
                  <ValidationItem key={index} {...result} />
                ))}
              </List>

              {!canCreate && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Bitte korrigieren Sie die markierten Punkte vor der Erstellung.
                </Alert>
              )}

              {canCreate && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  🎉 Ihr Chatbot ist bereit zur Erstellung!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Design Preview */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎨 Design-Vorschau
              </Typography>

              <Box
                sx={{
                  background: `linear-gradient(135deg, ${formData.branding?.primary_color || '#1f3a93'}, ${formData.branding?.secondary_color || '#34495e'})`,
                  color: 'white',
                  p: 3,
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  🤖 {formData.name || 'Ihr Chatbot'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {formData.company_info?.company_name || 'Ihr Unternehmen'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {formData.branding?.welcome_message || 'Hallo! Wie kann ich Ihnen helfen?'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Create Button */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                🚀 Chatbot erstellen
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Klicken Sie auf den Button, um Ihren Chatbot zu erstellen. 
                Dies kann einige Minuten dauern.
              </Typography>

              <Button
                variant="contained"
                size="large"
                startIcon={<RocketIcon />}
                onClick={onCreateChatbot}
                disabled={!canCreate}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  background: canCreate 
                    ? 'linear-gradient(135deg, #1f3a93, #34495e)' 
                    : undefined,
                  '&:hover': canCreate ? {
                    background: 'linear-gradient(135deg, #4a69bd, #5a6c7d)',
                  } : undefined,
                }}
              >
                Chatbot jetzt erstellen
              </Button>

              {!canCreate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Bitte füllen Sie alle Pflichtfelder aus
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PreviewStep;