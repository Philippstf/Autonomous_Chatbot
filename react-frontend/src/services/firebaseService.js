import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names based on Supabase schema
const COLLECTIONS = {
  PROFILES: 'profiles',
  CHATBOT_CONFIGS: 'chatbot_configs', 
  CHATBOT_REGISTRY: 'chatbot_registry',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  LEADS: 'leads',
  CAPTURED_LEADS: 'captured_leads',
  CONTACT_PERSONS: 'contact_persons',
  CONTACT_REQUESTS: 'contact_requests',
  CHATBOT_ANALYTICS: 'chatbot_analytics',
  PLATFORM_ANALYTICS: 'platform_analytics',
  CHATBOT_SOURCES: 'chatbot_sources',
  CONVERSATION_LOGS: 'conversation_logs'
};

// Profile operations
export const profileService = {
  async createProfile(userId, profileData) {
    const docRef = doc(db, COLLECTIONS.PROFILES, userId);
    await setDoc(docRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getProfile(userId) {
    const docRef = doc(db, COLLECTIONS.PROFILES, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async updateProfile(userId, updates) {
    const docRef = doc(db, COLLECTIONS.PROFILES, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// Chatbot Registry operations
export const chatbotRegistryService = {
  async createChatbot(userId, chatbotData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHATBOT_REGISTRY), {
      ...chatbotData,
      creatorUserId: userId,
      status: 'active',
      documentCount: 0,
      totalChunks: 0,
      branding: {},
      ragInfo: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getChatbotsByUser(userId) {
    const q = query(
      collection(db, COLLECTIONS.CHATBOT_REGISTRY),
      where('creatorUserId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getChatbot(chatbotId) {
    const docRef = doc(db, COLLECTIONS.CHATBOT_REGISTRY, chatbotId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async updateChatbot(chatbotId, updates) {
    const docRef = doc(db, COLLECTIONS.CHATBOT_REGISTRY, chatbotId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteChatbot(chatbotId) {
    const docRef = doc(db, COLLECTIONS.CHATBOT_REGISTRY, chatbotId);
    await deleteDoc(docRef);
  }
};

// Chatbot Config operations
export const chatbotConfigService = {
  async createConfig(userId, configData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHATBOT_CONFIGS), {
      ...configData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getConfigsByUser(userId) {
    const q = query(
      collection(db, COLLECTIONS.CHATBOT_CONFIGS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateConfig(configId, updates) {
    const docRef = doc(db, COLLECTIONS.CHATBOT_CONFIGS, configId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// Conversation operations
export const conversationService = {
  async createConversation(chatbotId, conversationData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.CONVERSATIONS), {
      ...conversationData,
      chatbotId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getConversationsByBot(chatbotId) {
    const q = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('chatbotId', '==', chatbotId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getConversation(conversationId) {
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
};

// Message operations
export const messageService = {
  async addMessage(conversationId, messageData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      ...messageData,
      conversationId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getMessagesByConversation(conversationId) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Real-time listener for messages
  subscribeToMessages(conversationId, callback) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
  }
};

// Leads operations
export const leadsService = {
  async createLead(leadData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.LEADS), {
      ...leadData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getLeadsByBot(chatbotId) {
    const q = query(
      collection(db, COLLECTIONS.LEADS),
      where('chatbotId', '==', chatbotId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Contact Persons operations
export const contactPersonService = {
  async createContactPerson(chatbotId, contactData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.CONTACT_PERSONS), {
      ...contactData,
      chatbotId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getContactPersonsByBot(chatbotId) {
    const q = query(
      collection(db, COLLECTIONS.CONTACT_PERSONS),
      where('chatbotId', '==', chatbotId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Analytics operations
export const analyticsService = {
  async logEvent(eventData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.PLATFORM_ANALYTICS), {
      ...eventData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  },

  async getChatbotAnalytics(chatbotId, startDate, endDate) {
    let q = query(
      collection(db, COLLECTIONS.CHATBOT_ANALYTICS),
      where('chatbotId', '==', chatbotId)
    );
    
    if (startDate) {
      q = query(q, where('timestamp', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('timestamp', '<=', endDate));
    }
    
    q = query(q, orderBy('timestamp', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Chatbot Sources operations
export const sourcesService = {
  async addSource(chatbotId, sourceData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHATBOT_SOURCES), {
      ...sourceData,
      chatbotId,
      chunkCount: 0,
      processedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getSourcesByBot(chatbotId) {
    const q = query(
      collection(db, COLLECTIONS.CHATBOT_SOURCES),
      where('chatbotId', '==', chatbotId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

const firebaseService = {
  profileService,
  chatbotRegistryService,
  chatbotConfigService,
  conversationService,
  messageService,
  leadsService,
  contactPersonService,
  analyticsService,
  sourcesService
};

export default firebaseService;