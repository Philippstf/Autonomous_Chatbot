import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Divider,
  Link,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { 
  Person, 
  Email, 
  Phone, 
  Business, 
  Close,
  Launch,
  ContactSupport 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ContactPersonModal = ({ open, onClose, contactPersons = [], chatbotName = 'Chatbot' }) => {
  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone) => {
    // Remove spaces and formatting for tel: link
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const ContactCard = ({ contact }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        mb: 2, 
        border: '1px solid rgba(30, 58, 138, 0.1)',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(30, 58, 138, 0.1)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {/* Profile Image */}
            <Avatar
              src={contact.profileImagePreview || contact.profileImage}
              sx={{
                width: 72,
                height: 72,
                border: '3px solid rgba(30, 58, 138, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Person sx={{ fontSize: '2rem', color: '#1e3a8a' }} />
            </Avatar>
            
            {/* Contact Information */}
            <Box sx={{ flex: 1 }}>
              {/* Name and Position */}
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#1e3a8a',
                mb: 0.5 
              }}>
                {contact.name}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#6b7280', 
                fontWeight: 500,
                mb: 2 
              }}>
                {contact.position}
              </Typography>

              {/* Department */}
              {contact.department && (
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={<Business />}
                    label={contact.department}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#e5e7eb',
                      color: '#374151',
                      backgroundColor: '#f9fafb',
                    }}
                  />
                </Box>
              )}

              {/* Specialization */}
              {contact.specialization && (
                <Typography variant="body2" sx={{ 
                  color: '#6b7280',
                  mb: 2,
                  fontStyle: 'italic'
                }}>
                  {contact.specialization}
                </Typography>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Contact Methods */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Email */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                  <Link
                    component="button"
                    onClick={() => handleEmailClick(contact.email)}
                    sx={{
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#1e40af',
                      }
                    }}
                  >
                    {contact.email}
                  </Link>
                  <Launch sx={{ fontSize: '1rem', color: '#9ca3af' }} />
                </Box>

                {/* Phone */}
                {contact.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <Link
                      component="button"
                      onClick={() => handlePhoneClick(contact.phone)}
                      sx={{
                        color: '#10b981',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#059669',
                        }
                      }}
                    >
                      {contact.phone}
                    </Link>
                    <Launch sx={{ fontSize: '1rem', color: '#9ca3af' }} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ContactSupport sx={{ fontSize: '1.8rem' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              👥 Unsere Ansprechpartner
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Kontaktieren Sie uns direkt für persönliche Beratung
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Introduction */}
          <Box sx={{ mb: 3, p: 3, backgroundColor: '#dbeafe', borderRadius: 2, border: '1px solid #3b82f6' }}>
            <Typography variant="body1" sx={{ color: '#1e40af', textAlign: 'center', fontWeight: 500 }}>
              Unser <strong>{chatbotName}</strong> Team steht Ihnen gerne zur Verfügung. 
              Wählen Sie den passenden Ansprechpartner für Ihr Anliegen.
            </Typography>
          </Box>

          {/* Contact Persons List */}
          {contactPersons.length > 0 ? (
            <Box>
              {contactPersons.map((contact, index) => (
                <ContactCard key={contact.id || index} contact={contact} />
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              backgroundColor: '#f9fafb',
              borderRadius: 2,
              border: '1px dashed #d1d5db'
            }}>
              <Person sx={{ fontSize: '3rem', color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                Keine Kontaktpersonen verfügbar
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Derzeit sind keine spezifischen Ansprechpartner hinterlegt.
              </Typography>
            </Box>
          )}

          {/* Footer Info */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            backgroundColor: '#f1f5f9', 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              💡 <strong>Tipp:</strong> Klicken Sie auf E-Mail oder Telefon, um direkt Kontakt aufzunehmen. 
              Wir antworten in der Regel innerhalb von 24 Stunden.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        justifyContent: 'center'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #1e40af, #2563eb)',
            }
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactPersonModal;