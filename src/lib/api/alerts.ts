import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'alerts';

export interface Alert {
  id?: string;
  key_id: string;
  alert_date: string;
  description: string;
  status: 'Pending' | 'Dismissed';
  created_at?: string;
  updated_at?: string;
}

export async function getAlerts() {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Alert[];
}

export async function getAlert(id: string) {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Alert not found');
  }
  return { id: docSnap.id, ...docSnap.data() } as Alert;
}

export async function addAlert(data: Omit<Alert, 'id'>) {
  return addDoc(collection(db, COLLECTION), {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export async function updateAlert(id: string, data: Partial<Alert>) {
  const docRef = doc(db, COLLECTION, id);
  return updateDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export async function deleteAlert(id: string) {
  const docRef = doc(db, COLLECTION, id);
  return deleteDoc(docRef);
}