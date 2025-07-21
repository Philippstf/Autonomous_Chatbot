import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';

function CompanyInfoStep({ formData, updateFormData }) {
  const handleCompanyInfoChange = (field, value) => {
    updateFormData({
      company_info: {
        ...formData.company_info,
        [field]: value,
      },
    });
  };

  const handleAddressChange = (field, value) => {
    updateFormData({
      company_info: {
        ...formData.company_info,
        address: {
          ...formData.company_info?.address,
          [field]: value,
        },
      },
    });
  };

  const industries = [
    'IT & Software', 'E-Commerce', 'Beratung', 'Gesundheitswesen',
    'Bildung', 'Finanzdienstleistungen', 'Immobilien', 'Automotive',
    'Fertigung', 'Handel', 'Gastronomie', 'Tourismus', 'Logistik',
    'Marketing & Werbung', 'Rechtsberatung', 'Architektur', 'Sonstiges'
  ];

  const companySizes = [
    '1-10 Mitarbeiter', '11-50 Mitarbeiter', 
    '51-200 Mitarbeiter', '200+ Mitarbeiter'
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🏢 Unternehmensdaten
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Geben Sie Ihre Kontaktdaten und Unternehmensinformationen ein
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Firmenname *"
            value={formData.company_info?.company_name || ''}
            onChange={(e) => handleCompanyInfoChange('company_name', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Branche"
            value={formData.company_info?.industry || ''}
            onChange={(e) => handleCompanyInfoChange('industry', e.target.value)}
            sx={{ mb: 2 }}
          >
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry}>
                {industry}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Unternehmensgröße"
            value={formData.company_info?.company_size || ''}
            onChange={(e) => handleCompanyInfoChange('company_size', e.target.value)}
            sx={{ mb: 2 }}
          >
            {companySizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Website"
            value={formData.company_info?.website || ''}
            onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
            placeholder="https://www.ihre-firma.de"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={formData.company_info?.email || ''}
            onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Telefon"
            value={formData.company_info?.phone || ''}
            onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
            placeholder="+49 123 456789"
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            📍 Adresse
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Straße & Hausnummer"
            value={formData.company_info?.address?.street || ''}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="PLZ"
            value={formData.company_info?.address?.zip_code || ''}
            onChange={(e) => handleAddressChange('zip_code', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Stadt"
            value={formData.company_info?.address?.city || ''}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Land"
            value={formData.company_info?.address?.country || 'Deutschland'}
            onChange={(e) => handleAddressChange('country', e.target.value)}
          >
            <MenuItem value="Deutschland">Deutschland</MenuItem>
            <MenuItem value="Österreich">Österreich</MenuItem>
            <MenuItem value="Schweiz">Schweiz</MenuItem>
            <MenuItem value="Andere">Andere</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CompanyInfoStep;