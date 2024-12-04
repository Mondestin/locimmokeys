import { 
  updateProfile,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  address?: string;
}

export async function uploadUserPhoto(file: File) {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    const storage = getStorage();
    const photoRef = ref(storage, `user-photos/${auth.currentUser.uid}/${Date.now()}-${file.name}`);
    await uploadBytes(photoRef, file);
    return getDownloadURL(photoRef);
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

export async function updateUserProfile(data: Partial<UserProfile>, photoFile?: File) {
  if (!auth.currentUser) throw new Error('No user logged in');

  let photoURL = data.photoURL;

  if (photoFile) {
    try {
      photoURL = await uploadUserPhoto(photoFile);
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  // Clean undefined values and ensure valid data types
  const cleanData = {
    displayName: data.displayName || auth.currentUser.displayName || '',
    email: data.email || auth.currentUser.email || '',
    phone: data.phone || '',
    address: data.address || '',
    photoURL: photoURL || auth.currentUser.photoURL || '',
    updated_at: new Date().toISOString()
  };

  try {
    // Update auth profile first
    await updateProfile(auth.currentUser, {
      displayName: cleanData.displayName,
      photoURL: cleanData.photoURL
    });

    // Update Firestore document
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, cleanData, { merge: true });

    return cleanData;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function getUserProfile() {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create default profile if it doesn't exist
      const defaultProfile = {
        displayName: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        photoURL: auth.currentUser.photoURL || '',
        phone: '',
        address: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(userRef, defaultProfile);
      return defaultProfile;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserEmail(newEmail: string, currentPassword: string) {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email!,
      currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateEmail(auth.currentUser, newEmail);

    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, {
      email: newEmail,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email!,
      currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);

    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, {
      password_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}