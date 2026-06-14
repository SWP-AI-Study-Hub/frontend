import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence, type Auth } from 'firebase/auth'

const firebaseEnvironment = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let googleAuthProvider: GoogleAuthProvider | undefined

function getFirebaseConfig() {
  const missingVariables = Object.entries(firebaseEnvironment)
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missingVariables.length > 0) {
    throw new Error(`Missing Firebase environment variables: ${missingVariables.join(', ')}`)
  }

  return {
    apiKey: firebaseEnvironment.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: firebaseEnvironment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: firebaseEnvironment.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: firebaseEnvironment.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseEnvironment.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
}

export function getFirebaseApp(): FirebaseApp {
  firebaseApp ??= getApps().length ? getApp() : initializeApp(getFirebaseConfig())
  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp())
    void setPersistence(firebaseAuth, browserLocalPersistence)
  }
  return firebaseAuth
}

export function getGoogleAuthProvider(): GoogleAuthProvider {
  if (!googleAuthProvider) {
    googleAuthProvider = new GoogleAuthProvider()
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account',
    })
  }

  return googleAuthProvider
}
