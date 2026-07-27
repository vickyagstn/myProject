import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Login from './pages/Login'
import DashboardAdmin from './pages/admin/Dashboard'
import DashboardAnggota from './pages/anggota/Dashboard'
import Anggota from './pages/admin/Anggota'
import Pembayaran from './pages/admin/Pembayaran'
import Kas from './pages/admin/Kas'
import ArisanUang from './pages/admin/ArisanUang'
import ArisanBarang from './pages/admin/ArisanBarang'
import Pengumuman from './pages/admin/Pengumuman'
import Laporan from './pages/admin/Laporan'

function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        const docSnap = await getDoc(doc(db, 'users', u.uid))
        if (docSnap.exists()) setRole(docSnap.data().role)
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="text-center">
        <div className="text-4xl mb-4">🌿</div>
        <p className="text-green-700 font-medium">Loading...</p>
      </div>
    </div>
  )

  const isAdmin = user && role === 'admin'
  const isAnggota = user && role === 'anggota'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Navigate to="/login" /> : role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/anggota/dashboard" />}/>
        <Route path="/login" element={!user ? <Login /> : role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/anggota/dashboard" />}/>
        <Route path="/admin/dashboard" element={isAdmin ? <DashboardAdmin /> : <Navigate to="/login" />}/>
        <Route path="/admin/anggota" element={isAdmin ? <Anggota /> : <Navigate to="/login" />}/>
        <Route path="/admin/pembayaran" element={isAdmin ? <Pembayaran /> : <Navigate to="/login" />}/>
        <Route path="/admin/kas" element={isAdmin ? <Kas /> : <Navigate to="/login" />}/>
        <Route path="/admin/arisan-uang" element={isAdmin ? <ArisanUang /> : <Navigate to="/login" />}/>
        <Route path="/admin/arisan-barang" element={isAdmin ? <ArisanBarang /> : <Navigate to="/login" />}/>
        <Route path="/admin/pengumuman" element={isAdmin ? <Pengumuman /> : <Navigate to="/login" />}/>
        <Route path="/admin/laporan" element={isAdmin ? <Laporan /> : <Navigate to="/login" />}/>
        <Route path="/anggota/dashboard" element={isAnggota ? <DashboardAnggota /> : <Navigate to="/login" />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App