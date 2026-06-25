import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function Dashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ anggota: 0, kegiatan: 0, pengumuman: 0, notulen: 0 });
  const [kegiatanTerbaru, setKegiatanTerbaru] = useState([]);
  const [pengumumanTerbaru, setPengumumanTerbaru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [anggotaSnap, kegiatanSnap, pengumumanSnap, notulenSnap, attendanceSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'kegiatan')),
          getDocs(collection(db, 'pengumuman')),
          getDocs(collection(db, 'notulen')),
          getDocs(collection(db, 'attendance')),
        ]);

        const anggotaList = anggotaSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'anggota');
        const kegiatanList = kegiatanSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const pengumumanList = pengumumanSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const attendanceList = attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({
          anggota: anggotaList.length,
          kegiatan: kegiatanList.length,
          pengumuman: pengumumanList.length,
          notulen: notulenSnap.size,
        });

        setKegiatanTerbaru(kegiatanList.slice(-3).reverse());

        const sortedPengumuman = [...pengumumanList].sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setPengumumanTerbaru(sortedPengumuman.slice(0, 3));

        const anggotaWithKehadiran = anggotaList.map(a => {
          const hadir = attendanceList.filter(att => att.userId === a.id && att.status === 'Hadir').length;
          const terlambat = attendanceList.filter(att => att.userId === a.id && att.status === 'Terlambat').length;
          const totalRapat = kegiatanList.length;
          const persen = totalRapat > 0 ? Math.round(((hadir + terlambat) / totalRapat) * 100) : 0;
          return { nama: a.nama || a.name || a.email, divisi: a.divisi || '-', hadir, terlambat, totalRapat, persen };
        });

        setRawData({
          totalAnggota: anggotaList.length,
          totalKegiatan: kegiatanList.length,
          totalNotulen: notulenSnap.size,
          totalPengumuman: pengumumanList.length,
          anggotaAktif: anggotaList.filter(a => a.status === 'aktif').length,
          kegiatanSelesai: kegiatanList.filter(k => k.status === 'selesai').length,
          kegiatanAkanDatang: kegiatanList.filter(k => k.status === 'akan_datang').length,
          kehadiran: anggotaWithKehadiran,
        });

      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const generateAI = async () => {
    if (!OPENROUTER_API_KEY) return setAiError('API Key OpenRouter belum diset di file .env!');
    if (!rawData) return;
    setAiLoading(true);
    setAiError('');
    setAiResult('');

    const kehadiranRingkas = rawData.kehadiran.length > 0
      ? rawData.kehadiran.map(a => `- ${a.nama} (${a.divisi}): ${a.persen}% (${a.hadir} hadir, ${a.terlambat} terlambat dari ${a.totalRapat} rapat)`).join('\n')
      : 'Belum ada data kehadiran';

    const prompt = `Kamu adalah konsultan organisasi mahasiswa profesional. Analisis data organisasi HIMAPROTEKSA berikut dan berikan:

1. **Analisis Kehadiran & Partisipasi Anggota** — evaluasi tingkat kehadiran, siapa yang aktif/kurang aktif, tren partisipasi.
2. **Saran Pengembangan Organisasi** — rekomendasi konkret untuk meningkatkan kinerja organisasi berdasarkan data.

DATA ORGANISASI:
- Total Anggota: ${rawData.totalAnggota} (Aktif: ${rawData.anggotaAktif})
- Total Kegiatan: ${rawData.totalKegiatan} (Selesai: ${rawData.kegiatanSelesai}, Akan Datang: ${rawData.kegiatanAkanDatang})
- Total Notulen: ${rawData.totalNotulen}
- Total Pengumuman: ${rawData.totalPengumuman}

DATA KEHADIRAN PER ANGGOTA:
${kehadiranRingkas}

Berikan analisis yang tajam, spesifik, dan actionable. Gunakan bahasa Indonesia yang profesional namun mudah dipahami. Format dengan heading dan poin-poin yang jelas.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'HIMAPROTEKSA DIGITAL',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setAiError(`Error ${response.status}: ${data?.error?.message || 'Gagal menghubungi OpenRouter'}`);
        return;
      }

      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        setAiResult(text);
      } else {
        setAiError('Tidak ada response dari AI. Coba lagi.');
      }
    } catch (err) {
      setAiError('Koneksi gagal: ' + err.message);
    }
    setAiLoading(false);
  };

  const jam = new Date().getHours();
  const sapa = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam';

  const statusColor = {
    'akan_datang': { bg: '#dbeafe', color: '#1d4ed8', label: 'Akan Datang' },
    'berlangsung': { bg: '#dcfce7', color: '#15803d', label: 'Berlangsung' },
    'selesai':     { bg: '#f3f4f6', color: '#6b7280', label: 'Selesai' },
  };

  const kategoriColor = {
    'Umum':       { bg: '#dbeafe', color: '#1d4ed8' },
    'Akademik':   { bg: '#dcfce7', color: '#15803d' },
    'Organisasi': { bg: '#ede9fe', color: '#7c3aed' },
    'Mendesak':   { bg: '#fee2e2', color: '#dc2626' },
  };

  const menuCepat = [
    { label: 'Kelola Anggota', icon: '👥', path: '/admin/anggota', color: '#800020', bg: '#fdf2f4' },
    { label: 'Buat Kegiatan', icon: '📅', path: '/admin/kegiatan', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Absensi Rapat', icon: '✅', path: '/admin/absensi', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Generate Notulen', icon: '🤖', path: '/admin/notulen', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Pengumuman', icon: '📢', path: '/admin/pengumuman', color: '#d97706', bg: '#fffbeb' },
    { label: 'Laporan PDF', icon: '📄', path: '/admin/laporan', color: '#0891b2', bg: '#ecfeff' },
  ];

  const renderAI = (text) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return <p key={i} style={{ margin: '14px 0 6px', fontWeight: '700', color: '#800020', fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: bold.replace(/^#+\s/, '') }} />;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <p key={i} style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '13px', color: '#374151', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: '• ' + bold.replace(/^[-*]\s/, '') }} />;
      }
      if (!line.trim()) return <br key={i} />;
      return <p key={i} style={{ margin: '4px 0', fontSize: '13px', color: '#374151', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #800020 0%, #b91c1c 100%)', borderRadius: '16px', padding: '28px', marginBottom: '24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
              {sapa}, {userData?.nama || userData?.name || 'Admin'}! 👋
            </h1>
            <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '14px' }}>Selamat datang di dashboard HIMAPROTEKSA DIGITAL</p>
            <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '12px' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ fontSize: '64px', opacity: 0.3 }}>🎓</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Anggota', value: stats.anggota, color: '#800020', icon: '👥', path: '/admin/anggota' },
          { label: 'Total Kegiatan', value: stats.kegiatan, color: '#2563eb', icon: '📅', path: '/admin/kegiatan' },
          { label: 'Pengumuman', value: stats.pengumuman, color: '#d97706', icon: '📢', path: '/admin/pengumuman' },
          { label: 'Notulen', value: stats.notulen, color: '#7c3aed', icon: '📝', path: '/admin/notulen' },
        ].map((card, i) => (
          <div key={i} onClick={() => navigate(card.path)}
            style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}`, cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>{card.label}</p>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: card.color }}>{loading ? '...' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Kegiatan & Pengumuman */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '15px', fontWeight: '600' }}>📅 Kegiatan Terbaru</h3>
            <button onClick={() => navigate('/admin/kegiatan')} style={{ background: 'none', border: 'none', color: '#800020', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Lihat Semua →</button>
          </div>
          {loading ? <p style={{ color: '#6b7280', fontSize: '13px' }}>Memuat...</p>
          : kegiatanTerbaru.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>Belum ada kegiatan
            </div>
          ) : kegiatanTerbaru.map((k, i) => {
            const st = statusColor[k.status] || { bg: '#f3f4f6', color: '#6b7280', label: k.status };
            return (
              <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < kegiatanTerbaru.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{k.namaKegiatan}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280' }}>📍 {k.lokasi || '-'} · {k.tanggal || '-'}</p>
                </div>
                <span style={{ background: st.bg, color: st.color, padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap' }}>{st.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '15px', fontWeight: '600' }}>📢 Pengumuman Terbaru</h3>
            <button onClick={() => navigate('/admin/pengumuman')} style={{ background: 'none', border: 'none', color: '#800020', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Lihat Semua →</button>
          </div>
          {loading ? <p style={{ color: '#6b7280', fontSize: '13px' }}>Memuat...</p>
          : pengumumanTerbaru.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>Belum ada pengumuman
            </div>
          ) : pengumumanTerbaru.map((p, i) => {
            const warna = kategoriColor[p.kategori] || kategoriColor['Umum'];
            return (
              <div key={p.id} style={{ padding: '12px 0', borderBottom: i < pengumumanTerbaru.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#1f2937', flex: 1 }}>{p.judul}</p>
                  <span style={{ background: warna.bg, color: warna.color, padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap' }}>{p.kategori}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>👤 {p.pembuatNama || p.pembuatEmail || '-'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Analisis */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '15px', fontWeight: '600' }}>🤖 Analisis AI Organisasi</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>Analisis kehadiran & saran pengembangan berbasis data real</p>
          </div>
          <button onClick={generateAI} disabled={aiLoading || loading}
            style={{ background: aiLoading ? '#9ca3af' : 'linear-gradient(135deg, #800020, #b91c1c)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: aiLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}>
            {aiLoading ? '⏳ Menganalisis...' : '✨ Generate Analisis'}
          </button>
        </div>

        {!OPENROUTER_API_KEY && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontSize: '13px', color: '#92400e' }}>
            ⚠️ <strong>API Key belum diset!</strong> Tambahkan <code>VITE_OPENROUTER_API_KEY=...</code> di file <code>.env</code>
          </div>
        )}

        {aiError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#dc2626' }}>
            ❌ {aiError}
          </div>
        )}

        {aiLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
            <p style={{ fontSize: '13px' }}>AI sedang menganalisis data organisasi kamu...</p>
          </div>
        )}

        {aiResult && !aiLoading && (
          <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb' }}>
            {renderAI(aiResult)}
          </div>
        )}

        {!aiResult && !aiLoading && !aiError && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
            <p style={{ fontSize: '13px' }}>Klik <strong>"Generate Analisis"</strong> untuk mendapatkan analisis kehadiran dan saran pengembangan organisasi berbasis data Firebase kamu.</p>
          </div>
        )}
      </div>

      {/* Menu Cepat */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '15px', fontWeight: '600' }}>⚡ Menu Cepat</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {menuCepat.map((m, i) => (
            <button key={i} onClick={() => navigate(m.path)}
              style={{ background: m.bg, border: 'none', borderRadius: '12px', padding: '16px 8px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{m.icon}</div>
              <div style={{ fontSize: '11px', color: m.color, fontWeight: '600', lineHeight: '1.3' }}>{m.label}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}