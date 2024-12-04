import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      displayName: name,
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  const logout = () => signOut(auth);

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    await updateProfile(auth.currentUser, data);

    // Update Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, {
      ...data,
      updated_at: new Date().toISOString()
    }, { merge: true });
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    await updatePassword(auth.currentUser, newPassword);

    // Log password update in Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, {
      password_updated_at: new Date().toISOString()
    }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      logout,
      updateUserProfile,
      updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}