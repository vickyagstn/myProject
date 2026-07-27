import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function Pengumuman() {
  const [pengumuman, setPengumuman] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ judul: '', isi: '', tanggal: '', kategori: 'arisan' })
  const [loading, setLoading] = useState(false)
  const [notif, setNotif] = useState(null)

  const fetchData = async () => {
    const q = query(collection(db, 'announcements'), orderBy('tanggal', 'desc'))
    const snap = await getDocs(q)
    setPengumuman(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { fetchData() }, [])

  const showNotif = (msg, type = 'success') => {
    setNotif({ msg, type })
    setTimeout(() => setNotif(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'announcements'), {
        judul: form.judul,
        isi: form.isi,
        tanggal: form.tanggal,
        kategori: form.kategori,
        createdAt: new Date()
      })
      setForm({ judul: '', isi: '', tanggal: '', kategori: 'arisan' })
      setShowForm(false)
      fetchData()
      showNotif('✅ Pengumuman berhasil dibuat!')
    } catch (err) {
      showNotif('❌ Gagal membuat pengumuman!', 'error')
    }
    setLoading(false)
  }

  const handleHapus = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await deleteDoc(doc(db, 'announcements', id))
    fetchData()
    showNotif('🗑️ Pengumuman berhasil dihapus!')
  }

  const getKategoriStyle = (k) => {
    if (k === 'arisan') return 'bg-yellow-100 text-yellow-700'
    if (k === 'kas') return 'bg-green-100 text-green-700'
    if (k === 'kegiatan') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  const getKategoriIcon = (k) => {
    if (k === 'arisan') return '🪙'
    if (k === 'kas') return '💰'
    if (k === 'kegiatan') return '🎉'
    return '📢'
  }

  return (
    <Layout title="Pengumuman">
      {/* Notifikasi Toast */}
      {notif && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium transition-all duration-300 ${
          notif.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {notif.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📢 Pengumuman</h1>
          <p className="text-gray-500 text-sm mt-0.5">Buat & kelola pengumuman PKK</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
          {showForm ? '✕ Tutup' : '+ Buat Pengumuman'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4 text-base">📝 Form Pengumuman Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Judul</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                  value={form.judul}
                  onChange={e => setForm({...form, judul: e.target.value})}
                  placeholder="contoh: Arisan Bulan Agustus"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tanggal</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                  value={form.tanggal}
                  onChange={e => setForm({...form, tanggal: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Kategori</label>
              <div className="flex gap-2">
                {['arisan', 'kas', 'kegiatan', 'lainnya'].map(k => (
                  <button key={k} type="button"
                    onClick={() => setForm({...form, kategori: k})}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                      form.kategori === k
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {getKategoriIcon(k)} {k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Isi Pengumuman</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 resize-none"
                rows={4}
                value={form.isi}
                onChange={e => setForm({...form, isi: e.target.value})}
                placeholder="Tulis isi pengumuman di sini..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
                {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Pengumuman */}
      {pengumuman.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-3">📢</div>
          <p className="text-gray-500 text-sm font-medium">Belum ada pengumuman</p>
          <p className="text-gray-400 text-xs mt-1">Klik "Buat Pengumuman" untuk menambahkan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pengumuman.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getKategoriStyle(p.kategori)}`}>
                      {getKategoriIcon(p.kategori)} {p.kategori || 'lainnya'}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      📅 {p.tanggal}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{p.judul}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.isi}</p>
                </div>
                <button onClick={() => handleHapus(p.id)}
                  className="flex-shrink-0 text-xs text-red-400 hover:text-white hover:bg-red-400 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-all">
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}