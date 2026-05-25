/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable offline local caching and data persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore offline persistence failed: Multiple tabs open simultaneously.');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore offline persistence is not supported by this environment/browser.');
  } else {
    console.error('Firestore offline persistence initialization error:', err);
  }
});
export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SavedScenario {
  id: string;
  userId: string;
  title: string;
  deceasedName: string;
  deceasedGender: 'M' | 'F';
  grossValue: number;
  funeralExpenses: number;
  debtsValue: number;
  willsValue: number;
  currency: string;
  relatives: any[];
  createdAt?: any;
  updatedAt?: any;
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("Auth login failure:", err);
    throw err;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Auth logout failure:", err);
    throw err;
  }
}

export async function saveScenario(
  scenarioData: Omit<SavedScenario, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
) {
  if (!auth.currentUser) {
    throw new Error("Must be authenticated to save a scenario.");
  }
  const userId = auth.currentUser.uid;
  const id = existingId || doc(collection(db, 'scenarios')).id;
  const path = `scenarios/${id}`;

  try {
    const docRef = doc(db, 'scenarios', id);
    const dataToSave = {
      ...scenarioData,
      id,
      userId,
      updatedAt: serverTimestamp(),
    };

    if (existingId) {
      await updateDoc(docRef, dataToSave);
    } else {
      await setDoc(docRef, {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteScenario(id: string) {
  const path = `scenarios/${id}`;
  try {
    await deleteDoc(doc(db, 'scenarios', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchUserScenarios(): Promise<SavedScenario[]> {
  if (!auth.currentUser) return [];
  const userId = auth.currentUser.uid;
  const path = 'scenarios';
  try {
    const q = query(
      collection(db, 'scenarios'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const list: SavedScenario[] = [];
    querySnapshot.forEach((doc) => {
      // Safely parse
      const data = doc.data();
      list.push(data as SavedScenario);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
