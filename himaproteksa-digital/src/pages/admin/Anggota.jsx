import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function Anggota() {
  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    nama: '', nim: '', email: '', angkatan: '', divisi: '', noHp: '', status: 'aktif'
  });

  const fetchAnggota = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.role === 'anggota');
    setAnggota(data);
    setLoading(false);
  };

  useEffect(() => { fetchAnggota(); }, []);

  const resetForm = () => {
    setForm({ nama: '', nim: '', email: '', angkatan: '', divisi: '', noHp: '', status: 'aktif' });
    setEditData(null);
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.nim || !form.email) return toast.error('Nama, NIM, dan Email wajib diisi!');
    try {
      if (editData) {
        await updateDoc(doc(db, 'users', editData.id), { ...form });
        toast.success('Anggota berhasil diupdate!');
      } else {
        const result = await createUserWithEmailAndPassword(auth, form.email, form.nim);
        await addDoc(collection(db, 'users'), {
          ...form, uid: result.user.uid, role: 'anggota', createdAt: new Date()
        });
        toast.success('Anggota berhasil ditambahkan!');
      }
      setShowModal(false);
      resetForm();
      fetchAnggota();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (data) => {
    setEditData(data);
    setForm({ nama: data.nama, nim: data.nim, email: data.email, angkatan: data.angkatan, divisi: data.divisi, noHp: data.noHp, status: data.status });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus anggota ini?')) return;
    await deleteDoc(doc(db, 'users', id));
    toast.success('Anggota dihapus!');
    fetchAnggota();
  };

  const filtered = anggota.filter(a =>
    a.nama?.toLowerCase().includes(search.toLowerCase()) || a.nim?.includes(search)
  );

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Cari nama atau NIM..."
          style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '280px', outline: 'none' }}
        />
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          + Tambah Anggota
        </button>
      </div>

      {/* Tabel */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#800020' }}>
              {['No', 'Nama', 'NIM', 'Angkatan', 'Divisi', 'No HP', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Memuat data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Belum ada anggota</td></tr>
            ) : filtered.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{a.nama}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{a.nim}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{a.angkatan}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{a.divisi}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{a.noHp}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: a.status === 'aktif' ? '#dcfce7' : '#fee2e2',
                    color: a.status === 'aktif' ? '#16a34a' : '#dc2626',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500'
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleEdit(a)}
                    style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)}
                    style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#800020', marginTop: 0 }}>{editData ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h3>
            {[
              { label: 'Nama Lengkap', key: 'nama', type: 'text' },
              { label: 'NIM', key: 'nim', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Angkatan', key: 'angkatan', type: 'text' },
              { label: 'Divisi', key: 'divisi', type: 'text' },
              { label: 'No HP', key: 'noHp', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}>
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>*Password default: NIM anggota</p>
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