import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function NotulenAnggota() {
  const [notulen, setNotulen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchNotulen(); }, []);

  const fetchNotulen = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'notulen'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setNotulen(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatTanggal = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const filtered = notulen.filter(n =>
    n.pimpinanRapat?.toLowerCase().includes(search.toLowerCase()) ||
    n.notulis?.toLowerCase().includes(search.toLowerCase()) ||
    n.poinPembahasan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Notulen Rapat</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Dokumentasi hasil rapat HIMAPROTEKSA</p>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Cari notulen..."
        style={{ width: '100%', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#6b7280' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📝</p>
          <p style={{ margin: 0 }}>Belum ada notulen rapat</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((n, i) => (
            <div key={n.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

              {/* Header Card */}
              <div
                onClick={() => setSelected(selected?.id === n.id ? null : n)}
                style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #800020' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#fdf2f4', color: '#800020', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                        📝 Notulen #{i + 1}
                      </span>
                      {n.generatedByAI && (
                        <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                          🤖 AI Generated
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                        <strong>Pimpinan:</strong> {n.pimpinanRapat || '-'}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                        <strong>Notulis:</strong> {n.notulis || '-'}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                        🗓️ {formatTanggal(n.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '18px', color: '#9ca3af', marginLeft: '12px' }}>
                    {selected?.id === n.id ? '▲' : '▼'}
                  </span>
                </div>

                {/* Preview peserta */}
                {selected?.id !== n.id && n.pesertaHadir && (
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                    👥 Peserta: {n.pesertaHadir}
                  </p>
                )}
              </div>

              {/* Isi Notulen */}
              {selected?.id === n.id && (
                <div style={{ borderTop: '1px solid #f3f4f6' }}>

                  {/* Info Rapat */}
                  <div style={{ padding: '16px 20px', background: '#fdf2f4', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Peserta Hadir</p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{n.pesertaHadir || '-'}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Keputusan</p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{n.keputusan || '-'}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Tindak Lanjut</p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{n.tindakLanjut || '-'}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Poin Pembahasan</p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151', whiteSpace: 'pre-line' }}>{n.poinPembahasan || '-'}</p>
                    </div>
                  </div>

                  {/* Isi Notulen AI */}
                  {n.isiNotulen && (
                    <div style={{ padding: '20px' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>📄 Isi Notulen Lengkap:</p>
                      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
                        {n.isiNotulen}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}