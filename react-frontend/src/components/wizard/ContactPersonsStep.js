import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

function ContactPersonsStep({ formData, updateFormData }) {
  const [newContact, setNewContact] = React.useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
  });

  const handleContactPersonsToggle = (enabled) => {
    updateFormData({
      features: {
        ...formData.features,
        contact_persons_enabled: enabled,
      },
    });
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.position && newContact.email) {
      updateFormData({
        contact_persons: [
          ...(formData.contact_persons || []),
          { ...newContact, id: Date.now().toString() },
        ],
      });
      setNewContact({
        name: '',
        position: '',
        email: '',
        phone: '',
        department: '',
        specialization: '',
      });
    }
  };

  const handleRemoveContact = (index) => {
    const updatedContacts = formData.contact_persons?.filter((_, i) => i !== index) || [];
    updateFormData({ contact_persons: updatedContacts });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        👥 Kontaktpersonen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fügen Sie Ansprechpartner hinzu, die Ihre Website-Besucher kontaktieren können
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={formData.features?.contact_persons_enabled || false}
            onChange={(e) => handleContactPersonsToggle(e.target.checked)}
          />
        }
        label="Kontaktpersonen-Feature aktivieren"
        sx={{ mb: 3 }}
      />

      {formData.features?.contact_persons_enabled && (
        <>
          {/* Existing Contacts */}
          {formData.contact_persons?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aktuelle Kontaktpersonen
              </Typography>
              {formData.contact_persons.map((contact, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">
                          👤 {contact.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {contact.position}
                        </Typography>
                        <Typography variant="body2">
                          📧 {contact.email}
                        </Typography>
                        {contact.phone && (
                          <Typography variant="body2">
                            📞 {contact.phone}
                          </Typography>
                        )}
                        {contact.department && (
                          <Typography variant="body2">
                            🏢 {contact.department}
                          </Typography>
                        )}
                        {contact.specialization && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {contact.specialization}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveContact(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Add New Contact */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ➕ Neue Kontaktperson hinzufügen
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name *"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Position *"
                    value={newContact.position}
                    onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Abteilung"
                    value={newContact.department}
                    onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Spezialisierung"
                    value={newContact.specialization}
                    onChange={(e) => setNewContact({ ...newContact, specialization: e.target.value })}
                    placeholder="z.B. Produktberatung, Technischer Support..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddContact}
                    disabled={!newContact.name || !newContact.position || !newContact.email}
                  >
                    Kontaktperson hinzufügen
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {!formData.features?.contact_persons_enabled && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Kontaktpersonen-Feature deaktiviert
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aktivieren Sie das Feature, um Ansprechpartner hinzuzufügen, die Ihre Website-Besucher direkt kontaktieren können.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ContactPersonsStep;