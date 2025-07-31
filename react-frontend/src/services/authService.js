import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Auth service for Firebase Authentication
export const authService = {
  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Bitte verifizieren Sie zuerst Ihre E-Mail-Adresse.');
      }
      
      return { user: userCredential.user };
    } catch (error) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  },

  // Sign up with email and password
  async signUp(email, password, name = '') {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      if (name) {
        await updateProfile(user, { 
          displayName: name 
        });
      }

      // Send email verification - do NOT sign out
      await sendEmailVerification(user);

      return { 
        user: user,
        needsEmailVerification: !user.emailVerified
      };
    } catch (error) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  },

  // Create user profile in Firestore (only for verified users)
  async createUserProfile(user, additionalData = {}) {
    if (!user || !user.emailVerified) return null;
    
    try {
      const userDocRef = doc(db, 'profiles', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Only create if doesn't exist
      if (!userDoc.exists()) {
        const profileData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData
        };
        
        await setDoc(userDocRef, profileData);
        return profileData;
      }
      
      return userDoc.data();
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth?mode=login`,
        handleCodeInApp: false
      });
    } catch (error) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        // Don't create profile here - just return the user
        // Profile will be created when needed (e.g., Dashboard)
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const userDocRef = doc(db, 'profiles', userId);
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });

      // Update Firebase Auth profile if display name changed
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: updates.name });
      }
    } catch (error) {
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  },

  // Convert Firebase error codes to user-friendly messages
  getFirebaseErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.',
      'auth/wrong-password': 'Falsches Passwort.',
      'auth/email-already-in-use': 'Diese E-Mail-Adresse wird bereits verwendet.',
      'auth/weak-password': 'Das Passwort ist zu schwach.',
      'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
      'auth/user-disabled': 'Dieser Benutzer wurde deaktiviert.',
      'auth/too-many-requests': 'Zu viele Anmeldeversuche. Versuchen Sie es später erneut.',
      'auth/network-request-failed': 'Netzwerkfehler. Überprüfen Sie Ihre Internetverbindung.',
      'auth/requires-recent-login': 'Diese Aktion erfordert eine erneute Anmeldung.',
      'auth/invalid-credential': 'Ungültige Anmeldedaten.',
      'auth/missing-password': 'Passwort ist erforderlich.',
      'auth/invalid-login-credentials': 'Ungültige Anmeldedaten. Überprüfen Sie Email und Passwort.',
      'auth/account-exists-with-different-credential': 'Ein Account mit dieser Email existiert bereits.'
    };

    return errorMessages[errorCode] || 'Ein unbekannter Fehler ist aufgetreten.';
  }
};

export default authService;