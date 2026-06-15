import { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import StatusBayar from './StatusBayar'
import RiwayatBayar from './RiwayatBayar'
import Arisan from './Arisan'
import PengumumanAnggota from './Pengumuman'

export default function DashboardAnggota() {
  const [nama, setNama] = useState('')
  const [active, setActive] = useState('home')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) setNama(snap.data().nama)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const menuItems = [
    { key: 'home', icon: '🏠', label: 'Beranda' },
    { key: 'status', icon: '💳', label: 'Status Bayar' },
    { key: 'riwayat', icon: '📋', label: 'Riwayat Bayar' },
    { key: 'arisan', icon: '🎰', label: 'Penerima Arisan' },
    { key: 'pengumuman', icon: '📢', label: 'Pengumuman' },
  ]

  const renderContent = () => {
    switch(active) {
      case 'status': return <StatusBayar />
      case 'riwayat': return <RiwayatBayar />
      case 'arisan': return <Arisan />
      case 'pengumuman': return <PengumumanAnggota />
      default: return (
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Selamat Datang! 👋</h1>
          <p className="text-gray-500 text-sm mb-6">{nama || 'Anggota PKK'}</p>
          <div className="grid grid-cols-2 gap-3">
            {menuItems.slice(1).map(item => (
              <div key={item.key} onClick={() => setActive(item.key)}
                className="bg-white rounded-xl p-5 border border-gray-200 text-center cursor-pointer hover:border-green-400 hover:shadow-sm transition">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-gray-700">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-green-800 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-green-700">
          <div className="text-lg font-bold">🌿 PKK RW 05</div>
          <div className="text-green-300 text-xs mt-1">Portal Anggota</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => (
            <button key={item.key} onClick={() => setActive(item.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                active === item.key ? 'bg-green-600 text-white font-medium' : 'hover:bg-green-700 text-green-100'
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-green-700">
          <div className="px-3 py-2 text-green-300 text-xs mb-1">👤 {nama}</div>
          <button onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-700 text-green-100 text-sm flex items-center gap-2">
            🚪 Logout
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}