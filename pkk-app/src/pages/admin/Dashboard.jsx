import { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router-dom'

export default function DashboardAdmin() {
  const [jumlahAnggota, setJumlahAnggota] = useState(0)
  const [saldoKas, setSaldoKas] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchData = async () => {
      const anggotaSnap = await getDocs(collection(db, 'users'))
      setJumlahAnggota(anggotaSnap.size)
      const kasSnap = await getDocs(collection(db, 'cashbook'))
      let total = 0
      kasSnap.forEach(doc => {
        const d = doc.data()
        if (d.tipe === 'masuk') total += d.jumlah
        if (d.tipe === 'keluar') total -= d.jumlah
      })
      setSaldoKas(total)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard', section: 'MENU UTAMA' },
    { path: '/admin/anggota', icon: '👥', label: 'Anggota', section: 'MENU UTAMA' },
    { path: '/admin/pembayaran', icon: '💳', label: 'Pembayaran', section: 'MENU UTAMA' },
    { path: '/admin/kas', icon: '💰', label: 'Kas', section: 'MENU UTAMA' },
    { path: '/admin/arisan-uang', icon: '🪙', label: 'Arisan Uang', section: 'ARISAN' },
    { path: '/admin/arisan-barang', icon: '🎁', label: 'Arisan Barang', section: 'ARISAN' },
    { path: '/admin/pengumuman', icon: '📢', label: 'Pengumuman', section: 'LAINNYA' },
    { path: '/admin/laporan', icon: '📊', label: 'Laporan', section: 'LAINNYA' },
  ]

  const sections = ['MENU UTAMA', 'ARISAN', 'LAINNYA']

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-green-800 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-green-700">
          <div className="text-lg font-bold">🌿 PKK RW 05</div>
          <div className="text-green-300 text-xs mt-1">Panel Admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sections.map(section => (
            <div key={section}>
              <div className="text-green-400 text-xs px-2 py-2 font-medium">{section}</div>
              {menuItems.filter(m => m.section === section).map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                    location.pathname === item.path
                      ? 'bg-green-600 text-white font-medium'
                      : 'hover:bg-green-700 text-green-100'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-green-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-700 text-green-100 text-sm flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">Selamat datang, Bendahara PKK!</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-gray-500 text-xs mb-1">Saldo Kas</div>
              <div className="text-xl font-bold text-green-700">
                Rp {saldoKas.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-gray-500 text-xs mb-1">Total Anggota</div>
              <div className="text-xl font-bold text-blue-700">{jumlahAnggota} orang</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-gray-500 text-xs mb-1">Bulan</div>
              <div className="text-xl font-bold text-purple-700">
                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 text-sm font-medium">✅ Aplikasi PKK berhasil dijalankan!</p>
            <p className="text-green-600 text-xs mt-1">Klik menu di sidebar untuk mengakses fitur.</p>
          </div>
        </div>
      </div>
    </div>
  )
}