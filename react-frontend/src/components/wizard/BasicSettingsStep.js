import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';

function BasicSettingsStep({ formData, updateFormData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const predefinedTags = [
    'Kundenservice', 'Vertrieb', 'Support', 'FAQ', 'E-Commerce', 
    'Gesundheit', 'Bildung', 'Immobilien', 'Automotive', 'Beratung'
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 0 } }}>
      <Typography 
        variant={isMobile ? 'h6' : 'h5'} 
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        📋 Grundeinstellungen
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: 3,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        Definieren Sie die Grunddaten für Ihren Chatbot
      </Typography>

      <TextField
        fullWidth
        label="Chatbot Name *"
        value={formData.name || ''}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="z.B. Kundenservice Assistant, Support Bot"
        sx={{ 
          mb: 3,
          '& .MuiInputBase-input': {
            fontSize: { xs: '16px', sm: '14px' } // Prevents zoom on iOS
          }
        }}
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
        sx={{ 
          mb: 3,
          '& .MuiInputBase-input': {
            fontSize: { xs: '16px', sm: '14px' }
          }
        }}
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