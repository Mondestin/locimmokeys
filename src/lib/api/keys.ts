import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAlerts } from './alerts';

const COLLECTION = 'keys';

export interface Key {
  id?: string;
  property_id: string;
  supplier_name: string;
  description: string;
  status: 'Remise' | 'Retrait';
  date: string;
  photos: string[];
  signature?: string;
  commentaires: string;
  created_at?: string;
  updated_at?: string;
}

export async function getKeys() {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Key[];
}

export async function getKey(id: string) {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Key not found');
  }
  return { id: docSnap.id, ...docSnap.data() } as Key;
}

export async function addKey(data: Omit<Key, 'id'>) {
  return addDoc(collection(db, COLLECTION), {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export async function updateKey(id: string, data: Partial<Key>) {
  const docRef = doc(db, COLLECTION, id);
  return updateDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export async function deleteKey(id: string) {
  // Check if key is linked to any alerts
  const alerts = await getAlerts();
  const linkedAlerts = alerts.filter(alert => alert.key_id === id);

  if (linkedAlerts.length > 0) {
    throw new Error('Cette clé ne peut pas être supprimée car elle est liée à des alertes.');
  }

  const docRef = doc(db, COLLECTION, id);
  return deleteDoc(docRef);
}