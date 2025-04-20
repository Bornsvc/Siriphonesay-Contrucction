// lib/firebaseAdmin.ts
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync('keepimg-c2a7b-firebase-adminsdk-fbsvc-0edb806d8f.json', 'utf-8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'keep-img-from-siriphonesay.appspot.com',
  });
}

export const bucket = admin.storage().bucket();
