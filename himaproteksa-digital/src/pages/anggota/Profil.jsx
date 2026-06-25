import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function ProfilAnggota() {
  const { user, userData } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showGantiPassword, setShowGantiPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama: userData?.nama || '',
    nim: userData?.nim || '',
    angkatan: userData?.angkatan || '',
    divisi: userData?.divisi || '',
    noHp: userData?.noHp || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasi: '',
  });

  const handleSimpanProfil = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userData?.id), { ...form });
      toast.success('Profil berhasil diperbarui!');
      setEditMode(false);
    } catch (e) {
      toast.error('Gagal memperbarui profil: ' + e.message);
    }
    setLoading(false);
  };

  const handleGantiPassword = async () => {
    if (passwordForm.passwordBaru !== passwordForm.konfirmasi) {
      return toast.error('Password baru tidak cocok!');
    }
    if (passwordForm.passwordBaru.length < 6) {
      return toast.error('Password minimal 6 karakter!');
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.passwordLama);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.passwordBaru);
      toast.success('Password berhasil diubah!');
      setShowGantiPassword(false);
      setPasswordForm({ passwordLama: '', passwordBaru: '', konfirmasi: '' });
    } catch (e) {
      if (e.code === 'auth/wrong-password') {
        toast.error('Password lama salah!');
      } else {
        toast.error('Gagal mengubah password: ' + e.message);
      }
    }
    setLoading(false);
  };

  const getInisial = (nama) => {
    if (!nama) return 'A';
    return nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getKategori = () => {
    // Placeholder - bisa dihitung dari attendance
    return { label: 'Aktif', color: '#16a34a', bg: '#dcfce7' };
  };

  const kategori = getKategori();

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh', maxWidth: '700px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Profil Saya</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Kelola informasi akun kamu</p>
      </div>

      {/* Avatar Card */}
      <div style={{ background: 'linear-gradient(135deg, #800020, #A52A2A)', borderRadius: '16px', padding: '24px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '72px', height: '72px', background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#800020', flexShrink: 0 }}>
          {getInisial(userData?.nama)}
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700' }}>{userData?.nama || '-'}</h2>
          <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.85 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>
              🎓 {userData?.nim || '-'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>
              📚 {userData?.divisi || '-'}
            </span>
            <span style={{ background: kategori.bg, color: kategori.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
              {kategori.label}
            </span>
          </div>
        </div>
      </div>

      {/* Info Profil */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>👤 Informasi Pribadi</h3>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{ background: editMode ? '#f3f4f6' : '#800020', color: editMode ? '#374151' : 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
          >
            {editMode ? 'Batal' : '✏️ Edit Profil'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Nama Lengkap', key: 'nama', type: 'text' },
            { label: 'NIM', key: 'nim', type: 'text' },
            { label: 'Angkatan', key: 'angkatan', type: 'text' },
            { label: 'Divisi', key: 'divisi', type: 'text' },
            { label: 'No HP', key: 'noHp', type: 'text' },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.key === 'nama' ? 'span 2' : 'span 1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>
                {f.label}
              </label>
              {editMode ? (
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', focus: 'ring' }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                  {userData?.[f.key] || '-'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Email - readonly */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Email</label>
          <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', padding: '10px', background: '#f3f4f6', borderRadius: '8px' }}>
            {user?.email} <span style={{ fontSize: '11px' }}>(tidak dapat diubah)</span>
          </p>
        </div>

        {editMode && (
          <button
            onClick={handleSimpanProfil}
            disabled={loading}
            style={{ marginTop: '20px', width: '100%', background: loading ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        )}
      </div>

      {/* Ganti Password */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showGantiPassword ? '20px' : '0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>🔒 Keamanan Akun</h3>
          <button
            onClick={() => setShowGantiPassword(!showGantiPassword)}
            style={{ background: showGantiPassword ? '#f3f4f6' : '#fdf2f4', color: showGantiPassword ? '#374151' : '#800020', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
          >
            {showGantiPassword ? 'Batal' : '🔑 Ganti Password'}
          </button>
        </div>

        {showGantiPassword && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Password Lama', key: 'passwordLama' },
              { label: 'Password Baru', key: 'passwordBaru' },
              { label: 'Konfirmasi Password Baru', key: 'konfirmasi' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                <input
                  type="password"
                  value={passwordForm[f.key]}
                  onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button
              onClick={handleGantiPassword}
              disabled={loading}
              style={{ background: loading ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
            >
              {loading ? 'Memproses...' : '🔒 Ubah Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}