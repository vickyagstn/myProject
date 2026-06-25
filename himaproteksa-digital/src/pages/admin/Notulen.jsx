import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function Notulen() {
  const [kegiatan, setKegiatan] = useState([]);
  const [notulenList, setNotulenList] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    kegiatanId: '', pimpinanRapat: '', notulis: '',
    pesertaHadir: '', poinPembahasan: '', keputusan: '', tindakLanjut: ''
  });
  const [hasilNotulen, setHasilNotulen] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const snapKegiatan = await getDocs(collection(db, 'kegiatan'));
      setKegiatan(snapKegiatan.docs.map(d => ({ id: d.id, ...d.data() })));
      const snapNotulen = await getDocs(collection(db, 'notulen'));
      const data = snapNotulen.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setNotulenList(data);
    };
    fetchData();
  }, []);

  const generateNotulen = async () => {
    if (!form.kegiatanId || !form.poinPembahasan) {
      return toast.error('Pilih kegiatan dan isi poin pembahasan!');
    }
    const selectedKegiatan = kegiatan.find(k => k.id === form.kegiatanId);
    setLoadingAI(true);
    try {
      const prompt = 'Kamu adalah sekretaris profesional. Buatkan notulen rapat formal dalam Bahasa Indonesia berdasarkan data berikut:\n\n' +
        'Nama Kegiatan: ' + selectedKegiatan?.namaKegiatan + '\n' +
        'Tanggal: ' + selectedKegiatan?.tanggal + '\n' +
        'Waktu: ' + selectedKegiatan?.waktuMulai + ' - ' + selectedKegiatan?.waktuSelesai + '\n' +
        'Lokasi: ' + selectedKegiatan?.lokasi + '\n' +
        'Pimpinan Rapat: ' + form.pimpinanRapat + '\n' +
        'Notulis: ' + form.notulis + '\n' +
        'Peserta Hadir: ' + form.pesertaHadir + '\n' +
        'Poin-poin yang dibahas: ' + form.poinPembahasan + '\n' +
        'Keputusan Rapat: ' + form.keputusan + '\n' +
        'Tindak Lanjut: ' + form.tindakLanjut + '\n\n' +
        'Organisasi: HIMAPROTEKSA (Himpunan Mahasiswa Teknologi Rekayasa Perangkat Lunak)\n\n' +
        'Format notulen harus mencakup:\n' +
        '- Header organisasi\n' +
        '- Informasi rapat lengkap\n' +
        '- Daftar peserta\n' +
        '- Agenda dan hasil pembahasan\n' +
        '- Keputusan rapat\n' +
        '- Tindak lanjut dan penanggung jawab\n' +
        '- Penutup dengan tanda tangan pimpinan dan notulis\n\n' +
        'Gunakan bahasa formal dan terstruktur.';

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
        setHasilNotulen(data.choices[0].message.content);
        toast.success('Notulen berhasil digenerate!');
      } else {
        toast.error('Gagal generate: ' + JSON.stringify(data));
      }
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setLoadingAI(false);
  };

  const saveNotulen = async () => {
    if (!hasilNotulen) return toast.error('Generate notulen dulu!');
    setSaving(true);
    try {
      await addDoc(collection(db, 'notulen'), {
        ...form,
        isiNotulen: hasilNotulen,
        generatedByAI: true,
        createdAt: new Date()
      });
      toast.success('Notulen berhasil disimpan!');
      setShowForm(false);
      setHasilNotulen('');
      setForm({ kegiatanId: '', pimpinanRapat: '', notulis: '', pesertaHadir: '', poinPembahasan: '', keputusan: '', tindakLanjut: '' });
      const snap = await getDocs(collection(db, 'notulen'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setNotulenList(data);
    } catch (e) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const formatTanggal = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Notulen Rapat</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Generate dan kelola notulen rapat dengan AI</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setHasilNotulen(''); }}
          style={{ background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          {showForm ? 'Tutup Form' : '+ Buat Notulen'}
        </button>
      </div>

      {/* Form Generate */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <h3 style={{ color: '#800020', marginTop: 0, fontSize: '16px' }}>🤖 Generate Notulen dengan AI</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

            {/* Pilih Kegiatan */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Pilih Kegiatan <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={form.kegiatanId}
                onChange={e => setForm({ ...form, kegiatanId: e.target.value })}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}
              >
                <option value="">-- Pilih Kegiatan --</option>
                {kegiatan.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKegiatan} ({k.tanggal})</option>
                ))}
              </select>
            </div>

            {/* Pimpinan Rapat */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Pimpinan Rapat</label>
              <input
                value={form.pimpinanRapat}
                onChange={e => setForm({ ...form, pimpinanRapat: e.target.value })}
                placeholder="Nama pimpinan rapat"
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Notulis */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Notulis</label>
              <input
                value={form.notulis}
                onChange={e => setForm({ ...form, notulis: e.target.value })}
                placeholder="Nama notulis"
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Peserta */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Peserta Hadir</label>
              <input
                value={form.pesertaHadir}
                onChange={e => setForm({ ...form, pesertaHadir: e.target.value })}
                placeholder="Nama1, Nama2, Nama3..."
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Poin Pembahasan */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Poin-poin yang Dibahas <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                value={form.poinPembahasan}
                onChange={e => setForm({ ...form, poinPembahasan: e.target.value })}
                rows={4}
                placeholder="1. Pembahasan program kerja&#10;2. Evaluasi kegiatan&#10;3. ..."
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* Keputusan */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Keputusan Rapat</label>
              <textarea
                value={form.keputusan}
                onChange={e => setForm({ ...form, keputusan: e.target.value })}
                rows={3}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* Tindak Lanjut */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tindak Lanjut</label>
              <textarea
                value={form.tindakLanjut}
                onChange={e => setForm({ ...form, tindakLanjut: e.target.value })}
                rows={3}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Tombol Generate */}
          <button
            onClick={generateNotulen}
            disabled={loadingAI}
            style={{ width: '100%', background: loadingAI ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: loadingAI ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px', marginBottom: '16px' }}
          >
            {loadingAI ? '🤖 Sedang Generate...' : '🤖 Generate Notulen dengan AI'}
          </button>

          {/* Hasil AI */}
          {hasilNotulen && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                ✅ Hasil Notulen (bisa diedit sebelum disimpan)
              </label>
              <textarea
                value={hasilNotulen}
                onChange={e => setHasilNotulen(e.target.value)}
                rows={20}
                style={{ width: '100%', border: '2px solid #800020', borderRadius: '8px', padding: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif', lineHeight: '1.8' }}
              />
              <button
                onClick={saveNotulen}
                disabled={saving}
                style={{ marginTop: '12px', background: saving ? '#9ca3af' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Notulen'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Daftar Notulen */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#800020', marginTop: 0, fontSize: '16px' }}>
          📝 Daftar Notulen ({notulenList.length})
        </h3>

        {notulenList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📝</p>
            <p style={{ margin: 0 }}>Belum ada notulen. Klik "+ Buat Notulen" untuk membuat.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notulenList.map((n, i) => (
              <div key={n.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderLeft: '4px solid #800020', background: 'white' }}>
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                          <strong>Pimpinan:</strong> {n.pimpinanRapat || '-'}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                          <strong>Notulis:</strong> {n.notulis || '-'}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                          🗓️ {formatTanggal(n.createdAt)}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                          👥 {n.pesertaHadir || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Poin pembahasan preview */}
                  {n.poinPembahasan && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <strong>Poin Pembahasan:</strong> {n.poinPembahasan.substring(0, 100)}{n.poinPembahasan.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>

                {/* Isi Notulen */}
                {n.isiNotulen && (
                  <details style={{ borderTop: '1px solid #e5e7eb' }}>
                    <summary style={{ padding: '12px 20px', cursor: 'pointer', fontSize: '13px', color: '#800020', fontWeight: '600', background: '#fdf2f4', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📄 Lihat Isi Notulen Lengkap
                    </summary>
                    <div style={{ padding: '20px', background: '#f9fafb' }}>
                      <pre style={{ margin: 0, fontSize: '13px', color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', lineHeight: '1.8' }}>
                        {n.isiNotulen}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}