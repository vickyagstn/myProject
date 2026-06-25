import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function Pengumuman() {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasilAI, setHasilAI] = useState('');
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    judul: '',
    tanggal: '',
    lokasi: '',
    deskripsi: '',
  });

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
      toast.error('Gagal memuat pengumuman');
    }
    setLoading(false);
  };

  const generatePengumuman = async () => {
    if (!form.judul || !form.deskripsi) return toast.error('Judul dan deskripsi wajib diisi!');
    setGenerating(true);
    try {
      const prompt = 'Buatkan pengumuman resmi organisasi mahasiswa dalam Bahasa Indonesia yang formal dan profesional berdasarkan data berikut:\n\n' +
        'Judul / Nama Kegiatan: ' + form.judul + '\n' +
        'Tanggal: ' + (form.tanggal || 'Segera') + '\n' +
        'Lokasi: ' + (form.lokasi || 'Akan dikonfirmasi') + '\n' +
        'Deskripsi / Keterangan: ' + form.deskripsi + '\n\n' +
        'Organisasi: HIMAPROTEKSA (Himpunan Mahasiswa Teknologi Rekayasa Perangkat Lunak)\n\n' +
        'Format pengumuman harus mencakup:\n' +
        '- Kop pengumuman\n' +
        '- Nomor surat (format: 001/HIMAPROTEKSA/VI/2025)\n' +
        '- Perihal\n' +
        '- Isi pengumuman yang formal dan jelas\n' +
        '- Penutup\n' +
        '- Tanda tangan Ketua HIMAPROTEKSA\n\n' +
        'Buat dalam format teks yang rapi dan profesional.';
  
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_OPENROUTER_API_KEY,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'HIMAPROTEKSA Digital',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
      });
  
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setHasilAI(data.choices[0].message.content);
        toast.success('Pengumuman berhasil digenerate!');
      } else {
        toast.error('Gagal generate: ' + JSON.stringify(data));
      }
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setGenerating(false);
  };

  const savePengumuman = async () => {
    if (!hasilAI) return toast.error('Generate pengumuman dulu!');
    setSaving(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: form.judul,
        content: hasilAI,
        tanggal: form.tanggal,
        lokasi: form.lokasi,
        generatedByAI: true,
        createdAt: serverTimestamp(),
      });
      toast.success('Pengumuman berhasil disimpan!');
      setShowForm(false);
      setHasilAI('');
      setForm({ judul: '', tanggal: '', lokasi: '', deskripsi: '' });
      fetchPengumuman();
    } catch (e) {
      toast.error('Gagal menyimpan: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast.success('Pengumuman dihapus!');
      fetchPengumuman();
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  const formatTanggal = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Pengumuman</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Kelola pengumuman organisasi</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setHasilAI(''); }}
          style={{ background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          {showForm ? 'Tutup Form' : '+ Buat Pengumuman'}
        </button>
      </div>

      {/* Form Generate */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <h3 style={{ color: '#800020', marginTop: 0, fontSize: '16px' }}>🤖 Generate Pengumuman dengan AI</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

            {/* Judul */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Judul / Nama Kegiatan <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                placeholder="contoh: Rapat Koordinasi Pengurus HIMAPROTEKSA"
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Tanggal */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={e => setForm({ ...form, tanggal: e.target.value })}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Lokasi */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Lokasi</label>
              <input
                value={form.lokasi}
                onChange={e => setForm({ ...form, lokasi: e.target.value })}
                placeholder="contoh: Gedung B Lt.2 R.4"
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Deskripsi */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Deskripsi / Keterangan <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                rows={4}
                placeholder="Jelaskan detail kegiatan, tujuan, dan informasi penting lainnya..."
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Tombol Generate */}
          <button
            onClick={generatePengumuman}
            disabled={generating}
            style={{ width: '100%', background: generating ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px', marginBottom: '16px' }}
          >
            {generating ? '🤖 Sedang Generate...' : '🤖 Generate Pengumuman dengan AI'}
          </button>

          {/* Hasil AI */}
          {hasilAI && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                ✅ Hasil Pengumuman (bisa diedit sebelum disimpan)
              </label>
              <textarea
                value={hasilAI}
                onChange={e => setHasilAI(e.target.value)}
                rows={20}
                style={{ width: '100%', border: '2px solid #800020', borderRadius: '8px', padding: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif', lineHeight: '1.8' }}
              />
              <button
                onClick={savePengumuman}
                disabled={saving}
                style={{ marginTop: '12px', background: saving ? '#9ca3af' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Pengumuman'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Daftar Pengumuman */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#800020', marginTop: 0, fontSize: '16px' }}>
          📢 Daftar Pengumuman ({pengumuman.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Memuat data...</div>
        ) : pengumuman.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
            <p style={{ margin: 0 }}>Belum ada pengumuman. Klik "+ Buat Pengumuman" untuk membuat.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pengumuman.map((p, i) => (
              <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>

                {/* Header Card */}
                <div
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selected?.id === p.id ? '#fdf2f4' : 'white', borderLeft: `4px solid ${i === 0 ? '#D4AF37' : '#800020'}` }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {i === 0 && (
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700' }}>
                          🔔 TERBARU
                        </span>
                      )}
                      {p.generatedByAI && (
                        <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                          🤖 AI Generated
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {p.title || p.judul}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      🗓️ {formatTanggal(p.createdAt)}
                      {p.lokasi && ` • 📍 ${p.lokasi}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', flexShrink: 0 }}
                    >
                      Hapus
                    </button>
                    <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                      {selected?.id === p.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Isi Pengumuman */}
                {selected?.id === p.id && (
                  <div style={{ padding: '20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    <pre style={{ margin: 0, fontSize: '13px', color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', lineHeight: '1.8' }}>
                      {p.content || p.isi}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}