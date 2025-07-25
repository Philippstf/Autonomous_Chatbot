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
import { PeopleAlt } from '@mui/icons-material';

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

  const handleContactPersonsChange = (field, value) => {
    updateFormData({
      features: {
        ...formData.features,
        contact_persons_config: {
          ...formData.features?.contact_persons_config,
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
        {/* Email Capture Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
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
                    helperText="Die Nachricht, die der Bot anzeigt, um nach der E-Mail zu fragen."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Trigger-Keywords (kommagetrennt)"
                    value={formData.features?.email_capture_config?.trigger_keywords?.join(', ') || ''}
                    onChange={(e) => handleEmailCaptureChange('trigger_keywords', e.target.value.split(',').map(k => k.trim()))}
                    placeholder="preise, angebot, kontakt"
                    helperText="Wörter, die die E-Mail-Abfrage auslösen."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Nach X Nachrichten fragen"
                    value={formData.features?.email_capture_config?.after_messages || 3}
                    onChange={(e) => handleEmailCaptureChange('after_messages', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 20 }}
                    helperText="Automatische Abfrage nach einer bestimmten Anzahl von Nachrichten."
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Persons Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleAlt /> Ansprechpartner-Anzeige
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features?.contact_persons_enabled || false}
                    onChange={(e) => handleFeaturesChange('contact_persons_enabled', e.target.checked)}
                  />
                }
                label="Ansprechpartner-Modal aktivieren"
                sx={{ mb: 2 }}
              />

              {formData.features?.contact_persons_enabled && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Zeigt ein Fenster mit den hinterlegten Kontaktdaten, wenn der Nutzer danach fragt.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Trigger-Keywords (kommagetrennt)"
                    value={formData.features?.contact_persons_config?.trigger_keywords?.join(', ') || ''}
                    onChange={(e) => handleContactPersonsChange('trigger_keywords', e.target.value.split(',').map(k => k.trim()))}
                    placeholder="kontakt, ansprechpartner, hilfe"
                    helperText="Wörter, die das Ansprechpartner-Fenster auslösen."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Nach X Nachrichten anzeigen"
                    value={formData.features?.contact_persons_config?.after_messages || 5}
                    onChange={(e) => handleContactPersonsChange('after_messages', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 20 }}
                    helperText="Automatische Anzeige nach einer bestimmten Anzahl von Nachrichten."
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Behavior Settings Card */}
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

        {/* Custom Instructions Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💬 Zusätzliche Anweisungen
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={11}
                label="Spezielle Anweisungen"
                value={formData.features?.behavior_settings?.custom_instructions || ''}
                onChange={(e) => handleBehaviorChange('custom_instructions', e.target.value)}
                placeholder="z.B. 'Betone immer unsere 24/7-Verfügbarkeit', 'Erwähne unser kostenloses Beratungsgespräch'"
                helperText="Geben Sie dem Bot spezifische Verhaltensregeln oder Informationen, die er immer beachten soll."
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FeaturesStep;