import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import BetaDisclaimerModal from '../components/BetaDisclaimerModal';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') || 'login');
  const { signIn, signUp, resetPassword, signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showBetaDisclaimer, setShowBetaDisclaimer] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) throw error;

      if (data.user) {
        // For Firebase: User is now logged in automatically
        // Skip beta disclaimer for now - go directly to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        name: formData.name || formData.email.split('@')[0]
      });

      if (error) throw error;

      if (data.user) {
        if (data.needsEmailVerification) {
          // Show success message for registration
          setSuccess('Registrierung erfolgreich! Bitte prüfen Sie Ihr Email-Postfach zur Bestätigung, bevor Sie sich anmelden.');
          setMode('login');
          
          // Clear form
          setFormData({ email: '', password: '', confirmPassword: '', name: '' });
        } else {
          // User is immediately verified (rare case)
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Bitte geben Sie Ihre Email-Adresse ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(formData.email);

      if (error) throw error;

      setSuccess('Password-Reset Link wurde an Ihre Email-Adresse gesendet.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBetaDisclaimerAccept = () => {
    if (pendingAuth && pendingAuth.user) {
      // Store acceptance in localStorage
      localStorage.setItem(`beta_accepted_${pendingAuth.user.uid}`, 'true');
      
      // Navigate to dashboard
      setShowBetaDisclaimer(false);
      setPendingAuth(null);
      navigate('/dashboard');
    }
  };

  const handleBetaDisclaimerDecline = async () => {
    if (pendingAuth && pendingAuth.user) {
      // Sign out the user if they decline
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
      
      // Reset state
      setShowBetaDisclaimer(false);
      setPendingAuth(null);
      setError('Sie müssen den Beta-Hinweisen zustimmen, um HELFERLAIN zu nutzen.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                HELFERLAIN
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                {mode === 'login' ? 'Willkommen zurück!' : 'Kostenlos registrieren'}
              </Typography>
              <Typography color="text.secondary">
                {mode === 'login' 
                  ? 'Melden Sie sich in Ihrem Account an' 
                  : 'Starten Sie mit DSGVO-konformen KI-Lösungen'
                }
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
              {mode === 'register' && (
                <TextField
                  fullWidth
                  label="Name (optional)"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
              )}

              <TextField
                fullWidth
                label="Email-Adresse"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Passwort"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
                variant="outlined"
                helperText={mode === 'register' ? 'Mindestens 6 Zeichen' : ''}
              />

              {mode === 'register' && (
                <TextField
                  fullWidth
                  label="Passwort bestätigen"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 3 }}
                  variant="outlined"
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                  py: 1.5,
                  fontSize: '1.1rem',
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                  },
                  '&:disabled': {
                    background: '#9ca3af',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  mode === 'login' ? 'Anmelden' : 'Registrieren'
                )}
              </Button>

              {mode === 'login' && (
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  sx={{ mb: 2, color: '#1e3a8a' }}
                >
                  Passwort vergessen?
                </Button>
              )}
            </form>

            <Divider sx={{ my: 3 }} />

            {/* Mode Switch */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {mode === 'login' ? 'Noch kein Account?' : 'Bereits registriert?'}
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                  setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                }}
                sx={{
                  color: '#1e3a8a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {mode === 'login' ? 'Kostenlos registrieren' : 'Hier anmelden'}
              </Link>
            </Box>

            {/* Back to Landing */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/')}
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#1e3a8a',
                    textDecoration: 'underline'
                  }
                }}
              >
                ← Zurück zur Startseite
              </Link>
            </Box>
          </Paper>
        </motion.div>
      </Container>
      
      {/* Beta Disclaimer Modal */}
      <BetaDisclaimerModal
        open={showBetaDisclaimer}
        onAccept={handleBetaDisclaimerAccept}
        onDecline={handleBetaDisclaimerDecline}
      />
    </Box>
  );
};

export default AuthPage;