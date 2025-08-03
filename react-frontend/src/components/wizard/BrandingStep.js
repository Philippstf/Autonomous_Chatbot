import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { ChromePicker } from 'react-color';

function BrandingStep({ formData, updateFormData }) {
  const [showColorPicker, setShowColorPicker] = React.useState(null);

  const handleBrandingChange = (field, value) => {
    updateFormData({
      branding: {
        ...formData.branding,
        [field]: value,
      },
    });
  };

  const ColorPickerButton = ({ label, color, field }) => (
    <Box>
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => setShowColorPicker(showColorPicker === field ? null : field)}
        sx={{
          backgroundColor: color,
          color: 'white',
          '&:hover': { backgroundColor: color },
          minWidth: 120,
          height: 40,
        }}
      >
        {color}
      </Button>
      {showColorPicker === field && (
        <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
          <ChromePicker
            color={color}
            onChange={(newColor) => handleBrandingChange(field, newColor.hex)}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
        🎨 Design & Branding
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
        Gestalten Sie das Aussehen Ihres Chatbots
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
            Farbschema
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <ColorPickerButton
                label="Primärfarbe"
                color={formData.branding?.primary_color || '#1f3a93'}
                field="primary_color"
              />
            </Grid>
            <Grid item xs={4}>
              <ColorPickerButton
                label="Sekundärfarbe"
                color={formData.branding?.secondary_color || '#34495e'}
                field="secondary_color"
              />
            </Grid>
            <Grid item xs={4}>
              <ColorPickerButton
                label="Akzentfarbe"
                color={formData.branding?.accent_color || '#e74c3c'}
                field="accent_color"
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Willkommensnachricht"
            value={formData.branding?.welcome_message || ''}
            onChange={(e) => handleBrandingChange('welcome_message', e.target.value)}
            placeholder="Hallo! Ich bin Ihr persönlicher Assistent..."
            sx={{ 
              mt: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: '#d1d5db',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1e3a8a',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#6b7280',
                '&.Mui-focused': {
                  color: '#1e3a8a',
                }
              },
              '& .MuiInputBase-input': {
                color: '#374151',
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
            Vorschau
          </Typography>
          <Card>
            <CardContent
              sx={{
                background: `linear-gradient(135deg, ${formData.branding?.primary_color || '#1f3a93'}, ${formData.branding?.secondary_color || '#34495e'})`,
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6">
                🤖 {formData.name || 'Ihr Chatbot'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formData.branding?.welcome_message || 'Willkommensnachricht hier...'}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: formData.branding?.accent_color || '#e74c3c',
                  '&:hover': {
                    backgroundColor: formData.branding?.accent_color || '#e74c3c',
                    opacity: 0.8,
                  },
                }}
              >
                Chat starten
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BrandingStep;