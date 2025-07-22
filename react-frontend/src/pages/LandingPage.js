import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  SmartToy, 
  Security, 
  Speed, 
  Business,
  AutoAwesome,
  Engineering,
  Phone,
  Analytics
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth?mode=register');
  };

  const handleLogin = () => {
    navigate('/auth?mode=login');
  };

  const handleFooterNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      overflowX: 'hidden'
    }}>
      
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(30, 58, 138, 0.1)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 2
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              HELFERLAIN
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleLogin}
                sx={{ 
                  borderColor: '#1e3a8a',
                  color: '#1e3a8a',
                  '&:hover': {
                    borderColor: '#1e3a8a',
                    backgroundColor: 'rgba(30, 58, 138, 0.05)'
                  }
                }}
              >
                Anmelden
              </Button>
              <Button 
                variant="contained" 
                onClick={handleGetStarted}
                sx={{ 
                  background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                  }
                }}
              >
                Kostenlos starten
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        overflow: 'hidden',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Animated Background Elements */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 1
        }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: isMobile ? '150px' : '300px',
                height: isMobile ? '150px' : '300px',
                background: `linear-gradient(45deg, rgba(30, 58, 138, 0.05), rgba(59, 130, 246, 0.05))`,
                borderRadius: '30%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" sx={{ 
                  fontSize: isMobile ? '2.5rem' : '4rem',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 3,
                  background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Helfen mit KI.
                  <br />
                  <span style={{ color: '#374151' }}>DSGVO-konform.</span>
                </Typography>
                
                <Typography variant="h5" sx={{ 
                  color: '#6b7280',
                  mb: 4,
                  lineHeight: 1.6,
                  fontWeight: 400
                }}>
                  Deutsche Server. Maximale Sicherheit. Professionelle KI-Lösungen für Ihr Unternehmen.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleGetStarted}
                    sx={{ 
                      background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(30, 58, 138, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Kostenlos testen
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{ 
                      borderColor: '#1e3a8a',
                      color: '#1e3a8a',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: '#1e3a8a',
                        backgroundColor: 'rgba(30, 58, 138, 0.05)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Demo ansehen
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '400px'
                }}>
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      width: '300px',
                      height: '300px',
                      background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                      borderRadius: '30%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 25px 50px rgba(30, 58, 138, 0.3)'
                    }}
                  >
                    <AutoAwesome sx={{ 
                      fontSize: '4rem', 
                      color: 'white',
                    }} />
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* USP Section - DSGVO Highlight */}
      <Box sx={{ py: 8, backgroundColor: '#1e3a8a' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" align="center" sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 4
            }}>
              🇩🇪 Ihre Daten bleiben in Deutschland
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Security sx={{ fontSize: '3rem', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    DSGVO-konform
                  </Typography>
                  <Typography>
                    Vollständige Compliance mit deutschen Datenschutzgesetzen
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Speed sx={{ fontSize: '3rem', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Deutsche Server
                  </Typography>
                  <Typography>
                    Alle Daten werden ausschließlich auf deutschen Servern verarbeitet
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Business sx={{ fontSize: '3rem', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Enterprise Ready
                  </Typography>
                  <Typography>
                    Professionelle KI-Lösungen für Unternehmen jeder Größe
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" align="center" sx={{ 
              color: '#1e3a8a', 
              fontWeight: 700,
              mb: 6
            }}>
              Unsere Services
            </Typography>

            {/* Self-Service Module */}
            <Typography variant="h4" sx={{ 
              color: '#374151', 
              fontWeight: 600,
              mb: 4,
              textAlign: 'center'
            }}>
              🤖 Self-Service Lösungen
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} md={6} lg={3}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    border: '1px solid rgba(30, 58, 138, 0.1)'
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <SmartToy sx={{ fontSize: '3rem', color: '#1e3a8a', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Chatbot as a Service
                      </Typography>
                      <Typography color="text.secondary">
                        Intelligente Chatbots in Minuten erstellen
                      </Typography>
                      <Box sx={{ 
                        mt: 2, 
                        px: 2, 
                        py: 1, 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        ✅ VERFÜGBAR
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    border: '1px solid rgba(30, 58, 138, 0.1)'
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Phone sx={{ fontSize: '3rem', color: '#1e3a8a', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        KI-Caller as a Service
                      </Typography>
                      <Typography color="text.secondary">
                        Automatisierte Anrufe mit KI-Stimme
                      </Typography>
                      <Box sx={{ 
                        mt: 2, 
                        px: 2, 
                        py: 1, 
                        backgroundColor: '#f59e0b', 
                        color: 'white', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        🚧 COMING SOON
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    border: '1px solid rgba(30, 58, 138, 0.1)'
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <AutoAwesome sx={{ fontSize: '3rem', color: '#1e3a8a', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Lokas GPT
                      </Typography>
                      <Typography color="text.secondary">
                        Firmen-eigene KI-Assistenten
                      </Typography>
                      <Box sx={{ 
                        mt: 2, 
                        px: 2, 
                        py: 1, 
                        backgroundColor: '#f59e0b', 
                        color: 'white', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        🚧 COMING SOON
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    border: '1px solid rgba(30, 58, 138, 0.1)'
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Engineering sx={{ fontSize: '3rem', color: '#1e3a8a', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Prozessoptimierung
                      </Typography>
                      <Typography color="text.secondary">
                        KI-gestützte Automatisierung
                      </Typography>
                      <Box sx={{ 
                        mt: 2, 
                        px: 2, 
                        py: 1, 
                        backgroundColor: '#f59e0b', 
                        color: 'white', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        🚧 COMING SOON
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Beratungsmodul */}
            <Typography variant="h4" sx={{ 
              color: '#374151', 
              fontWeight: 600,
              mb: 4,
              textAlign: 'center'
            }}>
              💼 Beratung & Consulting
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    color: 'white'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Analytics sx={{ fontSize: '3rem', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        KI-Strategie Beratung
                      </Typography>
                      <Typography>
                        Entwicklung maßgeschneiderter KI-Strategien für Ihr Unternehmen
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    color: 'white'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Security sx={{ fontSize: '3rem', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        Enterprise Integration
                      </Typography>
                      <Typography>
                        DSGVO-konforme KI-Integration in bestehende Unternehmenssysteme
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: 8, 
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        color: 'white'
      }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" align="center" sx={{ 
              fontWeight: 700,
              mb: 4
            }}>
              Bereit für die KI-Revolution?
            </Typography>
            
            <Typography variant="h6" align="center" sx={{ 
              mb: 4,
              opacity: 0.9,
              lineHeight: 1.6
            }}>
              Starten Sie noch heute mit DSGVO-konformen KI-Lösungen.
              Kostenlos testen, keine Kreditkarte erforderlich.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleGetStarted}
                sx={{ 
                  backgroundColor: 'white',
                  color: '#1e3a8a',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Kostenlos registrieren
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#f8fafc', borderTop: '1px solid rgba(30, 58, 138, 0.1)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                color: '#1e3a8a'
              }}>
                HELFERLAIN
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DSGVO-konforme KI-Lösungen aus Deutschland
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3, flexWrap: 'wrap' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  onClick={() => handleFooterNavigation('/terms')}
                  sx={{ cursor: 'pointer', '&:hover': { color: '#1e3a8a' } }}
                >
                  Nutzungsbedingungen
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  onClick={() => handleFooterNavigation('/privacy')}
                  sx={{ cursor: 'pointer', '&:hover': { color: '#1e3a8a' } }}
                >
                  Datenschutz
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  onClick={() => handleFooterNavigation('/impressum')}
                  sx={{ cursor: 'pointer', '&:hover': { color: '#1e3a8a' } }}
                >
                  Impressum
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  onClick={() => handleFooterNavigation('/contact')}
                  sx={{ cursor: 'pointer', '&:hover': { color: '#1e3a8a' } }}
                >
                  Kontakt
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;