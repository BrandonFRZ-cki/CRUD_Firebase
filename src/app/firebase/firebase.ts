import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de la aplicación web "practica-web" del proyecto practicawebuniversidad.
const firebaseConfig = {
  apiKey: 'AIzaSyBdCscgVT8ZfpUwqNKKnEr_-h8oXo6GSZ8',
  authDomain: 'practicawebuniversidad.firebaseapp.com',
  projectId: 'practicawebuniversidad',
  storageBucket: 'practicawebuniversidad.firebasestorage.app',
  messagingSenderId: '719451020258',
  appId: '1:719451020258:web:e4778a7e82da986c1a77bb',
  measurementId: 'G-8YVC3YQZRE',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
