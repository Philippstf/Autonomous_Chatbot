import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const ImpressumPage = () => {
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
            Impressum
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ '& > *': { mb: 4 } }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Angaben gemäß § 5 TMG
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Philipp Staufenberger Media<br />
                Glemsgaustraße 19<br />
                70499 Stuttgart<br />
                Deutschland
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Kontakt
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Telefon: +49 (0) 711 123456789<br />
                E-Mail: info@helferlain.com<br />
                Website: www.helferlain.com
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Umsatzsteuer-ID
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE123456789 (Beispiel - bitte durch echte USt-ID ersetzen)
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Philipp Staufenberger<br />
                Glemsgaustraße 19<br />
                70499 Stuttgart<br />
                Deutschland
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Streitschlichtung
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                https://ec.europa.eu/consumers/odr.<br /><br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.<br /><br />
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Haftung für Inhalte
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte 
                fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine 
                rechtswidrige Tätigkeit hinweisen.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Haftung für Links
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir 
                keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
                Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
                Anbieter oder Betreiber der Seiten verantwortlich.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Urheberrecht
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, 
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />
          
          <Typography variant="body2" sx={{ 
            color: '#6b7280', 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            HELFERLAIN - KI-Lösungen aus Deutschland 🇩🇪
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ImpressumPage;