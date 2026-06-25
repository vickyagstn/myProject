import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function DashboardAnggota() {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState({
    totalKegiatan: 0,
    totalPengumuman: 0,
    kehadiranSaya: 0,
    totalRapat: 0,
  });
  const [kegiatanMendatang, setKegiatanMendatang] = useState([]);
  const [pengumumanTerbaru, setPengumumanTerbaru] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kegiatanSnap, pengumumanSnap, attendanceSnap] = await Promise.all([
        getDocs(collection(db, 'kegiatan')),
        getDocs(collection(db, 'announcements')),
        getDocs(collection(db, 'attendance')),
      ]);

      const kegiatan = kegiatanSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const pengumuman = pengumumanSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const attendance = attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const today = new Date().toISOString().split('T')[0];
      const mendatang = kegiatan
        .filter(k => k.tanggal >= today)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
        .slice(0, 4);

      const kehadiranSaya = attendance.filter(a => a.userId === user.uid).length;

      setStats({
        totalKegiatan: kegiatan.length,
        totalPengumuman: pengumuman.length,
        kehadiranSaya,
        totalRapat: kegiatan.length,
      });
      setKegiatanMendatang(mendatang);
      setPengumumanTerbaru(pengumuman.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const persen = stats.totalRapat > 0
    ? Math.round((stats.kehadiranSaya / stats.totalRapat) * 100) : 0;

  const kategori = persen >= 75 ? { label: 'Aktif', color: '#16a34a', bg: '#dcfce7' }
    : persen >= 50 ? { label: 'Cukup Aktif', color: '#d97706', bg: '#fef3c7' }
    : { label: 'Kurang Aktif', color: '#dc2626', bg: '#fee2e2' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #800020', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280' }}>Memuat dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Greeting */}
      <div style={{ background: 'linear-gradient(135deg, #800020, #A52A2A)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700' }}>
          Halo, {userData?.nama || userData?.name || 'Anggota'}! 👋
        </h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>
          Selamat datang di HIMAPROTEKSA Digital
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
            📚 {userData?.divisi || '-'}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
            🎓 {userData?.nim || '-'}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Kegiatan', value: stats.totalKegiatan, icon: '📅', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Pengumuman', value: stats.totalPengumuman, icon: '📢', color: '#d97706', bg: '#fffbeb' },
          { label: 'Kehadiran Saya', value: stats.kehadiranSaya, icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Persentase', value: `${persen}%`, icon: '📊', color: '#800020', bg: '#fdf2f4' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>{card.label}</p>
              <div style={{ width: '36px', height: '36px', background: card.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {card.icon}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Keaktifan */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>📈 Status Keaktifan Saya</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '999px', height: '10px' }}>
            <div style={{ background: kategori.color, width: `${persen}%`, height: '10px', borderRadius: '999px', transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: kategori.color }}>{persen}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: kategori.bg, color: kategori.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            {kategori.label}
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {stats.kehadiranSaya} dari {stats.totalRapat} rapat
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Kegiatan Mendatang */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>📅 Kegiatan Mendatang</h3>
          {kegiatanMendatang.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
              <p style={{ fontSize: '24px', margin: '0 0 8px' }}>📭</p>
              <p style={{ margin: 0, fontSize: '13px' }}>Tidak ada kegiatan mendatang</p>
            </div>
          ) : kegiatanMendatang.map(k => (
            <div key={k.id} style={{ borderLeft: '3px solid #800020', paddingLeft: '12px', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{k.namaKegiatan}</p>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>📅 {k.tanggal} • 🕐 {k.waktuMulai}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>📍 {k.lokasi}</p>
            </div>
          ))}
        </div>

        {/* Pengumuman Terbaru */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>📢 Pengumuman Terbaru</h3>
          {pengumumanTerbaru.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
              <p style={{ fontSize: '24px', margin: '0 0 8px' }}>📭</p>
              <p style={{ margin: 0, fontSize: '13px' }}>Belum ada pengumuman</p>
            </div>
          ) : pengumumanTerbaru.map(p => (
            <div key={p.id} style={{ borderLeft: '3px solid #D4AF37', paddingLeft: '12px', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{p.title || p.judul}</p>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.content || p.isi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}