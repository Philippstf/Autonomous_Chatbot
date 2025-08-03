import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotRegistryService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

// Import step components
import BasicSettingsStep from '../components/wizard/BasicSettingsStep';
import BrandingStep from '../components/wizard/BrandingStep';
import CompanyInfoStep from '../components/wizard/CompanyInfoStep';
import FeaturesStep from '../components/wizard/FeaturesStep';
import ContactPersonsStep from '../components/wizard/ContactPersonsStep';
import DataSourcesStep from '../components/wizard/DataSourcesStep';
import PreviewStep from '../components/wizard/PreviewStep';
import BotCreationDisclaimerModal from '../components/BotCreationDisclaimerModal';

const wizardSteps = [
  { 
    id: 'basic', 
    label: 'Grundeinstellungen', 
    description: 'Name und Beschreibung'
  },
  { 
    id: 'branding', 
    label: 'Design', 
    description: 'Farben und Aussehen'
  },
  { 
    id: 'company', 
    label: 'Unternehmen', 
    description: 'Firmendaten'
  },
  { 
    id: 'features', 
    label: 'Funktionen', 
    description: 'Features konfigurieren'
  },
  { 
    id: 'contacts', 
    label: 'Kontakte', 
    description: 'Ansprechpartner'
  },
  { 
    id: 'data', 
    label: 'Datenquellen', 
    description: 'Wissensgrundlage'
  },
  { 
    id: 'preview', 
    label: 'Überprüfung', 
    description: 'Chatbot erstellen'
  },
];

// Einfache Progress Anzeige
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          color: '#374151'
        }}>
          Schritt {currentStep + 1} von {totalSteps}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          {Math.round(progress)}% abgeschlossen
        </Typography>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#f3f4f6',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
          },
        }}
      />
    </Box>
  );
};

const initialFormData = {
  // Basic Settings
  name: '',
  description: '',
  tags: [],
  
  // Branding
  branding: {
    primary_color: '#1f3a93',
    secondary_color: '#34495e',
    accent_color: '#e74c3c',
    logo_url: null,
    welcome_message: '',
  },
  
  // Company Info
  company_info: {
    company_name: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      zip_code: '',
      city: '',
      country: 'Deutschland',
    },
    business_hours: {},
    social_media: {
      linkedin: '',
      facebook: '',
      instagram: '',
      twitter: '',
    },
  },
  
  // Features
  features: {
    email_capture_enabled: false,
    email_capture_config: {
      prompt: 'Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen.',
      trigger_keywords: ['preise', 'angebot', 'kontakt', 'beratung'],
      max_requests: 1,
      after_messages: 3,
    },
    contact_persons_enabled: false,
    behavior_settings: {
      tone: 'Professionell',
      response_length: 'Mittel',
      formality: 'Sie (förmlich)',
      language: 'Deutsch',
      custom_instructions: '',
    },
  },
  
  // Contact Persons
  contact_persons: [],
  
  // Data Sources
  data_sources: {
    urls: [],
    files: [],
    text_inputs: [],
  },
};

function CreateChatbotPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    // Auto-open disclaimer on first visit
    const hasSeenDisclaimer = localStorage.getItem('hasSeenBotCreationDisclaimer');
    if (!hasSeenDisclaimer) {
      setDisclaimerOpen(true);
    }
  }, []);

  const updateFormData = (section, data) => {
    // Falls nur ein Parameter übergeben wird (für Basic Settings)
    if (typeof section === 'object' && data === undefined) {
      setFormData(prev => ({
        ...prev,
        ...section
      }));
    } else {
      // Normal für verschachtelte Objekte
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
    }
  };

  const validateStep = (stepIndex) => {
    const step = wizardSteps[stepIndex];
    switch (step.id) {
      case 'basic':
        return formData.name.trim() !== ''; // Nur Name ist required
      case 'branding':
        return true; // Optional
      case 'company':
        return true; // Optional
      case 'features':
        return true; // Optional
      case 'contacts':
        return true; // Optional
      case 'data':
        return true; // Optional - kann auch leer bleiben
      case 'preview':
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setCompletedSteps(prev => new Set([...prev, activeStep]));
      setActiveStep(prev => Math.min(prev + 1, wizardSteps.length - 1));
      setError(null);
    } else {
      setError('Please complete all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleStepClick = (stepIndex) => {
    // Allow jumping to previous steps or next step if current is valid
    if (stepIndex <= activeStep || validateStep(activeStep)) {
      if (stepIndex < activeStep) {
        setActiveStep(stepIndex);
      } else if (stepIndex === activeStep + 1 && validateStep(activeStep)) {
        handleNext();
      }
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const chatbotData = {
        ...formData,
        user_id: user.uid,
        created_at: new Date(),
        status: 'active',
      };

      await chatbotRegistryService.createChatbot(chatbotData);
      navigate('/chatbots', { 
        state: { message: 'Neural Assistant successfully created!' }
      });
    } catch (error) {
      console.error('Chatbot creation failed:', error);
      setError('Failed to create neural assistant. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      isLastStep: activeStep === wizardSteps.length - 1,
      isFirstStep: activeStep === 0,
    };

    switch (wizardSteps[activeStep].id) {
      case 'basic':
        return <BasicSettingsStep {...stepProps} />;
      case 'branding':
        return <BrandingStep {...stepProps} />;
      case 'company':
        return <CompanyInfoStep {...stepProps} />;
      case 'features':
        return <FeaturesStep {...stepProps} />;
      case 'contacts':
        return <ContactPersonsStep {...stepProps} />;
      case 'data':
        return <DataSourcesStep {...stepProps} />;
      case 'preview':
        return <PreviewStep {...stepProps} onSubmit={handleSubmit} isCreating={isCreating} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      position: 'relative'
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Neuen Chatbot erstellen
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#6b7280',
              fontWeight: 400
            }}>
              Erstellen Sie in wenigen Schritten Ihren DSGVO-konformen AI-Assistenten
            </Typography>
          </Box>
          
          <ProgressIndicator 
            currentStep={activeStep} 
            totalSteps={wizardSteps.length} 
          />
        </motion.div>

        {/* Stepper Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {wizardSteps.map((step, index) => (
                <Step key={step.id} completed={completedSteps.has(index)}>
                  <StepButton onClick={() => handleStepClick(index)}>
                    <StepLabel>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {step.description}
                      </Typography>
                    </StepLabel>
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minHeight: 500 }}>
            {/* Step Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                color: '#374151',
                mb: 1
              }}>
                {wizardSteps[activeStep].label}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                {wizardSteps[activeStep].description}
              </Typography>
            </Box>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid #f3f4f6'
            }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: '#6b7280',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                  },
                  '&:disabled': {
                    color: '#d1d5db'
                  }
                }}
              >
                Zurück
              </Button>

              {activeStep === wizardSteps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
                    },
                    '&:disabled': {
                      background: '#d1d5db'
                    }
                  }}
                >
                  {isCreating ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                      Chatbot wird erstellt...
                    </>
                  ) : (
                    'Chatbot erstellen'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1e40af, #2563eb)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
                    }
                  }}
                >
                  Weiter
                </Button>
              )}
            </Box>
          </Paper>
        </motion.div>

        {/* Disclaimer Modal */}
        <BotCreationDisclaimerModal
          open={disclaimerOpen}
          onAccept={() => {
            setDisclaimerOpen(false);
            localStorage.setItem('hasSeenBotCreationDisclaimer', 'true');
          }}
          onCancel={() => {
            setDisclaimerOpen(false);
            navigate('/dashboard');
          }}
          botName={formData.name || 'Neuer Chatbot'}
        />
      </Container>
    </Box>
  );
}

export default CreateChatbotPage;