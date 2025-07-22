import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Warning, Close, SmartToy, CheckCircle, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BotCreationDisclaimerModal = ({ open, onAccept, onCancel, botName }) => {
  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #f59e0b, #f97316)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <SmartToy sx={{ mr: 2, fontSize: '2rem' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Chatbot "{botName}" erstellen - Beta-Hinweis
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Letzter Schritt vor der Erstellung
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Hauptwarnung */}
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#fef3c7', 
              border: '2px solid #f59e0b',
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
              ⚠️ BETA-PHASE ERINNERUNG
            </Typography>
            <Typography variant="body1" sx={{ color: '#92400e', fontWeight: 500 }}>
              Sie sind dabei, einen Chatbot in unserer <strong>Beta-Version</strong> zu erstellen. 
              Ihre Daten werden durch <strong>Drittanbieter-APIs</strong> verarbeitet!
            </Typography>
          </Alert>

          {/* Daten-Checkliste */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', mb: 2 }}>
              🔍 Überprüfen Sie Ihre Daten:
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#059669', fontWeight: 600, mb: 1 }}>
              ✅ ERLAUBT - Verwenden Sie folgende Daten:
            </Typography>
            <List dense sx={{ color: '#059669', pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#059669', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Öffentlich zugängliche Website-Inhalte" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#059669', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Allgemeine Produktbeschreibungen und FAQ" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#059669', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Öffentliche Unternehmensinformationen" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#059669', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Handbücher und öffentliche Dokumentationen" />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ color: '#dc2626', fontWeight: 600, mt: 2, mb: 1 }}>
              ❌ VERBOTEN - Verwenden Sie KEINE:
            </Typography>
            <List dense sx={{ color: '#dc2626', pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Cancel sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Persönliche oder vertrauliche Kundendaten" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Cancel sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Interne Unternehmensdokumente" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Cancel sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Passwörter, API-Keys oder Zugangsdaten" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Cancel sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Gesundheitsdaten, Finanzinformationen oder Rechtsdokumente" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* API-Datenübertragung */}
          <Alert severity="error" sx={{ mb: 3, backgroundColor: '#fee2e2', border: '1px solid #dc2626' }}>
            <Typography variant="body1" sx={{ color: '#dc2626', fontWeight: 600, mb: 1 }}>
              🚨 Datenübertragung an Drittanbieter:
            </Typography>
            <Typography variant="body2" sx={{ color: '#dc2626' }}>
              • <strong>OpenAI API:</strong> Ihre Texte werden zur KI-Verarbeitung übertragen<br />
              • <strong>Supabase:</strong> Chatbot-Konfiguration wird gespeichert<br />
              • <strong>Railway/Vercel:</strong> Hosting und Datenverarbeitung
            </Typography>
          </Alert>

          {/* Haftungsausschluss */}
          <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
            <Typography variant="body1" sx={{ color: '#92400e', fontWeight: 600, mb: 1 }}>
              📋 Haftungsausschluss:
            </Typography>
            <Typography variant="body2" sx={{ color: '#92400e' }}>
              HELFERLAIN übernimmt <strong>KEINE Gewähr</strong> für die Richtigkeit der KI-generierten Antworten 
              und <strong>KEINE Haftung</strong> für die Datenverarbeitung durch Drittanbieter-APIs. 
              Die Nutzung erfolgt auf eigenes Risiko.
            </Typography>
          </Alert>

          {/* Bestätigung */}
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f1f5f9', 
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="body1" sx={{ color: '#1e40af', fontWeight: 600, textAlign: 'center' }}>
              Durch das Erstellen des Chatbots bestätigen Sie, dass Sie:<br />
              ✓ Diese Hinweise gelesen und verstanden haben<br />
              ✓ Nur erlaubte, nicht-sensible Daten verwenden<br />
              ✓ Die{' '}
              <Link href="/terms" target="_blank" sx={{ fontWeight: 700 }}>
                Nutzungsbedingungen
              </Link>{' '}
              akzeptieren
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="error"
          size="large"
          sx={{ 
            minWidth: 150,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Abbrechen
        </Button>
        
        <Button
          onClick={onAccept}
          variant="contained"
          color="primary"
          size="large"
          sx={{ 
            minWidth: 250,
            background: 'linear-gradient(45deg, #059669, #10b981)',
            '&:hover': {
              background: 'linear-gradient(45deg, #047857, #059669)',
            }
          }}
        >
          Chatbot erstellen - Ich stimme zu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BotCreationDisclaimerModal;