import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC4A61yQmKufdYiALVF1wy_5cEhTm_WdXs",
  authDomain: "sales-visit-manager.firebaseapp.com",
  projectId: "sales-visit-manager",
  storageBucket: "sales-visit-manager.firebasestorage.app",
  messagingSenderId: "360594149709",
  appId: "1:360594149709:web:056fdafce6762615ec6704"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
