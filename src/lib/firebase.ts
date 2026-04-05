import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

function getMissingFirebaseEnvVars(): string[] {
  const required = [
    ['apiKey', 'VITE_FIREBASE_API_KEY'],
    ['authDomain', 'VITE_FIREBASE_AUTH_DOMAIN'],
    ['projectId', 'VITE_FIREBASE_PROJECT_ID'],
    ['storageBucket', 'VITE_FIREBASE_STORAGE_BUCKET'],
    ['messagingSenderId', 'VITE_FIREBASE_MESSAGING_SENDER_ID'],
    ['appId', 'VITE_FIREBASE_APP_ID'],
  ] as const;

  return required.filter(([k]) => !firebaseConfig[k]).map(([, envName]) => envName);
}

export const isFirebaseConfigured = getMissingFirebaseEnvVars().length === 0;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp(firebaseConfig);
}

export const firebaseApp = getFirebaseApp();

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null;

export async function getFirebaseAnalytics() {
  if (!firebaseApp) return null;
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}

