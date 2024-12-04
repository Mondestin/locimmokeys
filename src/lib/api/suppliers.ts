import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getKeys } from './keys';

const COLLECTION = 'suppliers';

export interface Supplier {
  id?: string;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export async function getSuppliers() {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Supplier[];
}

export async function getSupplier(id: string) {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Supplier not found');
  }
  return { id: docSnap.id, ...docSnap.data() } as Supplier;
}

export async function addSupplier(data: Omit<Supplier, 'id'>) {
  return addDoc(collection(db, COLLECTION), {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export async function updateSupplier(id: string, data: Partial<Supplier>) {
  const docRef = doc(db, COLLECTION, id);
  return updateDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export async function deleteSupplier(id: string) {
  // Check if supplier is linked to any keys
  const keys = await getKeys();
  const linkedKeys = keys.filter(key => key.supplier_name === id);

  if (linkedKeys.length > 0) {
    throw new Error('Ce fournisseur ne peut pas être supprimé car il est lié à des clés.');
  }

  const docRef = doc(db, COLLECTION, id);
  return deleteDoc(docRef);
}