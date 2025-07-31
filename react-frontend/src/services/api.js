import axios from 'axios';
import { auth } from '../config/firebase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Firebase Authentication
api.interceptors.request.use(
  async (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Get Firebase ID token
        const idToken = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${idToken}`;
        console.log('🔑 Added Firebase ID token to Authorization header');
        
        // Also add custom headers as fallback
        config.headers['X-Firebase-User'] = currentUser.uid;
        config.headers['X-Firebase-Email'] = currentUser.email;
        console.log('🔑 Added Firebase user info as custom headers (fallback)');
      } catch (error) {
        console.error('Failed to get Firebase ID token:', error);
        // Still add custom headers as fallback
        config.headers['X-Firebase-User'] = currentUser.uid;
        config.headers['X-Firebase-Email'] = currentUser.email;
        console.log('⚠️ Using Firebase custom headers as fallback');
      }
    } else {
      console.warn('No authenticated user found for API request');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Handle authentication errors
      console.warn('Authentication required');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// ─── Health Check ────────────────────────────────────────────────────────────

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

// ─── Chatbot Management ──────────────────────────────────────────────────────

export const getAllChatbots = async () => {
  try {
    const response = await api.get('/chatbots');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch chatbots: ${error.response?.data?.detail || error.message}`);
  }
};

export const getChatbot = async (chatbotId) => {
  try {
    const response = await api.get(`/chatbots/${chatbotId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch chatbot: ${error.response?.data?.detail || error.message}`);
  }
};

export const createChatbot = async (chatbotData, files = null) => {
  try {
    const formData = new FormData();
    
    // Add JSON data
    formData.append('request', JSON.stringify(chatbotData));
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await api.post('/chatbots', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create chatbot: ${error.response?.data?.detail || error.message}`);
  }
};

export const updateChatbot = async (chatbotId, updateData) => {
  try {
    const response = await api.put(`/chatbots/${chatbotId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update chatbot: ${error.response?.data?.detail || error.message}`);
  }
};

export const deleteChatbot = async (chatbotId) => {
  try {
    const response = await api.delete(`/chatbots/${chatbotId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete chatbot: ${error.response?.data?.detail || error.message}`);
  }
};

export const getCreationProgress = async (creationId) => {
  try {
    const response = await api.get(`/chatbots/creation/${creationId}/progress`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get creation progress: ${error.response?.data?.detail || error.message}`);
  }
};

// ─── Chat Functions ──────────────────────────────────────────────────────────

export const sendChatMessage = async (chatbotId, message, conversationId = null) => {
  try {
    const response = await api.post(`/chat/${chatbotId}`, {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.response?.data?.detail || error.message}`);
  }
};

export const submitLead = async (chatbotId, leadData) => {
  try {
    const response = await api.post(`/chat/${chatbotId}/submit-lead`, leadData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to submit lead: ${error.response?.data?.detail || error.message}`);
  }
};

export const getChatConfig = async (chatbotId) => {
  try {
    const response = await api.get(`/chat/${chatbotId}/config`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get chat config: ${error.response?.data?.detail || error.message}`);
  }
};

// ─── File Upload ─────────────────────────────────────────────────────────────

export const uploadDocuments = async (files) => {
  try {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await api.post('/upload/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to upload documents: ${error.response?.data?.detail || error.message}`);
  }
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const getAnalyticsOverview = async () => {
  try {
    const response = await api.get('/analytics/overview');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch analytics: ${error.response?.data?.detail || error.message}`);
  }
};

// ─── WebSocket for Real-time Updates ────────────────────────────────────────

export const createWebSocketConnection = (chatbotId, onMessage, onError) => {
  const wsUrl = `ws://localhost:8000/ws/chat/${chatbotId}`;
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for chatbot ${chatbotId}`);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket disconnected for chatbot ${chatbotId}`);
    };
    
    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    if (onError) onError(error);
    return null;
  }
};

// ─── Utility Functions ───────────────────────────────────────────────────────

export const validateApiResponse = (response, expectedFields = []) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  const missingFields = expectedFields.filter(field => !(field in response));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
};

export const handleApiError = (error, fallbackMessage = 'An unexpected error occurred') => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.detail || error.response.data?.message || fallbackMessage;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || fallbackMessage;
  }
};

export default api;