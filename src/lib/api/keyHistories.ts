import { collection, doc, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION = 'key_histories';

export interface KeyHistory {
  id?: string;
  key_id: string;
  action: 'Retrieve' | 'Return';
  description: string;
  date: string;
  photo_url?: string;
  created_at?: string;
}

export async function getKeyHistories(keyId: string) {
  const q = query(collection(db, COLLECTION), where('key_id', '==', keyId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as KeyHistory[];
}

export async function addKeyHistory(data: Omit<KeyHistory, 'id'>, photoFile?: File) {
  let photoUrl;
  
  if (photoFile) {
    const storage = getStorage();
    const photoRef = ref(storage, `key-photos/${Date.now()}-${photoFile.name}`);
    await uploadBytes(photoRef, photoFile);
    photoUrl = await getDownloadURL(photoRef);
  }

  return addDoc(collection(db, COLLECTION), {
    ...data,
    photo_url: photoUrl,
    created_at: new Date().toISOString()
  });
}