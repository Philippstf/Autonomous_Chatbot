import React, { useState, useEffect } from 'react';
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
  alpha,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  StepConnector,
  StepIcon,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Rocket as RocketIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotRegistryService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { createChatbot } from '../services/api';

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
    label: 'Neural Core', 
    shortLabel: 'Core',
    description: 'Define AI Identity',
    icon: '🧠',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  { 
    id: 'branding', 
    label: 'Visual Interface', 
    shortLabel: 'Design',
    description: 'Design Persona',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  { 
    id: 'company', 
    label: 'Entity Matrix', 
    shortLabel: 'Entity',
    description: 'Corporate Data',
    icon: '🏢',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  { 
    id: 'features', 
    label: 'Neural Features', 
    shortLabel: 'Features',
    description: 'AI Capabilities',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
  { 
    id: 'contacts', 
    label: 'Human Network', 
    shortLabel: 'Contacts',
    description: 'Team Integration',
    icon: '👥',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#fa709a'
  },
  { 
    id: 'data', 
    label: 'Knowledge Base', 
    shortLabel: 'Data',
    description: 'Training Material',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    color: '#a8edea'
  },
  { 
    id: 'preview', 
    label: 'Launch Protocol', 
    shortLabel: 'Launch',
    description: 'Deploy & Activate',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    color: '#d299c2'
  },
];

// Custom Stepper Components
const CustomStepConnector = ({ theme }) => (
  <StepConnector
    sx={{
      '& .MuiStepConnector-line': {
        height: 3,
        border: 0,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderRadius: 1,
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.3), transparent)',
      },
      '&.Mui-active .MuiStepConnector-line': {
        backgroundImage: 'linear-gradient(90deg, #667eea, #764ba2)',
        animation: 'pulse 2s infinite',
      },
      '&.Mui-completed .MuiStepConnector-line': {
        backgroundImage: 'linear-gradient(90deg, #43e97b, #38f9d7)',
      },
    }}
  />
);

const CustomStepIcon = ({ active, completed, icon, step }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: completed 
            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            : active 
              ? step.gradient
              : alpha(theme.palette.primary.main, 0.1),
          border: `2px solid ${
            completed 
              ? '#43e97b'
              : active 
                ? step.color
                : alpha(theme.palette.primary.main, 0.2)
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backdropFilter: 'blur(10px)',
          boxShadow: completed || active 
            ? `0 8px 32px ${alpha(step.color, 0.3)}`
            : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {completed ? (
          <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
        ) : (
          <Typography
            variant="h5"
            sx={{
              filter: active ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' : 'none',
            }}
          >
            {step.icon}
          </Typography>
        )}
        
        {active && (
          <motion.div
            style={{
              position: 'absolute',
              width: 70,
              height: 70,
              borderRadius: '50%',
              border: `2px solid ${alpha(step.color, 0.5)}`,
              top: -7,
              left: -7,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        )}
      </Box>
    </motion.div>
  );
};

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ 
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Neural Creation Progress
        </Typography>
        <Chip
          label={`${currentStep + 1} / ${totalSteps}`}
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        />
      </Box>
      
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha('#667eea', 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #667eea, #764ba2, #43e97b)',
              backgroundSize: '200% 100%',
              animation: 'progressShimmer 3s ease-in-out infinite',
            },
            '@keyframes progressShimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' },
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            right: 0,
            top: 12,
            fontFamily: 'monospace',
            fontWeight: 700,
            color: 'text.secondary',
          }}
        >
          {Math.round(progress)}% Complete
        </Typography>
      </Box>
    </Box>
  );
};

const StepCard = ({ step, isActive, isCompleted, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          background: isActive 
            ? `linear-gradient(135deg, ${alpha(step.color, 0.1)}, ${alpha(step.color, 0.05)})`
            : alpha('#000', 0.02),
          border: `2px solid ${
            isCompleted 
              ? '#43e97b'
              : isActive 
                ? step.color
                : alpha('#000', 0.1)
          }`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(step.color, 0.2)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: step.gradient,
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: isCompleted 
                  ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                  : isActive 
                    ? step.gradient
                    : alpha(step.color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: isActive || isCompleted ? `0 4px 16px ${alpha(step.color, 0.3)}` : 'none',
              }}
            >
              {isCompleted ? '✅' : step.icon}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  color: isActive ? step.color : 'text.primary',
                  fontFamily: '"Space Grotesk", sans-serif',
                }}
              >
                {step.label}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500,
                }}
              >
                {step.description}
              </Typography>
            </Box>
            
            {isCompleted && (
              <CheckCircleIcon sx={{ color: '#43e97b', fontSize: 24 }} />
            )}
            {isActive && !isCompleted && (
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: step.color,
                  animation: 'pulse 2s infinite',
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
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
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const validateStep = (stepIndex) => {
    const step = wizardSteps[stepIndex];
    switch (step.id) {
      case 'basic':
        return formData.name && formData.description;
      case 'branding':
        return formData.branding.primary_color && formData.branding.welcome_message;
      case 'company':
        return formData.company_info.company_name;
      case 'features':
        return true; // Features are optional
      case 'contacts':
        return true; // Contacts are optional
      case 'data':
        return formData.data_sources.urls.length > 0 || 
               formData.data_sources.files.length > 0 || 
               formData.data_sources.text_inputs.length > 0;
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 70%, rgba(67, 233, 123, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }
    }}>
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ 
            background: alpha('#000', 0.1),
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            p: 4
          }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <PsychologyIcon sx={{ fontSize: 48, color: 'white' }} />
                </motion.div>
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    sx={{
                      color: 'white',
                      fontFamily: '"Space Grotesk", sans-serif',
                      letterSpacing: '-0.02em',
                      textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    Neural Forge
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#fff', 0.8),
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}
                  >
                    AI Assistant Creation Engine
                  </Typography>
                </Box>
              </Box>
              
              <ProgressIndicator 
                currentStep={activeStep} 
                totalSteps={wizardSteps.length} 
              />
            </Box>
          </Box>
        </motion.div>

        {/* Main Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '300px 1fr' }, gap: 4 }}>
              
              {/* Step Navigation Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box sx={{ 
                  position: 'sticky', 
                  top: 20,
                  display: { xs: 'none', lg: 'block' }
                }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: 'white',
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    Creation Steps
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {wizardSteps.map((step, index) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        isActive={index === activeStep}
                        isCompleted={completedSteps.has(index)}
                        onClick={() => handleStepClick(index)}
                      />
                    ))}
                  </Box>
                </Box>
              </motion.div>

              {/* Step Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    background: alpha('#fff', 0.95),
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden',
                    minHeight: 600,
                  }}
                >
                  {/* Step Header */}
                  <Box sx={{ 
                    p: 4, 
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: `linear-gradient(135deg, ${alpha(wizardSteps[activeStep].color, 0.1)}, ${alpha(wizardSteps[activeStep].color, 0.05)})`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CustomStepIcon
                        active={true}
                        completed={completedSteps.has(activeStep)}
                        icon={wizardSteps[activeStep].icon}
                        step={wizardSteps[activeStep]}
                      />
                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight={900}
                          sx={{
                            background: wizardSteps[activeStep].gradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: '"Space Grotesk", sans-serif',
                          }}
                        >
                          {wizardSteps[activeStep].label}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          sx={{
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 600,
                          }}
                        >
                          {wizardSteps[activeStep].description}
                        </Typography>
                      </Box>
                    </Box>
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
                          sx={{ m: 2, borderRadius: 2 }}
                          onClose={() => setError(null)}
                        >
                          {error}
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Step Content */}
                  <Box sx={{ p: 4 }}>
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
                  </Box>

                  {/* Navigation Buttons */}
                  <Box sx={{ 
                    p: 4, 
                    pt: 0,
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          background: alpha('#000', 0.05),
                        }
                      }}
                    >
                      Previous
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {wizardSteps.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: index <= activeStep 
                              ? wizardSteps[index].gradient
                              : alpha('#000', 0.1),
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Box>

                    {activeStep === wizardSteps.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        endIcon={isCreating ? <AutoAwesomeIcon /> : <RocketIcon />}
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          px: 4,
                          py: 1.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
                          }
                        }}
                      >
                        {isCreating ? 'Creating Neural Assistant...' : 'Launch AI Assistant'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        endIcon={<ArrowForwardIcon />}
                        variant="contained"
                        sx={{
                          background: wizardSteps[activeStep].gradient,
                          px: 4,
                          py: 1.5,
                          fontWeight: 700,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 32px ${alpha(wizardSteps[activeStep].color, 0.3)}`,
                          }
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Box>
          </Box>
        </Box>

        {/* Disclaimer Modal */}
        <BotCreationDisclaimerModal
          open={disclaimerOpen}
          onClose={() => setDisclaimerOpen(false)}
        />
      </Box>
    </Box>
  );
}

export default CreateChatbotPage;