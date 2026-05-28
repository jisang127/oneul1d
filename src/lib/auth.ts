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

// 아이디를 내부 이메일 형식으로 변환
const toEmail = (username: string): string =>
  username.includes('@') ? username : `${username}@oneul1d.app`

export const signUp = (username: string, password: string) =>
  createUserWithEmailAndPassword(auth, toEmail(username), password)

export const signIn = (username: string, password: string) =>
  signInWithEmailAndPassword(auth, toEmail(username), password)

export const signOut = () => firebaseSignOut(auth)

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export const onAuth = (callback: (user: FirebaseUser | null) => void) =>
  onAuthStateChanged(auth, callback)
