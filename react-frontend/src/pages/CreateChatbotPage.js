import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotRegistryService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { createChatbot } from '../services/api'; // Für Railway Backend

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
  { id: 'basic', label: 'Basic Settings', icon: '📋' },
  { id: 'branding', label: 'Design & Branding', icon: '🎨' },
  { id: 'company', label: 'Company Info', icon: '🏢' },
  { id: 'features', label: 'Features', icon: '⚡' },
  { id: 'contacts', label: 'Contact Persons', icon: '👥' },
  { id: 'data', label: 'Data Sources', icon: '📊' },
  { id: 'preview', label: 'Preview & Deploy', icon: '🚀' },
];

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
  website_url: '',
  manual_text: '',
  uploaded_files: [],
};

function CreateChatbotPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(null);
  const [error, setError] = useState(null);
  const [showCreationDisclaimer, setShowCreationDisclaimer] = useState(false);

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData,
    }));
  };

  const handleNext = () => {
    if (activeStep < wizardSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const validateStep = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Basic Settings
        return formData.name.trim().length > 0;
      case 2: // Company Info
        return formData.company_info.company_name.trim().length > 0 && 
               formData.company_info.email.trim().length > 0;
      case 5: // Data Sources
        return formData.website_url.trim().length > 0 || 
               formData.manual_text.trim().length > 0 || 
               formData.uploaded_files.length > 0;
      default:
        return true;
    }
  };

  const handleCreateChatbot = () => {
    // Show disclaimer modal first
    setShowCreationDisclaimer(true);
  };

  const handleConfirmCreation = async () => {
    try {
      setShowCreationDisclaimer(false);
      setIsCreating(true);
      setError(null);

      if (!user) {
        setError('Sie müssen angemeldet sein, um einen Chatbot zu erstellen.');
        setIsCreating(false);
        return;
      }

      // 🔥 HYBRID-ANSATZ: Erstelle Chatbot in BEIDEN Systemen
      
      // 1️⃣ Erstelle in Railway API (für echte Chat-Engine)
      setCreationProgress({
        status: 'processing',
        progress: 0.2,
        message: 'Chatbot-Engine wird erstellt...'
      });

      const railwayData = {
        name: formData.name,
        description: formData.description,
        website_url: formData.website_url || null,
        manual_text: formData.manual_text || null,
        branding: formData.branding,
        company_info: formData.company_info,
        features: formData.features,
        contact_persons: formData.contact_persons,
        behavior_settings: formData.features.behavior_settings,
      };

      console.log('🚀 Creating chatbot in Railway API:', railwayData);
      const railwayResponse = await createChatbot(railwayData, formData.uploaded_files);
      
      setCreationProgress({
        status: 'processing', 
        progress: 0.6,
        message: 'Wissensbasis wird aufgebaut...'
      });

      // Warte auf Railway-Verarbeitung (falls creation_id vorhanden)
      let finalChatbotId = railwayResponse.chatbot_id;
      
      if (railwayResponse.creation_id) {
        // TODO: Poll Railway für echten Status
        console.log('🔄 Railway creation_id:', railwayResponse.creation_id);
        // Für jetzt nehmen wir an, dass es funktioniert
        finalChatbotId = railwayResponse.creation_id; // Oder was auch immer Railway zurückgibt
      }

      // 2️⃣ Parallel: Speichere Referenz in Firebase (für Management)
      const firebaseData = {
        config: {
          id: finalChatbotId, // Verwende Railway ID!
          name: formData.name,
          description: formData.description,
          website_url: formData.website_url || null,
          manual_text: formData.manual_text || null,
          created_at: new Date().toISOString(),
        },
        branding: formData.branding,
        company_info: formData.company_info,
        features: formData.features,
        contact_persons: formData.contact_persons,
        behavior_settings: formData.features.behavior_settings,
        status: 'active',
        documentCount: 0,
        totalChunks: 0,
        ragInfo: {},
        runtime_status: {
          loaded: true // Railway ist aktiv
        },
        // Wichtig: Railway-Referenz speichern
        railwayBotId: finalChatbotId,
        isHybrid: true
      };

      console.log('💾 Saving chatbot reference to Firebase:', firebaseData);
      await chatbotRegistryService.createChatbot(user.uid, firebaseData);

      setCreationProgress({
        status: 'completed',
        progress: 1.0,
        message: 'Chatbot erfolgreich erstellt!'
      });
      
      setIsCreating(false);
      navigate(`/chatbot/${finalChatbotId}`);

    } catch (error) {
      console.error('Failed to create chatbot:', error);
      setError(error.message || 'Fehler beim Erstellen des Chatbots');
      setIsCreating(false);
    }
  };

  const handleCancelCreation = () => {
    setShowCreationDisclaimer(false);
  };

  const renderStepContent = (stepIndex) => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
    };

    switch (stepIndex) {
      case 0:
        return <BasicSettingsStep {...stepProps} />;
      case 1:
        return <BrandingStep {...stepProps} />;
      case 2:
        return <CompanyInfoStep {...stepProps} />;
      case 3:
        return <FeaturesStep {...stepProps} />;
      case 4:
        return <ContactPersonsStep {...stepProps} />;
      case 5:
        return <DataSourcesStep {...stepProps} />;
      case 6:
        return <PreviewStep {...stepProps} onCreateChatbot={handleCreateChatbot} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  if (isCreating) {
    return (
      <Box sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        textAlign: 'center',
        px: { xs: 2, sm: 3 }
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              🚀 Creating Your Chatbot...
            </Typography>
            
            {creationProgress && (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {creationProgress.message}
                </Typography>
                
                <LinearProgress
                  variant="determinate"
                  value={creationProgress.progress * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #1f3a93, #34495e)',
                    },
                  }}
                />
                
                <Typography variant="caption" color="text.secondary">
                  {Math.round(creationProgress.progress * 100)}% Complete
                </Typography>
              </>
            )}
            
            {!creationProgress && (
              <div className="loading-spinner" />
            )}
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Progress Stepper */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isSmall}
            orientation={isSmall ? 'vertical' : 'horizontal'}
          >
            {wizardSteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      fontWeight: activeStep === index ? 600 : 400,
                      display: { xs: 'none', sm: 'block' },
                    },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 0.5, sm: 1 },
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>{step.icon}</span>
                    <span style={{ display: isSmall ? 'none' : 'inline' }}>{step.label}</span>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              Back
            </Button>

            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  alignSelf: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Step {activeStep + 1} of {wizardSteps.length}
              </Typography>

              {activeStep === wizardSteps.length - 1 ? (
                <Button
                  onClick={handleCreateChatbot}
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  disabled={!validateStep(activeStep) || isCreating}
                  sx={{
                    background: 'linear-gradient(135deg, #1f3a93, #34495e)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4a69bd, #5a6c7d)',
                    },
                  }}
                >
                  🚀 Create Chatbot
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  disabled={!validateStep(activeStep)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>
      
      {/* Bot Creation Disclaimer Modal */}
      <BotCreationDisclaimerModal
        open={showCreationDisclaimer}
        onAccept={handleConfirmCreation}
        onCancel={handleCancelCreation}
        botName={formData.name}
      />
    </Box>
  );
}

export default CreateChatbotPage;