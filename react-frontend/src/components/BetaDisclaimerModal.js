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
  Divider,
  IconButton
} from '@mui/material';
import { Warning, Close, Engineering, Security } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BetaDisclaimerModal = ({ open, onAccept, onDecline }) => {
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
        background: 'linear-gradient(135deg, #dc2626, #ef4444)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <Warning sx={{ mr: 2, fontSize: '2rem' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            WICHTIGER BETA-HINWEIS
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Bitte lesen Sie diese Informationen sorgfältig
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Hauptwarnung */}
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#fee2e2', 
              border: '2px solid #dc2626',
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', mb: 1 }}>
              🚨 BETA-PHASE WARNUNG
            </Typography>
            <Typography variant="body1" sx={{ color: '#dc2626', fontWeight: 500 }}>
              HELFERLAIN befindet sich im Aufbau/Beta-Phase. Wir arbeiten mit Drittanbieter-APIs 
              statt eigener Server-Infrastruktur. Nutzen Sie <strong>NUR öffentlich zugängliche 
              Informationen</strong> und <strong>KEINE privaten, sicherheitssensitiven Daten</strong>, 
              die nicht mit Dritten geteilt werden dürfen!
            </Typography>
          </Alert>

          {/* Details zu Drittanbietern */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center' }}>
              <Engineering sx={{ mr: 1 }} />
              Verwendete Drittanbieter-Services:
            </Typography>
            
            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>• OpenAI API:</strong> KI-Textgenerierung und Chat-Funktionen
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>• Supabase:</strong> Benutzer-Authentifizierung und Datenbank
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>• Railway/Vercel:</strong> Hosting und Server-Infrastruktur
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
              <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                <strong>Ihre Daten können durch API-Zugriffe an diese Drittanbieter übertragen werden.</strong>
              </Typography>
            </Alert>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Haftungsausschluss */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', mb: 2, display: 'flex', alignItems: 'center' }}>
              <Security sx={{ mr: 1 }} />
              Haftungsausschluss:
            </Typography>
            
            <Box component="ul" sx={{ color: '#374151', pl: 3, mb: 2 }}>
              <li><strong>KEINE Gewähr</strong> für Richtigkeit der KI-generierten Inhalte</li>
              <li><strong>KEINE Haftung</strong> für Datenverlust oder -missbrauch durch Drittanbieter</li>
              <li><strong>KEINE Garantie</strong> für kontinuierliche Verfügbarkeit der Plattform</li>
              <li><strong>Nutzung auf eigenes Risiko</strong> - Beta-Version kann jederzeit geändert werden</li>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Nutzungsrichtlinien */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
              ✅ Erlaubte Nutzung:
            </Typography>
            <Box component="ul" sx={{ color: '#059669', pl: 3, mb: 2 }}>
              <li>Öffentlich zugängliche Website-Inhalte</li>
              <li>Allgemeine Unternehmensinformationen</li>
              <li>Nicht-sensible FAQ und Produktbeschreibungen</li>
              <li>Öffentliche Dokumentationen und Handbücher</li>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', mb: 2 }}>
              ❌ Verbotene Nutzung:
            </Typography>
            <Box component="ul" sx={{ color: '#dc2626', pl: 3 }}>
              <li>Persönliche oder vertrauliche Daten</li>
              <li>Interne Unternehmensdokumente</li>
              <li>Passwörter, API-Keys oder Zugangsdaten</li>
              <li>Medizinische, rechtliche oder finanzielle Informationen</li>
              <li>Urheberrechtlich geschützte Inhalte ohne Berechtigung</li>
            </Box>
          </Box>

          {/* Link zu Nutzungsbedingungen */}
          <Alert severity="info" sx={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
            <Typography variant="body2" sx={{ color: '#1e40af' }}>
              Weitere Details finden Sie in unseren{' '}
              <Link 
                href="/terms" 
                target="_blank" 
                sx={{ color: '#1e40af', fontWeight: 600, textDecoration: 'underline' }}
              >
                Nutzungsbedingungen
              </Link>
              {' '}und der{' '}
              <Link 
                href="/privacy" 
                target="_blank" 
                sx={{ color: '#1e40af', fontWeight: 600, textDecoration: 'underline' }}
              >
                Datenschutzerklärung
              </Link>
              .
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={onDecline}
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
          Ablehnen
        </Button>
        
        <Button
          onClick={onAccept}
          variant="contained"
          color="primary"
          size="large"
          sx={{ 
            minWidth: 200,
            background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1e40af, #2563eb)',
            }
          }}
        >
          Verstanden & Akzeptieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BetaDisclaimerModal;