import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function DokumentasiAnggota() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'dokumentasi'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const aTime = a.uploadedAt?.toDate?.() || new Date(0);
        const bTime = b.uploadedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setPhotos(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatTanggal = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filtered = photos.filter(p =>
    p.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Dokumentasi</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Galeri foto kegiatan HIMAPROTEKSA</p>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Cari foto..."
        style={{ width: '100%', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      {/* Info jumlah */}
      {!loading && filtered.length > 0 && (
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>
          🖼️ {filtered.length} foto tersedia
        </p>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Memuat foto...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#6b7280' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🖼️</p>
          <p style={{ margin: 0 }}>Belum ada foto dokumentasi</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {filtered.map(photo => (
            <div
              key={photo.id}
              style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => setPreview(photo)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              {/* Foto */}
              <div style={{ position: 'relative', paddingBottom: '75%', background: '#f3f4f6', overflow: 'hidden' }}>
                <img
                  src={photo.imageUrl}
                  alt={photo.fileName}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(128,0,32,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,0,32,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(128,0,32,0)'}
                >
                  <span style={{ color: 'white', fontSize: '24px', opacity: 0 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  >🔍</span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#374151', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {photo.fileName || 'Foto'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                  {formatTanggal(photo.uploadedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={preview.imageUrl}
              alt={preview.fileName}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain' }}
            />
            {/* Info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '16px', borderRadius: '0 0 8px 8px' }}>
              <p style={{ margin: 0, color: 'white', fontSize: '13px', fontWeight: '500' }}>{preview.fileName}</p>
              <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{formatTanggal(preview.uploadedAt)}</p>
            </div>
            {/* Tombol tutup */}
            <button
              onClick={() => setPreview(null)}
              style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#800020', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}