import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

export async function addDocument(collectionName: string, data: DocumentData) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

export async function updateDocument(collectionName: string, id: string, data: DocumentData) {
  const docRef = doc(db, collectionName, id);
  return updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteDocument(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef);
}

export async function getDocuments(collectionName: string) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getDocumentsByField(
  collectionName: string,
  field: string,
  value: any
) {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}