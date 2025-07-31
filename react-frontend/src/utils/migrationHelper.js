import { collection, doc, setDoc, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';

// Migration helper to transfer data from Supabase to Firebase
export class MigrationHelper {
  
  // Migrate profiles
  static async migrateProfiles() {
    console.log('Starting profiles migration...');
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const batch = writeBatch(db);
      
      profiles.forEach(profile => {
        const docRef = doc(db, 'profiles', profile.id);
        batch.set(docRef, {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
          emailVerified: profile.email_verified || false
        });
      });

      await batch.commit();
      console.log(`Migrated ${profiles.length} profiles`);
      return { success: true, count: profiles.length };
    } catch (error) {
      console.error('Error migrating profiles:', error);
      return { success: false, error };
    }
  }

  // Migrate chatbot registry
  static async migrateChatbotRegistry() {
    console.log('Starting chatbot registry migration...');
    try {
      const { data: chatbots, error } = await supabase
        .from('chatbot_registry')
        .select('*');

      if (error) throw error;

      const batch = writeBatch(db);
      
      chatbots.forEach(chatbot => {
        const docRef = doc(db, 'chatbot_registry', chatbot.id);
        batch.set(docRef, {
          name: chatbot.name,
          description: chatbot.description,
          websiteUrl: chatbot.website_url,
          documentCount: chatbot.document_count || 0,
          createdAt: chatbot.created_at ? new Date(chatbot.created_at) : new Date(),
          updatedAt: chatbot.updated_at ? new Date(chatbot.updated_at) : new Date(),
          status: chatbot.status || 'active',
          branding: chatbot.branding || {},
          creatorUserId: chatbot.creator_device_id, // Map device_id to userId
          totalChunks: chatbot.total_chunks || 0,
          ragInfo: chatbot.rag_info || {}
        });
      });

      await batch.commit();
      console.log(`Migrated ${chatbots.length} chatbots`);
      return { success: true, count: chatbots.length };
    } catch (error) {
      console.error('Error migrating chatbot registry:', error);
      return { success: false, error };
    }
  }

  // Migrate chatbot configs
  static async migrateChatbotConfigs() {
    console.log('Starting chatbot configs migration...');
    try {
      const { data: configs, error } = await supabase
        .from('chatbot_configs')
        .select('*');

      if (error) throw error;

      const batch = writeBatch(db);
      
      configs.forEach(config => {
        const docRef = doc(collection(db, 'chatbot_configs'));
        batch.set(docRef, {
          userId: config.user_id,
          name: config.name,
          description: config.description,
          configData: config.config_data || {},
          createdAt: config.created_at ? new Date(config.created_at) : new Date(),
          updatedAt: config.updated_at ? new Date(config.updated_at) : new Date()
        });
      });

      await batch.commit();
      console.log(`Migrated ${configs.length} chatbot configs`);
      return { success: true, count: configs.length };
    } catch (error) {
      console.error('Error migrating chatbot configs:', error);
      return { success: false, error };
    }
  }

  // Migrate conversations
  static async migrateConversations() {
    console.log('Starting conversations migration...');
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*');

      if (error) throw error;

      const batch = writeBatch(db);
      
      conversations.forEach(conversation => {
        const docRef = doc(db, 'conversations', conversation.id);
        batch.set(docRef, {
          deviceId: conversation.device_id,
          chatbotId: conversation.chatbot_id,
          sessionId: conversation.session_id,
          isActive: conversation.is_active || false,
          lastMessage: conversation.last_message,
          createdAt: conversation.created_at ? new Date(conversation.created_at) : new Date(),
          updatedAt: conversation.updated_at ? new Date(conversation.updated_at) : new Date()
        });
      });

      await batch.commit();
      console.log(`Migrated ${conversations.length} conversations`);
      return { success: true, count: conversations.length };
    } catch (error) {
      console.error('Error migrating conversations:', error);
      return { success: false, error };
    }
  }

  // Migrate messages
  static async migrateMessages() {
    console.log('Starting messages migration...');
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*');

      if (error) throw error;

      // Split into batches of 500 (Firestore batch limit)
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchMessages = messages.slice(i, i + batchSize);
        
        batchMessages.forEach(message => {
          const docRef = doc(collection(db, 'messages'));
          batch.set(docRef, {
            conversationId: message.conversation_id,
            content: message.content,
            role: message.role,
            timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
            createdAt: message.created_at ? new Date(message.created_at) : new Date()
          });
        });
        
        batches.push(batch);
      }

      // Execute all batches
      await Promise.all(batches.map(batch => batch.commit()));
      
      console.log(`Migrated ${messages.length} messages`);
      return { success: true, count: messages.length };
    } catch (error) {
      console.error('Error migrating messages:', error);
      return { success: false, error };
    }
  }

  // Migrate leads
  static async migrateLeads() {
    console.log('Starting leads migration...');
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*');

      if (error) throw error;

      const batch = writeBatch(db);
      
      leads.forEach(lead => {
        const docRef = doc(collection(db, 'leads'));
        batch.set(docRef, {
          chatbotId: lead.chatbot_id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          message: lead.message,
          source: lead.source,
          deviceId: lead.device_id,
          conversationId: lead.conversation_id,
          createdAt: lead.created_at ? new Date(lead.created_at) : new Date()
        });
      });

      await batch.commit();
      console.log(`Migrated ${leads.length} leads`);
      return { success: true, count: leads.length };
    } catch (error) {
      console.error('Error migrating leads:', error);
      return { success: false, error };
    }
  }

  // Run complete migration
  static async runFullMigration(onProgress) {
    const results = [];
    const steps = [
      { name: 'Profiles', fn: this.migrateProfiles },
      { name: 'Chatbot Registry', fn: this.migrateChatbotRegistry },  
      { name: 'Chatbot Configs', fn: this.migrateChatbotConfigs },
      { name: 'Conversations', fn: this.migrateConversations },
      { name: 'Messages', fn: this.migrateMessages },
      { name: 'Leads', fn: this.migrateLeads }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (onProgress) {
        onProgress({
          step: i + 1,
          total: steps.length,
          name: step.name,
          status: 'running'
        });
      }

      const result = await step.fn();
      results.push({ name: step.name, ...result });

      if (onProgress) {
        onProgress({
          step: i + 1,
          total: steps.length,
          name: step.name,
          status: result.success ? 'completed' : 'failed',
          result
        });
      }
    }

    return results;
  }

  // Verify migration by comparing counts
  static async verifyMigration() {
    console.log('Verifying migration...');
    const verification = {};

    try {
      // Check profiles
      const { data: supabaseProfiles } = await supabase.from('profiles').select('id');
      const firebaseProfiles = await getDocs(collection(db, 'profiles'));
      verification.profiles = {
        supabase: supabaseProfiles?.length || 0,
        firebase: firebaseProfiles.size
      };

      // Check chatbot_registry
      const { data: supabaseChatbots } = await supabase.from('chatbot_registry').select('id');
      const firebaseChatbots = await getDocs(collection(db, 'chatbot_registry'));
      verification.chatbots = {
        supabase: supabaseChatbots?.length || 0,
        firebase: firebaseChatbots.size
      };

      // Check conversations
      const { data: supabaseConversations } = await supabase.from('conversations').select('id');
      const firebaseConversations = await getDocs(collection(db, 'conversations'));
      verification.conversations = {
        supabase: supabaseConversations?.length || 0,
        firebase: firebaseConversations.size
      };

      // Check messages
      const { data: supabaseMessages } = await supabase.from('messages').select('id');
      const firebaseMessages = await getDocs(collection(db, 'messages'));
      verification.messages = {
        supabase: supabaseMessages?.length || 0,
        firebase: firebaseMessages.size
      };

      console.log('Migration verification:', verification);
      return verification;
    } catch (error) {
      console.error('Error verifying migration:', error);
      return { error };
    }
  }
}

export default MigrationHelper;