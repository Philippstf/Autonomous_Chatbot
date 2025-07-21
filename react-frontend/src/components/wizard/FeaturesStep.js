import React from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

function FeaturesStep({ formData, updateFormData }) {
  const handleFeaturesChange = (field, value) => {
    updateFormData({
      features: {
        ...formData.features,
        [field]: value,
      },
    });
  };

  const handleEmailCaptureChange = (field, value) => {
    updateFormData({
      features: {
        ...formData.features,
        email_capture_config: {
          ...formData.features?.email_capture_config,
          [field]: value,
        },
      },
    });
  };

  const handleBehaviorChange = (field, value) => {
    updateFormData({
      features: {
        ...formData.features,
        behavior_settings: {
          ...formData.features?.behavior_settings,
          [field]: value,
        },
      },
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        ⚡ Features & Verhalten
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Konfigurieren Sie erweiterte Funktionen und das Chatbot-Verhalten
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📧 Email-Erfassung
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features?.email_capture_enabled || false}
                    onChange={(e) => handleFeaturesChange('email_capture_enabled', e.target.checked)}
                  />
                }
                label="Email-Erfassung aktivieren"
                sx={{ mb: 2 }}
              />

              {formData.features?.email_capture_enabled && (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Email-Prompt"
                    value={formData.features?.email_capture_config?.prompt || ''}
                    onChange={(e) => handleEmailCaptureChange('prompt', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Trigger-Keywords"
                    value={formData.features?.email_capture_config?.trigger_keywords?.join(', ') || ''}
                    onChange={(e) => handleEmailCaptureChange('trigger_keywords', e.target.value.split(', '))}
                    placeholder="preise, angebot, kontakt"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Nach X Nachrichten fragen"
                    value={formData.features?.email_capture_config?.after_messages || 3}
                    onChange={(e) => handleEmailCaptureChange('after_messages', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🤖 Chatbot-Verhalten
              </Typography>

              <TextField
                fullWidth
                select
                label="Gesprächston"
                value={formData.features?.behavior_settings?.tone || 'Professionell'}
                onChange={(e) => handleBehaviorChange('tone', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Professionell">Professionell</MenuItem>
                <MenuItem value="Freundlich">Freundlich</MenuItem>
                <MenuItem value="Technisch">Technisch</MenuItem>
                <MenuItem value="Lässig">Lässig</MenuItem>
                <MenuItem value="Enthusiastisch">Enthusiastisch</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Antwortlänge"
                value={formData.features?.behavior_settings?.response_length || 'Mittel'}
                onChange={(e) => handleBehaviorChange('response_length', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Kurz">Kurz</MenuItem>
                <MenuItem value="Mittel">Mittel</MenuItem>
                <MenuItem value="Ausführlich">Ausführlich</MenuItem>
                <MenuItem value="Kontextabhängig">Kontextabhängig</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Anrede"
                value={formData.features?.behavior_settings?.formality || 'Sie (förmlich)'}
                onChange={(e) => handleBehaviorChange('formality', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Sie (förmlich)">Sie (förmlich)</MenuItem>
                <MenuItem value="Du (informell)">Du (informell)</MenuItem>
                <MenuItem value="Automatisch erkennen">Automatisch erkennen</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Sprache"
                value={formData.features?.behavior_settings?.language || 'Deutsch'}
                onChange={(e) => handleBehaviorChange('language', e.target.value)}
              >
                <MenuItem value="Deutsch">Deutsch</MenuItem>
                <MenuItem value="Englisch">Englisch</MenuItem>
                <MenuItem value="Französisch">Französisch</MenuItem>
                <MenuItem value="Spanisch">Spanisch</MenuItem>
                <MenuItem value="Italienisch">Italienisch</MenuItem>
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💬 Zusätzliche Anweisungen
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Spezielle Anweisungen"
                value={formData.features?.behavior_settings?.custom_instructions || ''}
                onChange={(e) => handleBehaviorChange('custom_instructions', e.target.value)}
                placeholder="z.B. 'Betone immer unsere 24/7-Verfügbarkeit', 'Erwähne unser kostenloses Beratungsgespräch'"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FeaturesStep;