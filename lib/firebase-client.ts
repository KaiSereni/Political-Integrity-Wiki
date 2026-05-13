'use client'

import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyD-TwhgZ1mXiIjEullP02qeMUlfmO5BDwY',
  authDomain: 'political-integrity-wiki.firebaseapp.com',
  projectId: 'political-integrity-wiki',
  storageBucket: 'political-integrity-wiki.firebasestorage.app',
  messagingSenderId: '232736095439',
  appId: '1:232736095439:web:0711f2933b1d39590f0bba',
  measurementId: 'G-YW293Z74XR',
}

function getClientApp() {
  const existing = getApps()
  if (existing.length > 0) return existing[0]
  return initializeApp(firebaseConfig)
}

const app = getClientApp()

export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const functions: Functions = getFunctions(app)

// Connect to emulators in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  } catch {
    // Already connected
  }
}

// NOTE: App Check is not currently initialized. 
// If enabled, it should be configured to be optional for candidate read calls
// to support bots and No-JS users as requested.
