import { useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

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
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}