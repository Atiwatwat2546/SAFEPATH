import admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey.json';

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: "testexpo-90dd3",
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
