import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PengumumanAnggota() {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchPengumuman(); }, []);

  const fetchPengumuman = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setPengumuman(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatTanggal = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filtered = pengumuman.filter(p =>
    (p.title || p.judul)?.toLowerCase().includes(search.toLowerCase()) ||
    (p.content || p.isi)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Pengumuman</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Informasi dan pengumuman terbaru HIMAPROTEKSA</p>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Cari pengumuman..."
        style={{ width: '100%', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#6b7280' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
          <p style={{ margin: 0 }}>Belum ada pengumuman</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={() => setSelected(selected?.id === p.id ? null : p)}
              style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', borderLeft: `4px solid ${i === 0 ? '#D4AF37' : '#800020'}`, transition: 'box-shadow 0.2s' }}
            >
              {/* Badge terbaru */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {i === 0 && (
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700' }}>
                      🔔 TERBARU
                    </span>
                  )}
                  <span style={{ background: '#fdf2f4', color: '#800020', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                    📢 Pengumuman
                  </span>
                </div>
                <span style={{ fontSize: '18px', color: '#9ca3af' }}>
                  {selected?.id === p.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Judul */}
              <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                {p.title || p.judul || 'Tanpa Judul'}
              </h3>

              {/* Tanggal */}
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>
                🗓️ {formatTanggal(p.createdAt)}
              </p>

              {/* Preview isi */}
              {selected?.id !== p.id && (
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {p.content || p.isi}
                </p>
              )}

              {/* Isi lengkap */}
              {selected?.id === p.id && (
                <div style={{ marginTop: '12px', padding: '16px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {p.content || p.isi}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}