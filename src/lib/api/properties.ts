import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getKeys } from './keys';

const COLLECTION = 'properties';

export interface Property {
  id?: string;
  address: string;
  owner_name: string;
  created_at?: string;
  updated_at?: string;
}

export async function getProperties() {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Property[];
}

export async function getProperty(id: string) {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Property not found');
  }
  return { id: docSnap.id, ...docSnap.data() } as Property;
}

export async function addProperty(data: Omit<Property, 'id'>) {
  return addDoc(collection(db, COLLECTION), {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export async function updateProperty(id: string, data: Partial<Property>) {
  const docRef = doc(db, COLLECTION, id);
  return updateDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export async function deleteProperty(id: string) {
  // Check if property is linked to any keys
  const keys = await getKeys();
  const linkedKeys = keys.filter(key => key.property_id === id);

  if (linkedKeys.length > 0) {
    throw new Error('Cette propriété ne peut pas être supprimée car elle est liée à des clés.');
  }

  const docRef = doc(db, COLLECTION, id);
  return deleteDoc(docRef);
}