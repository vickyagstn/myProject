import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function Dokumentasi() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
  const [preview, setPreview] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'dokumentasi'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate ? a.uploadedAt.toDate() : new Date(a.uploadedAt || 0);
        const dateB = b.uploadedAt?.toDate ? b.uploadedAt.toDate() : new Date(b.uploadedAt || 0);
        return dateB - dateA;
      });
      setPhotos(data);
    } catch (e) {
      toast.error('Gagal memuat foto');
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary belum dikonfigurasi di .env!');
      return;
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" terlalu besar! Maks 5MB.`);
        e.target.value = '';
        return;
      }
    }
    setUploading(true);
    setUploadCount({ done: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'himaproteksa');
        const url = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
            else reject(new Error('Upload gagal'));
          };
          xhr.onerror = () => reject(new Error('Koneksi gagal'));
          xhr.send(formData);
        });
        await addDoc(collection(db, 'dokumentasi'), {
          imageUrl: url,
          fileName: file.name.replace(/\.[^/.]+$/, ''), // simpan tanpa ekstensi
          fileSize: file.size,
          uploadedAt: new Date(),
        });
        setUploadCount(prev => ({ ...prev, done: prev.done + 1 }));
        setProgress(0);
      }
      toast.success(`${files.length} foto berhasil diupload!`);
      fetchPhotos();
    } catch (e) {
      toast.error('Gagal upload: ' + e.message);
    }
    setUploading(false);
    setProgress(0);
    setUploadCount({ done: 0, total: 0 });
    e.target.value = '';
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Hapus foto ini?')) return;
    try {
      await deleteDoc(doc(db, 'dokumentasi', photo.id));
      toast.success('Foto dihapus!');
      if (preview?.id === photo.id) setPreview(null);
      fetchPhotos();
    } catch (e) {
      toast.error('Gagal menghapus: ' + e.message);
    }
  };

  const startEdit = (photo) => {
    setEditingId(photo.id);
    setEditingName(photo.fileName || '');
  };

  const saveEdit = async (photoId) => {
    if (!editingName.trim()) return toast.error('Nama tidak boleh kosong!');
    try {
      await updateDoc(doc(db, 'dokumentasi', photoId), { fileName: editingName.trim() });
      toast.success('Nama berhasil diubah!');
      setEditingId(null);
      setEditingName('');
      fetchPhotos();
    } catch (e) {
      toast.error('Gagal mengubah nama: ' + e.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const openPreview = (photo, index) => { setPreview(photo); setPreviewIndex(index); };
  const prevPhoto = (e) => { e.stopPropagation(); const i = (previewIndex - 1 + photos.length) % photos.length; setPreview(photos[i]); setPreviewIndex(i); };
  const nextPhoto = (e) => { e.stopPropagation(); const i = (previewIndex + 1) % photos.length; setPreview(photos[i]); setPreviewIndex(i); };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (uploadedAt) => {
    if (!uploadedAt) return '-';
    const date = uploadedAt?.toDate ? uploadedAt.toDate() : new Date(uploadedAt);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>🖼️ Dokumentasi</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Galeri foto kegiatan HIMAPROTEKSA</p>
        </div>
        <label style={{ background: uploading ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', display: 'inline-block' }}>
          {uploading ? `⏳ ${uploadCount.done}/${uploadCount.total} foto...` : '📷 Upload Foto'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {/* Progress */}
      {uploading && (
        <div style={{ background: 'white', borderRadius: '10px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontWeight: '500' }}>Mengupload foto {uploadCount.done + 1} dari {uploadCount.total}...</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#800020', fontWeight: '600' }}>{progress}%</p>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '8px' }}>
            <div style={{ background: '#800020', width: `${progress}%`, height: '8px', borderRadius: '999px', transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      {/* Stats & Toggle */}
      {!loading && photos.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ background: '#fdf2f4', color: '#800020', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            📷 {photos.length} Foto
          </span>
          <div style={{ display: 'flex', gap: '4px', background: 'white', borderRadius: '8px', padding: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {[{ mode: 'grid', icon: '⊞ Grid' }, { mode: 'list', icon: '☰ List' }].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode)}
                style={{ background: viewMode === v.mode ? '#800020' : 'transparent', color: viewMode === v.mode ? 'white' : '#6b7280', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280', background: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div><p>Memuat foto...</p>
        </div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
          <p style={{ fontWeight: '600', fontSize: '16px', color: '#374151' }}>Belum ada foto dokumentasi</p>
          <p style={{ fontSize: '13px' }}>Klik "Upload Foto" untuk menambahkan</p>
          <label style={{ display: 'inline-block', marginTop: '16px', background: '#800020', color: 'white', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            📷 Upload Foto Sekarang
            <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {photos.map((photo, index) => (
            <div key={photo.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ position: 'relative', paddingBottom: '75%', background: '#f3f4f6', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openPreview(photo, index)}>
                <img src={photo.imageUrl} alt={photo.fileName} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                {/* Edit nama inline */}
                {editingId === photo.id ? (
                  <div style={{ marginBottom: '6px' }}>
                    <input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(photo.id); if (e.key === 'Escape') cancelEdit(); }}
                      autoFocus
                      style={{ width: '100%', border: '1px solid #800020', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      <button onClick={() => saveEdit(photo.id)}
                        style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                        ✓ Simpan
                      </button>
                      <button onClick={cancelEdit}
                        style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', fontSize: '11px' }}>
                        ✕ Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#374151', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {photo.fileName || 'Foto'}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{formatDate(photo.uploadedAt)}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEdit(photo)}
                      style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(photo)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {photos.map((photo, index) => (
            <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderBottom: index < photos.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <img src={photo.imageUrl} alt={photo.fileName} onClick={() => openPreview(photo, index)}
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === photo.id ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input value={editingName} onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(photo.id); if (e.key === 'Escape') cancelEdit(); }}
                      autoFocus
                      style={{ flex: 1, border: '1px solid #800020', borderRadius: '6px', padding: '5px 8px', fontSize: '13px', outline: 'none' }} />
                    <button onClick={() => saveEdit(photo.id)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✓</button>
                    <button onClick={cancelEdit} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.fileName || 'Foto'}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                      {formatDate(photo.uploadedAt)}{photo.fileSize ? ` · ${formatSize(photo.fileSize)}` : ''}
                    </p>
                  </>
                )}
              </div>
              <button onClick={() => openPreview(photo, index)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>👁️</button>
              <button onClick={() => startEdit(photo)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
              <button onClick={() => handleDelete(photo)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photos.length > 1 && (
            <button onClick={prevPhoto} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', fontSize: '24px', zIndex: 201 }}>‹</button>
          )}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '85vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={preview.imageUrl} alt={preview.fileName} style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '8px', objectFit: 'contain' }} />
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{preview.fileName}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0' }}>{previewIndex + 1} / {photos.length} · {formatDate(preview.uploadedAt)}</p>
            </div>
          </div>
          {photos.length > 1 && (
            <button onClick={nextPhoto} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', fontSize: '24px', zIndex: 201 }}>›</button>
          )}
          <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#800020', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', zIndex: 201 }}>✕</button>
        </div>
      )}
    </div>
  );
}