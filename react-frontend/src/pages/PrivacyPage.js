import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #ffffff, #f8fafc)' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1e3a8a', 
            mb: 3,
            textAlign: 'center'
          }}>
            Datenschutzerklärung
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#374151' }}>
            Stand: {new Date().toLocaleDateString('de-DE')}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ '& > *': { mb: 4 } }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                1. Verantwortlicher
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Philipp Staufenberger Media<br />
                Glemsgaustraße 19<br />
                70499 Stuttgart<br />
                Deutschland<br />
                E-Mail: info@helferlain.com
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                2. Grundsätze der Datenverarbeitung
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                HELFERLAIN verarbeitet personenbezogene Daten ausschließlich auf deutschen Servern und 
                unter Einhaltung der DSGVO. Ihre Daten verlassen niemals die EU und werden mit höchsten 
                Sicherheitsstandards geschützt.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                3. Verwendete Dienste und Datenverarbeitung
              </Typography>
              
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#1e40af', mb: 2 }}>
                3.1 Supabase (Authentifizierung und Datenbank)
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
                Für die Benutzerauthentifizierung und Datenspeicherung nutzen wir Supabase mit Servern in Deutschland. 
                Verarbeitete Daten: E-Mail-Adresse, verschlüsseltes Passwort, Chatbot-Konfigurationen.<br />
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 500, color: '#1e40af', mb: 2 }}>
                3.2 OpenAI API (KI-Verarbeitung)
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
                Für die KI-Funktionen nutzen wir die OpenAI API. Chat-Nachrichten werden zur Antwortgenerierung 
                verarbeitet, aber nicht dauerhaft gespeichert.<br />
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 500, color: '#1e40af', mb: 2 }}>
                3.3 Railway (Hosting Backend)
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
                Unser Backend läuft auf Railway mit deutschen/EU Servern. Verarbeitet werden technische 
                Daten für den Betrieb der Anwendung.<br />
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 500, color: '#1e40af', mb: 2 }}>
                3.4 Vercel (Hosting Frontend)
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
                Das Frontend wird über Vercel bereitgestellt. Es werden nur technische Daten für 
                die Auslieferung der Webseite verarbeitet.<br />
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                4. Ihre Rechte
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Sie haben das Recht auf:<br />
                • Auskunft über Ihre gespeicherten Daten<br />
                • Berichtigung unrichtiger Daten<br />
                • Löschung Ihrer Daten<br />
                • Einschränkung der Verarbeitung<br />
                • Datenübertragbarkeit<br />
                • Widerspruch gegen die Verarbeitung<br />
                • Beschwerde bei einer Aufsichtsbehörde
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                5. Datensicherheit
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Alle Daten werden verschlüsselt übertragen und gespeichert. Der Zugriff ist durch 
                moderne Authentifizierungsverfahren geschützt. Unsere Server befinden sich 
                ausschließlich in Deutschland und der EU.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                6. Kontakt
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Bei Fragen zum Datenschutz kontaktieren Sie uns unter:<br />
                E-Mail: privacy@helferlain.com<br />
                Adresse: Glemsgaustraße 19, 70499 Stuttgart
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PrivacyPage;