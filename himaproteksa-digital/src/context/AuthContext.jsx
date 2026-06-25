import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Cari dokumen berdasarkan field uid
          const q = query(
            collection(db, 'users'),
            where('uid', '==', firebaseUser.uid)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setUserData({ id: snap.docs[0].id, ...snap.docs[0].data() });
          } else {
            // Coba cari berdasarkan email (untuk akun admin)
            const qEmail = query(
              collection(db, 'users'),
              where('email', '==', firebaseUser.email)
            );
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
              setUserData({ id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() });
            }
          }
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};