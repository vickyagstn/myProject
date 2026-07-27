import { useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useState } from 'react'

export default function Layout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    if (confirm('Yakin mau logout?')) {
      await signOut(auth)
      navigate('/login')
    }
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-60'} bg-gradient-to-b from-green-800 to-green-900 text-white flex flex-col flex-shrink-0 transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-green-700 flex items-center justify-between">
          {!collapsed && (
            <div>
              <div className="text-lg font-bold flex items-center gap-2">🌿 ArtaWarga</div>
              <div className="text-green-300 text-xs mt-0.5">Panel Bendahara</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-green-700 transition text-green-300">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sections.map(section => (
            <div key={section}>
              {!collapsed && (
                <div className="text-green-400 text-xs px-2 py-2 font-semibold tracking-wider">{section}</div>
              )}
              {menuItems.filter(m => m.section === section).map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-all duration-150 ${
                    location.pathname === item.path
                      ? 'bg-white text-green-800 font-semibold shadow-sm'
                      : 'hover:bg-green-700 text-green-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
              {!collapsed && <div className="border-b border-green-700 my-2"></div>}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-green-700">
          <button onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500 text-green-100 hover:text-white text-sm flex items-center gap-3 transition-all">
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-bold text-gray-800">{title || 'Dashboard'}</h1>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
              👑 Admin
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}