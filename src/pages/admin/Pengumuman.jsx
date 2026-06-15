import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function Pengumuman() {
  const [pengumuman, setPengumuman] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ judul: '', isi: '', tanggal: '' })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const q = query(collection(db, 'announcements'), orderBy('tanggal', 'desc'))
    const snap = await getDocs(q)
    setPengumuman(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'announcements'), {
        judul: form.judul,
        isi: form.isi,
        tanggal: form.tanggal,
        createdAt: new Date()
      })
      setForm({ judul: '', isi: '', tanggal: '' })
      setShowForm(false)
      fetchData()
      alert('Pengumuman berhasil dibuat!')
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  const handleHapus = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await deleteDoc(doc(db, 'announcements', id))
    fetchData()
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pengumuman</h1>
            <p className="text-gray-500 text-sm">Buat & kelola pengumuman PKK</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Buat Pengumuman
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Form Pengumuman</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Judul</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
                    placeholder="contoh: Arisan Bulan Juli" required />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Tanggal</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Isi Pengumuman</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={4} value={form.isi} onChange={e => setForm({...form, isi: e.target.value})}
                  placeholder="Tulis isi pengumuman di sini..." required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {pengumuman.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
              Belum ada pengumuman
            </div>
          ) : pengumuman.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-gray-800">📢 {p.judul}</span>
                    <span className="text-xs text-gray-400">{p.tanggal}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.isi}</p>
                </div>
                <button onClick={() => handleHapus(p.id)}
                  className="ml-4 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}