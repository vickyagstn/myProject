import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function ArisanBarang() {
  const [anggota, setAnggota] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ penerima: '', barang: '', tanggal: '', putaran: '' })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const anggotaSnap = await getDocs(collection(db, 'users'))
    setAnggota(anggotaSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'anggota'))
    const q = query(collection(db, 'arisan_barang'), orderBy('tanggal', 'desc'))
    const snap = await getDocs(q)
    setRiwayat(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'arisan_barang'), {
        penerima: form.penerima,
        barang: form.barang,
        tanggal: form.tanggal,
        putaran: parseInt(form.putaran),
        createdAt: new Date()
      })
      setForm({ penerima: '', barang: '', tanggal: '', putaran: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Arisan Barang</h1>
            <p className="text-gray-500 text-sm">Kelola penerima arisan barang</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Tambah Penerima
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Tentukan Penerima Arisan Barang</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Penerima</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.penerima} onChange={e => setForm({...form, penerima: e.target.value})} required>
                  <option value="">-- Pilih Anggota --</option>
                  {anggota.map(a => <option key={a.id} value={a.nama}>{a.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Putaran ke-</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.putaran} onChange={e => setForm({...form, putaran: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nama Barang</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.barang} onChange={e => setForm({...form, barang: e.target.value})}
                  placeholder="contoh: Rice Cooker, Kulkas, dll" required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tanggal</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
              </div>
              <div className="flex gap-2 items-end">
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

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Putaran</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Penerima</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Barang</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-400 text-sm">Belum ada data arisan barang</td></tr>
              ) : riwayat.map(r => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">Putaran {r.putaran}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.penerima}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">🎁 {r.barang}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}