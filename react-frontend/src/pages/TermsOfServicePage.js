import React from 'react';
import { Container, Typography, Box, Paper, Divider, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Warning, Engineering } from '@mui/icons-material';

const TermsOfServicePage = () => {
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
            Nutzungsbedingungen
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#374151' }}>
            Stand: {new Date().toLocaleDateString('de-DE')}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {/* Beta-Warnung */}
          <Alert severity="warning" sx={{ mb: 4, backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning sx={{ mr: 1, color: '#f59e0b' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#92400e' }}>
                BETA-PHASE - WICHTIGER HINWEIS
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#92400e', fontWeight: 500 }}>
              HELFERLAIN befindet sich derzeit in der Beta-Phase. Wir arbeiten mit Drittanbieter-APIs 
              statt eigener Server-Infrastruktur. Nutzen Sie AUSSCHLIESSLICH öffentlich zugängliche 
              Informationen und KEINE privaten, sicherheitssensitiven Daten, die nicht mit Dritten 
              geteilt werden dürfen.
            </Typography>
          </Alert>

          <Box sx={{ '& > *': { mb: 4 } }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                1. Geltungsbereich und Vertragspartner
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Diese Nutzungsbedingungen gelten für die Nutzung der HELFERLAIN-Plattform, 
                betrieben von:<br /><br />
                Philipp Staufenberger Media<br />
                Glemsgaustraße 19<br />
                70499 Stuttgart<br />
                Deutschland<br />
                E-Mail: info@helferlain.com
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                2. Beta-Phase und Drittanbieter-Services
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
                <strong>WICHTIG:</strong> HELFERLAIN befindet sich in der Beta-Entwicklungsphase. 
                Während dieser Phase werden folgende Drittanbieter-Services verwendet:
              </Typography>
              
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" sx={{ color: '#374151', mb: 1 }}>
                  <strong>• OpenAI API:</strong> Für KI-Textgenerierung und Chat-Funktionen
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', mb: 1 }}>
                  <strong>• Supabase:</strong> Für Authentifizierung und Datenbankfunktionen
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', mb: 1 }}>
                  <strong>• Railway/Vercel:</strong> Für Hosting und Infrastruktur
                </Typography>
              </Box>
              
              <Alert severity="error" sx={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444' }}>
                <Typography variant="body1" sx={{ color: '#dc2626', fontWeight: 500 }}>
                  Ihre Daten können durch API-Zugriffe an diese Drittanbieter weitergeleitet werden. 
                  Verwenden Sie KEINE vertraulichen, persönlichen oder sicherheitskritischen 
                  Informationen in Ihren Chatbots oder Anfragen.
                </Typography>
              </Alert>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                3. Nutzungsrichtlinien
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
                Bei der Nutzung der HELFERLAIN-Plattform verpflichten Sie sich:
              </Typography>
              <Box component="ul" sx={{ color: '#374151', pl: 3 }}>
                <li>Ausschließlich öffentlich zugängliche, nicht-sensible Daten zu verwenden</li>
                <li>Keine persönlichen, vertraulichen oder urheberrechtlich geschützten Inhalte hochzuladen</li>
                <li>Die Plattform nicht für illegale oder schädliche Zwecke zu nutzen</li>
                <li>Die Rechte Dritter zu respektieren</li>
                <li>Nur eigene oder rechtmäßig erworbene Inhalte zu verwenden</li>
              </Box>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center' }}>
                <Engineering sx={{ mr: 1 }} />
                4. Haftungsausschluss
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#92400e', mb: 2 }}>
                  VOLLSTÄNDIGER HAFTUNGSAUSSCHLUSS
                </Typography>
                <Typography variant="body1" sx={{ color: '#92400e' }}>
                  HELFERLAIN übernimmt KEINE Gewähr für die Richtigkeit, Vollständigkeit oder 
                  Angemessenheit der von KI-Modellen generierten Inhalte.
                </Typography>
              </Alert>
              
              <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
                <strong>4.1 KI-generierte Inhalte:</strong>
              </Typography>
              <Box component="ul" sx={{ color: '#374151', pl: 3, mb: 3 }}>
                <li>Alle durch KI generierten Antworten sind automatisch erstellt und ungeprüft</li>
                <li>HELFERLAIN haftet nicht für falsche, irreführende oder schädliche AI-Outputs</li>
                <li>Nutzer sind selbst für die Überprüfung und Bewertung der Inhalte verantwortlich</li>
                <li>KI-Antworten stellen keine Rechts-, Finanz- oder medizinische Beratung dar</li>
              </Box>

              <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
                <strong>4.2 Datenverarbeitung:</strong>
              </Typography>
              <Box component="ul" sx={{ color: '#374151', pl: 3, mb: 3 }}>
                <li>HELFERLAIN haftet nicht für Datenverlust oder -missbrauch durch Drittanbieter</li>
                <li>Nutzer laden Daten auf eigenes Risiko hoch</li>
                <li>Keine Garantie für Datenschutz oder -sicherheit bei Drittanbieter-APIs</li>
              </Box>

              <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
                <strong>4.3 Verfügbarkeit:</strong>
              </Typography>
              <Box component="ul" sx={{ color: '#374151', pl: 3 }}>
                <li>Keine Garantie für kontinuierliche Verfügbarkeit der Plattform</li>
                <li>Beta-Version kann jederzeit geändert oder eingestellt werden</li>
                <li>Wartungsarbeiten und Ausfälle sind jederzeit möglich</li>
              </Box>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                5. Intellectual Property und Urheberrecht
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Sie behalten die Rechte an Ihren hochgeladenen Inhalten, räumen HELFERLAIN jedoch 
                das Recht ein, diese für die Bereitstellung der Dienstleistung zu verwenden. 
                Sie versichern, dass Sie über alle erforderlichen Rechte an den hochgeladenen 
                Inhalten verfügen.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                6. Beendigung und Änderungen
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                HELFERLAIN behält sich das Recht vor, den Service jederzeit zu beenden oder zu ändern. 
                Diese Nutzungsbedingungen können mit einer Ankündigung von 30 Tagen geändert werden. 
                Die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                7. Geltendes Recht
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Für diese Nutzungsbedingungen gilt deutsches Recht. Erfüllungsort und 
                Gerichtsstand ist Stuttgart, Deutschland.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                8. Salvatorische Klausel
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein, 
                berührt dies nicht die Wirksamkeit der übrigen Bestimmungen.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Alert severity="info" sx={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
            <Typography variant="body1" sx={{ color: '#1e40af', fontWeight: 500 }}>
              📧 Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns unter: 
              <strong> legal@helferlain.com</strong>
            </Typography>
          </Alert>
          
          <Typography variant="body2" sx={{ 
            color: '#6b7280', 
            textAlign: 'center',
            fontStyle: 'italic',
            mt: 4
          }}>
            HELFERLAIN - KI-Lösungen aus Deutschland 🇩🇪 | Beta-Version
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default TermsOfServicePage;