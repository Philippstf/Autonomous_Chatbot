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
            fontSize: { xs: '16px', sm: '14px' }, // Prevents zoom on iOS
            color: '#ffffff',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#3b82f6',
            }
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6',
              borderWidth: '2px',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 1,
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
            fontSize: { xs: '16px', sm: '14px' },
            color: '#ffffff',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#3b82f6',
            }
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6',
              borderWidth: '2px',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 1,
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
            <Chip 
              variant="outlined" 
              label={option} 
              {...getTagProps({ index })}
              sx={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                color: '#ffffff',
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    color: '#ffffff',
                  }
                }
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags / Kategorien"
            placeholder="Wählen Sie Kategorien oder fügen Sie eigene hinzu..."
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '16px', sm: '14px' },
                color: '#ffffff',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                padding: '12px 16px',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#3b82f6',
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              }
            }}
          />
        )}
        sx={{
          '& .MuiAutocomplete-popupIndicator': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiAutocomplete-clearIndicator': {
            color: 'rgba(255, 255, 255, 0.7)',
          }
        }}
      />
    </Box>
  );
}

export default BasicSettingsStep;