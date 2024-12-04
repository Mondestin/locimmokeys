import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const properties = [
  {
    address: '123 Rue de Paris',
    owner_name: 'Jean Dupont',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    address: '45 Avenue des Champs-Élysées',
    owner_name: 'Marie Martin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    address: '78 Boulevard Saint-Michel',
    owner_name: 'Pierre Bernard',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const suppliers = [
  {
    name: 'Clés Express',
    email: 'contact@clesexpress.fr',
    phone: '01 23 45 67 89',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Serrurerie Moderne',
    email: 'info@serrurerie-moderne.fr',
    phone: '01 98 76 54 32',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function checkIfCollectionEmpty(collectionName: string) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.empty;
}

async function seedProperties() {
  if (await checkIfCollectionEmpty('properties')) {
    for (const property of properties) {
      try {
        await addDoc(collection(db, 'properties'), property);
        console.log('Added property:', property.address);
      } catch (error) {
        console.error('Error adding property:', error);
        throw error; // Re-throw to handle in the calling function
      }
    }
  } else {
    console.log('Properties collection is not empty, skipping seeding');
  }
}

async function seedSuppliers() {
  if (await checkIfCollectionEmpty('suppliers')) {
    for (const supplier of suppliers) {
      try {
        await addDoc(collection(db, 'suppliers'), supplier);
        console.log('Added supplier:', supplier.name);
      } catch (error) {
        console.error('Error adding supplier:', error);
        throw error; // Re-throw to handle in the calling function
      }
    }
  } else {
    console.log('Suppliers collection is not empty, skipping seeding');
  }
}

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    await seedProperties();
    await seedSuppliers();
    console.log('Database seeding completed!');
    return true;
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}