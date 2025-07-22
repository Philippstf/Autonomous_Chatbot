import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send, Email, Phone, LocationOn } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate form submission (in production, send to backend)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send the form data to your backend
      console.log('Contact form submitted:', formData);
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          color: '#1e3a8a', 
          mb: 6,
          textAlign: 'center'
        }}>
          Kontakt
        </Typography>

        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 4, 
              height: 'fit-content',
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Kontaktinformationen
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationOn sx={{ mr: 2, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Adresse
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Philipp Staufenberger Media<br />
                    Glemsgaustraße 19<br />
                    70499 Stuttgart, Deutschland
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Email sx={{ mr: 2, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    E-Mail
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    info@helferlain.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Phone sx={{ mr: 2, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Telefon
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    +49 (0) 711 123456789
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  🇩🇪 DSGVO-konforme KI-Lösungen
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Alle Daten werden ausschließlich auf deutschen Servern verarbeitet.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              border: '1px solid rgba(30, 58, 138, 0.1)'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: '#1e3a8a', 
                mb: 3 
              }}>
                Nachricht senden
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Vielen Dank für Ihre Nachricht! Wir melden uns schnellstmöglich bei Ihnen.
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-Mail"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Betreff"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nachricht"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      placeholder="Beschreiben Sie Ihr Anliegen oder Ihren Bedarf für KI-Lösungen..."
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                        },
                        '&:disabled': {
                          background: '#9ca3af',
                        }
                      }}
                    >
                      {loading ? 'Wird gesendet...' : 'Nachricht senden'}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              <Box sx={{ 
                mt: 4, 
                p: 3, 
                backgroundColor: '#f1f5f9', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="body1" sx={{ 
                  fontWeight: 500, 
                  color: '#1e3a8a', 
                  mb: 1 
                }}>
                  Schnelle Antwort gewünscht?
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Für dringende Anfragen oder direkte Beratungstermine erreichen Sie uns 
                  telefonisch oder per E-Mail. Wir antworten in der Regel innerhalb von 24 Stunden.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ContactPage;