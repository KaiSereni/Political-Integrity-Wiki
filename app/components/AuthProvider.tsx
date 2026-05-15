'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase-client'

interface AuthUser {
  uid: string
  displayName: string
  photoURL: string
  email: string
  credibilityPoints: number
  isAdmin: boolean
  isNewUser?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: () => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid)
        
        // Check if it's a first-time login
        const userDoc = await getDoc(userRef)
        const isNew = !userDoc.exists()

        if (isNew) {
          const newUser = {
            displayName: firebaseUser.displayName || 'Anonymous',
            photoURL: firebaseUser.photoURL || '',
            email: firebaseUser.email || '',
            credibilityPoints: 100,
            isAdmin: false,
            isBanned: false,
            createdAt: new Date().toISOString(),
          }
          await setDoc(userRef, newUser)
        }

        // Setup real-time listener
        unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            let isBanned = data.isBanned || false
            
            if (isBanned && data.banExpiry) {
              if (new Date() > new Date(data.banExpiry)) {
                isBanned = false
              }
            }
            
            if (isBanned) {
              setUser(null)
            } else {
              setUser({
                uid: firebaseUser.uid,
                displayName: data.displayName || 'Anonymous',
                photoURL: data.photoURL || '',
                email: data.email || '',
                credibilityPoints: data.credibilityPoints || 0,
                isAdmin: data.isAdmin || false,
                isNewUser: isNew && !data.hasCompletedSetup,
              })
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        })
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logOut = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
