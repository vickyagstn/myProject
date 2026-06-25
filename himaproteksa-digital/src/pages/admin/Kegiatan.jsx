import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function Kegiatan() {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    namaKegiatan: '', deskripsi: '', tanggal: '', waktuMulai: '',
    waktuSelesai: '', lokasi: '', jenisKegiatan: 'rapat', status: 'akan_datang'
  });

  const fetchKegiatan = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'kegiatan'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setKegiatan(data);
    setLoading(false);
  };

  useEffect(() => { fetchKegiatan(); }, []);

  const resetForm = () => {
    setForm({ namaKegiatan: '', deskripsi: '', tanggal: '', waktuMulai: '', waktuSelesai: '', lokasi: '', jenisKegiatan: 'rapat', status: 'akan_datang' });
    setEditData(null);
  };

  const handleSubmit = async () => {
    if (!form.namaKegiatan || !form.tanggal) return toast.error('Nama kegiatan dan tanggal wajib diisi!');
    try {
      if (editData) {
        await updateDoc(doc(db, 'kegiatan', editData.id), { ...form });
        toast.success('Kegiatan berhasil diupdate!');
      } else {
        await addDoc(collection(db, 'kegiatan'), { ...form, createdAt: new Date() });
        toast.success('Kegiatan berhasil ditambahkan!');
      }
      setShowModal(false);
      resetForm();
      fetchKegiatan();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (data) => {
    setEditData(data);
    setForm({
      namaKegiatan: data.namaKegiatan, deskripsi: data.deskripsi,
      tanggal: data.tanggal, waktuMulai: data.waktuMulai,
      waktuSelesai: data.waktuSelesai, lokasi: data.lokasi,
      jenisKegiatan: data.jenisKegiatan, status: data.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kegiatan ini?')) return;
    await deleteDoc(doc(db, 'kegiatan', id));
    toast.success('Kegiatan dihapus!');
    fetchKegiatan();
  };

  const getStatusColor = (status) => {
    if (status === 'akan_datang') return { bg: '#dbeafe', color: '#1d4ed8' };
    if (status === 'berlangsung') return { bg: '#dcfce7', color: '#16a34a' };
    return { bg: '#f3f4f6', color: '#6b7280' };
  };

  const getJenisColor = (jenis) => {
    if (jenis === 'rapat') return { bg: '#fef3c7', color: '#d97706' };
    if (jenis === 'pelatihan') return { bg: '#ede9fe', color: '#7c3aed' };
    if (jenis === 'acara') return { bg: '#fce7f3', color: '#be185d' };
    return { bg: '#f3f4f6', color: '#6b7280' };
  };

  const filtered = kegiatan.filter(k =>
    k.namaKegiatan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Cari kegiatan..."
          style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '280px', outline: 'none' }}
        />
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          + Tambah Kegiatan
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <p>Belum ada kegiatan</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((k) => {
            const statusStyle = getStatusColor(k.status);
            const jenisStyle = getJenisColor(k.jenisKegiatan);
            return (
              <div key={k.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #800020' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937', flex: 1 }}>{k.namaKegiatan}</h3>
                  <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                    {k.status?.replace('_', ' ')}
                  </span>
                </div>
                <span style={{ background: jenisStyle.bg, color: jenisStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                  {k.jenisKegiatan}
                </span>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>📅 {k.tanggal}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>⏰ {k.waktuMulai} - {k.waktuSelesai}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>📍 {k.lokasi}</p>
                  {k.deskripsi && <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>{k.deskripsi}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => handleEdit(k)} style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Edit</button>
                  <button onClick={() => handleDelete(k.id)} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Hapus</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#800020', marginTop: 0 }}>{editData ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Nama Kegiatan</label>
              <input value={form.namaKegiatan} onChange={e => setForm({ ...form, namaKegiatan: e.target.value })}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Deskripsi</label>
              <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Lokasi</label>
                <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Waktu Mulai</label>
                <input type="time" value={form.waktuMulai} onChange={e => setForm({ ...form, waktuMulai: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Waktu Selesai</label>
                <input type="time" value={form.waktuSelesai} onChange={e => setForm({ ...form, waktuSelesai: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Jenis Kegiatan</label>
                <select value={form.jenisKegiatan} onChange={e => setForm({ ...form, jenisKegiatan: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}>
                  <option value="rapat">Rapat</option>
                  <option value="acara">Acara</option>
                  <option value="pelatihan">Pelatihan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}>
                  <option value="akan_datang">Akan Datang</option>
                  <option value="berlangsung">Berlangsung</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '500' }}>
                Batal
              </button>
              <button onClick={handleSubmit}
                style={{ background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' }}>
                {editData ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}