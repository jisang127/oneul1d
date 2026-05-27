import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from './firebase'

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const signOut = () => firebaseSignOut(auth)

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export const onAuth = (callback: (user: FirebaseUser | null) => void) =>
  onAuthStateChanged(auth, callback)
