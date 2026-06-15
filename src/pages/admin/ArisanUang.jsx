import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function ArisanUang() {
  const [anggota, setAnggota] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ penerima: '', jumlah: '', tanggal: '', putaran: '' })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const anggotaSnap = await getDocs(collection(db, 'users'))
    setAnggota(anggotaSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'anggota'))
    const q = query(collection(db, 'arisan_uang'), orderBy('tanggal', 'desc'))
    const snap = await getDocs(q)
    setRiwayat(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'arisan_uang'), {
        penerima: form.penerima,
        jumlah: parseInt(form.jumlah),
        tanggal: form.tanggal,
        putaran: parseInt(form.putaran),
        createdAt: new Date()
      })
      setForm({ penerima: '', jumlah: '', tanggal: '', putaran: '' })
      setShowForm(false)
      fetchData()
      alert('Data arisan berhasil disimpan!')
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
            <h1 className="text-xl font-bold text-gray-800">Arisan Uang</h1>
            <p className="text-gray-500 text-sm">Kelola penerima arisan uang</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Tambah Penerima
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total Putaran</div>
            <div className="text-xl font-bold text-green-700">{riwayat.length} putaran</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Sisa Putaran</div>
            <div className="text-xl font-bold text-blue-700">{anggota.length - riwayat.length} putaran</div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Tentukan Penerima Arisan</h2>
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
                  value={form.putaran} onChange={e => setForm({...form, putaran: e.target.value})}
                  placeholder={riwayat.length + 1} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Jumlah Arisan (Rp)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})}
                  placeholder="500000" required />
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-400 text-sm">Belum ada data arisan</td></tr>
              ) : riwayat.map(r => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">Putaran {r.putaran}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.penerima}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.tanggal}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-700 text-right">
                    Rp {r.jumlah?.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}