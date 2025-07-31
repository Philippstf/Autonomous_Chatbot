import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/firebaseService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Listen for auth changes with Firebase
    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log('Auth state change:', user?.email, 'Verified:', user?.emailVerified);
      setUser(user);
      setSession(user ? { user } : null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Login function
  const signIn = async (email, password) => {
    try {
      const data = await authService.signIn(email, password);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Register function
  const signUp = async (email, password, userData = {}) => {
    try {
      const data = await authService.signUp(email, password, userData.name);
      
      // Profile wird automatisch vom onAuthStateChanged erstellt
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Logout function
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Get user profile from profiles table
  const getUserProfile = async () => {
    if (!user) return null;

    try {
      const data = await profileService.getProfile(user.uid);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    try {
      await profileService.updateProfile(user.uid, updates);
      return { data: updates, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};