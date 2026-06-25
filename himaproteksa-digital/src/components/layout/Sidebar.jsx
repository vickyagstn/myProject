import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import toast from 'react-hot-toast';
import { useState } from 'react';

const menuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Kelola Anggota', path: '/admin/anggota', icon: '👥' },
  { label: 'Kelola Kegiatan', path: '/admin/kegiatan', icon: '📅' },
  { label: 'Absensi Rapat', path: '/admin/absensi', icon: '✅' },
  { label: 'Notulen Rapat', path: '/admin/notulen', icon: '📝' },
  { label: 'Pengumuman', path: '/admin/pengumuman', icon: '📢' },
  { label: 'Dokumentasi', path: '/admin/dokumentasi', icon: '🖼️' },
  { label: 'Laporan PDF', path: '/admin/laporan', icon: '📄' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Berhasil logout!');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            display: 'none',
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: '260px', minHeight: '100vh',
        background: '#800020', display: 'flex',
        flexDirection: 'column', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            HIMAPROTEKSA
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: '11px' }}>
            DIGITAL
          </p>
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '12px', padding: '12px 20px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none', color: 'white', cursor: 'pointer',
                  fontSize: '14px', textAlign: 'left',
                  borderLeft: isActive ? '3px solid #D4AF37' : '3px solid transparent'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', borderRadius: '8px',
              padding: '10px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Konten Halaman */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>

    </div>
  );
}