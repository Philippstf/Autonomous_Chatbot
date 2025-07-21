import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Autocomplete,
} from '@mui/material';

function BasicSettingsStep({ formData, updateFormData }) {
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const predefinedTags = [
    'Kundenservice', 'Vertrieb', 'Support', 'FAQ', 'E-Commerce', 
    'Gesundheit', 'Bildung', 'Immobilien', 'Automotive', 'Beratung'
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        📋 Grundeinstellungen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Definieren Sie die Grunddaten für Ihren Chatbot
      </Typography>

      <TextField
        fullWidth
        label="Chatbot Name *"
        value={formData.name || ''}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="z.B. Kundenservice Assistant, Support Bot"
        sx={{ mb: 3 }}
        required
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Beschreibung"
        value={formData.description || ''}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Beschreiben Sie den Zweck und die Aufgaben Ihres Chatbots..."
        sx={{ mb: 3 }}
      />

      <Autocomplete
        multiple
        freeSolo
        options={predefinedTags}
        value={formData.tags || []}
        onChange={(event, newValue) => handleInputChange('tags', newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags / Kategorien"
            placeholder="Wählen Sie Kategorien oder fügen Sie eigene hinzu..."
          />
        )}
      />
    </Box>
  );
}

export default BasicSettingsStep;